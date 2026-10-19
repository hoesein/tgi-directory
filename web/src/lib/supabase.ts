import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Supabase Auth for PWA users (TGI-22). Only the public anon key belongs here;
// never the service-role key. Without both values, sign-in is turned off and
// the app stays browse-only.
const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          // PKCE: the provider sends back a one-time code that this browser
          // swaps for a session on /auth/callback.
          flowType: 'pkce',
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;
