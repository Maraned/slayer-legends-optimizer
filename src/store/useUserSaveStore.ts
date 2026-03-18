import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  BlackOrbState,
  SkillsState,
  StageSelectionState,
  UserSaveState,
} from '@/types/save-state';
import type { MemoryTreeState } from '@/types/tom';
import { CURRENT_SAVE_VERSION, migrateSaveState } from '@/lib/save-migrations';

import { createBlackOrbSlice, type BlackOrbSlice } from './blackOrbSlice';
import { type AppearanceSlice, createAppearanceSlice } from './appearanceSlice';
import { createConstellationSlice, type ConstellationSlice } from './constellation-slice';
import { type CharacterSlice, createCharacterSlice } from './characterSlice';
import { type CompanionsSlice, createCompanionsSlice } from './companionsSlice';
import { DEFAULT_STATE } from './defaults';
import { createEquipmentSlice, type EquipmentSliceActions } from './equipmentSlice';

export interface UserSaveActions extends EquipmentSliceActions {
  setSkills: (skills: SkillsState) => void;
  setMemoryTree: (memoryTree: MemoryTreeState) => void;
  setBlackOrb: (blackOrb: BlackOrbState) => void;
  setStageSelection: (stageSelection: StageSelectionState) => void;
  /** Replace the entire save state (e.g. on JSON import) */
  loadState: (state: UserSaveState) => void;
  /** Reset all state back to defaults */
  reset: () => void;
}

export type UserSaveStore = Omit<UserSaveState, 'appearance' | 'character' | 'companions'> & AppearanceSlice & CharacterSlice & BlackOrbSlice & CompanionsSlice & UserSaveActions & ConstellationSlice;

export const useUserSaveStore = create<UserSaveStore>()(
  persist(
    (set, get, api) => ({
      ...DEFAULT_STATE,
      // Appearance slice — provides appearance state, setAppearance,
      // setAppearanceItems, and toggleItemOwned.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...createAppearanceSlice(set as any, get as any, api as any),
      // Character slice — provides character state and granular setters.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...createCharacterSlice(set as any, get as any, api as any),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...createBlackOrbSlice(set as any, get as any, api as any),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...createEquipmentSlice(set as any, get as any, api as any),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...createConstellationSlice(set as any, get as any, api as any),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...createCompanionsSlice(set as any, get as any, api as any),

      setSkills: (skills) => set({ skills }),
      setMemoryTree: (memoryTree) => set({ memoryTree }),
      setStageSelection: (stageSelection) => set({ stageSelection }),

      loadState: (state) => set({ ...state }),
      reset: () => set({ ...DEFAULT_STATE }),
    }),
    {
      name: 'slayer-legends-save',
      version: CURRENT_SAVE_VERSION,
      migrate: (persistedState, fromVersion) =>
        migrateSaveState(persistedState as Record<string, unknown>, fromVersion),
    },
  ),
);
