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
      badges: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
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
            referencedRelation: "submissions"
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
      form_questions: {
        Row: {
          created_at: string
          description: string | null
          form_id: string
          id: string
          options: Json | null
          order_index: number
          required: boolean
          title: string
          type: string
          validation: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          form_id: string
          id?: string
          options?: Json | null
          order_index?: number
          required?: boolean
          title: string
          type: string
          validation?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          form_id?: string
          id?: string
          options?: Json | null
          order_index?: number
          required?: boolean
          title?: string
          type?: string
          validation?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "form_questions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_response_answers: {
        Row: {
          answer_data: Json | null
          answer_text: string | null
          created_at: string
          id: string
          question_id: string
          response_id: string
        }
        Insert: {
          answer_data?: Json | null
          answer_text?: string | null
          created_at?: string
          id?: string
          question_id: string
          response_id: string
        }
        Update: {
          answer_data?: Json | null
          answer_text?: string | null
          created_at?: string
          id?: string
          question_id?: string
          response_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_response_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "form_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_response_answers_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "form_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      form_responses: {
        Row: {
          form_id: string
          id: string
          ip_address: string | null
          metadata: Json | null
          respondent_id: string | null
          submitted_at: string
        }
        Insert: {
          form_id: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          respondent_id?: string | null
          submitted_at?: string
        }
        Update: {
          form_id?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          respondent_id?: string | null
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_responses_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          branding: Json | null
          created_at: string
          creator_id: string
          credits_per_response: number
          description: string | null
          id: string
          response_count: number
          settings: Json | null
          status: string
          test_id: string | null
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          branding?: Json | null
          created_at?: string
          creator_id: string
          credits_per_response?: number
          description?: string | null
          id?: string
          response_count?: number
          settings?: Json | null
          status?: string
          test_id?: string | null
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          branding?: Json | null
          created_at?: string
          creator_id?: string
          credits_per_response?: number
          description?: string | null
          id?: string
          response_count?: number
          settings?: Json | null
          status?: string
          test_id?: string | null
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "forms_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "test_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          payload: Json
          read: boolean
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          payload?: Json
          read?: boolean
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json
          read?: boolean
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          id: string
          status: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          credits_balance: number
          credits_locked: number
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
          credits_locked?: number
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
          credits_locked?: number
          display_name?: string | null
          id?: string
          interests?: string[] | null
          skills?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          attachments: Json
          content: string
          created_at: string
          device_fingerprint: string | null
          id: string
          ip_address: string | null
          rating: number | null
          status: Database["public"]["Enums"]["feedback_status"]
          test_id: string
          tester_id: string
          updated_at: string
        }
        Insert: {
          attachments?: Json
          content: string
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          ip_address?: string | null
          rating?: number | null
          status?: Database["public"]["Enums"]["feedback_status"]
          test_id: string
          tester_id: string
          updated_at?: string
        }
        Update: {
          attachments?: Json
          content?: string
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          ip_address?: string | null
          rating?: number | null
          status?: Database["public"]["Enums"]["feedback_status"]
          test_id?: string
          tester_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "test_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_requests: {
        Row: {
          created_at: string
          deadline: string | null
          goals: string | null
          id: string
          link: string
          locked_remaining: number
          max_testers: number
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
          deadline?: string | null
          goals?: string | null
          id?: string
          link: string
          locked_remaining?: number
          max_testers?: number
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
          deadline?: string | null
          goals?: string | null
          id?: string
          link?: string
          locked_remaining?: number
          max_testers?: number
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
      user_badges: {
        Row: {
          awarded_at: string
          badge_id: string
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          badge_id: string
          id?: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          badge_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      leaderboard_weekly: {
        Row: {
          credits_earned: number | null
          first_earn: string | null
          last_earn: string | null
          tester_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      adjust_user_credits: {
        Args: { _delta: number; _user_id: string }
        Returns: undefined
      }
      log_credit_tx: {
        Args: {
          _amount: number
          _direction: Database["public"]["Enums"]["tx_direction"]
          _feedback_id?: string
          _metadata?: Json
          _reason: Database["public"]["Enums"]["tx_reason"]
          _test_id?: string
          _user_id: string
        }
        Returns: undefined
      }
      notify: {
        Args: { _payload: Json; _type: string; _user_id: string }
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
