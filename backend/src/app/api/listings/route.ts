import { supabase } from '@/lib/supabase';
import { createListingSchema } from '@/types';
import { successResponse, errorResponse } from '@/lib/api-helpers';

async function collectDescendantIds(categoryId: string): Promise<string[]> {
  const ids: string[] = [categoryId];
  const queue: string[] = [categoryId];
  while (queue.length) {
    const pid = queue.shift()!;
    const { data } = await supabase.from('categories').select('id').eq('parent_id', pid);
    if (data) {
      for (const row of data) {
        ids.push(row.id as string);
        queue.push(row.id as string);
      }
    }
  }
  return ids;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const categoryId = url.searchParams.get('category_id');
    const search = url.searchParams.get('search');

    let categoryIds: string[] | null = null;
    if (categoryId) {
      categoryIds = await collectDescendantIds(categoryId);
    }

    let query = supabase.from('listings').select('*, category:categories(*), user:users(id, name, email)').order('created_at', { ascending: false });

    if (categoryIds) {
      query = query.in('category_id', categoryIds);
    }
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data: listings, error } = await query;

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
