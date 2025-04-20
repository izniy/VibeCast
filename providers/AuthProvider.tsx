import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Session, User } from '@supabase/supabase-js';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, options?: { data: { [key: string]: any } }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

const LoadingScreen = () => (
  <View className="flex-1 items-center justify-center">
    <ActivityIndicator size="large" color="#6366F1" />
  </View>
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    initialized: false,
    loading: true,
    error: null,
  });
  const isMounted = useRef(true);
  const router = useRouter();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Check if we have a session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      if (isMounted.current) {
        setState(s => ({ ...s, session, user: session?.user ?? null, initialized: true, loading: false }));
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        if (isMounted.current) {
          setState(s => ({ ...s, session, user: session?.user ?? null }));
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle routing based on auth state
  useEffect(() => {
    if (state.loading || !rootNavigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (state.user && inAuthGroup) {
      router.replace('/');
    } else if (!state.user && !inAuthGroup) {
      router.replace('/login');
    }
  }, [state.user, state.loading, segments, rootNavigationState]);

  const signUp = async (email: string, password: string, options?: { data: { [key: string]: any } }) => {
    try {
      if (isMounted.current) {
        setState(s => ({ ...s, loading: true, error: null }));
      }
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: options
      });

      if (error) throw error;

      // Only navigate if root layout is mounted
      if (rootNavigationState?.key) {
        router.replace('/login');
      }
    } catch (error) {
      if (isMounted.current) {
        setState(s => ({ 
          ...s, 
          error: error instanceof Error ? error.message : 'An error occurred during sign up' 
        }));
      }
    } finally {
      if (isMounted.current) {
        setState(s => ({ ...s, loading: false }));
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      if (isMounted.current) {
        setState(s => ({ ...s, loading: true, error: null }));
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error) {
      if (isMounted.current) {
        setState(s => ({ 
          ...s, 
          error: error instanceof Error ? error.message : 'An error occurred during sign in' 
        }));
      }
    } finally {
      if (isMounted.current) {
        setState(s => ({ ...s, loading: false }));
      }
    }
  };

  const signOut = async () => {
    try {
      if (isMounted.current) {
        setState(s => ({ ...s, loading: true, error: null }));
      }
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      if (isMounted.current) {
        setState(s => ({ 
          ...s, 
          error: error instanceof Error ? error.message : 'An error occurred during sign out' 
        }));
      }
    } finally {
      if (isMounted.current) {
        setState(s => ({ ...s, loading: false }));
      }
    }
  };

  const clearError = () => {
    if (isMounted.current) {
      setState(s => ({ ...s, error: null }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signUp,
        signIn,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
} 