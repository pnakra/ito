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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      eval_results: {
        Row: {
          actual_risk_level: string | null
          classification_pass: boolean
          created_at: string
          deterministic_pass: boolean
          error: string | null
          expected_refusal: boolean
          expected_risk_level: string
          forbidden_phrase_hits: Json
          id: string
          input_text: string
          latency_ms: number | null
          missing_themes: Json
          raw_response: Json | null
          refusal_fired: boolean
          refusal_pass: boolean
          run_id: string
          scenario_id: string
          tier: string
          tone_rationale: string | null
          tone_score: number | null
          tone_violations: Json
        }
        Insert: {
          actual_risk_level?: string | null
          classification_pass?: boolean
          created_at?: string
          deterministic_pass?: boolean
          error?: string | null
          expected_refusal?: boolean
          expected_risk_level: string
          forbidden_phrase_hits?: Json
          id?: string
          input_text: string
          latency_ms?: number | null
          missing_themes?: Json
          raw_response?: Json | null
          refusal_fired?: boolean
          refusal_pass?: boolean
          run_id: string
          scenario_id: string
          tier: string
          tone_rationale?: string | null
          tone_score?: number | null
          tone_violations?: Json
        }
        Update: {
          actual_risk_level?: string | null
          classification_pass?: boolean
          created_at?: string
          deterministic_pass?: boolean
          error?: string | null
          expected_refusal?: boolean
          expected_risk_level?: string
          forbidden_phrase_hits?: Json
          id?: string
          input_text?: string
          latency_ms?: number | null
          missing_themes?: Json
          raw_response?: Json | null
          refusal_fired?: boolean
          refusal_pass?: boolean
          run_id?: string
          scenario_id?: string
          tier?: string
          tone_rationale?: string | null
          tone_score?: number | null
          tone_violations?: Json
        }
        Relationships: [
          {
            foreignKeyName: "eval_results_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "eval_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      eval_runs: {
        Row: {
          avg_tone_score: number | null
          cancel_requested: boolean
          created_at: string
          fail_count: number
          finished_at: string | null
          id: string
          next_index: number
          notes: string | null
          pass_count: number
          payload: Json | null
          prompt_version_tag: string | null
          started_at: string
          total_count: number
        }
        Insert: {
          avg_tone_score?: number | null
          cancel_requested?: boolean
          created_at?: string
          fail_count?: number
          finished_at?: string | null
          id?: string
          next_index?: number
          notes?: string | null
          pass_count?: number
          payload?: Json | null
          prompt_version_tag?: string | null
          started_at?: string
          total_count?: number
        }
        Update: {
          avg_tone_score?: number | null
          cancel_requested?: boolean
          created_at?: string
          fail_count?: number
          finished_at?: string | null
          id?: string
          next_index?: number
          notes?: string | null
          pass_count?: number
          payload?: Json | null
          prompt_version_tag?: string | null
          started_at?: string
          total_count?: number
        }
        Relationships: []
      }
      submissions: {
        Row: {
          ai_response_summary: string | null
          choice_value: string | null
          created_at: string
          flow_type: string
          freetext_value: string | null
          id: string
          message_index: number | null
          metadata: Json | null
          session_id: string
          step_name: string
          step_type: string
        }
        Insert: {
          ai_response_summary?: string | null
          choice_value?: string | null
          created_at?: string
          flow_type: string
          freetext_value?: string | null
          id?: string
          message_index?: number | null
          metadata?: Json | null
          session_id?: string
          step_name: string
          step_type: string
        }
        Update: {
          ai_response_summary?: string | null
          choice_value?: string | null
          created_at?: string
          flow_type?: string
          freetext_value?: string | null
          id?: string
          message_index?: number | null
          metadata?: Json | null
          session_id?: string
          step_name?: string
          step_type?: string
        }
        Relationships: []
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
