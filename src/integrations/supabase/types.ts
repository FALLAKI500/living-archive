export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          city: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          name: string
          phone?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          email_type: string
          error_message: string | null
          id: string
          invoice_id: string | null
          recipient_email: string
          sent_at: string | null
          success: boolean
        }
        Insert: {
          email_type: string
          error_message?: string | null
          id?: string
          invoice_id?: string | null
          recipient_email: string
          sent_at?: string | null
          success: boolean
        }
        Update: {
          email_type?: string
          error_message?: string | null
          id?: string
          invoice_id?: string | null
          recipient_email?: string
          sent_at?: string | null
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string | null
          date: string
          description: string | null
          id: string
          payment_method: string | null
          property_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          property_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          property_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_revenue_summary"
            referencedColumns: ["property_id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          amount_paid: number
          created_at: string | null
          customer_id: string | null
          daily_rate: number
          days_rented: number
          description: string | null
          due_date: string
          end_date: string | null
          id: string
          property_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          amount_paid?: number
          created_at?: string | null
          customer_id?: string | null
          daily_rate?: number
          days_rented?: number
          description?: string | null
          due_date: string
          end_date?: string | null
          id?: string
          property_id: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          amount_paid?: number
          created_at?: string | null
          customer_id?: string | null
          daily_rate?: number
          days_rented?: number
          description?: string | null
          due_date?: string
          end_date?: string | null
          id?: string
          property_id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_revenue_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          invoice_id: string | null
          message: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          message: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          message?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          company_name: string | null
          created_at: string | null
          full_name: string | null
          id: string
          notes: string[] | null
          notifications_enabled: boolean | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          notes?: string[] | null
          notifications_enabled?: boolean | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          notes?: string[] | null
          notifications_enabled?: boolean | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          city: string | null
          created_at: string
          daily_rate: number
          id: string
          image_url: string | null
          monthly_rate: number | null
          name: string
          num_bedrooms: number | null
          pricing_type: string | null
          status: Database["public"]["Enums"]["property_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          city?: string | null
          created_at?: string
          daily_rate: number
          id?: string
          image_url?: string | null
          monthly_rate?: number | null
          name: string
          num_bedrooms?: number | null
          pricing_type?: string | null
          status?: Database["public"]["Enums"]["property_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          city?: string | null
          created_at?: string
          daily_rate?: number
          id?: string
          image_url?: string | null
          monthly_rate?: number | null
          name?: string
          num_bedrooms?: number | null
          pricing_type?: string | null
          status?: Database["public"]["Enums"]["property_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      revenue_update_logs: {
        Row: {
          id: number
          invoice_count: number | null
          total_revenue: number | null
          update_time: string | null
        }
        Insert: {
          id?: number
          invoice_count?: number | null
          total_revenue?: number | null
          update_time?: string | null
        }
        Update: {
          id?: number
          invoice_count?: number | null
          total_revenue?: number | null
          update_time?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      monthly_revenue_summary: {
        Row: {
          invoice_count: number | null
          month: string | null
          payment_count: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
      property_revenue_summary: {
        Row: {
          invoice_count: number | null
          outstanding_balance: number | null
          property_id: string | null
          property_name: string | null
          total_billed: number | null
          total_paid: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_customer_statistics: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          full_name: string
          phone: string
          city: string
          company_name: string
          total_bookings: number
          total_spent: number
          last_booking_date: string
        }[]
      }
      update_monthly_revenue_summary: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      expense_category:
        | "maintenance"
        | "utilities"
        | "insurance"
        | "taxes"
        | "mortgage"
        | "other"
      invoice_status: "pending" | "paid" | "overdue" | "cancelled"
      property_status: "Available" | "Rented"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
