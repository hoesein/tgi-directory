import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { storage } from '../lib/storage';
import { supabase } from '../lib/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  /** Access token for backend calls. Supabase refreshes it. */
  userToken: string | null;
  /** False until Supabase has restored the session (and finished any callback). */
  ready: boolean;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  userToken: null,
  ready: !supabase,
  signOut: async () => {
    // This device only; other devices stay signed in.
    try {
      await supabase?.auth.signOut({ scope: 'local' });
    } finally {
      set({ session: null, user: null, userToken: null });
    }
  },
}));

let started = false;

/** Keeps the store in step with Supabase (sign-in, refresh, sign-out). */
export function initAuth(): void {
  if (started) return;
  started = true;
  // The old dummy token from before real sign-in.
  storage.delete('userToken');
  if (!supabase) return;
  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.setState({
      session,
      user: session?.user ?? null,
      userToken: session?.access_token ?? null,
      ready: true,
    });
  });
}
