import { ReactNode, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  Eye, 
  FileText, 
  BarChart3,
  LogOut,
  Menu,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { t, isRTL } = useLanguage();
  const { user, logout, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const navigationItems = [
    { icon: LayoutDashboard, label: t('nav.dashboard'), path: '/', roles: ['manager', 'employee', 'viewer'] },
    { icon: Users, label: t('nav.employees'), path: '/employees', roles: ['manager'] },
    { icon: CheckSquare, label: t('nav.tasks'), path: '/tasks', roles: ['manager', 'employee'] },
    { icon: Eye, label: t('nav.followup'), path: '/followup', roles: ['manager'] },
    { icon: FileText, label: t('nav.files'), path: '/files', roles: ['manager', 'employee'] },
    { icon: BarChart3, label: t('nav.reports'), path: '/reports', roles: ['manager'] },
  ];

  const filteredNavItems = navigationItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className={cn("min-h-screen bg-background", isRTL ? "rtl" : "ltr")}>
      {/* Header */}
      <header className="border-b bg-white shadow-sm fixed top-0 left-0 right-0 z-40">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex-shrink-0"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-primary-dark truncate">
              {t('dashboard.title')}
            </h1>
          </div>

          <div className="flex items-center gap-2 lg:gap-4 min-w-0">
            <span className="text-xs lg:text-sm text-muted-foreground truncate max-w-[120px] lg:max-w-none">
              {user?.name} - {t(`role.${user?.role}`)}
            </span>
            <LanguageSwitcher />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 lg:gap-2 flex-shrink-0"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be signed out of your account and redirected to the login page.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className={cn(
          "bg-white border-r transition-all duration-300 fixed inset-y-16 z-30 lg:static lg:inset-auto lg:z-auto overflow-y-auto",
          sidebarOpen ? "w-64 translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-16"
        )}>
          <nav className="p-4 space-y-2">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    !sidebarOpen && "lg:justify-center lg:px-2"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className={cn(
                    "transition-opacity whitespace-nowrap",
                    !sidebarOpen && "lg:opacity-0 lg:hidden"
                  )}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className={cn(
          "flex-1 min-h-[calc(100vh-4rem)]",
          sidebarOpen ? "lg:ml-0" : "lg:ml-0"
        )}>
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};