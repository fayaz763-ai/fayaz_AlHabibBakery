import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== request.headers.get('host')) return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  return NextResponse.next();
}
export const config = { matcher: ['/api/:path*'] };
