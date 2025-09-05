import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DailyStats {
  id: string;
  date: string;
  router_id: string;
  active_users: number | null;
  total_data_used_gb: number | null;
  total_revenue: number | null;
  total_vouchers_sold: number | null;
}

export const useDailyStats = (routerId?: string, dateRange?: { start: string; end: string }) => {
  return useQuery({
    queryKey: ["daily-stats", routerId, dateRange],
    queryFn: async () => {
      let query = supabase
        .from("daily_stats")
        .select("*")
        .order("date", { ascending: false });

      if (routerId) {
        query = query.eq("router_id", routerId);
      }

      if (dateRange) {
        query = query
          .gte("date", dateRange.start)
          .lte("date", dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as DailyStats[];
    },
  });
};

export const useWeeklyStats = (routerId?: string) => {
  return useQuery({
    queryKey: ["weekly-stats", routerId],
    queryFn: async () => {
      // Get last 7 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      let query = supabase
        .from("daily_stats")
        .select("*")
        .gte("date", startDate.toISOString().split('T')[0])
        .lte("date", endDate.toISOString().split('T')[0])
        .order("date", { ascending: true });

      if (routerId) {
        query = query.eq("router_id", routerId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Group by day of week (Arabic)
      const dayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
      const weeklyData = dayNames.map(dayName => {
        const dayData = data.filter(stat => {
          const statDate = new Date(stat.date);
          const statDayName = dayNames[statDate.getDay()];
          return statDayName === dayName;
        });

        return {
          name: dayName,
          value: dayData.reduce((sum, stat) => sum + (stat.total_data_used_gb || 0), 0),
          sales: dayData.reduce((sum, stat) => sum + (stat.total_vouchers_sold || 0), 0)
        };
      });

      return weeklyData;
    },
  });
};

export const useMonthlyStats = (routerId?: string) => {
  return useQuery({
    queryKey: ["monthly-stats", routerId],
    queryFn: async () => {
      // Get last 6 months
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);

      let query = supabase
        .from("daily_stats")
        .select("*")
        .gte("date", startDate.toISOString().split('T')[0])
        .lte("date", endDate.toISOString().split('T')[0])
        .order("date", { ascending: true });

      if (routerId) {
        query = query.eq("router_id", routerId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Group by month
      const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
      const monthlyData = monthNames.map((monthName, index) => {
        const monthData = data.filter(stat => {
          const statDate = new Date(stat.date);
          return statDate.getMonth() === index;
        });

        return {
          month: monthName,
          sales: monthData.reduce((sum, stat) => sum + (stat.total_vouchers_sold || 0), 0),
          revenue: monthData.reduce((sum, stat) => sum + (stat.total_revenue || 0), 0)
        };
      }).filter(item => item.sales > 0 || item.revenue > 0); // Only show months with data

      return monthlyData;
    },
  });
};
