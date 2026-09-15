import { supabase } from '@/lib/supabase';
import { createCategorySchema } from '@/types';
import { successResponse, errorResponse } from '@/lib/api-helpers';

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
    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 400);
    }

    const { data: category, error } = await supabase
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
