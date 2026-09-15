import { supabase, supabaseAdmin } from '@/lib/supabase';
import { updateListingSchema } from '@/types';
import { successResponse, errorResponse, getTokenFromRequest } from '@/lib/api-helpers';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: listing, error } = await supabase
      .from('listings')
      .select('*, category:categories(*), user:users(id, name, email)')
      .eq('id', id)
      .single();

    if (error || !listing) {
      return errorResponse('Listing not found', 404);
    }

    return successResponse(listing);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch listing';
    return errorResponse(message, 500);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const token = getTokenFromRequest(request);
    if (!token) {
      return errorResponse('Not authorized to access this route', 401);
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      return errorResponse('Not authorized to access this route', 401);
    }

    // Check ownership or admin
    const { data: existing } = await supabaseAdmin
      .from('listings')
      .select('user_id, user:users(role)')
      .eq('id', id)
      .single();

    if (!existing) {
      return errorResponse('Listing not found', 404);
    }

    const userRole = (existing.user as unknown as { role: string } | null)?.role;
    if (existing.user_id !== userData.user.id && userRole !== 'admin') {
      return errorResponse('Not authorized', 403);
    }

    const body = await request.json();
    const parsed = updateListingSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 400);
    }

    const { data: listing, error } = await supabaseAdmin
      .from('listings')
      .update(parsed.data)
      .eq('id', id)
      .select('*, category:categories(*), user:users(id, name, email)')
      .single();

    if (error) {
      return errorResponse(error.message, 400);
    }

    return successResponse(listing);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update listing';
    return errorResponse(message, 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const token = getTokenFromRequest(request);
    if (!token) {
      return errorResponse('Not authorized to access this route', 401);
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      return errorResponse('Not authorized to access this route', 401);
    }

    // Check ownership or admin
    const { data: existing } = await supabaseAdmin
      .from('listings')
      .select('user_id, user:users(role)')
      .eq('id', id)
      .single();

    if (!existing) {
      return errorResponse('Listing not found', 404);
    }

    const userRole = (existing.user as unknown as { role: string } | null)?.role;
    if (existing.user_id !== userData.user.id && userRole !== 'admin') {
      return errorResponse('Not authorized', 403);
    }

    const { error } = await supabaseAdmin.from('listings').delete().eq('id', id);

    if (error) {
      return errorResponse(error.message, 400);
    }

    return successResponse({});
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete listing';
    return errorResponse(message, 500);
  }
}
