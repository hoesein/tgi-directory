import { supabaseAdmin } from '@/lib/supabase';
import { successResponse, errorResponse, getTokenFromRequest } from '@/lib/api-helpers';

export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return errorResponse('Not authorized to access this route', 401);
    }

    // Verify the JWT and get user
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !userData.user) {
      return errorResponse('Not authorized to access this route', 401);
    }

    // Get profile from users table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userData.user.id)
      .single();

    if (profileError || !profile) {
      return errorResponse('User not found', 404);
    }

    return successResponse(profile);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get user';
    return errorResponse(message, 500);
  }
}
