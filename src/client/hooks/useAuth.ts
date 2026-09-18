'use client';

import { useState, useEffect } from 'react';
import { login, signup, signout } from '@/server/presentation/actions/auth';
import { createClient } from '@/server/infrastructure/supabase/client';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    Promise.resolve().then(async () => {
      try {
        const supabase = createClient();

        try {
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          if (authError) throw authError;
          if (isMounted) setUser(user);
        } catch (err: unknown) {
          if (isMounted) setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
          if (isMounted) setIsLoading(false);
        }

        if (!isMounted) return;

        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
          if (isMounted) {
            setUser(session?.user ?? null);
            setIsLoading(false);
          }
        });

        if (!isMounted) {
          data?.subscription?.unsubscribe();
          return;
        }

        subscription = data?.subscription ?? null;
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize Supabase client');
          setIsLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogin = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(formData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await signup(formData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
