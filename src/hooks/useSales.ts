import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Sale {
  id: string;
  voucher_id: string;
  package_id: string;
  router_id: string;
  amount: number;
  payment_method: string | null;
  notes: string | null;
  quantity: number | null;
  sold_at: string;
  sold_by: string | null;
}

export const useSales = (routerId?: string, dateRange?: { start: string; end: string }) => {
  return useQuery({
    queryKey: ["sales", routerId, dateRange],
    queryFn: async () => {
      let query = supabase
        .from("sales")
        .select("*")
        .order("sold_at", { ascending: false });

      if (routerId) {
        query = query.eq("router_id", routerId);
      }

      if (dateRange) {
        query = query
          .gte("sold_at", dateRange.start)
          .lte("sold_at", dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Sale[];
    },
  });
};

export const useSalesStats = (routerId?: string) => {
  return useQuery({
    queryKey: ["sales-stats", routerId],
    queryFn: async () => {
      let query = supabase
        .from("sales")
        .select(`
          amount,
          sold_at,
          routers!inner(router_name, location)
        `);

      if (routerId) {
        query = query.eq("router_id", routerId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Group by router and calculate daily, weekly, monthly stats
      const routerStats = data.reduce((acc: any, sale: any) => {
        const routerName = sale.routers?.router_name || "غير محدد";
        const location = sale.routers?.location || "غير محدد";
        const saleDate = new Date(sale.sold_at);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        if (!acc[routerName]) {
          acc[routerName] = {
            cloudName: routerName,
            placeName: location,
            dailySales: 0,
            weeklySales: 0,
            monthlySales: 0
          };
        }

        // Count sales for different periods
        if (saleDate.toDateString() === today.toDateString()) {
          acc[routerName].dailySales++;
        }
        if (saleDate >= weekAgo) {
          acc[routerName].weeklySales++;
        }
        if (saleDate >= monthAgo) {
          acc[routerName].monthlySales++;
        }

        return acc;
      }, {});

      return Object.values(routerStats);
    },
  });
};
