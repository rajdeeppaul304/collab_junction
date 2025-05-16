import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])
const isProtectedRoute = createRouteMatcher([])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()

    try {
      if (!auth.userId) return NextResponse.redirect(new URL('/sign-in', req.url))
      const user = await clerkClient.users.getUser(auth.userId)
      const role = user.publicMetadata.role

      if (!role) {
        return NextResponse.redirect(new URL('/role-selection', req.url))
      }

      const path = req.nextUrl.pathname

      if (path.startsWith('/dashboard/brand') && role !== 'brand') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }

      if (path.startsWith('/dashboard/creator') && role !== 'creator') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }

    } catch (err) {
      console.error('Error in middleware:', err)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
