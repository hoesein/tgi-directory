import { supabase } from '@/lib/supabase';
import { loginSchema } from '@/types';
import { successResponse, errorResponse } from '@/lib/api-helpers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 400);
    }

    const { email, password } = parsed.data;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return errorResponse('Invalid credentials', 401);
    }

    return successResponse({ token: data.session.access_token });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return errorResponse(message, 500);
  }
}
