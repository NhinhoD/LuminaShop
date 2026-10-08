import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for browser/client-side execution.
 * Uses public environment variables safe for browser exposure.
 *
 * @returns Browser Supabase client instance.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
