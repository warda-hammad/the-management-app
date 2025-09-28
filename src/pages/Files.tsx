import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { FileUploadDialog } from '@/components/FileUploadDialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  Search, 
  FileText,
  Image,
  Download,
  Trash2,
  Folder,
  File
} from 'lucide-react';

// Mock files data
const mockFiles = [
  {
    id: 1,
    name: 'Task_Report_Q1_2024.pdf',
    type: 'pdf',
    size: '2.5 MB',
    uploadedBy: 'أحمد محمد السعيد',
    uploadedAt: '2024-01-15',
    taskTitle: 'إعداد التقرير المالي الربعي',
    taskId: 3
  },
  {
    id: 2,
    name: 'UI_Design_Mockups.png',
    type: 'image',
    size: '8.1 MB',
    uploadedBy: 'أحمد محمد السعيد',
    uploadedAt: '2024-01-20',
    taskTitle: 'تطوير واجهة المستخدم الجديدة',
    taskId: 1
  },
  {
    id: 3,
    name: 'HR_Policy_Draft_v2.docx',
    type: 'document',
    size: '1.2 MB',
    uploadedBy: 'سارة أحمد العلي',
    uploadedAt: '2024-01-18',
    taskTitle: 'مراجعة السياسات الداخلية',
    taskId: 2
  },
  {
    id: 4,
    name: 'Marketing_Campaign_Analysis.xlsx',
    type: 'spreadsheet',
    size: '3.4 MB',
    uploadedBy: 'فاطمة خالد المطيري',
    uploadedAt: '2024-01-22',
    taskTitle: 'حملة التسويق الرقمي',
    taskId: 4
  },
  {
    id: 5,
    name: 'Process_Improvement_Proposal.pdf',
    type: 'pdf',
    size: '1.8 MB',
    uploadedBy: 'عبدالله سعد النعيمي',
    uploadedAt: '2024-01-25',
    taskTitle: 'تحسين العمليات التشغيلية',
    taskId: 5
  }
];

export default function Files() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Fetch files from Supabase
  useEffect(() => {
    const fetchFiles = async () => {
      if (!user) return;
      
      try {
        const { data: filesData, error } = await supabase
          .from('files')
          .select(`
            *,
            profiles!files_uploaded_by_fkey(name)
          `)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching files:', error);
          toast({
            title: "Error",
            description: "Failed to load files",
            variant: "destructive"
          });
        } else {
          setFiles(filesData || []);
        }
      } catch (error) {
        console.error('Error fetching files:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [user, toast]);

  const handleFileUpload = (newFile: any) => {
    setFiles(prev => [...prev, newFile]);
  };

  const handleDownload = (file: any) => {
    // Simulate file download
    toast({
      title: "Download Started",
      description: `Downloading ${file.name}`,
    });
  };

  const handleDelete = (fileId: number) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
    toast({
      title: "File Deleted",
      description: "File has been deleted successfully",
    });
  };

  // Filter files based on search and type
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (file.profiles?.name && file.profiles.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === '' || file.mime_type?.startsWith(selectedType);
    
    return matchesSearch && matchesType;
  });

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />;
    } else if (mimeType === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />;
    } else if (mimeType?.includes('word') || mimeType?.includes('document')) {
      return <FileText className="h-8 w-8 text-blue-600" />;
    } else if (mimeType?.includes('sheet') || mimeType?.includes('excel')) {
      return <FileText className="h-8 w-8 text-green-600" />;
    } else {
      return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const fileTypes = [...new Set(files.map(file => file.mime_type?.split('/')[0]).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary-dark">
            {t('nav.files')}
          </h1>
          <p className="text-muted-foreground">
            Central repository for all task-related files
          </p>
        </div>
        <Button 
          className="bg-primary-dark hover:bg-secondary-dark"
          onClick={() => setUploadDialogOpen(true)}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload File
        </Button>
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
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All File Types</option>
              {fileTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Files Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">Loading files...</p>
          </div>
        ) : filteredFiles.map((file) => (
          <Card key={file.id} className="task-fade-in hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getFileIcon(file.mime_type)}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-medium truncate">
                      {file.original_name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {file.file_size ? `${(file.file_size / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleDownload(file)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {(user?.role === 'manager' || file.uploaded_by === user?.id) && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(file.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-primary-dark">Uploaded by:</p>
                <p className="text-sm text-muted-foreground">
                  {file.profiles?.name || 'Unknown user'}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-primary-dark">Upload Date:</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(file.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && filteredFiles.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No files found. Upload your first file to get started.</p>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-dark">{files.length}</div>
              <p className="text-sm text-muted-foreground">Total Files</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-dark">
                {files.filter(f => f.mime_type === 'application/pdf').length}
              </div>
              <p className="text-sm text-muted-foreground">PDF Documents</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-dark">
                {files.filter(f => f.mime_type?.startsWith('image/')).length}
              </div>
              <p className="text-sm text-muted-foreground">Images</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-dark">
                {(files.reduce((total, file) => {
                  return total + (file.file_size || 0);
                }, 0) / 1024 / 1024).toFixed(1)}
              </div>
              <p className="text-sm text-muted-foreground">Total Size (MB)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File Upload Dialog */}
      <FileUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onFileUpload={handleFileUpload}
      />
    </div>
  );
}