import { useState, useEffect, useCallback } from 'react';
import { supabase, auth, isSupabaseConfigured, getDeviceId } from '../lib/supabase';
import { User, Profile } from '../types/database';

interface UseAuthReturn {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = Boolean(user);
  const isAnonymous = user?.is_anonymous ?? false;

  // Fetch user profile from Supabase
  const fetchProfile = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }

      // If profile doesn't exist, create one
      if (!data) {
        const newProfile = {
          id: userId,
          display_name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'User',
          avatar_url: user?.user_metadata?.avatar_url || null,
          preferred_version: 'modern' as const,
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          return null;
        }

        return createdProfile;
      }

      return data as Profile;
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      return null;
    }
  }, [user]);

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  }, [user, fetchProfile]);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      
      try {
        // Get initial session
        const session = await auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError('Authentication initialization failed');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);

        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign in with Google
  const handleSignInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Please add your Supabase URL and anon key.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const { error: signInError } = await auth.signInWithGoogle();
      
      if (signInError) {
        throw signInError;
      }
      
      // If successful, the onAuthStateChange callback will handle the rest
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign in anonymously
  const handleSignInAnonymously = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Please add your Supabase URL and anon key.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const { user: anonUser, error: signInError } = await auth.signInAnonymously();
      
      if (signInError) {
        throw signInError;
      }

      if (anonUser) {
        // Create profile for anonymous user
        const profileData = await fetchProfile(anonUser.id);
        setProfile(profileData);
      }
    } catch (err: any) {
      console.error('Anonymous sign in error:', err);
      setError(err.message || 'Failed to sign in anonymously');
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfile]);

  // Sign out
  const handleSignOut = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const { error: signOutError } = await auth.signOut();
      
      if (signOutError) {
        throw signOutError;
      }

      setUser(null);
      setProfile(null);
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError(err.message || 'Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update profile
  const handleUpdateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user || !isSupabaseConfigured) return;

    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setProfile(data as Profile);
    } catch (err: any) {
      console.error('Update profile error:', err);
      setError(err.message || 'Failed to update profile');
    }
  }, [user]);

  return {
    user,
    profile,
    isLoading,
    isAuthenticated,
    isAnonymous,
    error,
    signInWithGoogle: handleSignInWithGoogle,
    signInAnonymously: handleSignInAnonymously,
    signOut: handleSignOut,
    updateProfile: handleUpdateProfile,
    refreshProfile,
  };
}
