import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types';
import { apiClient } from '@/lib/api';
import { useAuthStore } from './authStore';

interface CartStore {
  items: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  addItem: (item: CartItem, sync?: boolean) => Promise<void>;
  removeItem: (productId: string, sync?: boolean) => Promise<void>;
  updateItem: (productId: string, quantity: number, sync?: boolean) => Promise<void>;
  clear: (sync?: boolean) => Promise<void>;
  fetchCart: () => Promise<void>;
  calculateTotals: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      subtotal: 0,
      tax: 0,
      shipping: 0,
      
      fetchCart: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;
        
        try {
          const response = await apiClient.getCart();
          set({ items: response.data });
          get().calculateTotals();
          
        } catch (error) {
          console.error('Failed to fetch cart:', error);
        }
      },

      addItem: async (item, sync = true) => {
        const { user } = useAuthStore.getState();
        
        if (sync && user) {
          try {
            await apiClient.addToCart(item.productId, item.quantity);
          } catch (error) {
            console.error('Failed to sync addItem:', error);
          }
        }
        
        set((state) => {
          const existingItem = state.items.find((i) => i.productId === item.productId);
          let newItems;
          if (existingItem) {
            newItems = state.items.map((i) =>
              i.productId === item.productId
                ? {
                    ...i,
                    quantity: i.quantity + item.quantity,
                    subtotal: (i.quantity + item.quantity) * i.price,
                  }
                : i
            );
          } else {
            newItems = [...state.items, item];
          }
          return { items: newItems };
        });
        get().calculateTotals();
      },

      removeItem: async (productId, sync = true) => {
        const { user } = useAuthStore.getState();

        if (sync && user) {
          try {
            await apiClient.removeFromCart(productId);
          } catch (error) {
            console.error('Failed to sync removeItem:', error);
          }
        }

        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
        get().calculateTotals();
      },

      updateItem: async (productId, quantity, sync = true) => {
        const { user } = useAuthStore.getState();

        if (sync && user) {
          try {
            await apiClient.updateCartItem(productId, quantity);
          } catch (error) {
            console.error('Failed to sync updateItem:', error);
          }
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId
              ? {
                  ...i,
                  quantity,
                  subtotal: quantity * i.price,
                }
              : i
          ),
        }));
        get().calculateTotals();
      },

      clear: async (sync = true) => {
        const { user } = useAuthStore.getState();

        if (sync && user) {
          try {
            await apiClient.clearCart();
          } catch (error) {
            console.error('Failed to sync clearCart:', error);
          }
        }
        set({
          items: [],
          total: 0,
          subtotal: 0,
          tax: 0,
          shipping: 0,
        });
      },

      calculateTotals: () =>
        set((state) => {
          const subtotal = state.items.reduce((sum, item) => {
            // Use item.subtotal if present, otherwise calculate it
            const itemSubtotal = item.subtotal || (item.product?.price || 0) * item.quantity;
            return sum + itemSubtotal;
          }, 0);
          const tax = subtotal * 0.1; // 10% tax
          const shipping = subtotal > 0 ? 10 : 0;
          const total = subtotal + tax + shipping;
          return { subtotal, tax, shipping, total };
        }),
    }),
    {
      name: 'cart-storage',
    }
  )
);
