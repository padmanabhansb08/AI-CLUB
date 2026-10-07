import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface SupabaseAuthResult {
  user: SupabaseUser | null;
  session: Session | null;
  error?: string;
}

export const supabaseAuth = {
  signUp: async (
    email: string,
    password: string,
    metadata?: Record<string, any>
  ): Promise<SupabaseAuthResult> => {
    if (!isSupabaseConfigured()) {
      return { user: null, session: null, error: 'Supabase is not configured' };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    return { user: data.user, session: data.session };
  },

  signIn: async (email: string, password: string): Promise<SupabaseAuthResult> => {
    if (!isSupabaseConfigured()) {
      return { user: null, session: null, error: 'Supabase is not configured' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    return { user: data.user, session: data.session };
  },

  signOut: async (): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: true };
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  },

  getSession: async (): Promise<Session | null> => {
    if (!isSupabaseConfigured()) {
      return null;
    }
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  getUser: async (): Promise<SupabaseUser | null> => {
    if (!isSupabaseConfigured()) {
      return null;
    }
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
    if (!isSupabaseConfigured()) {
      return { unsubscribe: () => {} };
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return { unsubscribe: () => subscription.unsubscribe() };
  },
};
