import { supabase } from '@/lib/supabase';
import { createCategorySchema } from '@/types';
import { successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabase.from('categories').select('*').eq('id', id).single();
    if (error || !data) return errorResponse('Category not found', 404);
    const { data: children } = await supabase.from('categories').select('*').eq('parent_id', id).order('sort_order').order('name');
    return successResponse({ ...data, children: children ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch category';
    return errorResponse(message, 500);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = createCategorySchema.partial().safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.errors[0].message, 400);
    const { data, error } = await supabase.from('categories').update(parsed.data).eq('id', id).select().single();
    if (error) return errorResponse(error.message, 400);
    return successResponse(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update category';
    return errorResponse(message, 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return errorResponse(error.message, 400);
    return successResponse({});
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete category';
    return errorResponse(message, 500);
  }
}
