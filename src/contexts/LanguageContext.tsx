import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.employees': 'Employees',
    'nav.tasks': 'Tasks',
    'nav.followup': 'Follow-up',
    'nav.files': 'Files',
    'nav.reports': 'Reports',
    
    // Dashboard
    'dashboard.title': 'Task Management Dashboard',
    'dashboard.totalTasks': 'Total Tasks',
    'dashboard.completedTasks': 'Completed Tasks',
    'dashboard.employees': 'Employees',
    'dashboard.inProgress': 'In Progress',
    'dashboard.overdue': 'Overdue Tasks',
    'dashboard.performance': 'Performance Overview',
    
    // Tasks
    'tasks.title': 'Task Title',
    'tasks.description': 'Description',
    'tasks.deadline': 'Deadline',
    'tasks.priority': 'Priority',
    'tasks.status': 'Status',
    'tasks.assignedTo': 'Assigned To',
    'tasks.urgent': 'Urgent',
    'tasks.normal': 'Normal',
    'tasks.pending': 'Pending',
    'tasks.inProgress': 'In Progress',
    'tasks.completed': 'Completed',
    'tasks.declined': 'Declined',
    'tasks.addNew': 'Add New Task',
    
    // Employees
    'employees.name': 'Name',
    'employees.department': 'Department',
    'employees.email': 'Email',
    'employees.phone': 'Phone',
    'employees.jobTitle': 'Job Title',
    'employees.addNew': 'Add New Employee',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.view': 'View',
    'common.search': 'Search...',
    'common.filter': 'Filter',
    'common.export': 'Export',
    
    // Roles
    'role.manager': 'Manager',
    'role.employee': 'Employee',
    'role.viewer': 'Viewer',
  },
  ar: {
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.employees': 'الموظفين',
    'nav.tasks': 'المهام',
    'nav.followup': 'المتابعة',
    'nav.files': 'الملفات',
    'nav.reports': 'التقارير',
    
    // Dashboard
    'dashboard.title': 'لوحة تحكم إدارة المهام',
    'dashboard.totalTasks': 'إجمالي المهام',
    'dashboard.completedTasks': 'المهام المكتملة',
    'dashboard.employees': 'الموظفين',
    'dashboard.inProgress': 'قيد التنفيذ',
    'dashboard.overdue': 'المهام المتأخرة',
    'dashboard.performance': 'نظرة عامة على الأداء',
    
    // Tasks
    'tasks.title': 'عنوان المهمة',
    'tasks.description': 'الوصف',
    'tasks.deadline': 'الموعد النهائي',
    'tasks.priority': 'الأولوية',
    'tasks.status': 'الحالة',
    'tasks.assignedTo': 'مُكلف إلى',
    'tasks.urgent': 'عاجل',
    'tasks.normal': 'عادي',
    'tasks.pending': 'في الانتظار',
    'tasks.inProgress': 'قيد التنفيذ',
    'tasks.completed': 'مكتمل',
    'tasks.declined': 'مرفوض',
    'tasks.addNew': 'إضافة مهمة جديدة',
    
    // Employees
    'employees.name': 'الاسم',
    'employees.department': 'القسم',
    'employees.email': 'البريد الإلكتروني',
    'employees.phone': 'الهاتف',
    'employees.jobTitle': 'المسمى الوظيفي',
    'employees.addNew': 'إضافة موظف جديد',
    
    // Common
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.edit': 'تعديل',
    'common.delete': 'حذف',
    'common.view': 'عرض',
    'common.search': 'بحث...',
    'common.filter': 'تصفية',
    'common.export': 'تصدير',
    
    // Roles
    'role.manager': 'مدير',
    'role.employee': 'موظف',
    'role.viewer': 'مراقب',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  const isRTL = language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [isRTL, language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};