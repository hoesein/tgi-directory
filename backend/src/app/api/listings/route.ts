import { supabase } from '@/lib/supabase';
import { createListingSchema } from '@/types';
import { successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET() {
  try {
    const { data: listings, error } = await supabase
      .from('listings')
      .select('*, category:categories(*), user:users(id, name, email)')
      .order('created_at', { ascending: false });

    if (error) {
      return errorResponse(error.message, 400);
    }

    return successResponse(listings, 200, listings.length);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch listings';
    return errorResponse(message, 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createListingSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 400);
    }

    const { data: listing, error } = await supabase
      .from('listings')
      .insert(parsed.data)
      .select('*, category:categories(*), user:users(id, name, email)')
      .single();

    if (error) {
      return errorResponse(error.message, 400);
    }

    return successResponse(listing, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create listing';
    return errorResponse(message, 500);
  }
}
