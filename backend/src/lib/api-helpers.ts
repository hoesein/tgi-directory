import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

export function successResponse<T>(data: T, status = 200, count?: number): NextResponse {
  const body: ApiResponse<T> = { success: true, data };
  if (count !== undefined) body.count = count;
  return NextResponse.json(body, { status });
}

export function errorResponse(message: string, status = 400): NextResponse {
  const body: ApiResponse<null> = { success: false, data: null, message };
  return NextResponse.json(body, { status });
}

export function getTokenFromRequest(request: Request): string | null {
  const auth = request.headers.get('authorization');
  if (auth && auth.startsWith('Bearer ')) {
    return auth.slice(7);
  }
  return null;
}
