import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UsageLog {
  id: string;
  router_id: string;
  voucher_id: string;
  session_start: string;
  session_end: string | null;
  data_used_mb: number | null;
  duration_minutes: number | null;
  user_mac: string | null;
  user_ip: string | null;
}

export const useUsageLogs = (routerId?: string, activeOnly: boolean = false) => {
  return useQuery({
    queryKey: ["usage-logs", routerId, activeOnly],
    queryFn: async () => {
      let query = supabase
        .from("usage_logs")
        .select("*")
        .order("session_start", { ascending: false });

      if (routerId) {
        query = query.eq("router_id", routerId);
      }

      if (activeOnly) {
        query = query.is("session_end", null); // Only active sessions
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as UsageLog[];
    },
  });
};

export const useActiveUsers = (routerId?: string) => {
  return useQuery({
    queryKey: ["active-users", routerId],
    queryFn: async () => {
      let query = supabase
        .from("usage_logs")
        .select(`
          *,
          vouchers!inner(code),
          routers!inner(router_name)
        `)
        .is("session_end", null) // Only active sessions
        .order("session_start", { ascending: false })
        .limit(10); // Limit to recent active users

      if (routerId) {
        query = query.eq("router_id", routerId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data for dashboard display
      return data.map(log => ({
        cardNumber: (log.vouchers as any)?.code || "N/A",
        macAddress: log.user_mac || "N/A",
        startTime: formatTimeAgo(log.session_start),
        data: (log.data_used_mb || 0).toFixed(2),
        status: "نشط"
      }));
    },
  });
};

// Helper function to format time ago in Arabic
function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "منذ لحظات";
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  return `منذ ${diffDays} يوم`;
}
