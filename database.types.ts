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
      clinicas: {
        Row: {
          created_at: string
          endereco: string | null
          id: number
          sindicato: string | null
        }
        Insert: {
          created_at?: string
          endereco?: string | null
          id?: number
          sindicato?: string | null
        }
        Update: {
          created_at?: string
          endereco?: string | null
          id?: number
          sindicato?: string | null
        }
        Relationships: []
      }
      lista_materiais_itens: {
        Row: {
          created_at: string | null
          id: string
          lista_id: string
          material_id: string
          observacoes: string | null
          quantidade: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          lista_id: string
          material_id: string
          observacoes?: string | null
          quantidade: number
        }
        Update: {
          created_at?: string | null
          id?: string
          lista_id?: string
          material_id?: string
          observacoes?: string | null
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_lista"
            columns: ["lista_id"]
            isOneToOne: false
            referencedRelation: "listas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_material"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais"
            referencedColumns: ["id"]
          },
        ]
      }
      listas: {
        Row: {
          clinica_id: number
          created_at: string | null
          descricao: string | null
          filled_at: string | null
          id: string
          month: string | null
          profissional_id: string
          status: string
        }
        Insert: {
          clinica_id: number
          created_at?: string | null
          descricao?: string | null
          filled_at?: string | null
          id?: string
          month?: string | null
          profissional_id: string
          status?: string
        }
        Update: {
          clinica_id?: number
          created_at?: string | null
          descricao?: string | null
          filled_at?: string | null
          id?: string
          month?: string | null
          profissional_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profissional"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listas_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
        ]
      }
      materiais: {
        Row: {
          created_at: string | null
          id: string
          materiais: string
          preco: number | null
          tipo: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          materiais: string
          preco?: number | null
          tipo?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          materiais?: string
          preco?: number | null
          tipo?: string | null
        }
        Relationships: []
      }
      profissionais: {
        Row: {
          clinica: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          funcao: string | null
          id: string
          id_clinica: number | null
          login: string | null
          nome: string
          sindicato: string | null
          telefone: string | null
        }
        Insert: {
          clinica?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          funcao?: string | null
          id?: string
          id_clinica?: number | null
          login?: string | null
          nome: string
          sindicato?: string | null
          telefone?: string | null
        }
        Update: {
          clinica?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          funcao?: string | null
          id?: string
          id_clinica?: number | null
          login?: string | null
          nome?: string
          sindicato?: string | null
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profissionais_id_clinica_fkey"
            columns: ["id_clinica"]
            isOneToOne: false
            referencedRelation: "clinicas"
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
