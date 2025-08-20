import { NextResponse } from 'next/server';

export function middleware(request) {

  const path = request.nextUrl.pathname;

  // Protect /store routes for logged-in store users only
  if (path.startsWith('/store') && path !== '/storeLogin') {
    const customerToken = request.cookies.get('customerToken');
    if (!customerToken) {
      return NextResponse.redirect(new URL('/storeLogin', request.url));
    }
  }
  // Optional: redirect logged-in store users away from login page
  if (path === '/storeLogin') {
    const customerToken = request.cookies.get('customerToken');
    if (customerToken) {
      return NextResponse.redirect(new URL('/store', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*', '/adminLogin']
};
