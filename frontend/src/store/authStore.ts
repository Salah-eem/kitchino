import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthResponse } from '@/types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      setToken: (accessToken: string) => set({ token: accessToken }),
      setIsLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, token: null }),
      isAuthenticated: function () {
        const state = this as unknown as AuthStore;
        return !!state.token && !!state.user;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
