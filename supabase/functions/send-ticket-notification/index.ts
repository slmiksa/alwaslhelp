
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// استخدم مفتاح API المخزن في متغيرات البيئة
const resendApiKey = "re_RqWw6zr2_Amr7mwGUQaxaeiK1dNdTnv2N";
if (!resendApiKey) {
  console.error("RESEND_API_KEY environment variable is not set");
}

console.log("Initializing Resend with API key length:", resendApiKey?.length);
const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TicketNotificationRequest {
  ticket_id: string;
  employee_id: string;
  branch: string;
  description: string;
  priority?: string;
  admin_email: string;
  support_email?: string;
  customer_email?: string;
  status?: string;
  company_sender_email?: string | null;
  company_sender_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received request to send notification at:", new Date().toISOString());
    
    const { 
      ticket_id, 
      employee_id, 
      branch, 
      description, 
      priority, 
      admin_email = 'help@alwaslsaudi.com', // Default to help@alwaslsaudi.com if not provided
      support_email = 'help@alwaslsaudi.com', // Default to help@alwaslsaudi.com
      customer_email,
      status = 'pending',
      company_sender_email = null,
      company_sender_name = 'دعم الوصل'
    }: TicketNotificationRequest = await req.json();

    console.log(`Sending notification for ticket ${ticket_id}`);
    console.log(`Customer email: ${customer_email || 'not provided'}`);
    console.log(`Admin email: ${admin_email || 'help@alwaslsaudi.com'}`);
    console.log(`Support email: ${support_email}`);
    console.log(`Company sender email: null (using default Resend sender: onboarding@resend.dev)`);
    console.log(`Company sender name: ${company_sender_name}`);

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }

    // Validate required fields
    if (!ticket_id || !employee_id || !branch) {
      throw new Error("Missing required fields");
    }

    // Priority and status mapping for Arabic labels
    const priorityLabels: Record<string, string> = {
      'urgent': 'عاجلة',
      'medium': 'متوسطة',
      'normal': 'عادية'
    };

    const statusLabels: Record<string, string> = {
      'pending': 'قيد الانتظار',
      'open': 'مفتوحة',
      'inprogress': 'قيد المعالجة',
      'resolved': 'تم الحل',
      'closed': 'مغلقة'
    };

    const formattedPriority = priorityLabels[priority as keyof typeof priorityLabels] || 'عادية';
    const formattedStatus = statusLabels[status as keyof typeof statusLabels] || status;

    // Prepare the email HTML template
    const emailHtml = `
      <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #D4AF37; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">تذكرة دعم فني جديدة</h1>
        </div>
        
        <div style="background-color: #ffffff; padding: 25px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; margin-bottom: 25px; color: #555555;">تم إنشاء تذكرة دعم فني جديدة:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tr>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">رقم التذكرة:</td>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${ticket_id}</td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">الفرع:</td>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${branch}</td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">الأولوية:</td>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${formattedPriority}</td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">الرقم الوظيفي:</td>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${employee_id}</td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">وصف المشكلة:</td>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${description}</td>
            </tr>
            ${customer_email ? `
            <tr>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">البريد الإلكتروني للعميل:</td>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${customer_email}</td>
            </tr>
            ` : ''}
          </table>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://support.alwaslsaudi.com/admin/login?ticket=${ticket_id}" 
               style="background-color: #D4AF37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              مشاهدة التذكرة
            </a>
          </div>
          
          <p style="font-size: 14px; color: #888; margin-top: 20px; text-align: center;">
            سيتم توجيهك لصفحة تسجيل الدخول أولاً
          </p>
        </div>
      </div>
    `;

    let allEmails = [];
    
    // Always send email to help@alwaslsaudi.com
    const fixedSupportEmail = 'help@alwaslsaudi.com';
    console.log(`[${new Date().toISOString()}] Attempting to send support notification email to:`, fixedSupportEmail);
    try {
      // Always use the default Resend sender
      const emailConfig = { from: `${company_sender_name} <onboarding@resend.dev>` };

      const supportEmailResponse = await resend.emails.send({
        ...emailConfig,
        to: [fixedSupportEmail],
        subject: `تذكرة دعم فني جديدة رقم ${ticket_id}`,
        html: emailHtml,
      });

      console.log(`[${new Date().toISOString()}] Support notification sent:`, JSON.stringify(supportEmailResponse));
      allEmails.push({ type: 'support', success: true, response: supportEmailResponse });
    } catch (supportError) {
      console.error(`[${new Date().toISOString()}] Error sending support notification:`, supportError);
      allEmails.push({ type: 'support', success: false, error: supportError });
    }

    // Send email to admin if different from support email
    if (admin_email && admin_email !== fixedSupportEmail) {
      console.log(`[${new Date().toISOString()}] Attempting to send admin notification email to:`, admin_email);
      try {
        // Always use the default Resend sender
        const emailConfig = { from: `${company_sender_name} <onboarding@resend.dev>` };

        const adminEmailResponse = await resend.emails.send({
          ...emailConfig,
          to: [admin_email],
          subject: `تذكرة دعم فني جديدة رقم ${ticket_id}`,
          html: emailHtml,
        });

        console.log(`[${new Date().toISOString()}] Admin notification sent:`, JSON.stringify(adminEmailResponse));
        allEmails.push({ type: 'admin', success: true, response: adminEmailResponse });
      } catch (adminError) {
        console.error(`[${new Date().toISOString()}] Error sending admin notification:`, adminError);
        allEmails.push({ type: 'admin', success: false, error: adminError });
      }
    }

    // If customer email is provided, send confirmation to customer
    let customerEmailResult = null;
    if (customer_email) {
      console.log(`[${new Date().toISOString()}] Attempting to send customer notification email to:`, customer_email);
      
      const customerHtml = `
        <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #D4AF37; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">تم استلام طلب الدعم الفني</h1>
          </div>
          
          <div style="background-color: #ffffff; padding: 25px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; margin-bottom: 25px; color: #555555;">تم استلام طلب الدعم الفني الخاص بك وسيتم التواصل معك قريباً:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <tr>
                <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">رقم التذكرة:</td>
                <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${ticket_id}</td>
              </tr>
              <tr>
                <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">الحالة:</td>
                <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${formattedStatus}</td>
              </tr>
              <tr>
                <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">الوصف:</td>
                <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${description}</td>
              </tr>
            </table>

            <div style="background-color: #f5f7fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <p style="margin: 0;">يمكنك متابعة حالة طلبك من خلال الدخول على نظام الدعم الفني وإدخال رقم التذكرة.</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://support.alwaslsaudi.com/ticket-status/${ticket_id}" 
                 style="background-color: #D4AF37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                تتبع الطلب
              </a>
            </div>
          </div>
        </div>
      `;

      try {
        // Always use the default Resend sender for customer emails
        const emailConfig = { from: `${company_sender_name} <onboarding@resend.dev>` };

        const customerEmailResponse = await resend.emails.send({
          ...emailConfig,
          to: [customer_email],
          subject: `تم استلام طلب الدعم الفني رقم ${ticket_id}`,
          html: customerHtml,
        });

        console.log(`[${new Date().toISOString()}] Customer notification sent:`, JSON.stringify(customerEmailResponse));
        customerEmailResult = { success: true, response: customerEmailResponse };
        allEmails.push({ type: 'customer', success: true, response: customerEmailResponse });
      } catch (customerError) {
        console.error(`[${new Date().toISOString()}] Error sending customer notification:`, customerError);
        customerEmailResult = { success: false, error: customerError };
        allEmails.push({ type: 'customer', success: false, error: customerError });
      }
    }

    // Check if any emails were sent successfully
    const anySent = allEmails.some(email => email.success);
    
    if (!anySent) {
      throw new Error("Failed to send any notifications");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        allEmails,
        supportNotification: "Sent",
        adminNotification: "Sent",
        customerNotification: customer_email ? "Sent" : null 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in send-ticket-notification function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.stack 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
