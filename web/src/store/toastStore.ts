import { create } from 'zustand';

interface ToastState {
  message: string | null;
  /** Bumps on every show so the same text twice still restarts the timer. */
  id: number;
  show: (message: string) => void;
  hide: () => void;
}

/** One short message at the bottom of the screen (e.g. "Link copied"). */
export const useToastStore = create<ToastState>((set) => ({
  message: null,
  id: 0,
  show: (message) => set((state) => ({ message, id: state.id + 1 })),
  hide: () => set({ message: null }),
}));

export function showToast(message: string): void {
  useToastStore.getState().show(message);
}
