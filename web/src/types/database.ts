export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: { extensions?: Json; operationName?: string; query?: string; variables?: Json }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          alias: string | null
          archived: boolean
          card_color: string | null
          created_at: string
          credit_limit_cents: number | null
          id: string
          name: string
          opening_balance_cents: number
          type: Database['public']['Enums']['account_type']
          updated_at: string
          user_id: string
          wallet_name: string | null
        }
        ComputedFields: never
        Insert: {
          alias?: string | null
          archived?: boolean
          card_color?: string | null
          created_at?: string
          credit_limit_cents?: number | null
          id?: string
          name: string
          opening_balance_cents?: number
          type: Database['public']['Enums']['account_type']
          updated_at?: string
          user_id?: string
          wallet_name?: string | null
        }
        Update: {
          alias?: string | null
          archived?: boolean
          card_color?: string | null
          created_at?: string
          credit_limit_cents?: number | null
          id?: string
          name?: string
          opening_balance_cents?: number
          type?: Database['public']['Enums']['account_type']
          updated_at?: string
          user_id?: string
          wallet_name?: string | null
        }
        Relationships: []
      }
      api_tokens: {
        Row: {
          created_at: string
          id: string
          last_used_at: string | null
          name: string
          revoked_at: string | null
          token_hash: string
          token_prefix: string
          user_id: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          id?: string
          last_used_at?: string | null
          name: string
          revoked_at?: string | null
          token_hash: string
          token_prefix: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
          token_hash?: string
          token_prefix?: string
          user_id?: string
        }
        Relationships: []
      }
      card_payer_categories: {
        Row: {
          card_id: string
          card_payer_id: string
          category_id: string
          user_id: string
        }
        ComputedFields: never
        Insert: {
          card_id: string
          card_payer_id: string
          category_id: string
          user_id?: string
        }
        Update: {
          card_id?: string
          card_payer_id?: string
          category_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'card_payer_categories_card_payer_id_card_id_user_id_fkey'
            columns: ['card_payer_id', 'card_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'card_payers'
            referencedColumns: ['id', 'card_id', 'user_id']
          },
          {
            foreignKeyName: 'card_payer_categories_category_id_user_id_fkey'
            columns: ['category_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id', 'user_id']
          },
        ]
      }
      card_payers: {
        Row: {
          card_id: string
          created_at: string
          id: string
          is_default: boolean
          payer_account_id: string
          user_id: string
        }
        ComputedFields: never
        Insert: {
          card_id: string
          created_at?: string
          id?: string
          is_default?: boolean
          payer_account_id: string
          user_id?: string
        }
        Update: {
          card_id?: string
          created_at?: string
          id?: string
          is_default?: boolean
          payer_account_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'card_payers_card_id_user_id_fkey'
            columns: ['card_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'account_balances'
            referencedColumns: ['account_id', 'user_id']
          },
          {
            foreignKeyName: 'card_payers_card_id_user_id_fkey'
            columns: ['card_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'account_money_left'
            referencedColumns: ['account_id', 'user_id']
          },
          {
            foreignKeyName: 'card_payers_card_id_user_id_fkey'
            columns: ['card_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'accounts'
            referencedColumns: ['id', 'user_id']
          },
          {
            foreignKeyName: 'card_payers_payer_account_id_user_id_fkey'
            columns: ['payer_account_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'account_balances'
            referencedColumns: ['account_id', 'user_id']
          },
          {
            foreignKeyName: 'card_payers_payer_account_id_user_id_fkey'
            columns: ['payer_account_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'account_money_left'
            referencedColumns: ['account_id', 'user_id']
          },
          {
            foreignKeyName: 'card_payers_payer_account_id_user_id_fkey'
            columns: ['payer_account_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'accounts'
            referencedColumns: ['id', 'user_id']
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        ComputedFields: never
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'categories_parent_id_user_id_fkey'
            columns: ['parent_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id', 'user_id']
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          onboarding_step: number
          pinned_account_id: string | null
          updated_at: string
          user_id: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          display_name?: string | null
          onboarding_step?: number
          pinned_account_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          onboarding_step?: number
          pinned_account_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_pinned_account_id_user_id_fkey'
            columns: ['pinned_account_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'account_balances'
            referencedColumns: ['account_id', 'user_id']
          },
          {
            foreignKeyName: 'profiles_pinned_account_id_user_id_fkey'
            columns: ['pinned_account_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'account_money_left'
            referencedColumns: ['account_id', 'user_id']
          },
          {
            foreignKeyName: 'profiles_pinned_account_id_user_id_fkey'
            columns: ['pinned_account_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'accounts'
            referencedColumns: ['id', 'user_id']
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string
          amount_cents: number
          category_id: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          kind: Database['public']['Enums']['transaction_kind']
          merchant: string | null
          source: Database['public']['Enums']['transaction_source']
          transfer_id: string | null
          updated_at: string
          user_id: string
        }
        ComputedFields: never
        Insert: {
          account_id: string
          amount_cents: number
          category_id?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          kind?: Database['public']['Enums']['transaction_kind']
          merchant?: string | null
          source?: Database['public']['Enums']['transaction_source']
          transfer_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          account_id?: string
          amount_cents?: number
          category_id?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          kind?: Database['public']['Enums']['transaction_kind']
          merchant?: string | null
          source?: Database['public']['Enums']['transaction_source']
          transfer_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'transactions_account_id_user_id_fkey'
            columns: ['account_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'account_balances'
            referencedColumns: ['account_id', 'user_id']
          },
          {
            foreignKeyName: 'transactions_account_id_user_id_fkey'
            columns: ['account_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'account_money_left'
            referencedColumns: ['account_id', 'user_id']
          },
          {
            foreignKeyName: 'transactions_account_id_user_id_fkey'
            columns: ['account_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'accounts'
            referencedColumns: ['id', 'user_id']
          },
          {
            foreignKeyName: 'transactions_category_id_user_id_fkey'
            columns: ['category_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id', 'user_id']
          },
          {
            foreignKeyName: 'transactions_transfer_id_user_id_fkey'
            columns: ['transfer_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'transfers'
            referencedColumns: ['id', 'user_id']
          },
        ]
      }
      transfers: {
        Row: {
          amount_cents: number
          created_at: string
          date: string
          from_account_id: string
          id: string
          kind: Database['public']['Enums']['transaction_kind']
          note: string | null
          to_account_id: string
          user_id: string
        }
        ComputedFields: never
        Insert: {
          amount_cents: number
          created_at?: string
          date?: string
          from_account_id: string
          id?: string
          kind: Database['public']['Enums']['transaction_kind']
          note?: string | null
          to_account_id: string
          user_id?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          date?: string
          from_account_id?: string
          id?: string
          kind?: Database['public']['Enums']['transaction_kind']
          note?: string | null
          to_account_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'transfers_from_account_id_user_id_fkey'
            columns: ['from_account_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'account_balances'
            referencedColumns: ['account_id', 'user_id']
          },
          {
            foreignKeyName: 'transfers_from_account_id_user_id_fkey'
            columns: ['from_account_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'account_money_left'
            referencedColumns: ['account_id', 'user_id']
          },
          {
            foreignKeyName: 'transfers_from_account_id_user_id_fkey'
            columns: ['from_account_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'accounts'
            referencedColumns: ['id', 'user_id']
          },
          {
            foreignKeyName: 'transfers_to_account_id_user_id_fkey'
            columns: ['to_account_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'account_balances'
            referencedColumns: ['account_id', 'user_id']
          },
          {
            foreignKeyName: 'transfers_to_account_id_user_id_fkey'
            columns: ['to_account_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'account_money_left'
            referencedColumns: ['account_id', 'user_id']
          },
          {
            foreignKeyName: 'transfers_to_account_id_user_id_fkey'
            columns: ['to_account_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'accounts'
            referencedColumns: ['id', 'user_id']
          },
        ]
      }
    }
    Views: {
      account_balances: {
        Row: {
          account_id: string
          balance_cents: number | null
          user_id: string
        }
        ComputedFields: never
        Relationships: []
      }
      account_money_left: {
        Row: {
          account_id: string
          balance_cents: number | null
          covers_cents: number | null
          money_left_cents: number | null
          user_id: string
        }
        ComputedFields: never
        Relationships: []
      }
      card_payer_shares: {
        Row: {
          card_id: string
          payer_account_id: string | null
          share_cents: number | null
          user_id: string
        }
        ComputedFields: never
        Relationships: [
          {
            foreignKeyName: 'transactions_account_id_user_id_fkey'
            columns: ['card_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'account_balances'
            referencedColumns: ['account_id', 'user_id']
          },
          {
            foreignKeyName: 'transactions_account_id_user_id_fkey'
            columns: ['card_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'account_money_left'
            referencedColumns: ['account_id', 'user_id']
          },
          {
            foreignKeyName: 'transactions_account_id_user_id_fkey'
            columns: ['card_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'accounts'
            referencedColumns: ['id', 'user_id']
          },
        ]
      }
      card_transaction_payers: {
        Row: {
          amount_cents: number
          card_id: string
          category_id: string | null
          date: string
          kind: Database['public']['Enums']['transaction_kind']
          payer_account_id: string | null
          transaction_id: string
          user_id: string
        }
        ComputedFields: never
        Relationships: [
          {
            foreignKeyName: 'transactions_account_id_user_id_fkey'
            columns: ['card_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'account_balances'
            referencedColumns: ['account_id', 'user_id']
          },
          {
            foreignKeyName: 'transactions_account_id_user_id_fkey'
            columns: ['card_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'account_money_left'
            referencedColumns: ['account_id', 'user_id']
          },
          {
            foreignKeyName: 'transactions_account_id_user_id_fkey'
            columns: ['card_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'accounts'
            referencedColumns: ['id', 'user_id']
          },
          {
            foreignKeyName: 'transactions_category_id_user_id_fkey'
            columns: ['category_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id', 'user_id']
          },
        ]
      }
    }
    Functions: {
      add_categories: { Args: { categories: Json }; Returns: undefined }
      api_add_transaction: {
        Args: {
          account_ref: string
          amount_cents: number
          category_ref?: string
          description?: string
          kind: string
          merchant?: string
          on_date?: string
          user_ref: string
        }
        Returns: Json
      }
      api_info: { Args: { user_ref: string }; Returns: Json }
      api_money_left: { Args: { user_ref: string }; Returns: Json }
      api_transfer: {
        Args: {
          amount_cents: number
          from_ref: string
          note?: string
          on_date?: string
          to_ref: string
          user_ref: string
        }
        Returns: Json
      }
      api_user_for_token: { Args: { token: string }; Returns: string }
      create_api_token: { Args: { name: string }; Returns: string }
      create_transfer: {
        Args: {
          amount_cents: number
          from_account_id: string
          note?: string
          on_date?: string
          source?: Database['public']['Enums']['transaction_source']
          to_account_id: string
        }
        Returns: {
          amount_cents: number
          created_at: string
          date: string
          from_account_id: string
          id: string
          kind: Database['public']['Enums']['transaction_kind']
          note: string | null
          to_account_id: string
          user_id: string
        }
        SetofOptions: {
          from: '*'
          to: 'transfers'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      revoke_api_token: { Args: { token_id: string }; Returns: undefined }
      save_card_payers: {
        Args: { card_id: string; default_payer_id?: string; rules?: Json }
        Returns: undefined
      }
    }
    Enums: {
      account_type: 'checking' | 'savings' | 'credit_card'
      transaction_kind: 'regular' | 'transfer' | 'payment'
      transaction_source: 'app' | 'shortcut'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      account_type: ['checking', 'savings', 'credit_card'],
      transaction_kind: ['regular', 'transfer', 'payment'],
      transaction_source: ['app', 'shortcut'],
    },
  },
} as const
