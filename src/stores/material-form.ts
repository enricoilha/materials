import { create } from "zustand";

interface MaterialItem {
  id: string;
  preco: number;
  quantity: number;
}

interface PriceState {
  totalPrice: number;
  items: Record<string, MaterialItem>;
  updateItem: (id: string, preco: number, quantity: number) => void;
  removeItem: (id: string) => void;
  getFormattedTotal: () => string;
  resetStore: () => void;
}

export const usePriceStore = create<PriceState>((set, get) => ({
  totalPrice: 0,
  items: {},

  updateItem: (id: string, preco: number, quantity: number) => {
    set((state) => {
      const newItems = { ...state.items };
      let newTotalPrice = state.totalPrice;

      if (newItems[id]) {
        newTotalPrice -= (newItems[id].preco / 100) * newItems[id].quantity;
      }

      newTotalPrice += (preco / 100) * quantity;

      newItems[id] = { id, preco, quantity };

      return {
        items: newItems,
        totalPrice: newTotalPrice,
      };
    });
  },

  removeItem: (id: string) => {
    set((state) => {
      const newItems = { ...state.items };

      if (!newItems[id]) return state;

      const newTotalPrice =
        state.totalPrice - (newItems[id].preco / 100) * newItems[id].quantity;

      delete newItems[id];

      return {
        items: newItems,
        totalPrice: newTotalPrice,
      };
    });
  },

  getFormattedTotal: () => {
    const { totalPrice } = get();

    return (totalPrice / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  },

  resetStore: () => {
    set({
      totalPrice: 0,
      items: {},
    });
  },
}));
