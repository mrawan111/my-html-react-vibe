-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'operator', 'user')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create routers table
CREATE TABLE public.routers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cloud_name TEXT NOT NULL,
  router_name TEXT NOT NULL,
  identifier TEXT NOT NULL UNIQUE,
  ip_address INET,
  last_contact TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'maintenance')),
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create voucher packages table
CREATE TABLE public.voucher_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER DEFAULT 0,
  duration_hours INTEGER DEFAULT 0,
  duration_minutes INTEGER DEFAULT 0,
  data_limit_gb DECIMAL(10,2),
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vouchers table
CREATE TABLE public.vouchers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  package_id UUID NOT NULL REFERENCES public.voucher_packages(id),
  router_id UUID NOT NULL REFERENCES public.routers(id),
  status TEXT DEFAULT 'unused' CHECK (status IN ('unused', 'active', 'expired', 'suspended')),
  created_by UUID REFERENCES auth.users(id),
  used_by TEXT, -- MAC address or user identifier
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  remaining_data_gb DECIMAL(10,2),
  remaining_time_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales table
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voucher_id UUID NOT NULL REFERENCES public.vouchers(id),
  router_id UUID NOT NULL REFERENCES public.routers(id),
  package_id UUID NOT NULL REFERENCES public.voucher_packages(id),
  amount DECIMAL(10,2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  sold_by UUID REFERENCES auth.users(id),
  sold_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'digital')),
  notes TEXT
);

-- Create usage tracking table
CREATE TABLE public.usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voucher_id UUID NOT NULL REFERENCES public.vouchers(id),
  router_id UUID NOT NULL REFERENCES public.routers(id),
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  data_used_mb DECIMAL(10,2) DEFAULT 0,
  duration_minutes INTEGER DEFAULT 0,
  user_ip INET,
  user_mac TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily statistics table
CREATE TABLE public.daily_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  router_id UUID NOT NULL REFERENCES public.routers(id),
  total_vouchers_sold INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  total_data_used_gb DECIMAL(10,2) DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date, router_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voucher_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for routers (admin access)
CREATE POLICY "Authenticated users can view routers"
ON public.routers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage routers"
ON public.routers FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create RLS policies for voucher packages
CREATE POLICY "Authenticated users can view packages"
ON public.voucher_packages FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage packages"
ON public.voucher_packages FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'operator')
  )
);

-- Create RLS policies for vouchers
CREATE POLICY "Authenticated users can view vouchers"
ON public.vouchers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Operators can manage vouchers"
ON public.vouchers FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'operator')
  )
);

-- Create RLS policies for sales
CREATE POLICY "Authenticated users can view sales"
ON public.sales FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Operators can create sales"
ON public.sales FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'operator')
  )
);

-- Create RLS policies for usage logs
CREATE POLICY "Authenticated users can view usage logs"
ON public.usage_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "System can manage usage logs"
ON public.usage_logs FOR ALL
TO authenticated
USING (true);

-- Create RLS policies for daily stats
CREATE POLICY "Authenticated users can view daily stats"
ON public.daily_stats FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "System can manage daily stats"
ON public.daily_stats FOR ALL
TO authenticated
USING (true);

-- Create functions for automatic timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_routers_updated_at
  BEFORE UPDATE ON public.routers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_voucher_packages_updated_at
  BEFORE UPDATE ON public.voucher_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vouchers_updated_at
  BEFORE UPDATE ON public.vouchers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE 
      WHEN NEW.email = 'admin@etechvalley.com' THEN 'admin'
      ELSE 'operator'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data
INSERT INTO public.voucher_packages (name, description, duration_hours, price) VALUES
  ('ساعة واحدة', 'باقة إنترنت لمدة ساعة واحدة', 1, 5.00),
  ('4 ساعات', 'باقة إنترنت لمدة 4 ساعات', 4, 15.00),
  ('8 ساعات', 'باقة إنترنت لمدة 8 ساعات', 8, 25.00),
  ('يوم كامل', 'باقة إنترنت لمدة 24 ساعة', 24, 40.00);

INSERT INTO public.routers (cloud_name, router_name, identifier, ip_address, status, location) VALUES
  ('Frindes Cafe', 'MESHdesk_frindes_cafe_mcp_490', 'mcp_490', '156.197.132.238', 'online', 'المقهى الرئيسي'),
  ('VIP Lounge', 'MESHdesk_vip_lounge_mcp_491', 'mcp_491', '156.197.132.239', 'online', 'صالة الـ VIP'),
  ('Garden Area', 'MESHdesk_garden_mcp_492', 'mcp_492', '156.197.132.240', 'offline', 'منطقة الحديقة');