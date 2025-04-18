import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabaseClient';
import { useRouter, useSegments } from 'expo-router';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string) => Promise<void>;
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
    isLoading: true,
    error: null,
  });

  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Check if we have a session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(s => ({ ...s, session, user: session?.user ?? null, isLoading: false }));
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(s => ({ ...s, session, user: session?.user ?? null }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle routing based on auth state
  useEffect(() => {
    if (state.isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (state.user && inAuthGroup) {
      // Redirect authenticated users from auth screens to main app
      router.replace('/');
    } else if (!state.user && !inAuthGroup) {
      // Redirect unauthenticated users to login
      router.replace('/login');
    }
  }, [state.user, state.isLoading, segments]);

  const signUp = async (email: string, password: string) => {
    try {
      setState(s => ({ ...s, isLoading: true, error: null }));
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Redirect to login after successful signup
      router.replace('/login');
    } catch (error) {
      setState(s => ({ 
        ...s, 
        error: error instanceof Error ? error.message : 'An error occurred during sign up' 
      }));
    } finally {
      setState(s => ({ ...s, isLoading: false }));
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setState(s => ({ ...s, isLoading: true, error: null }));
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error) {
      setState(s => ({ 
        ...s, 
        error: error instanceof Error ? error.message : 'An error occurred during sign in' 
      }));
    } finally {
      setState(s => ({ ...s, isLoading: false }));
    }
  };

  const signOut = async () => {
    try {
      setState(s => ({ ...s, isLoading: true, error: null }));
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      setState(s => ({ 
        ...s, 
        error: error instanceof Error ? error.message : 'An error occurred during sign out' 
      }));
    } finally {
      setState(s => ({ ...s, isLoading: false }));
    }
  };

  const clearError = () => {
    setState(s => ({ ...s, error: null }));
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