import { create } from 'zustand';

interface AuthState {
  userToken: string | null;
  isLoading: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userToken: null,
  isLoading: false,
  signIn: (token) => set({ userToken: token }),
  signOut: () => set({ userToken: null }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
