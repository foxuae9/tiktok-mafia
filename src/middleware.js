import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

export async function middleware(request) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    try {
      await dbConnect();
      return NextResponse.next();
    } catch (error) {
      console.error('خطأ في الاتصال بقاعدة البيانات:', error);
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'خطأ في الاتصال بقاعدة البيانات' 
        }),
        { 
          status: 500, 
          headers: { 'content-type': 'application/json' }
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
