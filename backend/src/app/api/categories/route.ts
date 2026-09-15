import { supabase } from '@/lib/supabase';
import { createCategorySchema, type Category } from '@/types';
import { successResponse, errorResponse } from '@/lib/api-helpers';

function buildTree(categories: Category[]): Category[] {
  const map = new Map<string, Category & { children: Category[] }>();
  const roots: Category[] = [];
  categories.forEach((c) => map.set(c.id, { ...c, children: [] }));
  categories.forEach((c) => {
    const node = map.get(c.id)!;
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  const sortRec = (nodes: Category[]) => {
    nodes.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name));
    nodes.forEach((n) => n.children && sortRec(n.children as Category[]));
  };
  sortRec(roots);
  return roots;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parentId = url.searchParams.get('parent_id');
    const levelParam = url.searchParams.get('level');
    const tree = url.searchParams.get('tree');

    let query = supabase.from('categories').select('*').order('sort_order', { ascending: true }).order('name', { ascending: true });

    if (parentId !== null) {
      if (parentId === 'null' || parentId === '') {
        query = query.is('parent_id', null);
      } else {
        query = query.eq('parent_id', parentId);
      }
    }
    if (levelParam !== null) {
      const lvl = Number(levelParam);
      if (!Number.isNaN(lvl)) query = query.eq('level', lvl);
    }

    const { data: categories, error } = await query;

    if (error) {
      return errorResponse(error.message, 400);
    }

    if (tree === 'true' || tree === '1') {
      return successResponse(buildTree(categories as Category[]), 200, categories.length);
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

    const payload = parsed.data;

    // auto-derive level from parent if not provided
    if (payload.parent_id && payload.level === undefined) {
      const { data: parent } = await supabase.from('categories').select('level').eq('id', payload.parent_id).single();
      if (parent) payload.level = (parent.level as number) + 1;
    }
    if (payload.level === undefined) payload.level = payload.parent_id ? 1 : 0;

    const { data: category, error } = await supabase
      .from('categories')
      .insert(payload)
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
