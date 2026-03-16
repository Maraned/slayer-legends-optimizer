import type { StateCreator } from 'zustand';

import type { Companion, CompanionsState } from '@/types/companions';

import companionsData from '@/data/companions-data.json';

/**
 * Default companions state seeded from the static game data.
 * All four companions start at level 1 with their full advancement step
 * definitions and default special buff values from the COMPANIONS sheet.
 */
export const DEFAULT_COMPANIONS = companionsData.COMPANIONS as unknown as CompanionsState;

// ---------------------------------------------------------------------------
// Slice type
// ---------------------------------------------------------------------------

export interface CompanionsSlice {
  /** State for all four companions (Ellie, Zeke, Miho, Luna) */
  companions: CompanionsState;

  /** Replace the entire companions state (e.g. on JSON import) */
  setCompanions: (companions: CompanionsState) => void;

  /**
   * Update a single companion by its tuple index (0 = Ellie, 1 = Zeke,
   * 2 = Miho, 3 = Luna).
   */
  setCompanion: (index: number, companion: Companion) => void;
}

// ---------------------------------------------------------------------------
// Slice creator
// ---------------------------------------------------------------------------

export const createCompanionsSlice: StateCreator<
  CompanionsSlice,
  [],
  [],
  CompanionsSlice
> = (set) => ({
  companions: DEFAULT_COMPANIONS,

  setCompanions: (companions) => set({ companions }),

  setCompanion: (index, companion) =>
    set((state) => {
      const next = [...state.companions] as CompanionsState;
      next[index] = companion;
      return { companions: next };
    }),
});
