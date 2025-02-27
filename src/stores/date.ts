// store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";

interface DateRangeState {
  dateRange: DateRange;
  setDateRange: (dateRange: DateRange | undefined) => void;
  resetDateRange: () => void;
}

export const useDateRangeStore = create<DateRangeState>()(
  persist(
    (set) => ({
      dateRange: {
        from: addDays(new Date(), -15),
        to: new Date(),
      },

      setDateRange: (dateRange) => set({ dateRange }),

      resetDateRange: () =>
        set({
          dateRange: {
            from: addDays(new Date(), -7),
            to: new Date(),
          },
        }),
    }),
    {
      name: "date-range-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ dateRange: state.dateRange }),
    }
  )
);
