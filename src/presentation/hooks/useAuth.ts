'use client';

import { useState, useEffect } from 'react';
import { login, signup, signout } from '@/presentation/actions/auth';
import { makeSupabaseClient } from '@/infrastructure/supabase/container';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getUser() {
      try {
        const supabase = await makeSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    getUser();

    // Listen for auth changes
    const setupListener = async () => {
      const supabase = await makeSupabaseClient();
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      });
      return subscription;
    };

    const subscription = setupListener();

    return () => {
      subscription.then(sub => sub.unsubscribe());
    };
  }, []);

  const handleLogin = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(formData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await signup(formData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signout();
      setUser(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    login: handleLogin,
    signup: handleSignup,
    signout: handleSignout,
  };
}
