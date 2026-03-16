import { create } from 'zustand';

import type {
  ElementalMultipliers,
  Proficiency,
  SkillSlot,
  SkillsState,
} from '@/types/skills';

// ---------------------------------------------------------------------------
// Default state
// ---------------------------------------------------------------------------

const DEFAULT_SKILLS_STATE: SkillsState = {
  slots: [],
  elementalMultipliers: {
    Fire: 1,
    Water: 1,
    Wind: 1,
    Earth: 1,
    Lightning: 1,
  },
  proficiency: {
    level: 0,
    bonus: 0,
  },
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export interface SkillsActions {
  /** Replace all equipped skill slots */
  setSlots: (slots: SkillSlot[]) => void;
  /** Update a single skill slot by index */
  setSlot: (index: number, slot: SkillSlot) => void;
  /** Update all elemental damage multipliers */
  setElementalMultipliers: (multipliers: ElementalMultipliers) => void;
  /** Update the player's proficiency level and bonus */
  setProficiency: (proficiency: Proficiency) => void;
  /** Replace the entire skills state (e.g. on JSON import) */
  setSkills: (skills: SkillsState) => void;
  /** Reset skills state back to defaults */
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export type SkillsStore = SkillsState & SkillsActions;

export const useSkillsStore = create<SkillsStore>()((set) => ({
  ...DEFAULT_SKILLS_STATE,

  setSlots: (slots) => set({ slots }),

  setSlot: (index, slot) =>
    set((state) => {
      const slots = [...state.slots];
      slots[index] = slot;
      return { slots };
    }),

  setElementalMultipliers: (elementalMultipliers) => set({ elementalMultipliers }),

  setProficiency: (proficiency) => set({ proficiency }),

  setSkills: (skills) => set({ ...skills }),

  reset: () => set({ ...DEFAULT_SKILLS_STATE }),
}));
