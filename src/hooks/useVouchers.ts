
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
  status: 'unused' | 'active' | 'expired' | 'suspended';
  used_by?: string;
  used_at?: string;
  expires_at?: string;
  remaining_data_gb?: number;
  remaining_time_minutes?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  voucher_packages: {
    name: string;
    price: number;
  };
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

async function createMikroTikConnection(routerId: string): Promise<MikroTikConnection> {
  if (!routerId) {
    throw new Error("Router ID is required to create MikroTik connection");
  }

  // Fetch router credentials from Supabase
  const { data: router, error } = await supabase
    .from("routers")
    .select("ip_address, api_username, api_password, api_port")
    .eq("id", routerId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch router credentials: ${error.message}`);
  }

  if (!router.ip_address || !router.api_username || !router.api_password) {
    throw new Error("Router credentials are incomplete");
  }

  return {
    ip: router.ip_address as string,
    port: Number(router.api_port) || 8728,
    username: router.api_username as string,
    password: router.api_password as string
  };
}
export const useVouchers = () => {
  return useQuery({
    queryKey: ["vouchers"],
    queryFn: async () => {
      let allVouchers: Voucher[] = [];
      let page = 0;
      const pageSize = 1000; // Supabase max per page
      let hasMore = true;

      while (hasMore) {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, error } = await supabase
          .from("vouchers")
          .select(`
            *,
            voucher_packages (
              name,
              price
            )
          `)
          .order("created_at", { ascending: false })
          .range(from, to);

        if (error) throw error;

        if (data && data.length > 0) {
          allVouchers = [...allVouchers, ...data];
          page++;
          hasMore = data.length === pageSize;
        } else {
          hasMore = false;
        }
      }

      return allVouchers;
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
      if (!routerId) {
        throw new Error("Router ID is required to create vouchers in MikroTik");
      }

      // Get package details from Supabase
      const { data: packageData, error: packageError } = await supabase
        .from("voucher_packages")
        .select("*")
        .eq("id", packageId)
        .single();

      if (packageError) {
        throw packageError;
      }

      const connection = await createMikroTikConnection(routerId);
      const api = new MikroTikAPI(connection);

      const createdVouchers = [];

      // For bulk creation (more than 50 vouchers), use batch endpoint
      if (quantity > 50) {
        console.log(`Creating ${quantity} vouchers in batch mode`);

        // Generate all voucher codes first
        const voucherCodes = [];
        for (let i = 0; i < quantity; i++) {
          const code = autoGenerate ? generateVoucherCode() : `VOUCHER-${Date.now()}-${i}`;
          voucherCodes.push(code);
        }

        // Calculate expiry date string for MikroTik limit-uptime
        let limitUptime = undefined;
        const totalMinutes =
          (packageData.duration_days || 0) * 24 * 60 +
          (packageData.duration_hours || 0) * 60 +
          (packageData.duration_minutes || 0);

        if (totalMinutes > 0) {
          limitUptime = `${totalMinutes}m`;
        }

        // Create hotspot users in batch
        const hotspotUsers: HotspotUser[] = voucherCodes.map(code => ({
          name: code,
          password: code,
          'limit-uptime': limitUptime,
          'limit-bytes-in': packageData.data_limit_gb ? packageData.data_limit_gb * 1024 * 1024 * 1024 : undefined,
          'limit-bytes-out': packageData.data_limit_gb ? packageData.data_limit_gb * 1024 * 1024 * 1024 : undefined,
          disabled: false
        }));

        // Use batch creation for better performance
        await api.createHotspotUsersBatch(hotspotUsers);

        // Insert all voucher records in Supabase
        const voucherRecords = voucherCodes.map(code => ({
          code,
          package_id: packageId,
          router_id: routerId,
          status: 'unused',
          expires_at: null,
          remaining_data_gb: packageData.data_limit_gb || null,
          remaining_time_minutes: (packageData.duration_days || 0) * 24 * 60 || null
        }));

        const { data, error } = await supabase
          .from("vouchers")
          .insert(voucherRecords)
          .select();

        if (error) {
          throw error;
        }

        createdVouchers.push(...data);
      } else {
        // For smaller quantities, use individual creation
        for (let i = 0; i < quantity; i++) {
          const code = autoGenerate ? generateVoucherCode() : `VOUCHER-${Date.now()}-${i}`;

          // Calculate expiry date string for MikroTik limit-uptime
          let limitUptime = undefined;
          const totalMinutes =
            (packageData.duration_days || 0) * 24 * 60 +
            (packageData.duration_hours || 0) * 60 +
            (packageData.duration_minutes || 0);

          if (totalMinutes > 0) {
            limitUptime = `${totalMinutes}m`;
          }

          const hotspotUser: HotspotUser = {
            name: code,
            password: code,
            'limit-uptime': limitUptime,
            'limit-bytes-in': packageData.data_limit_gb ? packageData.data_limit_gb * 1024 * 1024 * 1024 : undefined,
            'limit-bytes-out': packageData.data_limit_gb ? packageData.data_limit_gb * 1024 * 1024 * 1024 : undefined,
            disabled: false
          };

          await api.createHotspotUser(hotspotUser);

          // Insert voucher record in Supabase
          const { data, error } = await supabase
            .from("vouchers")
            .insert([{
              code,
              package_id: packageId,
              router_id: routerId,
              status: 'unused',
              expires_at: null,
              remaining_data_gb: packageData.data_limit_gb || null,
              remaining_time_minutes: (packageData.duration_days || 0) * 24 * 60 || null
            }])
            .select();

          if (error) {
            throw error;
          }

          createdVouchers.push(data[0]);
        }
      }

      return createdVouchers;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      toast({
        title: "تم بنجاح",
        description: `تم إنشاء ${data.length} قسيمة بنجاح`,
      });
    },
    onError: (error) => {
      console.error("Error creating vouchers:", error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إنشاء القسائم",
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

export const useSellVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      voucherId,
      paymentMethod,
      notes
    }: {
      voucherId: string;
      paymentMethod: string;
      notes?: string;
    }) => {
      // Get voucher details including package and router
      const { data: voucher, error: voucherError } = await supabase
        .from("vouchers")
        .select("*, voucher_packages(*), routers(*)")
        .eq("id", voucherId)
        .single();

      if (voucherError) throw voucherError;

      // Insert sale record
      const { data: saleData, error: saleError } = await supabase
        .from("sales")
        .insert({
          voucher_id: voucherId,
          package_id: voucher.package_id,
          router_id: voucher.router_id,
          amount: voucher.voucher_packages.price,
          payment_method: paymentMethod,
          notes: notes || null,
          quantity: 1,
          sold_at: new Date().toISOString(),
          sold_by: null // Will be set by RLS policy based on authenticated user
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Update voucher status to 'suspended' (sold)
      const { data: updateData, error: updateError } = await supabase
        .from("vouchers")
        .update({
          status: 'suspended',
          used_at: new Date().toISOString()
        })
        .eq("id", voucherId)
        .select()
        .single();

      if (updateError) throw updateError;

      return { sale: saleData, voucher: updateData };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast({
        title: "تم بنجاح",
        description: `تم بيع القسيمة بمبلغ ${data.sale.amount} جنيه`,
      });
    },
    onError: (error: Error) => {
      console.error("Error selling voucher:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء بيع القسيمة",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (voucherId: string) => {
      const { error } = await supabase
        .from("vouchers")
        .delete()
        .eq("id", voucherId);

      if (error) throw error;
      return voucherId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      toast({
        title: "تم بنجاح",
        description: "تم حذف القسيمة بنجاح",
      });
    },
    onError: (error: Error) => {
      console.error("Error deleting voucher:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف القسيمة",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateVoucherStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      voucherId,
      status
    }: {
      voucherId: string;
      status: 'unused' | 'used' | 'suspended';
    }) => {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'used' || status === 'suspended') {
        updateData.used_at = new Date().toISOString();
      } else if (status === 'unused') {
        updateData.used_at = null;
        updateData.used_by = null;
      }

      const { data, error } = await supabase
        .from("vouchers")
        .update(updateData)
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
        description: "تم تحديث حالة القسيمة بنجاح",
      });
    },
    onError: (error: Error) => {
      console.error("Error updating voucher status:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة القسيمة",
        variant: "destructive",
      });
    },
  });
};

// Helper function to generate voucher codes (numbers only)
function generateVoucherCode(): string {
  const chars = '0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
