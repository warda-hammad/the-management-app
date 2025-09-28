-- Create departments table
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('manager', 'employee', 'viewer')),
  department_id UUID REFERENCES public.departments(id),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create files table
CREATE TABLE public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;

-- RLS Policies for departments
CREATE POLICY "Everyone can view departments" ON public.departments
  FOR SELECT USING (true);

CREATE POLICY "Managers can manage departments" ON public.departments
  FOR ALL USING (public.get_user_role(auth.uid()) = 'manager');

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Managers can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) = 'manager');

CREATE POLICY "Managers can update all profiles" ON public.profiles
  FOR UPDATE USING (public.get_user_role(auth.uid()) = 'manager');

-- RLS Policies for tasks
CREATE POLICY "Users can view tasks in their department" ON public.tasks
  FOR SELECT USING (
    department_id IN (
      SELECT department_id FROM public.profiles WHERE user_id = auth.uid()
    ) OR 
    assigned_to = auth.uid() OR 
    created_by = auth.uid() OR
    public.get_user_role(auth.uid()) = 'manager'
  );

CREATE POLICY "Users can create tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their assigned tasks or created tasks" ON public.tasks
  FOR UPDATE USING (
    assigned_to = auth.uid() OR 
    created_by = auth.uid() OR
    public.get_user_role(auth.uid()) = 'manager'
  );

CREATE POLICY "Managers and creators can delete tasks" ON public.tasks
  FOR DELETE USING (
    created_by = auth.uid() OR
    public.get_user_role(auth.uid()) = 'manager'
  );

-- RLS Policies for files
CREATE POLICY "Users can view files in their department" ON public.files
  FOR SELECT USING (
    department_id IN (
      SELECT department_id FROM public.profiles WHERE user_id = auth.uid()
    ) OR 
    uploaded_by = auth.uid() OR
    public.get_user_role(auth.uid()) = 'manager'
  );

CREATE POLICY "Users can upload files" ON public.files
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own files" ON public.files
  FOR DELETE USING (
    uploaded_by = auth.uid() OR
    public.get_user_role(auth.uid()) = 'manager'
  );

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('files', 'files', false);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

-- Storage policies for files bucket
CREATE POLICY "Users can view files in their department" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'files' AND (
      auth.uid()::text = (storage.foldername(storage.objects.name))[1] OR
      EXISTS (
        SELECT 1 FROM public.files f 
        JOIN public.profiles p ON f.uploaded_by = p.user_id
        WHERE f.file_path = storage.objects.name AND p.department_id IN (
          SELECT department_id FROM public.profiles WHERE user_id = auth.uid()
        )
      ) OR
      public.get_user_role(auth.uid()) = 'manager'
    )
  );

CREATE POLICY "Users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'files' AND 
    auth.uid()::text = (storage.foldername(storage.objects.name))[1]
  );

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'files' AND (
      auth.uid()::text = (storage.foldername(storage.objects.name))[1] OR
      public.get_user_role(auth.uid()) = 'manager'
    )
  );

-- Storage policies for avatars bucket
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(storage.objects.name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(storage.objects.name))[1]
  );

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();