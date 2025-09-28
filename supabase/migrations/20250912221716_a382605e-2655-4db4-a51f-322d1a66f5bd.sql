-- Update the first registered user to be an admin
-- This will help ensure at least one admin exists
CREATE OR REPLACE FUNCTION public.set_first_user_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the first user in profiles table
  IF (SELECT COUNT(*) FROM public.profiles) = 1 THEN
    -- Update the first user to be an admin
    UPDATE public.profiles 
    SET role = 'admin' 
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run after profile creation
CREATE TRIGGER set_first_user_admin_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_first_user_as_admin();