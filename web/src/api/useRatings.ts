import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMyRating, removeRating, saveRating } from '../services/ratings';
import { useAuthStore } from '../store/authStore';
import type { ApiMyRating } from '../types';

function myRatingKey(userId: string | undefined, entity: string, id: string) {
  return ['my-rating', userId ?? null, entity, id] as const;
}

/** The signed-in user's own rating for one place, plus the community rating. */
export function useMyRating(entity: string, id: string, enabled: boolean) {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: myRatingKey(userId, entity, id),
    queryFn: () => fetchMyRating(entity, id),
    enabled: enabled && !!userId,
    staleTime: 1000 * 60,
  });
}

/**
 * Set (`stars` 1–5) or remove (`stars` null) the user's rating. The stars
 * change at once; on failure they go back and the caller shows the error.
 */
export function useRatePlace(entity: string, id: string) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const key = myRatingKey(userId, entity, id);

  return useMutation({
    mutationFn: async (stars: number | null): Promise<ApiMyRating | null> => {
      if (stars === null) {
        await removeRating(entity, id);
        return null;
      }
      return saveRating(entity, id, stars);
    },
    onMutate: async (stars) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ApiMyRating>(key);
      if (previous) queryClient.setQueryData<ApiMyRating>(key, { ...previous, stars });
      return { previous };
    },
    onError: (_error, _stars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSuccess: (result) => {
      if (result) queryClient.setQueryData(key, result);
    },
    onSettled: () => {
      // Fresh average and count on this page and on the category lists.
      void queryClient.invalidateQueries({ queryKey: key });
      void queryClient.invalidateQueries({
        predicate: (query) =>
          (query.queryKey[0] === 'directory-place' && query.queryKey[3] === id) ||
          (query.queryKey[0] === 'directory-places' && query.queryKey[2] === entity),
      });
    },
  });
}
