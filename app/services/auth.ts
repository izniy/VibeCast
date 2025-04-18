import { supabase } from '../../lib/supabaseClient';
import { AuthError, Session, User, AuthChangeEvent } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

// Helper function to convert User to AuthUser
function toAuthUser(user: User | null): AuthUser | null {
  if (!user || !user.email) return null;
  return {
    id: user.id,
    email: user.email
  };
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    return {
      user: data.user,
      session: data.session,
      error: error,
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: error as AuthError,
    };
  }
}

/**
 * Sign in an existing user with email and password
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return {
      user: data.user,
      session: data.session,
      error: error,
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: error as AuthError,
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    return { error: error as AuthError };
  }
}

/**
 * Get the current session
 */
export async function getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
  try {
    const { data, error } = await supabase.auth.getSession();
    return {
      session: data.session,
      error,
    };
  } catch (error) {
    return {
      session: null,
      error: error as AuthError,
    };
  }
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<{ user: User | null; error: AuthError | null }> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  } catch (error) {
    return {
      user: null,
      error: error as AuthError,
    };
  }
}

// Subscribe to auth state changes
export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange(callback);
} 