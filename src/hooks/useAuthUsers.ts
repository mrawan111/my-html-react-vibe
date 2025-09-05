import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
  confirmed_at?: string;
  aud: string;
  role: string;
  updated_at: string;
  full_name?: string;
  profile_id?: string;
}

export const useAuthUsers = () => {
  return useQuery({
    queryKey: ["auth-users"],
    queryFn: async () => {
      // Since client-side admin access is not available, we'll use the profiles table
      // which contains user profile information linked to auth users
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          user_id
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform the data to match our expected interface
      return data.map(profile => ({
        id: profile.user_id,
        email: null, // Email not available in profiles table for security
        phone: null, // Phone not available in profiles table for security
        created_at: profile.created_at,
        last_sign_in_at: null, // Not available in profiles table
        email_confirmed_at: null, // Not available in profiles table
        phone_confirmed_at: null, // Not available in profiles table
        confirmed_at: null, // Not available in profiles table
        aud: 'authenticated',
        role: profile.role || 'user',
        updated_at: profile.updated_at,
        full_name: profile.full_name,
        // Add profile-specific fields
        profile_id: profile.id
      })) as AuthUser[];
    },
  });
};

// ... other imports and code ...

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      password,
      full_name,
      role = 'user'
    }: {
      email: string;
      password: string;
      full_name: string;
      role?: 'admin' | 'operator' | 'user';
    }) => {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            role
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("User creation failed");

      // Wait for the trigger to create the profile and verify it was created
      const maxRetries = 10;
      const retryDelay = 1000;
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        // Check if profile was created
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", authData.user.id)
          .single();

        if (profile && !profileError) {
          console.log("Profile created successfully:", profile);
          return { user: authData.user, profile };
        }

        if (attempt === maxRetries - 1) {
          throw new Error("Profile was not created by trigger after maximum retries");
        }

        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }

      throw new Error("Failed to verify profile creation");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["auth-users"] });
      toast({
        title: "تم بنجاح",
        description: `تم إنشاء المستخدم ${data.profile.full_name} بنجاح`,
      });
    },
    onError: (error: Error) => {
      console.error("Error creating user:", error);
      toast({
        title: "خطأ في إنشاء المستخدم",
        description: error.message || "حدث خطأ أثناء إنشاء المستخدم",
        variant: "destructive",
      });
    },
  });
};

// ... rest of the file (useUpdateUserRole, useDeleteUser, etc.) ...
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
      full_name
    }: {
      userId: string;
      role: 'admin' | 'operator' | 'user';
      full_name?: string;
    }) => {
      const updateData: any = {
        role,
        updated_at: new Date().toISOString()
      };

      if (full_name !== undefined) {
        updateData.full_name = full_name;
      }

      const { data, error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-users"] });
      toast({
        title: "تم بنجاح",
        description: "تم تحديث المستخدم بنجاح",
      });
    },
    onError: (error: Error) => {
      console.error("Error updating user:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث المستخدم",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // Delete profile first (cascade will handle auth user)
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-users"] });
      toast({
        title: "تم بنجاح",
        description: "تم حذف المستخدم بنجاح",
      });
    },
    onError: (error: Error) => {
      console.error("Error deleting user:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المستخدم",
        variant: "destructive",
      });
    },
  });
};

export const useAuthUserDetails = (userId: string) => {
  return useQuery({
    queryKey: ["auth-user", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};
