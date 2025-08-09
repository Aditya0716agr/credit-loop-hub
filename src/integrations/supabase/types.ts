export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          direction: Database["public"]["Enums"]["tx_direction"]
          feedback_id: string | null
          id: string
          metadata: Json
          reason: Database["public"]["Enums"]["tx_reason"]
          test_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          direction: Database["public"]["Enums"]["tx_direction"]
          feedback_id?: string | null
          id?: string
          metadata?: Json
          reason: Database["public"]["Enums"]["tx_reason"]
          test_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          direction?: Database["public"]["Enums"]["tx_direction"]
          feedback_id?: string | null
          id?: string
          metadata?: Json
          reason?: Database["public"]["Enums"]["tx_reason"]
          test_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedbacks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "test_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      feedbacks: {
        Row: {
          content: string
          created_at: string
          id: string
          rating: number | null
          status: Database["public"]["Enums"]["feedback_status"]
          test_id: string
          tester_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          rating?: number | null
          status?: Database["public"]["Enums"]["feedback_status"]
          test_id: string
          tester_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          rating?: number | null
          status?: Database["public"]["Enums"]["feedback_status"]
          test_id?: string
          tester_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "test_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          credits_balance: number
          display_name: string | null
          id: string
          interests: string[] | null
          skills: string[] | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          credits_balance?: number
          display_name?: string | null
          id: string
          interests?: string[] | null
          skills?: string[] | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          credits_balance?: number
          display_name?: string | null
          id?: string
          interests?: string[] | null
          skills?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      test_requests: {
        Row: {
          created_at: string
          goals: string | null
          id: string
          link: string
          nda: boolean
          owner_id: string
          reward: number
          status: Database["public"]["Enums"]["test_status"]
          time_required: number
          title: string
          type: Database["public"]["Enums"]["project_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          goals?: string | null
          id?: string
          link: string
          nda?: boolean
          owner_id: string
          reward: number
          status?: Database["public"]["Enums"]["test_status"]
          time_required: number
          title: string
          type: Database["public"]["Enums"]["project_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          goals?: string | null
          id?: string
          link?: string
          nda?: boolean
          owner_id?: string
          reward?: number
          status?: Database["public"]["Enums"]["test_status"]
          time_required?: number
          title?: string
          type?: Database["public"]["Enums"]["project_type"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adjust_user_credits: {
        Args: { _user_id: string; _delta: number }
        Returns: undefined
      }
      log_credit_tx: {
        Args: {
          _user_id: string
          _amount: number
          _direction: Database["public"]["Enums"]["tx_direction"]
          _reason: Database["public"]["Enums"]["tx_reason"]
          _test_id?: string
          _feedback_id?: string
          _metadata?: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      feedback_status: "submitted" | "approved" | "rejected"
      project_type: "Website" | "App" | "Service Flow" | "Other"
      test_status: "active" | "closed"
      tx_direction: "debit" | "credit"
      tx_reason:
        | "post_test"
        | "feedback_approved"
        | "purchase"
        | "refund"
        | "admin_adjust"
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
    Enums: {
      feedback_status: ["submitted", "approved", "rejected"],
      project_type: ["Website", "App", "Service Flow", "Other"],
      test_status: ["active", "closed"],
      tx_direction: ["debit", "credit"],
      tx_reason: [
        "post_test",
        "feedback_approved",
        "purchase",
        "refund",
        "admin_adjust",
      ],
    },
  },
} as const
