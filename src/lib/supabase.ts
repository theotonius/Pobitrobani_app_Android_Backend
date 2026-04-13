import { createClient, SupabaseClient, User, Session, AuthChangeEvent } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const effectiveUrl = supabaseUrl || 'https://placeholder.supabase.co';
const effectiveKey = supabaseAnonKey || 'placeholder-key';

export const supabase: SupabaseClient = createClient(effectiveUrl, effectiveKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key: string) => {
        try {
          return localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch {
          // Ignore quota exceeded errors
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch {
          // Ignore errors
        }
      },
    },
  },
  global: {
    headers: {
      'x-client-info': 'sacred-word-app',
    },
  },
});

// Auth helpers
export const auth = {
  // Get current session
  getSession: async (): Promise<Session | null> => {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  // Get current user
  getUser: async (): Promise<User | null> => {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  // Sign in with Google
  signInWithGoogle: async (): Promise<{ user: User | null; error: Error | null }> => {
    try {
      const redirectUrl = import.meta.env.VITE_REDIRECT_URL || window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: 'consent',
          },
        },
      });
      // For OAuth, user will be available via onAuthStateChange callback
      // Return the current user after OAuth redirect
      const { data } = await supabase.auth.getSession();
      return { user: data.session?.user as User || null, error: error as Error };
    } catch (err) {
      return { user: null, error: err as Error };
    }
  },

  // Sign in anonymously (for guest users)
  signInAnonymously: async (): Promise<{ user: User | null; error: Error | null }> => {
    const { data, error } = await supabase.auth.signInAnonymously();
    return { user: data.user as User | null, error: error as Error };
  },

  // Sign out
  signOut: async (): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.signOut();
    return { error: error as Error };
  },

  // Listen to auth changes
  onAuthStateChange: (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Update user profile
  updateProfile: async (updates: { display_name?: string; avatar_url?: string }) => {
    const user = await auth.getUser();
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    return { data, error };
  },
};

// Device ID generator for sync
export const getDeviceId = (): string => {
  const key = 'sacred_word_device_id';
  let deviceId = localStorage.getItem(key);
  
  if (!deviceId) {
    deviceId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem(key, deviceId);
  }
  
  return deviceId;
};
