import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Category, ApiResponse } from '../types';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const data = await api.get<ApiResponse<Category[]>>('/categories');
      return data.data;
    },
  });
}
