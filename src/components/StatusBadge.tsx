import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'pending' | 'urgent' | 'progress' | 'completed' | 'declined';
  className?: string;
  children: React.ReactNode;
}

export const StatusBadge = ({ status, className, children }: StatusBadgeProps) => {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-status-pending text-black';
      case 'urgent':
        return 'bg-status-urgent text-white';
      case 'progress':
        return 'bg-status-progress text-black';
      case 'completed':
        return 'bg-status-completed text-white';
      case 'declined':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        getStatusStyles(status),
        className
      )}
    >
      {children}
    </span>
  );
};