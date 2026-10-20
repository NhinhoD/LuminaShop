import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a server-only Supabase client authenticated with the service-role key.
 *
 * The service-role key bypasses Row Level Security and must NEVER reach the
 * browser (never prefix it with `NEXT_PUBLIC_`). It is used exclusively for
 * trusted server-side operations that RLS cannot express safely, such as
 * fulfilling a payment from an unauthenticated gateway webhook.
 *
 * @returns A service-role Supabase client, or null when the key is not configured.
 */
export function createServiceRoleClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
