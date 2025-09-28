import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Upload } from 'lucide-react';

interface AddEmployeeDialogProps {
  onEmployeeAdd: (employee: any) => void;
  departments?: string[];
}

const defaultDepartments = [
  'تقنية المعلومات',
  'الموارد البشرية', 
  'المالية',
  'التسويق',
  'العمليات',
  'الإدارة العامة'
];

const jobTitles = [
  'مطور أول',
  'أخصائي موارد بشرية',
  'محاسب مالي',
  'أخصائي تسويق',
  'مدير عمليات',
  'مدير إداري',
  'محلل أعمال',
  'مصمم جرافيك'
];

export function AddEmployeeDialog({ onEmployeeAdd, departments = defaultDepartments }: AddEmployeeDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    jobTitle: '',
    image: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.department || !formData.jobTitle) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    let imageUrl = '';
    if (imageFile) {
      // Create object URL for the image
      imageUrl = URL.createObjectURL(imageFile);
    }

    const newEmployee = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      jobTitle: formData.jobTitle,
      image: imageUrl,
      tasksCount: 0,
      completedTasks: 0
    };

    onEmployeeAdd(newEmployee);
    setOpen(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: '',
      jobTitle: '',
      image: ''
    });
    setImageFile(null);

    toast({
      title: "Success",
      description: "Employee has been added successfully",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary-dark hover:bg-secondary-dark">
          <Plus className="h-4 w-4 mr-2" />
          {t('employees.addNew')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{t('employees.addNew')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter employee name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+966501234567"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Profile Image</Label>
            <div className="flex items-center gap-4">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImageFile(file);
                  }
                }}
                className="flex-1"
              />
              {imageFile && (
                <div className="w-16 h-16 border rounded-lg overflow-hidden">
                  <img 
                    src={URL.createObjectURL(imageFile)} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Select value={formData.jobTitle} onValueChange={(value) => setFormData(prev => ({ ...prev, jobTitle: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job title" />
                </SelectTrigger>
                <SelectContent>
                  {jobTitles.map((title) => (
                    <SelectItem key={title} value={title}>
                      {title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">
              {t('common.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}