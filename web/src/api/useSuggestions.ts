import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchMySuggestions,
  fetchTownships,
  submitSuggestion,
  withdrawSuggestion,
} from '../services/suggestions';
import { useAuthStore } from '../store/authStore';
import type { SuggestionInput } from '../types';

/** Active townships for the place forms. */
export function useTownships(enabled = true) {
  return useQuery({
    queryKey: ['townships'],
    queryFn: fetchTownships,
    enabled,
    staleTime: 1000 * 60 * 60,
  });
}

function mySuggestionsKey(userId: string | undefined) {
  return ['my-suggestions', userId ?? null] as const;
}

export function useMySuggestions() {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: mySuggestionsKey(userId),
    queryFn: fetchMySuggestions,
    enabled: !!userId,
  });
}

export function useSubmitSuggestion() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  return useMutation({
    mutationFn: (input: SuggestionInput) => submitSuggestion(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: mySuggestionsKey(userId) }),
  });
}

export function useWithdrawSuggestion() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  return useMutation({
    mutationFn: (id: string) => withdrawSuggestion(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: mySuggestionsKey(userId) }),
  });
}
