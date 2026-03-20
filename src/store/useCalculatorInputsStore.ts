import { create } from 'zustand';

import type { EnhanceableStatKey } from '@/types/character';
import type {
  CalculatorInputsState,
  GoldEnhancementTargets,
} from '@/types/calculator-inputs';

const DEFAULT_GOLD_ENHANCEMENT_TARGETS: GoldEnhancementTargets = {
  ATK: 0,
  CRIT_DMG: 0,
  CRIT_PCT: 0,
  DEATH_STRIKE: 0,
  DEATH_STRIKE_PCT: 0,
  HP: 0,
  HP_RECOVERY: 0,
};

const DEFAULT_CALCULATOR_INPUTS: CalculatorInputsState = {
  sanctuaryLevel: 0,
  classLevel: 1,
  goldEnhancementTargets: { ...DEFAULT_GOLD_ENHANCEMENT_TARGETS },
  enhanceMultiplier: 1,
};

export interface CalculatorInputsActions {
  setSanctuaryLevel: (level: number) => void;
  setClassLevel: (level: number) => void;
  setGoldEnhancementTarget: (stat: EnhanceableStatKey, level: number) => void;
  setGoldEnhancementTargets: (targets: GoldEnhancementTargets) => void;
  setEnhanceMultiplier: (multiplier: number) => void;
  reset: () => void;
}

export type CalculatorInputsStore = CalculatorInputsState & CalculatorInputsActions;

export const useCalculatorInputsStore = create<CalculatorInputsStore>()((set) => ({
  ...DEFAULT_CALCULATOR_INPUTS,

  setSanctuaryLevel: (sanctuaryLevel) => set({ sanctuaryLevel }),
  setClassLevel: (classLevel) => set({ classLevel }),

  setGoldEnhancementTarget: (stat, level) =>
    set((state) => ({
      goldEnhancementTargets: { ...state.goldEnhancementTargets, [stat]: level },
    })),

  setGoldEnhancementTargets: (goldEnhancementTargets) => set({ goldEnhancementTargets }),

  setEnhanceMultiplier: (enhanceMultiplier) => set({ enhanceMultiplier }),

  reset: () => set({ ...DEFAULT_CALCULATOR_INPUTS }),
}));
