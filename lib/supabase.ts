import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Database = {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string;
          name: string;
          description: string;
          category: string;
          ipfs_hash: string;
          price_eth: string;
          creator_address: string;
          usage_count: number;
          rating: number;
          total_ratings: number;
          created_at: string;
          updated_at: string;
          sample_input: string;
          sample_output: string;
          language: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          category: string;
          ipfs_hash: string;
          price_eth: string;
          creator_address: string;
          usage_count?: number;
          rating?: number;
          total_ratings?: number;
          created_at?: string;
          updated_at?: string;
          sample_input: string;
          sample_output: string;
          language: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          category?: string;
          ipfs_hash?: string;
          price_eth?: string;
          creator_address?: string;
          usage_count?: number;
          rating?: number;
          total_ratings?: number;
          created_at?: string;
          updated_at?: string;
          sample_input?: string;
          sample_output?: string;
          language?: string;
          is_active?: boolean;
        };
      };
      benchmarks: {
        Row: {
          id: string;
          agent_id: string;
          latency_ms: number;
          cost_usd: number;
          accuracy_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          latency_ms: number;
          cost_usd: number;
          accuracy_score: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          agent_id?: string;
          latency_ms?: number;
          cost_usd?: number;
          accuracy_score?: number;
          created_at?: string;
        };
      };
      user_licenses: {
        Row: {
          id: string;
          user_address: string;
          agent_id: string;
          transaction_hash: string;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          user_address: string;
          agent_id: string;
          transaction_hash: string;
          created_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          user_address?: string;
          agent_id?: string;
          transaction_hash?: string;
          created_at?: string;
          expires_at?: string | null;
        };
      };
      reviews: {
        Row: {
          id: string;
          agent_id: string;
          user_address: string;
          rating: number;
          comment: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          user_address: string;
          rating: number;
          comment: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          agent_id?: string;
          user_address?: string;
          rating?: number;
          comment?: string;
          created_at?: string;
        };
      };
      waitlist: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          company: string | null;
          role: string | null;
          use_case: string | null;
          interests: string[] | null;
          referral_source: string | null;
          newsletter_consent: boolean;
          position: number | null;
          ip_address: string | null;
          user_agent: string | null;
          status: string;
          invited_at: string | null;
          registered_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          company?: string | null;
          role?: string | null;
          use_case?: string | null;
          interests?: string[] | null;
          referral_source?: string | null;
          newsletter_consent?: boolean;
          position?: number | null;
          ip_address?: string | null;
          user_agent?: string | null;
          status?: string;
          invited_at?: string | null;
          registered_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          company?: string | null;
          role?: string | null;
          use_case?: string | null;
          interests?: string[] | null;
          referral_source?: string | null;
          newsletter_consent?: boolean;
          position?: number | null;
          ip_address?: string | null;
          user_agent?: string | null;
          status?: string;
          invited_at?: string | null;
          registered_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
         process.env.NEXT_PUBLIC_SUPABASE_URL.includes('supabase.co');
};