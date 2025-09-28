-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert their own profile during signup" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Also, let's create a trigger to automatically create profiles when users sign up
-- This is more reliable than doing it in the application code

-- First, create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    NEW.email,
    'employee'
  );
  RETURN NEW;
END;
$$;

-- Create trigger to run the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();