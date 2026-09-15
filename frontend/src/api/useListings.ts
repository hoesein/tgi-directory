import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Listing, ApiResponse } from '../types';

export function useListings(params?: { category_id?: string; search?: string }) {
  return useQuery({
    queryKey: ['listings', params],
    queryFn: async () => {
      const search = new URLSearchParams();
      if (params?.category_id) search.set('category_id', params.category_id);
      if (params?.search) search.set('search', params.search);
      const qs = search.toString();
      const path = qs ? `/listings?${qs}` : '/listings';
      const data = await api.get<ApiResponse<Listing[]>>(path);
      return data.data;
    },
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const data = await api.get<ApiResponse<Listing>>(`/listings/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}
