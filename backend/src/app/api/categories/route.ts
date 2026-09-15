import { supabase, supabaseAdmin } from '@/lib/supabase';
import { createCategorySchema } from '@/types';
import { successResponse, errorResponse, getTokenFromRequest } from '@/lib/api-helpers';

export async function GET() {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      return errorResponse(error.message, 400);
    }

    return successResponse(categories, 200, categories.length);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch categories';
    return errorResponse(message, 500);
  }
}

export async function POST(request: Request) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return errorResponse('Not authorized to access this route', 401);
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      return errorResponse('Not authorized to access this route', 401);
    }

    // Check admin role
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userData.user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return errorResponse('Not authorized to access this route', 403);
    }

    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 400);
    }

    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .insert(parsed.data)
      .select()
      .single();

    if (error) {
      return errorResponse(error.message, 400);
    }

    return successResponse(category, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create category';
    return errorResponse(message, 500);
  }
}
