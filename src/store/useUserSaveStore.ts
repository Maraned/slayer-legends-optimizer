import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { AppearanceState } from '@/types/appearance';
import type { CharacterState } from '@/types/character';
import type { CompanionsState } from '@/types/companions';
import type { EquipmentState } from '@/types/equipment';
import type {
  ConstellationState,
  SkillsState,
  StageSelectionState,
  UserSaveState,
} from '@/types/save-state';
import type { MemoryTreeState } from '@/types/tom';

import { createBlackOrbSlice, type BlackOrbSlice } from './blackOrbSlice';
import { DEFAULT_STATE } from './defaults';

export interface UserSaveActions {
  setAppearance: (appearance: AppearanceState) => void;
  setCharacter: (character: CharacterState) => void;
  setEquipment: (equipment: EquipmentState) => void;
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

export type UserSaveStore = UserSaveState & UserSaveActions & BlackOrbSlice;

export const useUserSaveStore = create<UserSaveStore>()(
  persist(
    (...a) => {
      const [set] = a;
      return {
        ...DEFAULT_STATE,
        ...createBlackOrbSlice(...a),

        setAppearance: (appearance) => set({ appearance }),
        setCharacter: (character) => set({ character }),
        setEquipment: (equipment) => set({ equipment }),
        setCompanions: (companions) => set({ companions }),
        setSkills: (skills) => set({ skills }),
        setMemoryTree: (memoryTree) => set({ memoryTree }),
        setConstellation: (constellation) => set({ constellation }),
        setStageSelection: (stageSelection) => set({ stageSelection }),

        loadState: (state) => set({ ...state }),
        reset: () => set({ ...DEFAULT_STATE }),
      };
    },
    {
      name: 'slayer-legends-save',
    },
  ),
);
