import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WishlistItem } from '@/types';
import { apiClient } from '@/lib/api';

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clear: () => void;
  fetchWishlist: () => Promise<void>;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: async (item) => {
        set((state) => ({
          items: [...state.items.filter((i) => i.productId !== item.productId), item],
        }));
        await apiClient.addToWishlist(item.productId);
      },
      removeItem: async (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
        await apiClient.removeFromWishlist(productId);
      },
      isInWishlist: (productId) => {
        const state = get();
        return state.items.some((i) => i.productId === productId);
      },
      clear: async () => {
        set({ items: [] });
      },
      fetchWishlist: async () => {
        try {
          const response = await apiClient.getWishlist();
          set({ items: response.data.items || response.data });
        } catch (error) {
          console.error('Failed to fetch wishlist:', error);
        }
      },
    }),
    {
      name: 'wishlist-storage',
    }
  )
);
