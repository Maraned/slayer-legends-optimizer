import type { StateCreator } from 'zustand';

import type { AppearanceBonusTotals, AppearanceState, ClothingItem } from '@/types/appearance';

/**
 * Recompute bonus totals from a list of clothing items.
 * Sums effectValue for all owned items, grouped by bonusType.
 */
export function computeBonusTotals(items: ClothingItem[]): AppearanceBonusTotals {
  const totals: AppearanceBonusTotals = {};
  for (const item of items) {
    if (item.owned) {
      totals[item.bonusType] = (totals[item.bonusType] ?? 0) + item.effectValue;
    }
  }
  return totals;
}

export interface AppearanceSlice {
  appearance: AppearanceState;
  /** Replace the entire appearance state (e.g. on full save import). */
  setAppearance: (appearance: AppearanceState) => void;
  /** Replace all clothing items and recompute bonus totals. */
  setAppearanceItems: (items: ClothingItem[]) => void;
  /** Toggle ownership of a single clothing item and recompute bonus totals. */
  toggleItemOwned: (id: string) => void;
}

export const createAppearanceSlice: StateCreator<
  AppearanceSlice,
  [],
  [],
  AppearanceSlice
> = (set) => ({
  appearance: {
    items: [],
    bonusTotals: {},
  },

  setAppearance: (appearance) => set({ appearance }),

  setAppearanceItems: (items) =>
    set({ appearance: { items, bonusTotals: computeBonusTotals(items) } }),

  toggleItemOwned: (id) =>
    set((state) => {
      const items = state.appearance.items.map((item) =>
        item.id === id ? { ...item, owned: !item.owned } : item,
      );
      return { appearance: { items, bonusTotals: computeBonusTotals(items) } };
    }),
});
