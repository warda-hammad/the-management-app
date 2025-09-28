-- Fix the security definer function to have immutable search path
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;