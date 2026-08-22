import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const isLoggedin = request.cookies.get('isLoggedin')?.value === 'true';
    const { pathname } = request.nextUrl;

    // Protect /chat route
    if (pathname.startsWith('/chat')) {
        if (!isLoggedin) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Redirect logged-in users away from /login
    if (pathname === '/login') {
        if (isLoggedin) {
            return NextResponse.redirect(new URL('/chat', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/chat/:path*', '/login'],
}
