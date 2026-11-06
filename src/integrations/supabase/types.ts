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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      cancellation_requests: {
        Row: {
          admin_note: string | null
          customer_id: string
          id: string
          order_id: string
          reason: string
          requested_at: string
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["cancellation_status"]
        }
        Insert: {
          admin_note?: string | null
          customer_id: string
          id?: string
          order_id: string
          reason: string
          requested_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["cancellation_status"]
        }
        Update: {
          admin_note?: string | null
          customer_id?: string
          id?: string
          order_id?: string
          reason?: string
          requested_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["cancellation_status"]
        }
        Relationships: [
          {
            foreignKeyName: "cancellation_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cancellation_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          subtitle: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          subtitle?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          subtitle?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          purchase_price: number
          quantity: number
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          purchase_price: number
          quantity: number
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          purchase_price?: number
          quantity?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_line1: string
          address_line2: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          city: string
          country: string
          created_at: string
          customer_id: string
          discount: number
          id: string
          idempotency_key: string | null
          order_number: string
          pin_code: string
          shipping: number
          shipping_name: string
          shipping_phone: string
          state: string
          status: Database["public"]["Enums"]["order_status"]
          stock_deducted: boolean
          stock_restored: boolean
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          city: string
          country?: string
          created_at?: string
          customer_id: string
          discount?: number
          id?: string
          idempotency_key?: string | null
          order_number?: string
          pin_code: string
          shipping?: number
          shipping_name: string
          shipping_phone: string
          state: string
          status?: Database["public"]["Enums"]["order_status"]
          stock_deducted?: boolean
          stock_restored?: boolean
          subtotal: number
          total: number
          updated_at?: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          city?: string
          country?: string
          created_at?: string
          customer_id?: string
          discount?: number
          id?: string
          idempotency_key?: string | null
          order_number?: string
          pin_code?: string
          shipping?: number
          shipping_name?: string
          shipping_phone?: string
          state?: string
          status?: Database["public"]["Enums"]["order_status"]
          stock_deducted?: boolean
          stock_restored?: boolean
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          order_id: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          order_id: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          order_id?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string
          created_at: string
          display_order: number
          id: string
          image_url: string
          product_id: string
        }
        Insert: {
          alt_text?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          product_id: string
        }
        Update: {
          alt_text?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          colour: string | null
          created_at: string
          id: string
          product_id: string
          size: string | null
          sku: string | null
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          colour?: string | null
          created_at?: string
          id?: string
          product_id: string
          size?: string | null
          sku?: string | null
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          colour?: string | null
          created_at?: string
          id?: string
          product_id?: string
          size?: string | null
          sku?: string | null
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          collection_id: string | null
          compare_at_price: number | null
          created_at: string
          description: string | null
          gender: string | null
          highlights: string[]
          id: string
          is_active: boolean
          length_cm: number | null
          material: string | null
          meta_description: string | null
          meta_title: string | null
          name: string
          price: number
          purity: string | null
          sku: string | null
          slug: string
          tagline: string | null
          updated_at: string
          width_cm: number | null
        }
        Insert: {
          category: string
          collection_id?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          gender?: string | null
          highlights?: string[]
          id?: string
          is_active?: boolean
          length_cm?: number | null
          material?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          price: number
          purity?: string | null
          sku?: string | null
          slug: string
          tagline?: string | null
          updated_at?: string
          width_cm?: number | null
        }
        Update: {
          category?: string
          collection_id?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          gender?: string | null
          highlights?: string[]
          id?: string
          is_active?: boolean
          length_cm?: number | null
          material?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          price?: number
          purity?: string | null
          sku?: string | null
          slug?: string
          tagline?: string | null
          updated_at?: string
          width_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      refunds: {
        Row: {
          amount: number
          created_at: string
          id: string
          idempotency_key: string
          kind: Database["public"]["Enums"]["refund_kind"]
          offline_confirmed_at: string | null
          offline_confirmed_by: string | null
          offline_method: string | null
          offline_reference: string | null
          order_id: string
          payment_id: string | null
          razorpay_refund_id: string | null
          reason: string | null
          status: Database["public"]["Enums"]["refund_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          idempotency_key: string
          kind: Database["public"]["Enums"]["refund_kind"]
          offline_confirmed_at?: string | null
          offline_confirmed_by?: string | null
          offline_method?: string | null
          offline_reference?: string | null
          order_id: string
          payment_id?: string | null
          razorpay_refund_id?: string | null
          reason?: string | null
          status?: Database["public"]["Enums"]["refund_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          idempotency_key?: string
          kind?: Database["public"]["Enums"]["refund_kind"]
          offline_confirmed_at?: string | null
          offline_confirmed_by?: string | null
          offline_method?: string | null
          offline_reference?: string | null
          order_id?: string
          payment_id?: string | null
          razorpay_refund_id?: string | null
          reason?: string | null
          status?: Database["public"]["Enums"]["refund_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      return_requests: {
        Row: {
          admin_note: string | null
          customer_id: string
          id: string
          inspection_note: string | null
          order_id: string
          reason: string
          requested_at: string
          resolved_at: string | null
          resolved_by: string | null
          return_awb: string | null
          return_courier: string | null
          status: Database["public"]["Enums"]["return_status"]
        }
        Insert: {
          admin_note?: string | null
          customer_id: string
          id?: string
          inspection_note?: string | null
          order_id: string
          reason: string
          requested_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
          return_awb?: string | null
          return_courier?: string | null
          status?: Database["public"]["Enums"]["return_status"]
        }
        Update: {
          admin_note?: string | null
          customer_id?: string
          id?: string
          inspection_note?: string | null
          order_id?: string
          reason?: string
          requested_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
          return_awb?: string | null
          return_courier?: string | null
          status?: Database["public"]["Enums"]["return_status"]
        }
        Relationships: [
          {
            foreignKeyName: "return_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          awb_code: string | null
          courier_name: string | null
          created_at: string
          delivered_at: string | null
          id: string
          order_id: string
          shiprocket_order_id: string | null
          status: Database["public"]["Enums"]["shipment_status"]
          tracking_url: string | null
          updated_at: string
        }
        Insert: {
          awb_code?: string | null
          courier_name?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          order_id: string
          shiprocket_order_id?: string | null
          status?: Database["public"]["Enums"]["shipment_status"]
          tracking_url?: string | null
          updated_at?: string
        }
        Update: {
          awb_code?: string | null
          courier_name?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          order_id?: string
          shiprocket_order_id?: string | null
          status?: Database["public"]["Enums"]["shipment_status"]
          tracking_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          change: number
          created_at: string
          id: string
          order_id: string | null
          reason: string
          variant_id: string | null
        }
        Insert: {
          change: number
          created_at?: string
          id?: string
          order_id?: string | null
          reason: string
          variant_id?: string | null
        }
        Update: {
          change?: number
          created_at?: string
          id?: string
          order_id?: string | null
          reason?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_order_and_restore: {
        Args: { p_order_id: string; p_reason: string }
        Returns: Json
      }
      finalize_order: {
        Args: {
          p_mark_paid: boolean
          p_order_id: string
          p_razorpay_payment_id?: string
        }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      owns_order: { Args: { _order_id: string }; Returns: boolean }
      restore_returned_stock: { Args: { p_return_id: string }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "customer"
      cancellation_status: "requested" | "approved" | "rejected" | "completed"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
      payment_status:
        | "created"
        | "authorized"
        | "captured"
        | "failed"
        | "refunded"
      refund_kind: "cancellation" | "return"
      refund_status: "created" | "pending" | "processed" | "failed"
      return_status:
        | "requested"
        | "approved"
        | "rejected"
        | "received"
        | "inspection_passed"
        | "inspection_failed"
        | "refunded"
        | "closed"
      shipment_status:
        | "pending"
        | "created"
        | "pickup_scheduled"
        | "in_transit"
        | "out_for_delivery"
        | "delivered"
        | "returned"
        | "cancelled"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "customer"],
      cancellation_status: ["requested", "approved", "rejected", "completed"],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      payment_status: [
        "created",
        "authorized",
        "captured",
        "failed",
        "refunded",
      ],
      refund_kind: ["cancellation", "return"],
      refund_status: ["created", "pending", "processed", "failed"],
      return_status: [
        "requested",
        "approved",
        "rejected",
        "received",
        "inspection_passed",
        "inspection_failed",
        "refunded",
        "closed",
      ],
      shipment_status: [
        "pending",
        "created",
        "pickup_scheduled",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "returned",
        "cancelled",
      ],
    },
  },
} as const
