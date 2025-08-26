import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Router {
  id: string;
  cloud_name: string;
  router_name: string;
  identifier: string;
  ip_address?: string;
  last_contact?: string;
  status: 'online' | 'offline' | 'maintenance';
  location?: string;
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
      const { data, error } = await supabase
        .from("routers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routers"] });
      toast({
        title: "تم بنجاح",
        description: "تم تحديث الراوتر بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الراوتر",
        variant: "destructive",
      });
    },
  });
};