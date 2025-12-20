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
      app_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      delivery_zones: {
        Row: {
          base_delivery_fee: number | null
          city: string
          created_at: string
          id: string
          is_active: boolean | null
          min_order_amount: number | null
          name: string
          per_km_fee: number | null
          polygon: Json
        }
        Insert: {
          base_delivery_fee?: number | null
          city: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          min_order_amount?: number | null
          name: string
          per_km_fee?: number | null
          polygon: Json
        }
        Update: {
          base_delivery_fee?: number | null
          city?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          min_order_amount?: number | null
          name?: string
          per_km_fee?: number | null
          polygon?: Json
        }
        Relationships: []
      }
      driver_locations: {
        Row: {
          driver_id: string
          id: string
          lat: number
          lng: number
          order_id: string | null
          recorded_at: string
        }
        Insert: {
          driver_id: string
          id?: string
          lat: number
          lng: number
          order_id?: string | null
          recorded_at?: string
        }
        Update: {
          driver_id?: string
          id?: string
          lat?: number
          lng?: number
          order_id?: string | null
          recorded_at?: string
        }
        Relationships: []
      }
      drivers: {
        Row: {
          created_at: string
          current_lat: number | null
          current_lng: number | null
          id: string
          is_online: boolean | null
          is_verified: boolean | null
          last_location_update: string | null
          license_number: string
          license_url: string | null
          rating: number | null
          rc_url: string | null
          total_deliveries: number | null
          total_earnings: number | null
          updated_at: string
          user_id: string
          vehicle_number: string
          vehicle_type: string
        }
        Insert: {
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          id?: string
          is_online?: boolean | null
          is_verified?: boolean | null
          last_location_update?: string | null
          license_number: string
          license_url?: string | null
          rating?: number | null
          rc_url?: string | null
          total_deliveries?: number | null
          total_earnings?: number | null
          updated_at?: string
          user_id: string
          vehicle_number: string
          vehicle_type: string
        }
        Update: {
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          id?: string
          is_online?: boolean | null
          is_verified?: boolean | null
          last_location_update?: string | null
          license_number?: string
          license_url?: string | null
          rating?: number | null
          rc_url?: string | null
          total_deliveries?: number | null
          total_earnings?: number | null
          updated_at?: string
          user_id?: string
          vehicle_number?: string
          vehicle_type?: string
        }
        Relationships: []
      }
      menu_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          restaurant_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          restaurant_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          restaurant_id?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          calories: number | null
          category_id: string | null
          created_at: string
          description: string | null
          discounted_price: number | null
          id: string
          image_url: string | null
          is_available: boolean | null
          is_bestseller: boolean | null
          is_veg: boolean | null
          name: string
          prep_time_mins: number | null
          price: number
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          calories?: number | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          discounted_price?: number | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_bestseller?: boolean | null
          is_veg?: boolean | null
          name: string
          prep_time_mins?: number | null
          price: number
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          calories?: number | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          discounted_price?: number | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_bestseller?: boolean | null
          is_veg?: boolean | null
          name?: string
          prep_time_mins?: number | null
          price?: number
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          data: Json | null
          failed_count: number | null
          id: string
          scheduled_for: string | null
          sent_at: string | null
          sent_count: number | null
          status: string | null
          target_audience: string
          target_user_ids: string[] | null
          title: string
          type: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          data?: Json | null
          failed_count?: number | null
          id?: string
          scheduled_for?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string | null
          target_audience: string
          target_user_ids?: string[] | null
          title: string
          type: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          data?: Json | null
          failed_count?: number | null
          id?: string
          scheduled_for?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string | null
          target_audience?: string
          target_user_ids?: string[] | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string | null
          name: string
          notes: string | null
          order_id: string
          price: number
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id?: string | null
          name: string
          notes?: string | null
          order_id: string
          price: number
          quantity?: number
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string | null
          name?: string
          notes?: string | null
          order_id?: string
          price?: number
          quantity?: number
        }
        Relationships: []
      }
      order_status_history: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          order_id: string
          status: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          order_id: string
          status: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          status?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          actual_delivery_time: string | null
          cancellation_reason: string | null
          cancelled_by: string | null
          created_at: string
          customer_id: string
          delivery_address: string
          delivery_fee: number
          delivery_instructions: string | null
          delivery_lat: number | null
          delivery_lng: number | null
          discount: number | null
          driver_id: string | null
          estimated_delivery_time: string | null
          id: string
          order_number: string
          payment_id: string | null
          payment_method: string | null
          payment_status: string
          restaurant_id: string
          status: string
          subtotal: number
          tax: number | null
          total: number
          updated_at: string
        }
        Insert: {
          actual_delivery_time?: string | null
          cancellation_reason?: string | null
          cancelled_by?: string | null
          created_at?: string
          customer_id: string
          delivery_address: string
          delivery_fee?: number
          delivery_instructions?: string | null
          delivery_lat?: number | null
          delivery_lng?: number | null
          discount?: number | null
          driver_id?: string | null
          estimated_delivery_time?: string | null
          id?: string
          order_number: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string
          restaurant_id: string
          status?: string
          subtotal: number
          tax?: number | null
          total: number
          updated_at?: string
        }
        Update: {
          actual_delivery_time?: string | null
          cancellation_reason?: string | null
          cancelled_by?: string | null
          created_at?: string
          customer_id?: string
          delivery_address?: string
          delivery_fee?: number
          delivery_instructions?: string | null
          delivery_lat?: number | null
          delivery_lng?: number | null
          discount?: number | null
          driver_id?: string | null
          estimated_delivery_time?: string | null
          id?: string
          order_number?: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string
          restaurant_id?: string
          status?: string
          subtotal?: number
          tax?: number | null
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      promotion_usage: {
        Row: {
          discount_amount: number
          id: string
          order_id: string | null
          promotion_id: string
          used_at: string
          user_id: string
        }
        Insert: {
          discount_amount: number
          id?: string
          order_id?: string | null
          promotion_id: string
          used_at?: string
          user_id: string
        }
        Update: {
          discount_amount?: number
          id?: string
          order_id?: string | null
          promotion_id?: string
          used_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          applicable_to: string | null
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_discount: number | null
          min_order: number | null
          restaurant_ids: string[] | null
          title: string
          type: string
          updated_at: string
          usage_limit: number | null
          used_count: number | null
          valid_from: string
          valid_until: string
          value: number
        }
        Insert: {
          applicable_to?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_order?: number | null
          restaurant_ids?: string[] | null
          title: string
          type: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number | null
          valid_from: string
          valid_until: string
          value: number
        }
        Update: {
          applicable_to?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_order?: number | null
          restaurant_ids?: string[] | null
          title?: string
          type?: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string
          valid_until?: string
          value?: number
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          address: string
          avg_delivery_time: number | null
          closing_time: string | null
          commission_rate: number | null
          cover_url: string | null
          created_at: string
          cuisine_type: string[] | null
          description: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          lat: number | null
          lng: number | null
          logo_url: string | null
          min_order_amount: number | null
          name: string
          opening_time: string | null
          owner_id: string | null
          rating: number | null
          slug: string
          total_ratings: number | null
          updated_at: string
        }
        Insert: {
          address: string
          avg_delivery_time?: number | null
          closing_time?: string | null
          commission_rate?: number | null
          cover_url?: string | null
          created_at?: string
          cuisine_type?: string[] | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          min_order_amount?: number | null
          name: string
          opening_time?: string | null
          owner_id?: string | null
          rating?: number | null
          slug: string
          total_ratings?: number | null
          updated_at?: string
        }
        Update: {
          address?: string
          avg_delivery_time?: number | null
          closing_time?: string | null
          commission_rate?: number | null
          cover_url?: string | null
          created_at?: string
          cuisine_type?: string[] | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          min_order_amount?: number | null
          name?: string
          opening_time?: string | null
          owner_id?: string | null
          rating?: number | null
          slug?: string
          total_ratings?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      settlements: {
        Row: {
          amount: number
          commission: number | null
          created_at: string
          driver_id: string | null
          id: string
          notes: string | null
          order_count: number | null
          payment_reference: string | null
          period_end: string
          period_start: string
          processed_at: string | null
          restaurant_id: string | null
          status: string
          type: string
        }
        Insert: {
          amount: number
          commission?: number | null
          created_at?: string
          driver_id?: string | null
          id?: string
          notes?: string | null
          order_count?: number | null
          payment_reference?: string | null
          period_end: string
          period_start: string
          processed_at?: string | null
          restaurant_id?: string | null
          status?: string
          type: string
        }
        Update: {
          amount?: number
          commission?: number | null
          created_at?: string
          driver_id?: string | null
          id?: string
          notes?: string | null
          order_count?: number | null
          payment_reference?: string | null
          period_end?: string
          period_start?: string
          processed_at?: string | null
          restaurant_id?: string | null
          status?: string
          type?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string
          description: string
          id: string
          order_id: string | null
          priority: string | null
          resolved_at: string | null
          status: string
          subject: string
          ticket_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          description: string
          id?: string
          order_id?: string | null
          priority?: string | null
          resolved_at?: string | null
          status?: string
          subject: string
          ticket_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          order_id?: string | null
          priority?: string | null
          resolved_at?: string | null
          status?: string
          subject?: string
          ticket_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          attachments: string[] | null
          created_at: string
          id: string
          message: string
          sender_id: string
          ticket_id: string
        }
        Insert: {
          attachments?: string[] | null
          created_at?: string
          id?: string
          message: string
          sender_id: string
          ticket_id: string
        }
        Update: {
          attachments?: string[] | null
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
          ticket_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          gateway_transaction_id: string | null
          id: string
          metadata: Json | null
          order_id: string | null
          payment_gateway: string | null
          payment_method: string | null
          status: string
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          gateway_transaction_id?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          payment_gateway?: string | null
          payment_method?: string | null
          status?: string
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          gateway_transaction_id?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          payment_gateway?: string | null
          payment_method?: string | null
          status?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_notification_tokens: {
        Row: {
          created_at: string
          device_type: string | null
          id: string
          is_active: boolean | null
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          id?: string
          is_active?: boolean | null
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_type?: string | null
          id?: string
          is_active?: boolean | null
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          phone?: string | null
          role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: string
          status?: string
          updated_at?: string
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

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
