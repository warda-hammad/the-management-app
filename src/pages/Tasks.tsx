import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { StatusBadge } from '@/components/StatusBadge';
import { AddTaskDialog } from '@/components/AddTaskDialog';
import { TaskViewDialog } from '@/components/TaskViewDialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  Calendar,
  User,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Eye,
  Edit
} from 'lucide-react';

// Mock tasks data
const mockTasks = [
  {
    id: 1,
    title: 'تطوير واجهة المستخدم الجديدة',
    description: 'تصميم وتطوير واجهة مستخدم حديثة للنظام الإداري',
    deadline: '2024-02-15',
    assignedTo: 'أحمد محمد السعيد',
    assignedById: 1,
    priority: 'urgent',
    status: 'progress',
    createdAt: '2024-01-01',
    department: 'تقنية المعلومات'
  },
  {
    id: 2,
    title: 'مراجعة السياسات الداخلية',
    description: 'مراجعة وتحديث سياسات الموارد البشرية',
    deadline: '2024-03-01',
    assignedTo: 'سارة أحمد العلي',
    assignedById: 1,
    priority: 'normal',
    status: 'pending',
    createdAt: '2024-01-05',
    department: 'الموارد البشرية'
  },
  {
    id: 3,
    title: 'إعداد التقرير المالي الربعي',
    description: 'تجميع وتحليل البيانات المالية للربع الأول',
    deadline: '2024-01-31',
    assignedTo: 'محمد علي حسن',
    assignedById: 1,
    priority: 'urgent',
    status: 'completed',
    createdAt: '2024-01-10',
    department: 'المالية'
  },
  {
    id: 4,
    title: 'حملة التسويق الرقمي',
    description: 'تخطيط وتنفيذ حملة تسويقية على وسائل التواصل الاجتماعي',
    deadline: '2024-02-28',
    assignedTo: 'فاطمة خالد المطيري',
    assignedById: 1,
    priority: 'normal',
    status: 'progress',
    createdAt: '2024-01-12',
    department: 'التسويق'
  },
  {
    id: 5,
    title: 'تحسين العمليات التشغيلية',
    description: 'دراسة وتحسين الكفاءة في العمليات اليومية',
    deadline: '2024-04-15',
    assignedTo: 'عبدالله سعد النعيمي',
    assignedById: 1,
    priority: 'normal',
    status: 'pending',
    createdAt: '2024-01-15',
    department: 'العمليات'
  }
];

export default function Tasks() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState(mockTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const handleTaskAdd = (newTask: any) => {
    setTasks(prev => [...prev, newTask]);
  };

  const handleStatusChange = (taskId: number, newStatus: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
    
    toast({
      title: "Task Updated",
      description: `Task status changed to ${newStatus}`,
    });
  };

  const handleViewTask = (task: any) => {
    setSelectedTask(task);
    setViewDialogOpen(true);
  };

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || task.status === statusFilter;
    const matchesPriority = priorityFilter === '' || task.priority === priorityFilter;
    
    // If user is employee, only show tasks assigned to them
    if (user?.role === 'employee') {
      const matchesAssignee = task.assignedTo === user.name;
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    }
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getTaskStatusColor = (deadline: string, status: string) => {
    if (status === 'completed') return 'completed';
    if (status === 'declined') return 'declined';
    if (status === 'progress') return 'progress';
    
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return 'urgent';
    return 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'progress':
        return <Clock className="h-4 w-4" />;
      case 'declined':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary-dark">
            {t('nav.tasks')}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === 'manager' ? 'Manage and assign tasks' : 'Your assigned tasks'}
          </p>
        </div>
        {user?.role === 'manager' && (
          <AddTaskDialog onTaskAdd={handleTaskAdd} />
        )}
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">{t('tasks.pending')}</option>
              <option value="progress">{t('tasks.inProgress')}</option>
              <option value="completed">{t('tasks.completed')}</option>
              <option value="declined">{t('tasks.declined')}</option>
            </select>

            <select 
              className="px-3 py-2 border rounded-md bg-background"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priority</option>
              <option value="urgent">{t('tasks.urgent')}</option>
              <option value="normal">{t('tasks.normal')}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => {
          const statusColor = getTaskStatusColor(task.deadline, task.status);
          
          return (
            <Card key={task.id} className="task-fade-in hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-primary-dark">
                        {task.title}
                      </h3>
                      <StatusBadge status={statusColor}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(task.status)}
                          {t(`tasks.${task.status}`)}
                        </div>
                      </StatusBadge>
                      <Badge variant={task.priority === 'urgent' ? 'destructive' : 'secondary'}>
                        {t(`tasks.${task.priority}`)}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{task.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-accent-brown" />
                    <span className="font-medium">{t('tasks.assignedTo')}:</span>
                    <span className="text-muted-foreground">{task.assignedTo}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-accent-brown" />
                    <span className="font-medium">{t('tasks.deadline')}:</span>
                    <span className={`${
                      getTaskStatusColor(task.deadline, task.status) === 'urgent' ? 'text-status-urgent font-medium' : 'text-muted-foreground'
                    }`}>
                      {new Date(task.deadline).toLocaleDateString('ar-SA')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-accent-brown" />
                    <span className="font-medium">Department:</span>
                    <span className="text-muted-foreground">{task.department}</span>
                  </div>
                </div>

                {user?.role === 'manager' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm" onClick={() => handleViewTask(task)}>
                      <Eye className="h-4 w-4 mr-1" />
                      {t('common.view')}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      {t('common.edit')}
                    </Button>
                    {task.status === 'completed' && (
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="bg-status-completed hover:bg-status-completed/90"
                        onClick={() => handleStatusChange(task.id, 'approved')}
                      >
                        Approve
                      </Button>
                    )}
                  </div>
                )}

                {user?.role === 'employee' && task.assignedTo === user?.name && (
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm" onClick={() => handleViewTask(task)}>
                      <Eye className="h-4 w-4 mr-1" />
                      {t('common.view')}
                    </Button>
                    {task.status === 'pending' && (
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="bg-status-progress hover:bg-status-progress/90"
                        onClick={() => handleStatusChange(task.id, 'progress')}
                      >
                        Start Task
                      </Button>
                    )}
                    {task.status === 'progress' && (
                      <>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="bg-status-completed hover:bg-status-completed/90"
                          onClick={() => handleStatusChange(task.id, 'completed')}
                        >
                          Mark Complete
                        </Button>
                        <Button variant="outline" size="sm">
                          Add Note
                        </Button>
                        <Button variant="outline" size="sm">
                          Upload File
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleStatusChange(task.id, 'declined')}
                        >
                          Decline
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {user?.role === 'employee' 
                ? 'No tasks assigned to you matching the criteria.' 
                : 'No tasks found matching your criteria.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Task View Dialog */}
      <TaskViewDialog
        task={selectedTask}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}