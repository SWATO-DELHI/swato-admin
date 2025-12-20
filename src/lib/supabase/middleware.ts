import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

  // Protected admin routes
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login')
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  const isRoot = request.nextUrl.pathname === '/'
  const isPublicAsset =
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/favicon.ico') ||
    request.nextUrl.pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)

  // Allow public assets and API routes
  if (isPublicAsset || isApiRoute) {
    return supabaseResponse
  }

  // Redirect root to login or dashboard
  if (isRoot) {
    const url = request.nextUrl.clone()
    url.pathname = user ? '/admin/dashboard' : '/login'
    return NextResponse.redirect(url)
  }

  // Protect admin routes - redirect to login if not authenticated
  if (isAdminRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from login page
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/dashboard'
    return NextResponse.redirect(url)
  }

  // Redirect all other routes (front-end pages) to login or admin dashboard
  // These pages have been moved to a separate repository
  if (!isAdminRoute && !isAuthRoute && !isApiRoute) {
    const url = request.nextUrl.clone()
    url.pathname = user ? '/admin/dashboard' : '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
