import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { DepartmentManagementDialog } from '@/components/DepartmentManagementDialog';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckSquare, 
  Users, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Calendar
} from 'lucide-react';

// Mock data - in real app, this would come from your database
const mockStats = {
  totalTasks: 156,
  completedTasks: 89,
  employeesCount: 45,
  inProgressTasks: 34,
  overdueTasks: 12,
  thisYearTasks: 156
};

const mockChartData = [
  { month: 'Jan', completed: 15, pending: 8 },
  { month: 'Feb', completed: 22, pending: 12 },
  { month: 'Mar', completed: 18, pending: 6 },
  { month: 'Apr', completed: 25, pending: 15 },
  { month: 'May', completed: 20, pending: 10 },
  { month: 'Jun', completed: 28, pending: 8 },
];

const recentTasks = [
  {
    id: 1,
    title: 'تحديث نظام إدارة المحتوى',
    assignee: 'أحمد محمد',
    deadline: '2024-01-15',
    status: 'progress',
    priority: 'urgent'
  },
  {
    id: 2,
    title: 'مراجعة التقارير المالية',
    assignee: 'سارة أحمد',
    deadline: '2024-01-20',
    status: 'pending',
    priority: 'normal'
  },
  {
    id: 3,
    title: 'تدريب الموظفين الجدد',
    assignee: 'محمد علي',
    deadline: '2024-01-10',
    status: 'completed',
    priority: 'normal'
  }
];

export default function Dashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  // Real data state
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    employeesCount: 0,
    inProgressTasks: 0,
    overdueTasks: 0
  });
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Department management state
  const [departments, setDepartments] = useState<string[]>([]);

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        // Fetch departments
        const { data: departmentsData } = await supabase
          .from('departments')
          .select('name')
          .order('name');
        
        if (departmentsData) {
          setDepartments(departmentsData.map(d => d.name));
        }

        // Fetch tasks stats
        const { data: tasksData } = await supabase
          .from('tasks')
          .select('status, created_at');
        
        if (tasksData) {
          const totalTasks = tasksData.length;
          const completedTasks = tasksData.filter(t => t.status === 'completed').length;
          const inProgressTasks = tasksData.filter(t => t.status === 'progress').length;
          const overdueTasks = tasksData.filter(t => 
            t.status !== 'completed' && 
            new Date(t.created_at) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          ).length;

          setStats({
            totalTasks,
            completedTasks,
            inProgressTasks,
            overdueTasks,
            employeesCount: 0 // Will fetch from profiles if needed
          });
        }

        // Fetch recent tasks
        const { data: recentTasksData } = await supabase
          .from('tasks')
          .select(`
            id,
            title,
            status,
            priority,
            due_date,
            profiles!tasks_assigned_to_fkey(name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (recentTasksData) {
          setRecentTasks(recentTasksData);
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleDepartmentsUpdate = async (updatedDepartments: string[]) => {
    try {
      // Get current departments from database
      const { data: currentDepts } = await supabase
        .from('departments')
        .select('name');
      
      const currentNames = currentDepts?.map(d => d.name) || [];
      
      // Find new departments to add
      const newDepartments = updatedDepartments.filter(name => !currentNames.includes(name));
      
      // Add new departments to database
      if (newDepartments.length > 0) {
        const { error } = await supabase
          .from('departments')
          .insert(newDepartments.map(name => ({ name })));
        
        if (error) {
          console.error('Error adding departments:', error);
          return;
        }
      }
      
      // Find departments to remove
      const departmentsToRemove = currentNames.filter(name => !updatedDepartments.includes(name));
      
      // Remove departments from database
      if (departmentsToRemove.length > 0) {
        const { error } = await supabase
          .from('departments')
          .delete()
          .in('name', departmentsToRemove);
        
        if (error) {
          console.error('Error removing departments:', error);
          return;
        }
      }
      
      setDepartments(updatedDepartments);
      
      // Refresh the departments list
      const { data: refreshedDepts } = await supabase
        .from('departments')
        .select('name')
        .order('name');
      
      if (refreshedDepts) {
        setDepartments(refreshedDepts.map(d => d.name));
      }
    } catch (error) {
      console.error('Error updating departments:', error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, change, changeType }: {
    title: string;
    value: number;
    icon: any;
    change?: number;
    changeType?: 'positive' | 'negative' | 'neutral';
  }) => (
    <Card className="task-fade-in">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-accent-brown" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary-dark">{value}</div>
        {change !== undefined && (
          <p className={`text-xs ${
            changeType === 'positive' ? 'text-status-completed' :
            changeType === 'negative' ? 'text-status-urgent' :
            'text-muted-foreground'
          }`}>
            {change > 0 ? '+' : ''}{change}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary-dark mb-2">
            {t('nav.dashboard')}
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}
          </p>
        </div>
        {user?.role === 'manager' && (
          <DepartmentManagementDialog 
            departments={departments}
            onDepartmentsUpdate={handleDepartmentsUpdate}
          />
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('dashboard.totalTasks')}
          value={stats.totalTasks}
          icon={Calendar}
        />
        <StatCard
          title={t('dashboard.completedTasks')}
          value={stats.completedTasks}
          icon={CheckSquare}
        />
        <StatCard
          title={t('dashboard.employees')}
          value={stats.employeesCount}
          icon={Users}
        />
        <StatCard
          title={t('dashboard.inProgress')}
          value={stats.inProgressTasks}
          icon={Clock}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Performance Chart Placeholder */}
        <Card className="task-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent-brown" />
              {t('dashboard.performance')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center bg-muted rounded-lg">
              <p className="text-muted-foreground">Chart Component Placeholder</p>
            </div>
          </CardContent>
        </Card>

        {/* Overdue Tasks */}
        <Card className="task-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-status-urgent">
              <AlertTriangle className="h-5 w-5" />
              {t('dashboard.overdue')} ({stats.overdueTasks})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                <p className="text-muted-foreground text-sm">Loading...</p>
              ) : recentTasks.length === 0 ? (
                <p className="text-muted-foreground text-sm">No overdue tasks</p>
              ) : (
                recentTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.profiles?.name || 'Unassigned'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-status-urgent font-medium">
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No deadline'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks Overview */}
      <Card className="task-fade-in">
        <CardHeader>
          <CardTitle>Recent Tasks Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground">Loading recent tasks...</p>
            ) : recentTasks.length === 0 ? (
              <p className="text-muted-foreground">No recent tasks found</p>
            ) : (
              recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Assigned to: {task.profiles?.name || 'Unassigned'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      task.status === 'completed' ? 'bg-status-completed text-white' :
                      task.status === 'progress' ? 'bg-status-progress text-black' :
                      'bg-status-pending text-black'
                    }`}>
                      {task.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      task.priority === 'urgent' ? 'bg-status-urgent text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No deadline'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}