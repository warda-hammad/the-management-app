-- Fix security warnings by setting proper search paths for functions
DROP FUNCTION IF EXISTS public.set_first_user_as_admin() CASCADE;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate trigger 
CREATE TRIGGER set_first_user_admin_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_first_user_as_admin();

-- Also fix the existing get_user_role function to have proper search path
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$function$;