import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DailyUsage {
  cloudName: string;
  placeName: string;
  dailyCards: number;
  dailyData: number;
}

export const useDailyUsage = () => {
  return useQuery({
    queryKey: ["daily-usage"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get today's voucher usage
      const { data: voucherData, error: voucherError } = await supabase
        .from("vouchers")
        .select(`
          *,
          routers (
            router_name,
            cloud_name
          ),
          voucher_packages (
            data_limit_gb
          )
        `)
        .eq("status", "active")
        .gte("used_at", today.toISOString())
        .lt("used_at", tomorrow.toISOString());

      if (voucherError) throw voucherError;

      // Get today's usage logs
      const { data: usageData, error: usageError } = await supabase
        .from("usage_logs")
        .select(`
          *,
          routers (
            router_name,
            cloud_name
          )
        `)
        .gte("session_start", today.toISOString())
        .lt("session_start", tomorrow.toISOString());

      if (usageError) throw usageError;

      // Group data by router
      const usageByRouter = voucherData?.reduce((acc: any, voucher: any) => {
        const routerKey = `${voucher.routers?.cloud_name}-${voucher.routers?.router_name}`;
        
        if (!acc[routerKey]) {
          acc[routerKey] = {
            cloudName: voucher.routers?.cloud_name || '',
            placeName: voucher.routers?.router_name || '',
            dailyCards: 0,
            dailyData: 0
          };
        }

        acc[routerKey].dailyCards += 1;
        
        return acc;
      }, {});

      // Add usage data
      usageData?.forEach((usage: any) => {
        const routerKey = `${usage.routers?.cloud_name}-${usage.routers?.router_name}`;
        
        if (usageByRouter[routerKey]) {
          usageByRouter[routerKey].dailyData += Number(usage.data_used_mb || 0) / 1024; // Convert MB to GB
        }
      });

      return Object.values(usageByRouter || {}) as DailyUsage[];
    },
  });
};