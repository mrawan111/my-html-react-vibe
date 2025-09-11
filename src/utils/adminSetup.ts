import { supabase } from "@/integrations/supabase/client";

export const createAdminUser = async () => {
  const { data, error } = await supabase.auth.signUp({
    email: "marwanam980@gmail.com",
    password: "password123",
    options: {
      emailRedirectTo: `${window.location.origin}/`,
      data: {
        full_name: "Admin User",
        role: "admin"
      }
    }
  });

  if (error) {
    console.error("Error creating admin user:", error);
    return { error };
  }

  console.log("Admin user created successfully:", data);
  return { data };
};