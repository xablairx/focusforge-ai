import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED = ['/', '/onboarding', '/checkin', '/ideas', '/missions', '/chat', '/revenue', '/review', '/settings']
const PROTECTED_PREFIXES = ['/mission']

function isProtected(pathname: string) {
  if (PROTECTED.includes(pathname)) return true
  return PROTECTED_PREFIXES.some(p => pathname.startsWith(p))
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Unauthenticated → login
  if (!user && isProtected(pathname)) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Authenticated + not onboarded → onboarding
  if (user && isProtected(pathname) && pathname !== '/onboarding') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarded')
      .eq('id', user.id)
      .single()

    if (profile && !profile.onboarded) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  // Authenticated → skip auth pages
  if (user && pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/', '/onboarding', '/checkin', '/ideas', '/missions', '/chat', '/revenue', '/review', '/settings', '/mission/:path*', '/auth/:path*'],
}
