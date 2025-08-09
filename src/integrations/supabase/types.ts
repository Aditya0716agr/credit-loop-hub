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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      access_requests: {
        Row: {
          created_at: string
          id: string
          idea_id: string
          is_read: boolean | null
          message: string | null
          requester_id: string
          responded_at: string | null
          response_message: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          idea_id: string
          is_read?: boolean | null
          message?: string | null
          requester_id: string
          responded_at?: string | null
          response_message?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          idea_id?: string
          is_read?: boolean | null
          message?: string | null
          requester_id?: string
          responded_at?: string | null
          response_message?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_requests_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      cofounder_profiles: {
        Row: {
          about_me: string | null
          availability: Database["public"]["Enums"]["availability_type"]
          created_at: string
          experience_years: number
          full_name: string
          id: string
          is_active: boolean
          is_remote: boolean
          location: string | null
          personal_pitch: string
          portfolio_dribbble: string | null
          portfolio_github: string | null
          portfolio_linkedin: string | null
          primary_role: string
          profile_photo: string | null
          updated_at: string
        }
        Insert: {
          about_me?: string | null
          availability?: Database["public"]["Enums"]["availability_type"]
          created_at?: string
          experience_years: number
          full_name: string
          id: string
          is_active?: boolean
          is_remote?: boolean
          location?: string | null
          personal_pitch: string
          portfolio_dribbble?: string | null
          portfolio_github?: string | null
          portfolio_linkedin?: string | null
          primary_role: string
          profile_photo?: string | null
          updated_at?: string
        }
        Update: {
          about_me?: string | null
          availability?: Database["public"]["Enums"]["availability_type"]
          created_at?: string
          experience_years?: number
          full_name?: string
          id?: string
          is_active?: boolean
          is_remote?: boolean
          location?: string | null
          personal_pitch?: string
          portfolio_dribbble?: string | null
          portfolio_github?: string | null
          portfolio_linkedin?: string | null
          primary_role?: string
          profile_photo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          idea_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          idea_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          idea_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      ideas: {
        Row: {
          allowed_viewers: string[] | null
          author_username: string | null
          category: string | null
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_anonymous: boolean
          is_private: boolean | null
          private_access_token: string | null
          private_content: string | null
          problem: string | null
          saves: number | null
          solution: string | null
          status: string | null
          tags: string[]
          target_market: string | null
          title: string
          upvoted_by: string[]
          upvotes: number
          user_id: string
          views: number | null
          what_i_need: string | null
          why_now: string | null
        }
        Insert: {
          allowed_viewers?: string[] | null
          author_username?: string | null
          category?: string | null
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          is_anonymous?: boolean
          is_private?: boolean | null
          private_access_token?: string | null
          private_content?: string | null
          problem?: string | null
          saves?: number | null
          solution?: string | null
          status?: string | null
          tags?: string[]
          target_market?: string | null
          title: string
          upvoted_by?: string[]
          upvotes?: number
          user_id: string
          views?: number | null
          what_i_need?: string | null
          why_now?: string | null
        }
        Update: {
          allowed_viewers?: string[] | null
          author_username?: string | null
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_anonymous?: boolean
          is_private?: boolean | null
          private_access_token?: string | null
          private_content?: string | null
          problem?: string | null
          saves?: number | null
          solution?: string | null
          status?: string | null
          tags?: string[]
          target_market?: string | null
          title?: string
          upvoted_by?: string[]
          upvotes?: number
          user_id?: string
          views?: number | null
          what_i_need?: string | null
          why_now?: string | null
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          application_url: string | null
          benefits: string[] | null
          created_at: string
          created_by: string | null
          deadline: string | null
          description: string
          eligibility: string[] | null
          id: string
          industry: string[]
          is_active: boolean
          location: string
          requirements: string[] | null
          stage: Database["public"]["Enums"]["startup_stage"]
          timeline: Json | null
          title: string
          type: Database["public"]["Enums"]["opportunity_type"]
          updated_at: string
        }
        Insert: {
          application_url?: string | null
          benefits?: string[] | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description: string
          eligibility?: string[] | null
          id?: string
          industry: string[]
          is_active?: boolean
          location: string
          requirements?: string[] | null
          stage: Database["public"]["Enums"]["startup_stage"]
          timeline?: Json | null
          title: string
          type: Database["public"]["Enums"]["opportunity_type"]
          updated_at?: string
        }
        Update: {
          application_url?: string | null
          benefits?: string[] | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string
          eligibility?: string[] | null
          id?: string
          industry?: string[]
          is_active?: boolean
          location?: string
          requirements?: string[] | null
          stage?: Database["public"]["Enums"]["startup_stage"]
          timeline?: Json | null
          title?: string
          type?: Database["public"]["Enums"]["opportunity_type"]
          updated_at?: string
        }
        Relationships: []
      }
      opportunity_notifications: {
        Row: {
          created_at: string
          id: string
          opportunity_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          opportunity_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          opportunity_id?: string
          user_id?: string
        }
        Relationships: []
      }
      opportunity_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          opportunity_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          opportunity_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          opportunity_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string
          email: string
          id: string
          username: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          email: string
          id: string
          username: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          email?: string
          id?: string
          username?: string
        }
        Relationships: []
      }
      saved_opportunities: {
        Row: {
          created_at: string
          id: string
          opportunity_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          opportunity_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          opportunity_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_opportunities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          created_at: string
          endorsement_count: number
          id: string
          skill_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          endorsement_count?: number
          id?: string
          skill_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          endorsement_count?: number
          id?: string
          skill_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_skills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "cofounder_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_private_idea_access: {
        Args: { idea_uuid: string; user_uuid?: string }
        Returns: boolean
      }
      generate_private_access_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      increment_idea_views: {
        Args: { idea_id: string }
        Returns: number
      }
    }
    Enums: {
      availability_type: "full-time" | "part-time" | "advisor"
      experience_level: "beginner" | "intermediate" | "experienced" | "expert"
      opportunity_type: "grant" | "accelerator" | "hackathon" | "program"
      startup_stage: "ideation" | "mvp" | "growth" | "scaling"
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
      availability_type: ["full-time", "part-time", "advisor"],
      experience_level: ["beginner", "intermediate", "experienced", "expert"],
      opportunity_type: ["grant", "accelerator", "hackathon", "program"],
      startup_stage: ["ideation", "mvp", "growth", "scaling"],
    },
  },
} as const
