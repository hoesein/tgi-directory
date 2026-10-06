import { create } from 'zustand';
import { storage } from '../lib/storage';

interface AuthState {
  userToken: string | null;
  isLoading: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Restore persisted session (native MMKV equivalent on web)
  userToken: storage.getString('userToken') ?? null,
  isLoading: false,
  signIn: (token) => {
    storage.set('userToken', token);
    set({ userToken: token });
  },
  signOut: () => {
    storage.delete('userToken');
    set({ userToken: null });
  },
  setLoading: (loading) => set({ isLoading: loading }),
}));
