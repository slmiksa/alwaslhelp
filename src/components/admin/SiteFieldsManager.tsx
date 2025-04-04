
import { useState, useEffect } from 'react';
import { 
  getAllSiteFields, 
  updateSiteField, 
  createSiteField, 
  deleteSiteField, 
  SiteField,
  updateFieldOrder
} from '@/utils/ticketUtils';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ArrowUp, ArrowDown, Info } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SiteFieldsManager = () => {
  const [fields, setFields] = useState<SiteField[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<SiteField | null>(null);
  const [newField, setNewField] = useState({
    display_name: '',
    field_name: '',
    is_required: false,
    is_active: true
  });
  const { hasPermission } = useAdminAuth();
  const canManageAdmins = hasPermission('manage_admins');

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    setLoading(true);
    const data = await getAllSiteFields();
    
    // Sort fields by sort_order for initial load
    const sortedFields = [...data].sort((a, b) => 
      (a.sort_order || 0) - (b.sort_order || 0)
    );
    
    setFields(sortedFields);
    setLoading(false);
  };

  const handleToggleRequired = async (field: SiteField) => {
    if (!canManageAdmins) return;
    
    // Don't allow changing system fields like 'priority'
    if (field.field_name === 'priority') {
      toast.error('لا يمكن تغيير إعدادات حقل الأهمية');
      return;
    }
    
    const newValue = !field.is_required;
    const success = await updateSiteField(field.id, { is_required: newValue });
    
    if (success) {
      setFields(fields.map(f => f.id === field.id ? { ...f, is_required: newValue } : f));
      toast.success(`تم تحديث حالة الحقل ${field.display_name}`);
    } else {
      toast.error('فشل في تحديث الحقل');
    }
  };

  const handleToggleActive = async (field: SiteField) => {
    if (!canManageAdmins) return;
    
    // Don't allow changing system fields like 'priority'
    if (field.field_name === 'priority') {
      toast.error('لا يمكن تغيير إعدادات حقل الأهمية');
      return;
    }
    
    const newValue = !field.is_active;
    const success = await updateSiteField(field.id, { is_active: newValue });
    
    if (success) {
      setFields(fields.map(f => f.id === field.id ? { ...f, is_active: newValue } : f));
      toast.success(`تم تحديث حالة الحقل ${field.display_name}`);
    } else {
      toast.error('فشل في تحديث الحقل');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewField(prev => ({ ...prev, [name]: value }));
  };

  const convertToFieldName = (displayName: string) => {
    return displayName
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^\w\s]/gi, '');
  };

  const handleAddField = async () => {
    if (!canManageAdmins) return;
    if (!newField.display_name) {
      toast.error('يرجى إدخال اسم الحقل');
      return;
    }

    try {
      // Auto-generate field_name if empty
      const fieldName = newField.field_name || convertToFieldName(newField.display_name);
      
      const fieldData = {
        ...newField,
        field_name: fieldName
      };
      
      const result = await createSiteField(fieldData);
      
      if (result) {
        toast.success(`تم إضافة الحقل ${newField.display_name} بنجاح`);
        setFields([...fields, result]);
        setNewField({
          display_name: '',
          field_name: '',
          is_required: false,
          is_active: true
        });
        setIsAddDialogOpen(false);
      } else {
        toast.error('فشل في إضافة الحقل');
      }
    } catch (error) {
      console.error('Error adding field:', error);
      toast.error('حدث خطأ أثناء إضافة الحقل');
    }
  };

  const handleDeleteField = async () => {
    if (!canManageAdmins || !fieldToDelete) return;
    
    // Don't allow deleting system fields like 'priority'
    if (fieldToDelete.field_name === 'priority') {
      toast.error('لا يمكن حذف حقل الأهمية');
      setDeleteDialogOpen(false);
      setFieldToDelete(null);
      return;
    }
    
    try {
      const success = await deleteSiteField(fieldToDelete.id);
      
      if (success) {
        setFields(fields.filter(f => f.id !== fieldToDelete.id));
        toast.success(`تم حذف الحقل ${fieldToDelete.display_name} بنجاح`);
      } else {
        toast.error('فشل في حذف الحقل');
      }
    } catch (error) {
      console.error('Error deleting field:', error);
      toast.error('حدث خطأ أثناء حذف الحقل');
    } finally {
      setDeleteDialogOpen(false);
      setFieldToDelete(null);
    }
  };

  const openDeleteDialog = (field: SiteField) => {
    if (!canManageAdmins) return;
    setFieldToDelete(field);
    setDeleteDialogOpen(true);
  };

  // Functions for reordering fields
  const moveFieldUp = async (index: number) => {
    if (index === 0) return; // Already at the top
    
    const field = fields[index];
    
    // Don't allow reordering system fields
    if (field.field_name === 'priority') {
      toast.error('لا يمكن تغيير ترتيب حقل الأهمية');
      return;
    }
    
    // Call the backend function to update the order
    const success = await updateFieldOrder(field.id, 'up');
    
    if (success) {
      const newFields = [...fields];
      [newFields[index-1], newFields[index]] = [newFields[index], newFields[index-1]];
      setFields(newFields);
      toast.success('تم تحريك الحقل للأعلى');
    } else {
      toast.error('فشل في تحريك الحقل');
    }
  };

  const moveFieldDown = async (index: number) => {
    if (index === fields.length - 1) return; // Already at the bottom
    
    const field = fields[index];
    
    // Don't allow reordering system fields
    if (field.field_name === 'priority') {
      toast.error('لا يمكن تغيير ترتيب حقل الأهمية');
      return;
    }
    
    // Call the backend function to update the order
    const success = await updateFieldOrder(field.id, 'down');
    
    if (success) {
      const newFields = [...fields];
      [newFields[index], newFields[index+1]] = [newFields[index+1], newFields[index]];
      setFields(newFields);
      toast.success('تم تحريك الحقل للأسفل');
    } else {
      toast.error('فشل في تحريك الحقل');
    }
  };

  const isSystemField = (fieldName: string): boolean => {
    // List of system fields that cannot be modified
    return ['priority'].includes(fieldName);
  };

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-right text-xl font-bold text-company">إدارة حقول الموقع</CardTitle>
        {canManageAdmins && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus size={16} />
                <span>إضافة حقل</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-right">إضافة حقل جديد</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="display_name" className="text-right">اسم الحقل</Label>
                  <Input
                    id="display_name"
                    name="display_name"
                    className="text-right"
                    value={newField.display_name}
                    onChange={handleInputChange}
                    placeholder="مثال: الرقم الوظيفي"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="field_name" className="text-right">
                    اسم الحقل البرمجي (اختياري)
                  </Label>
                  <Input
                    id="field_name"
                    name="field_name"
                    className="text-right"
                    value={newField.field_name}
                    onChange={handleInputChange}
                    placeholder="سيتم إنشاؤه تلقائيًا إذا تركته فارغًا"
                  />
                  <p className="text-sm text-muted-foreground text-right">
                    إذا تركت هذا الحقل فارغًا، سيتم إنشاؤه تلقائيًا من اسم الحقل
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddField} className="w-full">إضافة الحقل</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-2">جاري تحميل البيانات...</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  {canManageAdmins && <TableHead className="text-center w-16">ترتيب</TableHead>}
                  <TableHead className="text-right">اسم الحقل</TableHead>
                  <TableHead className="text-right">مطلوب</TableHead>
                  <TableHead className="text-right">نشط</TableHead>
                  {canManageAdmins && <TableHead className="text-center w-20">حذف</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.length > 0 ? (
                  fields.map((field, index) => (
                    <TableRow key={field.id} className={isSystemField(field.field_name) ? "bg-muted/30" : ""}>
                      {canManageAdmins && (
                        <TableCell className="flex items-center justify-center space-x-1">
                          {isSystemField(field.field_name) ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center">
                                    <Info size={16} className="text-amber-500 mr-1" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>حقل نظام لا يمكن تعديله</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => moveFieldUp(index)}
                                disabled={index === 0}
                              >
                                <ArrowUp size={16} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => moveFieldDown(index)}
                                disabled={index === fields.length - 1}
                              >
                                <ArrowDown size={16} />
                              </Button>
                            </>
                          )}
                        </TableCell>
                      )}
                      <TableCell className="font-medium text-right">
                        {field.display_name}
                        {isSystemField(field.field_name) && (
                          <span className="mr-2 text-sm text-muted-foreground">(حقل نظام)</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={field.is_required}
                          onCheckedChange={() => handleToggleRequired(field)}
                          disabled={!canManageAdmins || isSystemField(field.field_name)}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={field.is_active}
                          onCheckedChange={() => handleToggleActive(field)}
                          disabled={!canManageAdmins || isSystemField(field.field_name)}
                        />
                      </TableCell>
                      {canManageAdmins && (
                        <TableCell className="text-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            onClick={() => openDeleteDialog(field)}
                            disabled={isSystemField(field.field_name)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={canManageAdmins ? 5 : 3} className="text-center h-24">
                      <p>لا توجد حقول مسجلة</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد حذف الحقل</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من رغبتك في حذف الحقل "{fieldToDelete?.display_name}"؟ 
              هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse justify-start gap-2">
            <AlertDialogCancel className="mb-0">إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteField}
              className="bg-destructive hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default SiteFieldsManager;
