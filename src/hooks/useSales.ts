import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Sale {
  id: string;
  voucher_id: string;
  router_id: string;
  package_id: string;
  amount: number;
  quantity: number;
  payment_method: string;
  notes?: string;
  sold_at: string;
  sold_by?: string;
  routers?: {
    router_name: string;
    cloud_name: string;
  };
  voucher_packages?: {
    name: string;
    price: number;
  };
}

export const useSales = () => {
  return useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select(`
          *,
          routers (
            router_name,
            cloud_name
          ),
          voucher_packages (
            name,
            price
          )
        `)
        .order("sold_at", { ascending: false });

      if (error) throw error;
      return data as Sale[];
    },
  });
};

export const useSalesStats = () => {
  return useQuery({
    queryKey: ["sales-stats"],
    queryFn: async () => {
      const today = new Date();
      const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      // Get sales grouped by router with time filters
      const { data, error } = await supabase
        .from("sales")
        .select(`
          *,
          routers (
            router_name,
            cloud_name
          )
        `)
        .order("sold_at", { ascending: false });

      if (error) throw error;

      // Group sales by router and calculate stats
      const salesByRouter = data?.reduce((acc: any, sale: Sale) => {
        const routerKey = `${sale.routers?.cloud_name}-${sale.routers?.router_name}`;
        const saleDate = new Date(sale.sold_at);
        
        if (!acc[routerKey]) {
          acc[routerKey] = {
            cloudName: sale.routers?.cloud_name || '',
            placeName: sale.routers?.router_name || '',
            dailySales: 0,
            weeklySales: 0,
            monthlySales: 0
          };
        }

        // Count sales by time period
        if (saleDate.toDateString() === today.toDateString()) {
          acc[routerKey].dailySales += sale.quantity;
        }
        if (saleDate >= weekStart) {
          acc[routerKey].weeklySales += sale.quantity;
        }
        if (saleDate >= monthStart) {
          acc[routerKey].monthlySales += sale.quantity;
        }

        return acc;
      }, {});

      return Object.values(salesByRouter || {});
    },
  });
};