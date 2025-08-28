import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { MikroTikAPI, MikroTikConnection, HotspotUser } from "@/lib/mikrotik-api";

export interface VoucherPackage {
  id: string;
  name: string;
  description?: string;
  price: number;
  data_limit_gb?: number;
  duration_days?: number;
  duration_hours?: number;
  duration_minutes?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Voucher {
  id: string;
  code: string;
  package_id: string;
  router_id: string;
  status: 'unused' | 'active' | 'expired' | 'used';
  used_by?: string;
  used_at?: string;
  expires_at?: string;
  remaining_data_gb?: number;
  remaining_time_minutes?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useVoucherPackages = () => {
  return useQuery({
    queryKey: ["voucher-packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voucher_packages")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as VoucherPackage[];
    },
  });
};

export const useVouchers = (routerId?: string) => {
  return useQuery({
    queryKey: ["vouchers", routerId],
    queryFn: async () => {
      let query = supabase
        .from("vouchers")
        .select("*");
      
      if (routerId) {
        query = query.eq("router_id", routerId);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data as Voucher[];
    },
  });
};

export const useCreateVouchers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      packageId,
      routerId,
      quantity = 1,
      autoGenerate = true
    }: {
      packageId: string;
      routerId: string;
      quantity?: number;
      autoGenerate?: boolean;
    }) => {
      // Get package details
      const { data: packageData, error: packageError } = await supabase
        .from("voucher_packages")
        .select("*")
        .eq("id", packageId)
        .single();

      if (packageError) throw packageError;

      const vouchers = [];
      
      for (let i = 0; i < quantity; i++) {
        const code = autoGenerate ? generateVoucherCode() : `VOUCHER-${Date.now()}-${i}`;
        
        // Calculate expiry date
        let expiresAt = null;
        if (packageData.duration_days || packageData.duration_hours || packageData.duration_minutes) {
          const now = new Date();
          const totalMinutes = 
            (packageData.duration_days || 0) * 24 * 60 +
            (packageData.duration_hours || 0) * 60 +
            (packageData.duration_minutes || 0);
          
          expiresAt = new Date(now.getTime() + totalMinutes * 60 * 1000).toISOString();
        }

        const voucher = {
          code,
          package_id: packageId,
          router_id: routerId,
          status: 'unused' as const,
          expires_at: expiresAt,
          remaining_data_gb: packageData.data_limit_gb,
          remaining_time_minutes: 
            (packageData.duration_days || 0) * 24 * 60 +
            (packageData.duration_hours || 0) * 60 +
            (packageData.duration_minutes || 0) || null
        };

        vouchers.push(voucher);
      }

      const { data, error } = await supabase
        .from("vouchers")
        .insert(vouchers)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      toast({
        title: "تم بنجاح",
        description: `تم إنشاء ${data.length} قسيمة بنجاح`,
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء القسائم",
        variant: "destructive",
      });
    },
  });
};

export const useActivateVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      voucherId,
      routerId,
      userMac
    }: {
      voucherId: string;
      routerId: string;
      userMac: string;
    }) => {
      // Get voucher and router details
      const { data: voucher, error: voucherError } = await supabase
        .from("vouchers")
        .select("*, voucher_packages(*)")
        .eq("id", voucherId)
        .single();

      if (voucherError) throw voucherError;

      const { data: router, error: routerError } = await supabase
        .from("routers")
        .select("*")
        .eq("id", routerId)
        .single();

      if (routerError) throw routerError;

      // Create MikroTik API connection
      if (router.ip_address && router.api_username && router.api_password) {
        const connection: MikroTikConnection = {
          ip: router.ip_address as string,
          port: Number(router.api_port) || 8728,
          username: router.api_username as string,
          password: router.api_password as string
        };

        const api = new MikroTikAPI(connection);
        
        // Create hotspot user
        const hotspotUser: HotspotUser = {
          name: voucher.code,
          password: voucher.code,
          'limit-uptime': voucher.remaining_time_minutes ? `${voucher.remaining_time_minutes}m` : undefined,
          'limit-bytes-in': voucher.remaining_data_gb ? voucher.remaining_data_gb * 1024 * 1024 * 1024 : undefined,
          'limit-bytes-out': voucher.remaining_data_gb ? voucher.remaining_data_gb * 1024 * 1024 * 1024 : undefined
        };

        await api.createHotspotUser(hotspotUser);
      }

      // Update voucher status
      const { data, error } = await supabase
        .from("vouchers")
        .update({
          status: 'active',
          used_by: userMac,
          used_at: new Date().toISOString()
        })
        .eq("id", voucherId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      toast({
        title: "تم بنجاح",
        description: "تم تفعيل القسيمة بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تفعيل القسيمة",
        variant: "destructive",
      });
    },
  });
};

// Helper function to generate voucher codes
function generateVoucherCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}