import { supabaseAdmin } from '@/lib/supabase';
import { registerSchema } from '@/types';
import { successResponse, errorResponse } from '@/lib/api-helpers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 400);
    }

    const { name, email, password } = parsed.data;

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return errorResponse(authError.message, 400);
    }

    // Insert profile into users table
    const { error: profileError } = await supabaseAdmin.from('users').insert({
      id: authData.user.id,
      name,
      email,
      role: 'user',
    });

    if (profileError) {
      // Clean up auth user if profile insert fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return errorResponse(profileError.message, 400);
    }

    // Create a session for the user

    // For simplicity, return the access token from a sign-in
    const { data: signInData, error: signInError } =
      await supabaseAdmin.auth.signInWithPassword({ email, password });

    if (signInError) {
      return errorResponse(signInError.message, 400);
    }

    return successResponse({ token: signInData.session.access_token }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    return errorResponse(message, 500);
  }
}
