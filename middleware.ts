import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const PROTECTED = ['/new', '/edit', '/favorites'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Só intercepta rotas protegidas
  const needsAuth = PROTECTED.some((p) => pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  // Supabase usa cookies que começam com "sb-" e contêm "access-token"
  const hasSbAccessToken =
    req.cookies.getAll().some((c) => c.name.includes('sb-') && c.name.includes('access-token'));

  if (!hasSbAccessToken) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/new/:path*', '/edit/:path*', '/favorites'],
};
