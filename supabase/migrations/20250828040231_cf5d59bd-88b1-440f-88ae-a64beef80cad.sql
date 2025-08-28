-- Add columns to routers table for MikroTik API credentials and configuration
ALTER TABLE public.routers 
ADD COLUMN api_port integer DEFAULT 8728,
ADD COLUMN api_username text,
ADD COLUMN api_password text,
ADD COLUMN connection_type text DEFAULT 'mikrotik-api',
ADD COLUMN hotspot_interface text,
ADD COLUMN hotspot_enabled boolean DEFAULT false;

-- Add constraint for connection type
ALTER TABLE public.routers 
ADD CONSTRAINT check_connection_type 
CHECK (connection_type IN ('mikrotik-api', 'winbox', 'ssh'));

-- Create router_credentials table for secure credential storage
CREATE TABLE public.router_credentials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  router_id uuid NOT NULL REFERENCES public.routers(id) ON DELETE CASCADE,
  api_username text NOT NULL,
  api_password text NOT NULL,
  api_port integer NOT NULL DEFAULT 8728,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on router_credentials
ALTER TABLE public.router_credentials ENABLE ROW LEVEL SECURITY;

-- Create policies for router_credentials
CREATE POLICY "Admins can manage router credentials" 
ON public.router_credentials 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Add trigger for updated_at on router_credentials
CREATE TRIGGER update_router_credentials_updated_at
BEFORE UPDATE ON public.router_credentials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();