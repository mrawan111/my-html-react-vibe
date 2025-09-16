import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { MikroTikAPI, MikroTikConnection } from "@/lib/mikrotik-api";

export interface Router {
  id: string;
  cloud_name: string;
  router_name: string;
  identifier: string;
  ip_address?: string;
  last_contact?: string;
  status: 'online' | 'offline' | 'maintenance';
  location?: string;
  api_port?: number;
  api_username?: string;
  api_password?: string;
  connection_type?: string;
  hotspot_interface?: string;
  hotspot_enabled?: boolean;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export const useRouters = () => {
  return useQuery({
    queryKey: ["routers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("routers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Router[];
    },
  });
};

export const useCreateRouter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (router: Omit<Router, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("routers")
        .insert([router])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routers"] });
      toast({
        title: "تم بنجاح",
        description: "تم إضافة الراوتر بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الراوتر",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateRouter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Router> & { id: string }) => {
      console.log("Updating router with ID:", id, "Updates:", updates);

      // 🧹 Remove undefined values so Supabase ignores them
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
      );

      console.log("Final update payload:", cleanUpdates);

      const { data, error } = await supabase
        .from("routers")
        .update(cleanUpdates)
        .eq("id", id)
        .select(); // no .single() → safer

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error("Update failed - no rows returned");
      }

      console.log("Update successful, returned data:", data[0]);
      return data[0];
    },

    onSuccess: (updatedRouter) => {
      // Refresh routers query so UI shows new logo
      queryClient.invalidateQueries({ queryKey: ["routers"] });

      toast({
        title: "تم بنجاح",
        description: `تم تحديث الراوتر ${updatedRouter.router_name}`,
      });
    },

    onError: (error) => {
      console.error("Update router mutation error:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الراوتر",
        variant: "destructive",
      });
    },
  });
};
export const useTestRouterConnection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (router: Router) => {
      if (!router.ip_address || !router.api_username || !router.api_password) {
        throw new Error("بيانات الاتصال غير مكتملة");
      }

      const connection: MikroTikConnection = {
        ip: router.ip_address,
        port: router.api_port || 8728,
        username: router.api_username,
        password: router.api_password
      };

      const api = new MikroTikAPI(connection);
      const isConnected = await api.testConnection();

      if (!isConnected) {
        throw new Error("فشل في الاتصال بالراوتر");
      }

      // Update router status to online if connection successful
      const { error } = await supabase
        .from("routers")
        .update({
          status: 'online',
          last_contact: new Date().toISOString()
        })
        .eq("id", router.id);

      if (error) throw error;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routers"] });
      toast({
        title: "تم بنجاح",
        description: "تم الاتصال بالراوتر بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في الاتصال",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteRouter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("routers")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routers"] });
      toast({
        title: "تم بنجاح",
        description: "تم حذف الراوتر بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف الراوتر",
        variant: "destructive",
      });
    },
  });
};
