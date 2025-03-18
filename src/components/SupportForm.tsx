
import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { toast } from 'sonner';
import { SupportTicket, generateTicketId, saveTicket, getAllBranches, getAllSiteFields, SiteField } from '../utils/ticketUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Branch } from '@/utils/ticketUtils';

interface FormData {
  employeeId: string;
  branch: string;
  description: string;
  imageFile: File | null;
  [key: string]: string | File | null; // Dynamic fields
}

const SupportForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    employeeId: '',
    branch: '',
    description: '',
    imageFile: null
  });
  
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [customFields, setCustomFields] = useState<SiteField[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingFields, setLoadingFields] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const branchesData = await getAllBranches();
        setBranches(branchesData);
      } catch (error) {
        console.error('Error fetching branches:', error);
        toast.error('حدث خطأ أثناء تحميل الفروع');
      } finally {
        setLoadingBranches(false);
      }
    };

    const fetchCustomFields = async () => {
      try {
        const fieldsData = await getAllSiteFields();
        // Filter only active fields
        const activeFields = fieldsData.filter(field => field.is_active);
        setCustomFields(activeFields);
        
        // Initialize form data with custom fields
        const initialFormData: FormData = {
          employeeId: '',
          branch: '',
          description: '',
          imageFile: null
        };
        
        // Add custom fields to form data
        activeFields.forEach(field => {
          initialFormData[field.field_name] = '';
        });
        
        setFormData(initialFormData);
      } catch (error) {
        console.error('Error fetching custom fields:', error);
        toast.error('حدث خطأ أثناء تحميل الحقول المخصصة');
      } finally {
        setLoadingFields(false);
      }
    };

    fetchBranches();
    fetchCustomFields();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, branch: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, imageFile: file }));
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.employeeId || !formData.branch || !formData.description) {
      toast.error('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }
    
    // Validate custom required fields
    for (const field of customFields) {
      if (field.is_required && !formData[field.field_name]) {
        toast.error(`الحقل "${field.display_name}" مطلوب`);
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      // Generate new ticket ID
      const newTicketId = generateTicketId();
      
      // Create ticket object with base fields
      const newTicket: SupportTicket = {
        ticket_id: newTicketId,
        employee_id: formData.employeeId,
        branch: formData.branch,
        description: formData.description,
        image_url: imagePreview || undefined,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
      // Add custom fields to ticket
      customFields.forEach(field => {
        if (formData[field.field_name]) {
          (newTicket as any)[field.field_name] = formData[field.field_name];
        }
      });
      
      // Save ticket to storage
      const result = await saveTicket(newTicket);
      
      if (!result.success) {
        throw new Error('Failed to save ticket');
      }
      
      // Display success message
      setTicketId(newTicketId);
      
      // Reset form after submission
      const resetFormData: FormData = {
        employeeId: '',
        branch: '',
        description: '',
        imageFile: null
      };
      
      // Reset custom fields
      customFields.forEach(field => {
        resetFormData[field.field_name] = '';
      });
      
      setFormData(resetFormData);
      setImagePreview(null);
      
      toast.success('تم إرسال طلب الدعم بنجاح');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while fetching data
  if (loadingBranches || loadingFields) {
    return (
      <div className="w-full max-w-2xl mx-auto animate-slide-in">
        <Card className="border-company/20 glass">
          <CardContent className="flex items-center justify-center min-h-[300px]">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mr-2">جاري تحميل النموذج...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-slide-in">
      {ticketId ? (
        <Card className="border-company/20 glass">
          <CardHeader>
            <CardTitle className="text-center">تم إرسال طلب الدعم بنجاح</CardTitle>
            <CardDescription className="text-center">يرجى الاحتفاظ برقم الطلب لمتابعة حالة الطلب</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">رقم الطلب الخاص بك:</p>
              <p className="text-2xl font-bold text-company bg-company-light py-2 px-4 rounded-md">{ticketId}</p>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              يمكنك متابعة حالة طلبك من خلال صفحة "متابعة طلب الدعم"
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => setTicketId(null)} className="mt-2">
              إرسال طلب جديد
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="border-company/20 glass">
          <CardHeader>
            <CardTitle className="text-right">طلب دعم فني جديد</CardTitle>
            <CardDescription className="text-right">
              يرجى تعبئة النموذج التالي لتقديم طلب دعم فني
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="employeeId" className="text-right">الرقم الوظيفي</Label>
                  <Input
                    id="employeeId"
                    name="employeeId"
                    type="text"
                    required
                    placeholder="أدخل الرقم الوظيفي"
                    className="text-right"
                    value={formData.employeeId}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="branch" className="text-right">الفرع</Label>
                  <Select
                    value={formData.branch}
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفرع" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.length > 0 ? (
                        branches.map(branch => (
                          <SelectItem key={branch.id} value={branch.name}>
                            {branch.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-branches" disabled>لا توجد فروع متاحة</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Render custom fields */}
                {customFields.map(field => (
                  <div key={field.id} className="grid gap-2">
                    <Label htmlFor={field.field_name} className="text-right">
                      {field.display_name} {field.is_required && <span className="text-destructive">*</span>}
                    </Label>
                    <Input
                      id={field.field_name}
                      name={field.field_name}
                      type="text"
                      required={field.is_required}
                      placeholder={`أدخل ${field.display_name}`}
                      className="text-right"
                      value={(formData[field.field_name] as string) || ''}
                      onChange={handleChange}
                    />
                  </div>
                ))}
                
                <div className="grid gap-2">
                  <Label htmlFor="description" className="text-right">محتوى الشكوى</Label>
                  <Textarea
                    id="description"
                    name="description"
                    required
                    placeholder="اكتب محتوى الشكوى هنا..."
                    className="min-h-[120px] text-right"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="imageFile" className="text-right">إرفاق صورة (اختياري)</Label>
                  <Input
                    id="imageFile"
                    name="imageFile"
                    type="file"
                    accept="image/*"
                    className="text-right cursor-pointer"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <div className="mt-2 relative">
                      <img
                        src={imagePreview}
                        alt="صورة مرفقة"
                        className="w-full max-h-48 object-contain rounded-md border border-border"
                      />
                      <button
                        type="button"
                        className="absolute top-2 left-2 bg-white/80 rounded-full p-1 hover:bg-white"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, imageFile: null }));
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
                          <path d="M18 6 6 18"></path>
                          <path d="m6 6 12 12"></path>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="loader mr-2"></div>
                    <span>جاري الإرسال...</span>
                  </div>
                ) : 'إرسال الطلب'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SupportForm;
