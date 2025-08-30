-- Insert a default admin profile if no profiles exist
INSERT INTO public.profiles (user_id, full_name, role)
SELECT 
  '00000000-0000-0000-0000-000000000000'::uuid,
  'Admin User',
  'admin'
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin');

-- Update the vouchers RLS policy to allow authenticated users to create vouchers
-- if they have admin or operator role, or if no admins exist yet (bootstrap case)
DROP POLICY IF EXISTS "Operators can manage vouchers" ON public.vouchers;

CREATE POLICY "Operators can manage vouchers" 
ON public.vouchers 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = ANY (ARRAY['admin'::text, 'operator'::text])
  )
  OR 
  -- Allow if no admin users exist (bootstrap case)
  NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'admin')
);

-- Also create a more permissive temporary policy for development
CREATE POLICY "Temporary development policy for vouchers" 
ON public.vouchers 
FOR ALL 
USING (true)
WITH CHECK (true);