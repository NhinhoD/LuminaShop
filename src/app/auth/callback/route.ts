import { createClient } from '@/infrastructure/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';

function getSafeRelativePath(path: string | null): string {
  if (!path) return '/';
  // Must strictly be a relative path, reject protocol-relative (//) or backslash (/\)
  if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) {
    return '/';
  }
  try {
    const parsed = new URL(path, 'http://localhost');
    if (parsed.origin === 'http://localhost') {
      return parsed.pathname + parsed.search + parsed.hash;
    }
  } catch {
    return '/';
  }
  return '/';
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null;
  const next = getSafeRelativePath(requestUrl.searchParams.get('next'));

  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV !== 'production';
  const targetBase = isLocalEnv 
    ? requestUrl.origin 
    : (forwardedHost ? `https://${forwardedHost}` : requestUrl.origin);

  const supabase = await createClient();

  // 1. Handle PKCE code exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${targetBase}${next}`);
    }
  }

  // 2. Handle OTP token_hash verification (e.g. for recovery / email verification)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ 
      token_hash, 
      type: type, 
    });
    if (!error) {
      return NextResponse.redirect(`${targetBase}${next}`);
    }
  }

  // 3. If next is explicitly set (e.g. /reset-password) and no code/token_hash was passed on server,
  // it might be a client-side hash fragment (#access_token=...). Forward to next so the client can parse it.
  if (next && next !== '/') {
    return NextResponse.redirect(`${targetBase}${next}`);
  }

  return NextResponse.redirect(`${targetBase}/login?error=AuthCallbackError`);
}
