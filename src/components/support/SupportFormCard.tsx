
import { FormEvent } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormData } from './useFormData';
import { SiteField } from '@/utils/ticketUtils';
import { 
  PrioritySelect, 
  EmployeeIdInput, 
  BranchSelect, 
  CustomFieldInput, 
  DescriptionInput, 
  ImageUpload, 
  SubmitButton 
} from './FormComponents';

interface SupportFormCardProps {
  formData: FormData;
  customFields: SiteField[];
  branches: any[];
  imagePreview: string | null;
  isSubmitting: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSelectChange: (value: string, fieldName?: string) => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetImage: () => void;
  onSubmit: (e: FormEvent) => Promise<void>;
}

const SupportFormCard = ({
  formData,
  customFields,
  branches,
  imagePreview,
  isSubmitting,
  handleChange,
  handleSelectChange,
  handleImageChange,
  resetImage,
  onSubmit
}: SupportFormCardProps) => {
  return (
    <Card className="border-company/20 glass">
      <CardHeader>
        <CardTitle className="text-right">طلب دعم فني جديد</CardTitle>
        <CardDescription className="text-right">
          يرجى تعبئة النموذج التالي لتقديم طلب دعم فني
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-4">
            <PrioritySelect 
              value={formData.priority} 
              onChange={(value) => handleSelectChange(value, 'priority')} 
            />
            
            <EmployeeIdInput 
              value={formData.employeeId} 
              onChange={handleChange} 
            />
            
            <BranchSelect 
              value={formData.branch} 
              branches={branches} 
              onChange={(value) => handleSelectChange(value, 'branch')} 
            />
            
            {customFields.map(field => (
              <CustomFieldInput
                key={field.id}
                field={field}
                value={formData[field.field_name] as string}
                onChange={handleChange}
              />
            ))}
            
            <DescriptionInput 
              value={formData.description} 
              onChange={handleChange} 
            />
            
            <ImageUpload 
              imagePreview={imagePreview} 
              handleImageChange={handleImageChange} 
              resetImage={resetImage} 
            />
          </div>
          
          <SubmitButton isSubmitting={isSubmitting} />
        </form>
      </CardContent>
    </Card>
  );
};

export default SupportFormCard;
