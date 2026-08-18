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
      envios: {
        Row: {
          cliente_nome: string
          cliente_telefone: string | null
          codigo_rastreio: string | null
          created_at: string
          created_by: string | null
          data_envio: string
          endereco_entrega: string | null
          forma_pagamento: string | null
          id: string
          marca: string | null
          modelo: string | null
          observacoes: string | null
          pedido_id: string | null
          recebimento_id: string | null
          servico: string | null
          transportadora: string | null
          valor_cobrado: number | null
        }
        Insert: {
          cliente_nome: string
          cliente_telefone?: string | null
          codigo_rastreio?: string | null
          created_at?: string
          created_by?: string | null
          data_envio?: string
          endereco_entrega?: string | null
          forma_pagamento?: string | null
          id?: string
          marca?: string | null
          modelo?: string | null
          observacoes?: string | null
          pedido_id?: string | null
          recebimento_id?: string | null
          servico?: string | null
          transportadora?: string | null
          valor_cobrado?: number | null
        }
        Update: {
          cliente_nome?: string
          cliente_telefone?: string | null
          codigo_rastreio?: string | null
          created_at?: string
          created_by?: string | null
          data_envio?: string
          endereco_entrega?: string | null
          forma_pagamento?: string | null
          id?: string
          marca?: string | null
          modelo?: string | null
          observacoes?: string | null
          pedido_id?: string | null
          recebimento_id?: string | null
          servico?: string | null
          transportadora?: string | null
          valor_cobrado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "envios_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "envios_recebimento_id_fkey"
            columns: ["recebimento_id"]
            isOneToOne: false
            referencedRelation: "recebimentos"
            referencedColumns: ["id"]
          },
        ]
      }
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
      orcamentos: {
        Row: {
          cliente_nome: string
          cliente_telefone: string | null
          created_at: string
          created_by: string | null
          id: string
          marca: string
          modelo: string
          observacoes: string | null
          servicos: Json
          status: string
          validade_dias: number
          valor_total: number
        }
        Insert: {
          cliente_nome: string
          cliente_telefone?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          marca: string
          modelo: string
          observacoes?: string | null
          servicos?: Json
          status?: string
          validade_dias?: number
          valor_total?: number
        }
        Update: {
          cliente_nome?: string
          cliente_telefone?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          marca?: string
          modelo?: string
          observacoes?: string | null
          servicos?: Json
          status?: string
          validade_dias?: number
          valor_total?: number
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
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          role: string
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: string
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: string
        }
        Relationships: []
      }
      recebimentos: {
        Row: {
          acessorios_entregues: Json | null
          cliente_nome: string
          cliente_telefone: string | null
          condicao_estetica: Json | null
          created_at: string
          created_by: string | null
          data_chegada: string
          forma_pagamento: string | null
          id: string
          marca: string | null
          modelo: string | null
          observacoes: string | null
          pedido_code: string | null
          pedido_id: string | null
          prazo_dias: number | null
          problema: string | null
          servico: string | null
          status_triagem: string
          valor_orcamento: number | null
        }
        Insert: {
          acessorios_entregues?: Json | null
          cliente_nome: string
          cliente_telefone?: string | null
          condicao_estetica?: Json | null
          created_at?: string
          created_by?: string | null
          data_chegada?: string
          forma_pagamento?: string | null
          id?: string
          marca?: string | null
          modelo?: string | null
          observacoes?: string | null
          pedido_code?: string | null
          pedido_id?: string | null
          prazo_dias?: number | null
          problema?: string | null
          servico?: string | null
          status_triagem?: string
          valor_orcamento?: number | null
        }
        Update: {
          acessorios_entregues?: Json | null
          cliente_nome?: string
          cliente_telefone?: string | null
          condicao_estetica?: Json | null
          created_at?: string
          created_by?: string | null
          data_chegada?: string
          forma_pagamento?: string | null
          id?: string
          marca?: string | null
          modelo?: string | null
          observacoes?: string | null
          pedido_code?: string | null
          pedido_id?: string | null
          prazo_dias?: number | null
          problema?: string | null
          servico?: string | null
          status_triagem?: string
          valor_orcamento?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recebimentos_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_pedido_code: { Args: never; Returns: string }
      generate_recebimento_code: { Args: never; Returns: string }
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
