import { formatToReais, parseFromReais } from "@/lib/utils";
import { create } from "zustand";

interface MaterialItem {
  id: string;
  preco: number;
  quantity: number;
}

interface PriceState {
  totalPrice: number;
  items: MaterialItem[];
  updateItem: (
    id: string,
    preco: number,
    quantity: number,
    previousItemId: string | null
  ) => void;
  removeItem: (id: string) => void;
  getFormattedTotal: () => string;
  resetStore: () => void;
  logState: () => void;
}

export const usePriceStore = create<PriceState>((set, get) => {
  const calculateTotalPrice = (items: MaterialItem[]): number => {
    return items.reduce((total, item) => item.preco * item.quantity + total, 0);
  };

  return {
    totalPrice: 0,
    items: [],

    updateItem: (
      id: string,
      preco: number,
      quantity: number,
      previousItemId: string | null
    ) => {
      set((state) => {
        const newItems = [...state.items];

        const existingItemIndex = newItems.findIndex(
          (item) => item.id === previousItemId
        );

        if (existingItemIndex >= 0) {
          newItems[existingItemIndex] = { id, preco, quantity };
        } else {
          newItems.push({ id, preco, quantity });
        }

        const newTotalPrice = calculateTotalPrice(newItems);
        console.log(`[Store] New total price: ${newTotalPrice}`);
        console.log(newItems);

        return {
          items: newItems,
          totalPrice: newTotalPrice,
        };
      });
    },

    removeItem: (id: string) => {
      set((state) => {
        console.log(`[Store] Removing item ${id}`);

        const itemExists = state.items.some((item) => item.id === id);

        if (!itemExists) {
          console.log(`[Store] Item ${id} not found, no changes made`);
          return state;
        }

        const newItems = state.items.filter((item) => item.id !== id);
        console.log(
          `[Store] Removed item ${id}, new items count: ${newItems.length}`
        );

        const newTotalPrice = calculateTotalPrice(newItems);
        console.log(`[Store] New total price after removal: ${newTotalPrice}`);

        return {
          items: newItems,
          totalPrice: newTotalPrice,
        };
      });
    },

    getFormattedTotal: () => {
      const { totalPrice } = get();
      return formatToReais(totalPrice);
    },

    resetStore: () => {
      console.log(`[Store] Resetting store`);
      set({
        totalPrice: 0,
        items: [],
      });
    },

    logState: () => {
      const state = get();
      console.log("Current store state:", {
        items: state.items,
        totalPrice: state.totalPrice,
        formattedTotal: state.getFormattedTotal(),
      });
    },
  };
});
