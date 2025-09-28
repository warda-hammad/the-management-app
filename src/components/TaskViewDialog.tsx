import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { StatusBadge } from '@/components/StatusBadge';
import { Calendar, User, AlertTriangle, Clock, CheckCircle, XCircle, Filter } from 'lucide-react';

interface TaskViewDialogProps {
  task: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: (taskId: number, status: string) => void;
}

export function TaskViewDialog({ task, open, onOpenChange, onStatusChange }: TaskViewDialogProps) {
  const { t } = useLanguage();
  const { user } = useAuth();

  if (!task) return null;

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

  const statusColor = getTaskStatusColor(task.deadline, task.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {task.title}
            <StatusBadge status={statusColor}>
              <div className="flex items-center gap-1">
                {getStatusIcon(task.status)}
                {t(`tasks.${task.status}`)}
              </div>
            </StatusBadge>
            <Badge variant={task.priority === 'urgent' ? 'destructive' : 'secondary'}>
              {t(`tasks.${task.priority}`)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">{t('tasks.description')}</h3>
            <p className="text-muted-foreground">{task.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-accent-brown" />
              <span className="font-medium">Created:</span>
              <span className="text-muted-foreground">
                {new Date(task.createdAt).toLocaleDateString('ar-SA')}
              </span>
            </div>
          </div>

          {/* Action buttons based on user role and task status */}
          <div className="flex gap-2 pt-4 border-t">
            {user?.role === 'manager' && (
              <>
                {task.status === 'completed' && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="bg-status-completed hover:bg-status-completed/90"
                    onClick={() => onStatusChange?.(task.id, 'approved')}
                  >
                    Approve
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  {t('common.edit')}
                </Button>
              </>
            )}

            {user?.role === 'employee' && task.assignedTo === user?.name && (
              <>
                {task.status === 'pending' && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="bg-status-progress hover:bg-status-progress/90"
                    onClick={() => onStatusChange?.(task.id, 'progress')}
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
                      onClick={() => onStatusChange?.(task.id, 'completed')}
                    >
                      Mark Complete
                    </Button>
                    <Button variant="outline" size="sm">
                      Add Note
                    </Button>
                    <Button variant="outline" size="sm">
                      Upload File
                    </Button>
                  </>
                )}
                {task.status === 'progress' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onStatusChange?.(task.id, 'declined')}
                  >
                    Decline Task
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}