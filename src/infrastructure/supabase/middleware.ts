import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { ROLES, ROUTES } from '@/presentation/constants'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Layer 1 — Middleware Security Guard
  if (request.nextUrl.pathname.startsWith(ROUTES.ADMIN)) {
    // 1. Must be logged in
    if (!user) {
      return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url))
    }

    let isAdmin = false;

    // 2. Try to get role from Custom Claims (Fastest, Edge-friendly)
    try {
      const { data: claimsData } = await supabase.rpc('get_my_claims')
      if (claimsData?.claims?.app_metadata?.user_role === ROLES.ADMIN || 
          claimsData?.claims?.user_role === ROLES.ADMIN) {
        isAdmin = true;
      }
    } catch (e) {
      console.error('Error fetching claims:', e);
    }

    // 3. Fallback to Profiles Table if not found in claims
    if (!isAdmin) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profileError && profile?.role === ROLES.ADMIN) {
        isAdmin = true;
      }
    }

    // 4. Deny access if not admin
    if (!isAdmin) {
      logAdminDenied(request, user.id)
      // Use redirect to homepage or a specific unauthorized page instead of a broken rewrite
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

function logAdminDenied(request: NextRequest, userId: string) {
  console.warn(
    JSON.stringify({
      event: 'ADMIN_ACCESS_DENIED',
      path: request.nextUrl.pathname,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userId,
      time: new Date().toISOString(),
    })
  )
}
