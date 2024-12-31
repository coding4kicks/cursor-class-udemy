import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({
            name,
            value,
            ...options
          });
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({
            name,
            value: '',
            ...options
          });
        }
      }
    }
  );

  const {
    data: { session }
  } = await supabase.auth.getSession();

  // Protected routes that require authentication
  if (!session && req.nextUrl.pathname.startsWith('/dashboards')) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  // Protected routes that require API key validation
  if (req.nextUrl.pathname.startsWith('/playground/protected')) {
    const apiKey = req.cookies.get('api_key')?.value;

    if (!apiKey) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/playground';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: ['/dashboards/:path*', '/playground/protected/:path*']
};
