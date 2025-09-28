import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Building, Trash2 } from 'lucide-react';

interface DepartmentManagementDialogProps {
  departments: string[];
  onDepartmentsUpdate: (departments: string[]) => void;
}

export function DepartmentManagementDialog({ departments, onDepartmentsUpdate }: DepartmentManagementDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [newDepartment, setNewDepartment] = useState('');

  const handleAddDepartment = () => {
    if (!newDepartment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a department name",
        variant: "destructive"
      });
      return;
    }

    if (departments.includes(newDepartment.trim())) {
      toast({
        title: "Error",
        description: "Department already exists",
        variant: "destructive"
      });
      return;
    }

    const updatedDepartments = [...departments, newDepartment.trim()];
    onDepartmentsUpdate(updatedDepartments);
    setNewDepartment('');
    
    toast({
      title: "Success",
      description: "Department added successfully",
    });
  };

  const handleDeleteDepartment = (departmentToDelete: string) => {
    const updatedDepartments = departments.filter(dept => dept !== departmentToDelete);
    onDepartmentsUpdate(updatedDepartments);
    
    toast({
      title: "Success",
      description: "Department removed successfully",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Building className="h-4 w-4" />
          Manage Departments
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Department Management</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Add New Department */}
          <div className="space-y-2">
            <Label htmlFor="newDepartment">Add New Department</Label>
            <div className="flex gap-2">
              <Input
                id="newDepartment"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                placeholder="Enter department name"
                onKeyPress={(e) => e.key === 'Enter' && handleAddDepartment()}
              />
              <Button onClick={handleAddDepartment}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Current Departments */}
          <div className="space-y-2">
            <Label>Current Departments ({departments.length})</Label>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {departments.length === 0 ? (
                <p className="text-muted-foreground text-sm">No departments added yet</p>
              ) : (
                departments.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <Badge variant="secondary">{dept}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDepartment(dept)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}