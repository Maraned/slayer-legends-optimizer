import type { StateCreator } from 'zustand';

import type {
  CharacterState,
  EnhanceableStats,
  GrowingKnowledge,
  GrowthStats,
  LatentPower,
  Promotion,
  SlayerLevel,
} from '@/types/character';

export interface CharacterSlice {
  character: CharacterState;
  /** Replace the entire character state */
  setCharacter: (character: CharacterState) => void;
  /** Update only the enhanceable stats (ENHANCE section) */
  setEnhanceableStats: (enhanceableStats: EnhanceableStats) => void;
  /** Update only the growth stats (GROWTH section) */
  setGrowthStats: (growthStats: GrowthStats) => void;
  /** Update only the latent power pages (LATENT POWER section) */
  setLatentPower: (latentPower: LatentPower) => void;
  /** Update only the promotion state (PROMOTIONS section) */
  setPromotion: (promotion: Promotion) => void;
  /** Update only the slayer level (Slayer Level section) */
  setSlayerLevel: (slayerLevel: SlayerLevel) => void;
  /** Update only the growing knowledge (Growing Knowledge section) */
  setGrowingKnowledge: (growingKnowledge: GrowingKnowledge) => void;
}

export const DEFAULT_CHARACTER: CharacterState = {
  enhanceableStats: {
    ATK: { currentLevel: 0, maxLevel: 0 },
    CRIT_DMG: { currentLevel: 0, maxLevel: 0 },
    CRIT_PCT: { currentLevel: 0, maxLevel: 0 },
    DEATH_STRIKE: { currentLevel: 0, maxLevel: 0 },
    DEATH_STRIKE_PCT: { currentLevel: 0, maxLevel: 0 },
    HP: { currentLevel: 0, maxLevel: 0 },
    HP_RECOVERY: { currentLevel: 0, maxLevel: 0 },
  },
  growthStats: {
    STR: { level: 0, bonus: 0 },
    HP: { level: 0, bonus: 0 },
    VIT: { level: 0, bonus: 0 },
  },
  latentPower: {
    pages: [
      { STR: { level: 0 }, HP: { level: 0 }, CRI: { level: 0 }, LUK: { level: 0 }, VIT: { level: 0 } },
      { STR: { level: 0 }, HP: { level: 0 }, CRI: { level: 0 }, LUK: { level: 0 }, VIT: { level: 0 } },
      { STR: { level: 0 }, HP: { level: 0 }, CRI: { level: 0 }, LUK: { level: 0 }, VIT: { level: 0 } },
      { STR: { level: 0 }, HP: { level: 0 }, CRI: { level: 0 }, LUK: { level: 0 }, VIT: { level: 0 } },
      { STR: { level: 0 }, HP: { level: 0 }, CRI: { level: 0 }, LUK: { level: 0 }, VIT: { level: 0 } },
    ],
  },
  promotion: {
    tier: 0,
    atkBonus: 0,
    hpBonus: 0,
    atkBonusPct: 0,
    monsterGoldBonusPct: 0,
    abilities: [],
  },
  slayerLevel: {
    level: 1,
    expRequiredForNext: 0,
  },
  growingKnowledge: {
    grade: 1,
    atkEffectPct: 0,
    superhumanObtained: false,
  },
};

export const createCharacterSlice: StateCreator<CharacterSlice> = (set) => ({
  character: DEFAULT_CHARACTER,

  setCharacter: (character) => set({ character }),

  setEnhanceableStats: (enhanceableStats) =>
    set((state) => ({ character: { ...state.character, enhanceableStats } })),

  setGrowthStats: (growthStats) =>
    set((state) => ({ character: { ...state.character, growthStats } })),

  setLatentPower: (latentPower) =>
    set((state) => ({ character: { ...state.character, latentPower } })),

  setPromotion: (promotion) =>
    set((state) => ({ character: { ...state.character, promotion } })),

  setSlayerLevel: (slayerLevel) =>
    set((state) => ({ character: { ...state.character, slayerLevel } })),

  setGrowingKnowledge: (growingKnowledge) =>
    set((state) => ({ character: { ...state.character, growingKnowledge } })),
});
