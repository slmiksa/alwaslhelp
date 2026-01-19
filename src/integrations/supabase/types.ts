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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          employee_id: string | null
          id: string
          notification_email: string | null
          password: string
          role: string
          username: string
        }
        Insert: {
          created_at?: string
          employee_id?: string | null
          id?: string
          notification_email?: string | null
          password: string
          role?: string
          username: string
        }
        Update: {
          created_at?: string
          employee_id?: string | null
          id?: string
          notification_email?: string | null
          password?: string
          role?: string
          username?: string
        }
        Relationships: []
      }
      branch_resource_types: {
        Row: {
          available: number
          branch_id: string
          created_at: string
          id: string
          in_use: number
          resource_type_id: string
          updated_at: string
        }
        Insert: {
          available?: number
          branch_id: string
          created_at?: string
          id?: string
          in_use?: number
          resource_type_id: string
          updated_at?: string
        }
        Update: {
          available?: number
          branch_id?: string
          created_at?: string
          id?: string
          in_use?: number
          resource_type_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_resource_types_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_resource_types_resource_type_id_fkey"
            columns: ["resource_type_id"]
            isOneToOne: false
            referencedRelation: "resource_types"
            referencedColumns: ["id"]
          },
        ]
      }
      branch_resources: {
        Row: {
          branch_id: string | null
          created_at: string | null
          id: string
          pc_cameras_available: number
          pc_cameras_in_use: number
          pc_screens_available: number
          pc_screens_in_use: number
          pcs_available: number
          pcs_in_use: number
          phones_available: number
          phones_in_use: number
          printers_available: number
          printers_in_use: number
          updated_at: string | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          id?: string
          pc_cameras_available?: number
          pc_cameras_in_use?: number
          pc_screens_available?: number
          pc_screens_in_use?: number
          pcs_available?: number
          pcs_in_use?: number
          phones_available?: number
          phones_in_use?: number
          printers_available?: number
          printers_in_use?: number
          updated_at?: string | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          id?: string
          pc_cameras_available?: number
          pc_cameras_in_use?: number
          pc_screens_available?: number
          pc_screens_in_use?: number
          pcs_available?: number
          pcs_in_use?: number
          phones_available?: number
          phones_in_use?: number
          printers_available?: number
          printers_in_use?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branch_resources_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      resource_types: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      site_fields: {
        Row: {
          created_at: string
          display_name: string
          field_name: string
          id: string
          is_active: boolean | null
          is_required: boolean | null
          placeholder: string | null
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          display_name: string
          field_name: string
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          placeholder?: string | null
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          display_name?: string
          field_name?: string
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          placeholder?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          favicon_url: string | null
          footer_text: string
          id: string
          logo_url: string | null
          page_title: string | null
          primary_color: string
          secondary_color: string
          site_name: string
          support_available: boolean | null
          support_help_fields: Json | null
          support_info: string | null
          support_message: string | null
          text_color: string
        }
        Insert: {
          created_at?: string
          favicon_url?: string | null
          footer_text?: string
          id?: string
          logo_url?: string | null
          page_title?: string | null
          primary_color?: string
          secondary_color?: string
          site_name?: string
          support_available?: boolean | null
          support_help_fields?: Json | null
          support_info?: string | null
          support_message?: string | null
          text_color?: string
        }
        Update: {
          created_at?: string
          favicon_url?: string | null
          footer_text?: string
          id?: string
          logo_url?: string | null
          page_title?: string | null
          primary_color?: string
          secondary_color?: string
          site_name?: string
          support_available?: boolean | null
          support_help_fields?: Json | null
          support_info?: string | null
          support_message?: string | null
          text_color?: string
        }
        Relationships: []
      }
      ticket_responses: {
        Row: {
          admin_id: string | null
          created_at: string
          id: string
          is_admin: boolean | null
          response: string
          ticket_id: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          id?: string
          is_admin?: boolean | null
          response: string
          ticket_id: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          id?: string
          is_admin?: boolean | null
          response?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_responses_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_responses_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["ticket_id"]
          },
        ]
      }
      tickets: {
        Row: {
          anydesk_number: string | null
          assigned_to: string | null
          branch: string
          created_at: string
          custom_fields: Json | null
          customer_email: string | null
          description: string
          employee_id: string
          extension_number: string | null
          id: string
          image_url: string | null
          priority: string | null
          status: string
          support_email: string | null
          ticket_id: string
          updated_at: string
        }
        Insert: {
          anydesk_number?: string | null
          assigned_to?: string | null
          branch: string
          created_at?: string
          custom_fields?: Json | null
          customer_email?: string | null
          description: string
          employee_id: string
          extension_number?: string | null
          id?: string
          image_url?: string | null
          priority?: string | null
          status?: string
          support_email?: string | null
          ticket_id: string
          updated_at?: string
        }
        Update: {
          anydesk_number?: string | null
          assigned_to?: string | null
          branch?: string
          created_at?: string
          custom_fields?: Json | null
          customer_email?: string | null
          description?: string
          employee_id?: string
          extension_number?: string | null
          id?: string
          image_url?: string | null
          priority?: string | null
          status?: string
          support_email?: string | null
          ticket_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_ticket_response: {
        Args: { p_is_admin?: boolean; p_response: string; p_ticket_id: string }
        Returns: string
      }
      add_ticket_response_with_admin: {
        Args: {
          p_admin_id?: string
          p_is_admin?: boolean
          p_response: string
          p_ticket_id: string
        }
        Returns: string
      }
      check_admin_credentials: {
        Args: { p_password: string; p_username: string }
        Returns: boolean
      }
      delete_ticket_by_id: { Args: { p_ticket_id: string }; Returns: boolean }
      update_ticket_status: {
        Args: { p_status: string; p_ticket_id: string }
        Returns: boolean
      }
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
