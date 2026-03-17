import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { CharacterState } from '@/types/character';
import type { CompanionsState } from '@/types/companions';
import type {
  ConstellationState,
  SkillsState,
  StageSelectionState,
  UserSaveState,
} from '@/types/save-state';
import type { MemoryTreeState } from '@/types/tom';

import { createBlackOrbSlice, type BlackOrbSlice } from './blackOrbSlice';
import { type AppearanceSlice, createAppearanceSlice } from './appearanceSlice';
import { DEFAULT_STATE } from './defaults';
import { createEquipmentSlice, type EquipmentSliceActions } from './equipmentSlice';

export interface UserSaveActions extends EquipmentSliceActions {
  setCharacter: (character: CharacterState) => void;
  setCompanions: (companions: CompanionsState) => void;
  setSkills: (skills: SkillsState) => void;
  setMemoryTree: (memoryTree: MemoryTreeState) => void;
  setConstellation: (constellation: ConstellationState) => void;
  setStageSelection: (stageSelection: StageSelectionState) => void;
  /** Replace the entire save state (e.g. on JSON import) */
  loadState: (state: UserSaveState) => void;
  /** Reset all state back to defaults */
  reset: () => void;
}

export type UserSaveStore = Omit<UserSaveState, 'appearance'> & AppearanceSlice & BlackOrbSlice & UserSaveActions;

export const useUserSaveStore = create<UserSaveStore>()(
  persist(
    (set, get, api) => ({
      ...DEFAULT_STATE,
      // Appearance slice — provides appearance state, setAppearance,
      // setAppearanceItems, and toggleItemOwned.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...createAppearanceSlice(set as any, get as any, api as any),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...createBlackOrbSlice(set as any, get as any, api as any),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...createEquipmentSlice(set as any, get as any, api as any),

      setCharacter: (character) => set({ character }),
      setCompanions: (companions) => set({ companions }),
      setSkills: (skills) => set({ skills }),
      setMemoryTree: (memoryTree) => set({ memoryTree }),
      setConstellation: (constellation) => set({ constellation }),
      setStageSelection: (stageSelection) => set({ stageSelection }),

      loadState: (state) => set({ ...state }),
      reset: () => set({ ...DEFAULT_STATE }),
    }),
    {
      name: 'slayer-legends-save',
    },
  ),
);
