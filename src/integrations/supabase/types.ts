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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      alert_preferences: {
        Row: {
          alerts_enabled: boolean | null
          created_at: string | null
          goal_alerts: boolean | null
          id: string
          platform_alerts: boolean | null
          surge_alerts: boolean | null
          surge_threshold: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alerts_enabled?: boolean | null
          created_at?: string | null
          goal_alerts?: boolean | null
          id?: string
          platform_alerts?: boolean | null
          surge_alerts?: boolean | null
          surge_threshold?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alerts_enabled?: boolean | null
          created_at?: string | null
          goal_alerts?: boolean | null
          id?: string
          platform_alerts?: boolean | null
          surge_alerts?: boolean | null
          surge_threshold?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
        }
        Relationships: []
      }
      earnings: {
        Row: {
          amount: number
          created_at: string
          id: string
          platform: string
          recorded_at: string
          surge_multiplier: number | null
          trip_distance_km: number | null
          trip_duration_min: number | null
          trip_lat: number | null
          trip_lng: number | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          platform: string
          recorded_at?: string
          surge_multiplier?: number | null
          trip_distance_km?: number | null
          trip_duration_min?: number | null
          trip_lat?: number | null
          trip_lng?: number | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          platform?: string
          recorded_at?: string
          surge_multiplier?: number | null
          trip_distance_km?: number | null
          trip_duration_min?: number | null
          trip_lat?: number | null
          trip_lng?: number | null
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          date: string
          description: string | null
          id: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      favourite_locations: {
        Row: {
          city: string | null
          created_at: string | null
          id: string
          lat: number | null
          lng: number | null
          name: string
          notes: string | null
          user_id: string
          zone_type: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          notes?: string | null
          user_id: string
          zone_type?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          notes?: string | null
          user_id?: string
          zone_type?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          city: string | null
          city_lat: number | null
          city_lng: number | null
          created_at: string
          earnings_goal: number | null
          full_name: string | null
          gmail_connected: boolean | null
          id: string
          onboarding_completed: boolean | null
          preferred_platforms: string[] | null
          stripe_customer_id: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string | null
          city_lat?: number | null
          city_lng?: number | null
          created_at?: string
          earnings_goal?: number | null
          full_name?: string | null
          gmail_connected?: boolean | null
          id?: string
          onboarding_completed?: boolean | null
          preferred_platforms?: string[] | null
          stripe_customer_id?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string | null
          city_lat?: number | null
          city_lng?: number | null
          created_at?: string
          earnings_goal?: number | null
          full_name?: string | null
          gmail_connected?: boolean | null
          id?: string
          onboarding_completed?: boolean | null
          preferred_platforms?: string[] | null
          stripe_customer_id?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      surge_predictions: {
        Row: {
          area: string
          city: string
          confidence: number
          created_at: string
          id: string
          platform: string | null
          predicted_for: string
          predicted_surge: number
        }
        Insert: {
          area: string
          city: string
          confidence: number
          created_at?: string
          id?: string
          platform?: string | null
          predicted_for: string
          predicted_surge: number
        }
        Update: {
          area?: string
          city?: string
          confidence?: number
          created_at?: string
          id?: string
          platform?: string | null
          predicted_for?: string
          predicted_surge?: number
        }
        Relationships: []
      }
    }
    Views: {
      platform_rates: {
        Row: {
          avg_per_hour: number | null
          avg_per_km: number | null
          avg_surge: number | null
          avg_trip_value: number | null
          city: string | null
          last_updated: string | null
          platform: string | null
          trip_count: number | null
        }
        Relationships: []
      }
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
