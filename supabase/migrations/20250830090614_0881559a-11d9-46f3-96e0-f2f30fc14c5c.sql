-- Remove the restrictive policy temporarily for development
DROP POLICY IF EXISTS "Operators can manage vouchers" ON public.vouchers;

-- Create a temporary permissive policy for development
DROP POLICY IF EXISTS "Temporary development policy for vouchers" ON public.vouchers;

CREATE POLICY "Development vouchers access" 
ON public.vouchers 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);