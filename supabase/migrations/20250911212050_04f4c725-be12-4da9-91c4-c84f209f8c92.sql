-- Delete all profiles (this will cascade to related data)
DELETE FROM profiles;

-- Create admin function to manage users (for cleanup and setup)
CREATE OR REPLACE FUNCTION admin_cleanup_and_setup()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  -- Note: We cannot directly delete from auth.users table
  -- Users need to be deleted from Supabase dashboard manually
  -- This function prepares the profiles table
$$;