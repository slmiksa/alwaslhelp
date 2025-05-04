import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SupportTicket, generateTicketId, saveTicket } from '../utils/ticketUtils';
import { sendTicketNotificationsToAllAdmins, getCompanyEmailSettings } from '@/utils/notificationUtils';
import LoadingForm from './support/LoadingForm';
import SuccessCard from './support/SuccessCard';
import SupportFormCard from './support/SupportFormCard';
import { useFormData } from './support/useFormData';
import { SYSTEM_FIELDS } from './support/constants';

const SupportForm = () => {
  // Always use null to trigger the default Resend sender
  const [companySenderName, setCompanySenderName] = useState<string>('دعم الوصل');
  
  const {
    formData,
    isSubmitting,
    setIsSubmitting,
    ticketId,
    setTicketId,
    imagePreview,
    branches,
    customFields,
    loadingBranches,
    loadingFields,
    handleChange,
    handleSelectChange,
    handleImageChange,
    resetImage,
    resetForm
  } = useFormData();

  useEffect(() => {
    // Fetch company email settings but always use the default Resend sender
    const fetchCompanyEmailSettings = async () => {
      try {
        const settings = await getCompanyEmailSettings();
        setCompanySenderName(settings.senderName);
        console.log('Loaded company email settings (using default Resend sender):', settings);
      } catch (error) {
        console.error('Failed to load company email settings:', error);
        setCompanySenderName('دعم الوصل');
      }
    };
    
    fetchCompanyEmailSettings();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.branch || !formData.description || !formData.priority) {
      toast.error('يرجى تعبئة جميع الحقول المطلوبة', {
        closeButton: true,
        position: 'top-center',
        duration: 5000
      });
      return;
    }
    
    for (const field of customFields) {
      if (field.is_required && !formData[field.field_name]) {
        toast.error(`الحقل "${field.display_name}" مطلوب`, {
          closeButton: true,
          position: 'top-center',
          duration: 5000
        });
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      const newTicketId = generateTicketId();
      
      const customFieldsData: Record<string, any> = {};
      
      customFields.forEach(field => {
        if (formData[field.field_name]) {
          customFieldsData[field.field_name] = formData[field.field_name];
        }
      });
      
      // Ensure imageUrlToSave is explicitly typed as string | null
      let imageUrlToSave: string | null = null;
      
      // Check if imagePreview is a string (already uploaded image URL)
      if (typeof imagePreview === 'string') {
        imageUrlToSave = imagePreview;
      }
      
      const newTicket: SupportTicket = {
        ticket_id: newTicketId,
        branch: formData.branch,
        priority: formData.priority,
        description: formData.description,
        image_url: imageUrlToSave,
        status: 'pending',
        created_at: new Date().toISOString(),
        employee_id: formData['field_1743981608110'] as string || '',
        custom_fields: customFieldsData,
        anydesk_number: formData.anydesk_number as string || '',
        customer_email: null, // Always null since email field is removed
        support_email: 'help@alwaslsaudi.com', // Always set the support email
        extension_number: formData['extension_number'] as string || ''
      };
      
      console.log('Submitting ticket with data:', newTicket);
      console.log('Using company sender name:', companySenderName);
      
      const result = await saveTicket(newTicket);
      
      if (!result.success) {
        console.error('Failed to save ticket:', result.error);
        throw new Error('Failed to save ticket');
      }
      
      try {
        console.log('Sending notification for new ticket:', newTicketId);
        // Send only one notification email
        const notificationResult = await sendTicketNotificationsToAllAdmins(
          newTicket, 
          companySenderName
        );
        console.log('Notification result:', notificationResult);
      } catch (error) {
        console.error('Error sending notification:', error);
        // Notify user about notification failure, but don't block ticket creation
        toast.warning('فشل إرسال الإشعارات، يرجى التواصل مع الدعم الفني', {
          closeButton: true,
          position: 'top-center',
          duration: 5000
        });
      }
      
      setTicketId(newTicketId);
      resetForm();
      
      toast.success('تم إرسال طلب الدعم بنجاح', {
        closeButton: true,
        position: 'top-center',
        duration: 5000
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى', {
        closeButton: true,
        position: 'top-center',
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingBranches || loadingFields) {
    return <LoadingForm />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-slide-in">
      {ticketId ? (
        <SuccessCard 
          ticketId={ticketId} 
          onNewTicket={() => setTicketId(null)} 
        />
      ) : (
        <SupportFormCard
          formData={formData}
          customFields={customFields}
          branches={branches}
          imagePreview={imagePreview}
          isSubmitting={isSubmitting}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
          handleImageChange={handleImageChange}
          resetImage={resetImage}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default SupportForm;
