import { useState, useEffect } from 'react';
import { AuthUser } from '../services/auth';
import * as authService from '../services/auth';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = authService.onAuthStateChange((_event, session) => {
      setUser(session?.user ? {
        id: session.user.id,
        email: session.user.email!
      } : null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    try {
      const { user: currentUser } = await authService.getCurrentUser();
      setUser(currentUser ? {
        id: currentUser.id,
        email: currentUser.email!
      } : null);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await authService.signIn(email, password);
    if (error) throw error;
  }

  async function signUp(email: string, password: string) {
    const { error } = await authService.signUp(email, password);
    if (error) throw error;
  }

  async function signOut() {
    const { error } = await authService.signOut();
    if (error) throw error;
    setUser(null);
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut
  };
} 