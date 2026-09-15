import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Category, ApiResponse } from '../types';

export function useCategories(params?: { parent_id?: string | null; level?: number; tree?: boolean }) {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: async () => {
      const search = new URLSearchParams();
      if (params?.parent_id !== undefined) search.set('parent_id', params.parent_id ?? 'null');
      if (params?.level !== undefined) search.set('level', String(params.level));
      if (params?.tree) search.set('tree', 'true');
      const qs = search.toString();
      const path = qs ? `/categories?${qs}` : '/categories';
      const data = await api.get<ApiResponse<Category[]>>(path);
      return data.data;
    },
  });
}

export function useMainCategories() {
  return useCategories({ level: 0 });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: async () => {
      const data = await api.get<ApiResponse<Category & { children: Category[] }>>(`/categories/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}
