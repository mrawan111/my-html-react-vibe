-- Drop the restrictive policy temporarily for development
DROP POLICY IF EXISTS "Operators can manage vouchers" ON public.vouchers;

-- Create a more permissive policy for development that allows authenticated users
CREATE POLICY "Development vouchers policy" 
ON public.vouchers 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);