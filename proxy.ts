import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js 16 renamed Middleware to Proxy (same behaviour).
 *
 * Responsibilities:
 *  1. Refresh the Supabase session cookies on every navigation so Server
 *     Components and Route Handlers can read a valid session.
 *  2. Optimistically redirect anonymous visitors away from /admin.
 *
 * This is deliberately NOT the authorization boundary: it only protects
 * rendering. Every read/write is additionally constrained by the Row Level
 * Security policies in supabase/schema.sql, which is what actually stops an
 * unauthenticated client from touching the data (see also /api/revalidate).
 */
const PROTECTED_PREFIXES = ['/admin'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Without Supabase configured there is no session to manage: the app runs on
  // its static fallbacks (lib/portfolio.ts) and /admin shows a setup notice.
  if (!supabaseUrl || !supabaseAnonKey) return response;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getUser() revalidates the token with Supabase; never trust the raw cookie.
  // Any failure (network, provider outage) is treated as "not authenticated",
  // i.e. the admin area fails closed.
  let user: User | null = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user ?? null;
  } catch {
    user = null;
  }

  if (!user && PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return response;
}

export const config = {
  // Run on everything except static assets; `/api/revalidate` re-checks the
  // session itself as defence in depth.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)'],
};
