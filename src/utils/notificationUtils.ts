import { supabase, PriorityType } from '@/integrations/supabase/client';
import { SupportTicket } from './ticketUtils';
import { toast } from 'sonner';

// Send email notification to admin when a new ticket is created
export const sendTicketNotification = async (
  ticket: SupportTicket, 
  adminEmail: string,
  companySenderEmail?: string | null,
  companySenderName?: string
): Promise<boolean> => {
  try {
    // Ensure we always use help@alwaslsaudi.com
    const fixedSupportEmail = 'help@alwaslsaudi.com';
    
    // Prepare the notification data
    const notificationData = {
      ticket_id: ticket.ticket_id,
      employee_id: ticket.employee_id,
      branch: ticket.branch,
      priority: ticket.priority,
      description: ticket.description,
      admin_email: adminEmail || fixedSupportEmail, // Ensure admin email is provided
      // Always use the fixed support email for consistent notifications
      support_email: fixedSupportEmail,
      // Add customer email if available
      customer_email: ticket.customer_email || null,
      // Always set to null to use default Resend sender (onboarding@resend.dev)
      company_sender_email: null,
      company_sender_name: companySenderName || 'دعم الوصل'
    };

    console.log('Sending notification for ticket', ticket.ticket_id, 'to', adminEmail || fixedSupportEmail);
    console.log('Using support email:', notificationData.support_email);
    console.log('Customer email:', notificationData.customer_email);
    console.log('Company sender email: null (using default Resend sender)');
    console.log('Company sender name:', notificationData.company_sender_name);

    // Call the Supabase edge function to send the email
    const { data, error } = await supabase.functions.invoke(
      'send-ticket-notification',
      {
        body: notificationData
      }
    );

    if (error) {
      console.error('Error sending ticket notification:', error);
      // Silently log error but don't show toast
      return false;
    }

    console.log('Notification sent successfully:', data);
    // Success toast is still shown only to admins
    return true;
  } catch (error) {
    console.error('Error sending ticket notification:', error);
    // Silently log error but don't show toast
    return false;
  }
};

// Send email notifications to all admins when a new ticket is created
export const sendTicketNotificationsToAllAdmins = async (
  ticket: SupportTicket,
  companySenderEmail?: string | null,
  companySenderName?: string
): Promise<boolean> => {
  try {
    // Get all admin emails
    const adminEmails = await getAdminEmails();
    
    // Always ensure help@alwaslsaudi.com is included
    const fixedSupportEmail = 'help@alwaslsaudi.com';
    
    if (!adminEmails.includes(fixedSupportEmail)) {
      adminEmails.push(fixedSupportEmail);
    }
    
    if (adminEmails.length === 0) {
      console.warn('No admin emails found. Sending notification to default support email.');
      adminEmails.push(fixedSupportEmail);
    }
    
    console.log('Sending notifications to admins:', adminEmails);
    console.log('Using company sender email: null (using default Resend sender)');
    console.log('Using company sender name:', companySenderName || 'دعم الوصل');
    
    // Send notifications to all admins
    const results = await Promise.allSettled(
      adminEmails.map(email => sendTicketNotification(ticket, email, null, companySenderName))
    );
    
    // Check if at least one notification was sent successfully
    const atLeastOneSuccess = results.some(
      result => result.status === 'fulfilled' && result.value === true
    );
    
    // If no admin notification succeeded, try sending directly to help@alwaslsaudi.com
    if (!atLeastOneSuccess) {
      console.log('No admin notifications succeeded. Sending directly to help@alwaslsaudi.com');
      return await sendTicketNotification(ticket, fixedSupportEmail, null, companySenderName);
    }
    
    return atLeastOneSuccess;
  } catch (error) {
    console.error('Error sending notifications to admins:', error);
    
    // Try sending to default email if all else fails
    try {
      console.log('Attempting fallback notification to help@alwaslsaudi.com');
      return await sendTicketNotification(ticket, 'help@alwaslsaudi.com', null, 'دعم الوصل');
    } catch (fallbackError) {
      console.error('Fallback notification also failed:', fallbackError);
      return false;
    }
  }
};

// Fetch admin emails from the database
export const getAdminEmails = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('username, notification_email')
      .or('role.eq.super_admin,role.eq.admin');

    if (error) {
      console.error('Error fetching admin emails:', error);
      throw error;
    }

    // Use notification_email if available, otherwise use username (which is the email)
    const emails = data
      .map(admin => admin.notification_email || admin.username)
      .filter(Boolean);
    
    console.log('Found admin emails:', emails);
    
    // Always include help@alwaslsaudi.com
    if (!emails.includes('help@alwaslsaudi.com')) {
      emails.push('help@alwaslsaudi.com');
    }
    
    return emails;
  } catch (error) {
    console.error('Error fetching admin emails:', error);
    return ['help@alwaslsaudi.com']; // Return default email
  }
};

// Save admin notification email
export const saveAdminNotificationEmail = async (
  adminId: string,
  notificationEmail: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('admins')
      .update({ notification_email: notificationEmail })
      .eq('id', adminId);

    if (error) {
      console.error('Error saving notification email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving notification email:', error);
    return false;
  }
};

// Get company email settings
export const getCompanyEmailSettings = async (): Promise<{
  senderEmail: string;
  senderName: string;
}> => {
  try {
    // Check if the required columns exist in the site_settings table
    const { data: columnsData, error: columnsError } = await supabase
      .rpc('check_column_exists', { 
        table_name: 'site_settings', 
        column_name: 'company_sender_email' 
      });
    
    // If columns don't exist or there's an error, return default values
    if (columnsError || !columnsData) {
      console.log('Company email settings columns do not exist yet. Using defaults.');
      return {
        senderEmail: 'help@alwaslsaudi.com',
        senderName: 'دعم الوصل'
      };
    }
    
    // If columns exist, fetch the data
    if (columnsData) {
      const { data, error } = await supabase
        .from('site_settings')
        .select('company_sender_email, company_sender_name')
        .single();

      if (error) {
        console.error('Error fetching company email settings:', error);
        throw error;
      }

      return {
        senderEmail: data?.company_sender_email || 'help@alwaslsaudi.com',
        senderName: data?.company_sender_name || 'دعم الوصل'
      };
    }
    
    // Default fallback
    return {
      senderEmail: 'help@alwaslsaudi.com',
      senderName: 'دعم الوصل'
    };
  } catch (error) {
    console.error('Error fetching company email settings:', error);
    return {
      senderEmail: 'help@alwaslsaudi.com',
      senderName: 'دعم الوصل'
    };
  }
};

// Save company email settings
export const saveCompanyEmailSettings = async (
  senderEmail: string,
  senderName: string
): Promise<boolean> => {
  try {
    // Check if columns exist
    const { data: columnsExist, error: columnsError } = await supabase
      .rpc('check_column_exists', { 
        table_name: 'site_settings', 
        column_name: 'company_sender_email' 
      });
    
    // If the columns don't exist yet, add them
    if (!columnsExist || columnsError) {
      // Create a function to add the columns if they don't exist
      const { error: addColumnError } = await supabase.rpc('add_company_email_columns');
      if (addColumnError) {
        console.error('Error adding company email columns:', addColumnError);
        return false;
      }
    }
    
    // Now update the settings
    const { error } = await supabase
      .from('site_settings')
      .update({
        company_sender_email: senderEmail,
        company_sender_name: senderName
      })
      .eq('id', 1); // Assuming there's only one record in site_settings

    if (error) {
      console.error('Error saving company email settings:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving company email settings:', error);
    return false;
  }
};
