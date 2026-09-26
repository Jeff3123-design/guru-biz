import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export type UserRole = 'admin' | 'accountant' | 'sales';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve user role from cookie or header (default to 'admin' if not set in dev session)
  const roleCookie = request.cookies.get('erp_user_role')?.value as UserRole | undefined;
  const currentRole: UserRole = roleCookie || 'admin';

  // Role Access Rules
  const rolePermissions: Record<string, UserRole[]> = {
    '/admin': ['admin'],
    '/accounting': ['admin', 'accountant'],
    '/pos': ['admin', 'sales'],
    '/sales': ['admin', 'sales', 'accountant'],
  };

  // Check matching path prefix
  for (const [prefix, allowedRoles] of Object.entries(rolePermissions)) {
    if (pathname.startsWith(prefix)) {
      if (!allowedRoles.includes(currentRole)) {
        // Redirect to dashboard with access denied flag
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        url.searchParams.set('error', 'unauthorized_role');
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/accounting/:path*', '/admin/:path*', '/pos/:path*', '/sales/:path*'],
};
