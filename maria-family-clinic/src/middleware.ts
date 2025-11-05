import { auth } from '@/server/auth'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/clinics',
    '/services',
    '/doctors',
    '/healthier-sg',
    '/contact',
    '/auth',
    '/api/auth',
    '/_next',
    '/favicon.ico',
  ]

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  )

  // Get the session
  const session = await auth()

  // If it's a protected route and user is not authenticated
  if (!isPublicRoute && !session) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // If user is authenticated and tries to access auth pages, redirect to home
  if (session && pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Role-based access control for admin routes
  if (pathname.startsWith('/admin')) {
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Healthcare provider access control
  if (pathname.startsWith('/provider')) {
    if (!session || !['admin', 'provider', 'clinic_admin'].includes((session.user as any)?.role || '')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, etc.)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}