export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      daily_stats: {
        Row: {
          active_users: number | null
          created_at: string
          date: string
          id: string
          router_id: string
          total_data_used_gb: number | null
          total_revenue: number | null
          total_vouchers_sold: number | null
        }
        Insert: {
          active_users?: number | null
          created_at?: string
          date: string
          id?: string
          router_id: string
          total_data_used_gb?: number | null
          total_revenue?: number | null
          total_vouchers_sold?: number | null
        }
        Update: {
          active_users?: number | null
          created_at?: string
          date?: string
          id?: string
          router_id?: string
          total_data_used_gb?: number | null
          total_revenue?: number | null
          total_vouchers_sold?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_stats_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      router_credentials: {
        Row: {
          api_password: string
          api_port: number
          api_username: string
          created_at: string
          id: string
          router_id: string
          updated_at: string
        }
        Insert: {
          api_password: string
          api_port?: number
          api_username: string
          created_at?: string
          id?: string
          router_id: string
          updated_at?: string
        }
        Update: {
          api_password?: string
          api_port?: number
          api_username?: string
          created_at?: string
          id?: string
          router_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "router_credentials_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
        ]
      }
      routers: {
        Row: {
          api_password: string | null
          api_port: number | null
          api_username: string | null
          cloud_name: string
          connection_type: string | null
          created_at: string
          hotspot_enabled: boolean | null
          hotspot_interface: string | null
          id: string
          identifier: string
          ip_address: unknown | null
          last_contact: string | null
          location: string | null
          router_name: string
          status: string | null
          updated_at: string
          logo_url?: string | null
        }
        Insert: {
          api_password?: string | null
          api_port?: number | null
          api_username?: string | null
          cloud_name: string
          connection_type?: string | null
          created_at?: string
          hotspot_enabled?: boolean | null
          hotspot_interface?: string | null
          id?: string
          identifier: string
          ip_address?: unknown | null
          last_contact?: string | null
          location?: string | null
          router_name: string
          status?: string | null
          updated_at?: string
          logo_url?: string | null
        }
        Update: {
          api_password?: string | null
          api_port?: number | null
          api_username?: string | null
          cloud_name?: string
          connection_type?: string | null
          created_at?: string
          hotspot_enabled?: boolean | null
          hotspot_interface?: string | null
          id?: string
          identifier?: string
          ip_address?: unknown | null
          last_contact?: string | null
          location?: string | null
          router_name?: string
          status?: string | null
          updated_at?: string
          logo_url?: string | null
        }
        Relationships: []
      }
      sales: {
        Row: {
          amount: number
          id: string
          notes: string | null
          package_id: string
          payment_method: string | null
          quantity: number | null
          router_id: string
          sold_at: string
          sold_by: string | null
          voucher_id: string
        }
        Insert: {
          amount: number
          id?: string
          notes?: string | null
          package_id: string
          payment_method?: string | null
          quantity?: number | null
          router_id: string
          sold_at?: string
          sold_by?: string | null
          voucher_id: string
        }
        Update: {
          amount?: number
          id?: string
          notes?: string | null
          package_id?: string
          payment_method?: string | null
          quantity?: number | null
          router_id?: string
          sold_at?: string
          sold_by?: string | null
          voucher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "voucher_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_logs: {
        Row: {
          created_at: string
          data_used_mb: number | null
          duration_minutes: number | null
          id: string
          router_id: string
          session_end: string | null
          session_start: string
          user_ip: unknown | null
          user_mac: string | null
          voucher_id: string
        }
        Insert: {
          created_at?: string
          data_used_mb?: number | null
          duration_minutes?: number | null
          id?: string
          router_id: string
          session_end?: string | null
          session_start?: string
          user_ip?: unknown | null
          user_mac?: string | null
          voucher_id: string
        }
        Update: {
          created_at?: string
          data_used_mb?: number | null
          duration_minutes?: number | null
          id?: string
          router_id?: string
          session_end?: string | null
          session_start?: string
          user_ip?: unknown | null
          user_mac?: string | null
          voucher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_logs_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_logs_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      voucher_packages: {
        Row: {
          created_at: string
          router_number: string | null
          quantity: number | null
          remaining: number | null
          description: string | null
          duration_days: number | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          pdf_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          router_number?: string | null
          quantity?: number | null
          remaining?: number | null
          description?: string | null
          duration_days?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          pdf_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          router_number?: string | null
          quantity?: number | null
          remaining?: number | null
          description?: string | null
          duration_days?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          pdf_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      card_files: {
        Row: {
          id: string
          router_number: string
          quantity: number
          remaining: number
          file_name: string
          caption: string
          expiry: string
          created_at: string
          pdf_url: string | null
        }
        Insert: {
          id?: string
          router_number: string
          quantity: number
          remaining: number
          file_name: string
          caption: string
          expiry: string
          created_at?: string
          pdf_url?: string | null
        }
        Update: {
          id?: string
          router_number?: string
          quantity?: number
          remaining?: number
          file_name?: string
          caption?: string
          expiry?: string
          created_at?: string
          pdf_url?: string | null
        }
        Relationships: []
      }
      vouchers: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          package_id: string
          remaining_data_gb: number | null
          remaining_time_minutes: number | null
          router_id: string
          status: string | null
          updated_at: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          package_id: string
          remaining_data_gb?: number | null
          remaining_time_minutes?: number | null
          router_id: string
          status?: string | null
          updated_at?: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          package_id?: string
          remaining_data_gb?: number | null
          remaining_time_minutes?: number | null
          router_id?: string
          status?: string | null
          updated_at?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vouchers_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "voucher_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vouchers_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
