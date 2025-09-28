import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

interface AddTaskDialogProps {
  onTaskAdd: (task: any) => void;
}

const mockEmployees = [
  { id: 1, name: 'أحمد محمد السعيد', department: 'تقنية المعلومات' },
  { id: 2, name: 'سارة أحمد العلي', department: 'الموارد البشرية' },
  { id: 3, name: 'محمد علي حسن', department: 'المالية' },
  { id: 4, name: 'فاطمة خالد المطيري', department: 'التسويق' },
  { id: 5, name: 'عبدالله سعد النعيمي', department: 'العمليات' },
];

export function AddTaskDialog({ onTaskAdd }: AddTaskDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    assignedTo: '',
    priority: 'normal'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.deadline || !formData.assignedTo) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const selectedEmployee = mockEmployees.find(emp => emp.id.toString() === formData.assignedTo);
    
    const newTask = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      deadline: formData.deadline,
      assignedTo: selectedEmployee?.name || '',
      assignedById: 1, // Current manager
      priority: formData.priority,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      department: selectedEmployee?.department || ''
    };

    onTaskAdd(newTask);
    setOpen(false);
    setFormData({
      title: '',
      description: '',
      deadline: '',
      assignedTo: '',
      priority: 'normal'
    });

    toast({
      title: "Success",
      description: "Task has been created successfully",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary-dark hover:bg-secondary-dark">
          <Plus className="h-4 w-4 mr-2" />
          {t('tasks.addNew')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{t('tasks.addNew')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('tasks.title')} *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('tasks.description')} *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter task description"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline">{t('tasks.deadline')} *</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">{t('tasks.priority')}</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">{t('tasks.normal')}</SelectItem>
                  <SelectItem value="urgent">{t('tasks.urgent')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedTo">{t('tasks.assignedTo')} *</Label>
            <Select value={formData.assignedTo} onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {mockEmployees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    {employee.name} - {employee.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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