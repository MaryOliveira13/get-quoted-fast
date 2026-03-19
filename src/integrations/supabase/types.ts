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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      fotos_pedido: {
        Row: {
          created_at: string | null
          id: string
          pedido_id: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          pedido_id: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          pedido_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "fotos_pedido_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      melhor_envio_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          id: string
          refresh_token: string
          updated_at: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          id?: string
          refresh_token: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          refresh_token?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          brand: string
          cpf: string
          created_at: string
          customer_cep: string | null
          customer_city: string | null
          customer_complement: string | null
          customer_district: string | null
          customer_email: string | null
          customer_name: string
          customer_number: string | null
          customer_phone: string
          customer_street: string | null
          customer_uf: string | null
          freight_payment_status: string
          id: string
          issue_description: string | null
          label_status: string
          label_url_pdf: string | null
          label_url_png: string | null
          melhor_envio_shipment_id: string | null
          model: string
          mp_external_reference: string | null
          mp_payment_id: string | null
          payment_id: string | null
          payment_provider: string | null
          paypal_capture_id: string | null
          paypal_order_id: string | null
          repair_estimate_total: number
          services: Json
          shipping_amount: number
          shipping_option: Json | null
          tracking_code: string | null
          updated_at: string
        }
        Insert: {
          brand: string
          cpf: string
          created_at?: string
          customer_cep?: string | null
          customer_city?: string | null
          customer_complement?: string | null
          customer_district?: string | null
          customer_email?: string | null
          customer_name: string
          customer_number?: string | null
          customer_phone: string
          customer_street?: string | null
          customer_uf?: string | null
          freight_payment_status?: string
          id?: string
          issue_description?: string | null
          label_status?: string
          label_url_pdf?: string | null
          label_url_png?: string | null
          melhor_envio_shipment_id?: string | null
          model: string
          mp_external_reference?: string | null
          mp_payment_id?: string | null
          payment_id?: string | null
          payment_provider?: string | null
          paypal_capture_id?: string | null
          paypal_order_id?: string | null
          repair_estimate_total?: number
          services?: Json
          shipping_amount?: number
          shipping_option?: Json | null
          tracking_code?: string | null
          updated_at?: string
        }
        Update: {
          brand?: string
          cpf?: string
          created_at?: string
          customer_cep?: string | null
          customer_city?: string | null
          customer_complement?: string | null
          customer_district?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_number?: string | null
          customer_phone?: string
          customer_street?: string | null
          customer_uf?: string | null
          freight_payment_status?: string
          id?: string
          issue_description?: string | null
          label_status?: string
          label_url_pdf?: string | null
          label_url_png?: string | null
          melhor_envio_shipment_id?: string | null
          model?: string
          mp_external_reference?: string | null
          mp_payment_id?: string | null
          payment_id?: string | null
          payment_provider?: string | null
          paypal_capture_id?: string | null
          paypal_order_id?: string | null
          repair_estimate_total?: number
          services?: Json
          shipping_amount?: number
          shipping_option?: Json | null
          tracking_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payment_logs: {
        Row: {
          created_at: string
          id: string
          order_id: string | null
          payload: Json
          provider: string
          status: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: string | null
          payload?: Json
          provider: string
          status?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string | null
          payload?: Json
          provider?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          acessorios: string | null
          bairro: string | null
          cep: string | null
          cidade: string | null
          codigo: string | null
          cpf: string | null
          created_at: string | null
          email: string | null
          frete_nome: string | null
          frete_valor: number | null
          id: string
          marca: string | null
          modelo: string | null
          nome: string | null
          problema: string | null
          rua: string | null
          servico: string | null
          status: string | null
          telefone: string | null
          uf: string | null
          valor: number | null
        }
        Insert: {
          acessorios?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          codigo?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          frete_nome?: string | null
          frete_valor?: number | null
          id?: string
          marca?: string | null
          modelo?: string | null
          nome?: string | null
          problema?: string | null
          rua?: string | null
          servico?: string | null
          status?: string | null
          telefone?: string | null
          uf?: string | null
          valor?: number | null
        }
        Update: {
          acessorios?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          codigo?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          frete_nome?: string | null
          frete_valor?: number | null
          id?: string
          marca?: string | null
          modelo?: string | null
          nome?: string | null
          problema?: string | null
          rua?: string | null
          servico?: string | null
          status?: string | null
          telefone?: string | null
          uf?: string | null
          valor?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_pedido_code: { Args: never; Returns: string }
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
