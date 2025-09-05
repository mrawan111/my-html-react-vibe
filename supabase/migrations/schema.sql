-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.daily_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  date date NOT NULL,
  router_id uuid NOT NULL,
  total_vouchers_sold integer DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  total_data_used_gb numeric DEFAULT 0,
  active_users integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT daily_stats_pkey PRIMARY KEY (id),
  CONSTRAINT daily_stats_router_id_fkey FOREIGN KEY (router_id) REFERENCES public.routers(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text,
  role text DEFAULT 'user'::text CHECK (role = ANY (ARRAY['admin'::text, 'operator'::text, 'user'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.router_credentials (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  router_id uuid NOT NULL,
  api_username text NOT NULL,
  api_password text NOT NULL,
  api_port integer NOT NULL DEFAULT 8728,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT router_credentials_pkey PRIMARY KEY (id),
  CONSTRAINT router_credentials_router_id_fkey FOREIGN KEY (router_id) REFERENCES public.routers(id)
);
CREATE TABLE public.routers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cloud_name text NOT NULL,
  router_name text NOT NULL,
  identifier text NOT NULL UNIQUE,
  ip_address inet,
  last_contact timestamp with time zone,
  status text DEFAULT 'offline'::text CHECK (status = ANY (ARRAY['online'::text, 'offline'::text, 'maintenance'::text])),
  location text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  api_port integer DEFAULT 8728,
  api_username text,
  api_password text,
  connection_type text DEFAULT 'mikrotik-api'::text CHECK (connection_type = ANY (ARRAY['mikrotik-api'::text, 'winbox'::text, 'ssh'::text])),
  hotspot_interface text,
  hotspot_enabled boolean DEFAULT false,
  logo_url text,
  user_id uuid,
  CONSTRAINT routers_pkey PRIMARY KEY (id),
  CONSTRAINT routers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.sales (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  voucher_id uuid NOT NULL,
  router_id uuid NOT NULL,
  package_id uuid NOT NULL,
  amount numeric NOT NULL,
  quantity integer DEFAULT 1,
  sold_by uuid,
  sold_at timestamp with time zone NOT NULL DEFAULT now(),
  payment_method text DEFAULT 'cash'::text CHECK (payment_method = ANY (ARRAY['cash'::text, 'card'::text, 'digital'::text])),
  notes text,
  CONSTRAINT sales_pkey PRIMARY KEY (id),
  CONSTRAINT sales_router_id_fkey FOREIGN KEY (router_id) REFERENCES public.routers(id),
  CONSTRAINT sales_sold_by_fkey FOREIGN KEY (sold_by) REFERENCES auth.users(id),
  CONSTRAINT sales_voucher_id_fkey FOREIGN KEY (voucher_id) REFERENCES public.vouchers(id),
  CONSTRAINT sales_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.voucher_packages(id)
);
CREATE TABLE public.usage_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  voucher_id uuid NOT NULL,
  router_id uuid NOT NULL,
  session_start timestamp with time zone NOT NULL DEFAULT now(),
  session_end timestamp with time zone,
  data_used_mb numeric DEFAULT 0,
  duration_minutes integer DEFAULT 0,
  user_ip inet,
  user_mac text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT usage_logs_pkey PRIMARY KEY (id),
  CONSTRAINT usage_logs_router_id_fkey FOREIGN KEY (router_id) REFERENCES public.routers(id),
  CONSTRAINT usage_logs_voucher_id_fkey FOREIGN KEY (voucher_id) REFERENCES public.vouchers(id)
);
CREATE TABLE public.voucher_packages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  duration_days integer DEFAULT 0,
  duration_hours integer DEFAULT 0,
  duration_minutes integer DEFAULT 0,
  data_limit_gb numeric,
  price numeric NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  router_number text,
  quantity integer,
  remaining integer,
  pdf_url text,
  CONSTRAINT voucher_packages_pkey PRIMARY KEY (id)
);
CREATE TABLE public.vouchers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  package_id uuid NOT NULL,
  router_id uuid NOT NULL,
  status text DEFAULT 'unused'::text CHECK (status = ANY (ARRAY['unused'::text, 'active'::text, 'expired'::text, 'suspended'::text])),
  created_by uuid,
  used_by text,
  used_at timestamp with time zone,
  expires_at timestamp with time zone,
  remaining_data_gb numeric,
  remaining_time_minutes integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT vouchers_pkey PRIMARY KEY (id),
  CONSTRAINT vouchers_router_id_fkey FOREIGN KEY (router_id) REFERENCES public.routers(id),
  CONSTRAINT vouchers_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT vouchers_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.voucher_packages(id)
);