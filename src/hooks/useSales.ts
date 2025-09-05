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
        .select("amount, sold_at");

      if (routerId) {
        query = query.eq("router_id", routerId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate stats
      const totalRevenue = data.reduce((sum, sale) => sum + sale.amount, 0);
      const todaySales = data.filter(sale => {
        const today = new Date().toDateString();
        return new Date(sale.sold_at).toDateString() === today;
      }).length;

      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();
      const monthlySales = data.filter(sale => {
        const saleDate = new Date(sale.sold_at);
        return saleDate.getMonth() === thisMonth && saleDate.getFullYear() === thisYear;
      }).length;

      return {
        totalRevenue,
        todaySales,
        monthlySales
      };
    },
  });
};
