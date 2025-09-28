import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { AddEmployeeDialog } from '@/components/AddEmployeeDialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  User,
  Users,
  Building,
  Edit,
  Trash2
} from 'lucide-react';

// Mock employees data
const mockEmployees = [
  {
    id: 1,
    name: 'أحمد محمد السعيد',
    department: 'تقنية المعلومات',
    email: 'ahmed.mohammed@company.com',
    phone: '+966501234567',
    jobTitle: 'مطور أول',
    image: '',
    tasksCount: 12,
    completedTasks: 8
  },
  {
    id: 2,
    name: 'سارة أحمد العلي',
    department: 'الموارد البشرية',
    email: 'sara.ahmed@company.com',
    phone: '+966502345678',
    jobTitle: 'أخصائي موارد بشرية',
    image: '',
    tasksCount: 8,
    completedTasks: 6
  },
  {
    id: 3,
    name: 'محمد علي حسن',
    department: 'المالية',
    email: 'mohammed.ali@company.com',
    phone: '+966503456789',
    jobTitle: 'محاسب مالي',
    image: '',
    tasksCount: 15,
    completedTasks: 12
  },
  {
    id: 4,
    name: 'فاطمة خالد المطيري',
    department: 'التسويق',
    email: 'fatima.khalid@company.com',
    phone: '+966504567890',
    jobTitle: 'أخصائي تسويق',
    image: '',
    tasksCount: 10,
    completedTasks: 7
  },
  {
    id: 5,
    name: 'عبدالله سعد النعيمي',
    department: 'العمليات',
    email: 'abdullah.saad@company.com',
    phone: '+966505678901',
    jobTitle: 'مدير عمليات',
    image: '',
    tasksCount: 20,
    completedTasks: 16
  }
];

export default function Employees() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [employees, setEmployees] = useState(mockEmployees);
  
  const [departments, setDepartments] = useState<string[]>([]);

  // Fetch departments from Supabase
  useEffect(() => {
    const fetchDepartments = async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('name')
        .order('name');
      
      if (!error && data) {
        setDepartments(data.map(dept => dept.name));
      }
    };
    
    fetchDepartments();
  }, []);

  const handleAddEmployee = (newEmployee: any) => {
    setEmployees(prev => [...prev, newEmployee]);
  };

  const handleDeleteEmployee = (employeeId: number) => {
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    toast({
      title: "Employee Deleted",
      description: "Employee has been removed successfully",
    });
  };

  // Filter employees based on search and department
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === '' || employee.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const availableDepartments = departments.length > 0 ? departments : [...new Set(employees.map(emp => emp.department))];

  // Only managers can access this page
  if (user?.role !== 'manager') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Access denied. Manager role required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary-dark">
            {t('nav.employees')}
          </h1>
          <p className="text-muted-foreground">
            Manage your organization's employees
          </p>
        </div>
        <AddEmployeeDialog onEmployeeAdd={handleAddEmployee} departments={departments} />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('common.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select 
              className="px-3 py-2 border rounded-md bg-background"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {availableDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Employees Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="task-fade-in hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent-brown rounded-full flex items-center justify-center overflow-hidden">
                    {employee.image ? (
                      <img 
                        src={employee.image} 
                        alt={employee.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{employee.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{employee.jobTitle}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive"
                    onClick={() => handleDeleteEmployee(employee.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-accent-brown" />
                <span>{employee.department}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-accent-brown" />
                <span className="text-muted-foreground">{employee.email}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-accent-brown" />
                <span className="text-muted-foreground">{employee.phone}</span>
              </div>

              <div className="pt-3 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Task Performance</span>
                  <Badge variant="secondary">
                    {employee.completedTasks}/{employee.tasksCount}
                  </Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-status-completed h-2 rounded-full transition-all"
                    style={{ 
                      width: `${(employee.completedTasks / employee.tasksCount) * 100}%` 
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {employee.tasksCount === 0 ? '0' : Math.round((employee.completedTasks / employee.tasksCount) * 100)}% completion rate
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No employees found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}