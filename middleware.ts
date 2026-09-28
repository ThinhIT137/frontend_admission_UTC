import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { tokenService } from '@/services/token.service';

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  const isLoginPage = request.nextUrl.pathname === '/admin/login';
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  if (isAdminRoute) {
    let isAccessTokenValid = false;
    
    if (accessToken) {
       const payload = await tokenService.verifyAccessToken(accessToken);
       if (payload) isAccessTokenValid = true;
    }

    if (!isAccessTokenValid) {
       // Không có accessToken hoặc accessToken hết hạn
       if (!isLoginPage) {
           // Đá sang API refresh. API refresh sẽ kiểm tra refreshToken, nếu có thì tạo mới, ko thì về login.
           return NextResponse.redirect(new URL(`/api/auth/refresh?redirect=${encodeURIComponent(request.nextUrl.pathname)}`, request.url));
       }
    } else {
       // AccessToken còn hạn
       if (isLoginPage) {
           return NextResponse.redirect(new URL('/admin', request.url));
       }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

