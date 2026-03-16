import type { UserSaveState } from '@/types/save-state';

import { DEFAULT_BLACK_ORB } from './blackOrbSlice';

export const DEFAULT_STATE: UserSaveState = {
  version: 1,

  appearance: {
    items: [],
    bonusTotals: {},
  },

  character: {
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
        { STR: 0, HP: 0, CRI: 0, LUK: 0, VIT: 0 },
        { STR: 0, HP: 0, CRI: 0, LUK: 0, VIT: 0 },
        { STR: 0, HP: 0, CRI: 0, LUK: 0, VIT: 0 },
        { STR: 0, HP: 0, CRI: 0, LUK: 0, VIT: 0 },
        { STR: 0, HP: 0, CRI: 0, LUK: 0, VIT: 0 },
      ],
    },
    promotion: {
      tier: 0,
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
    },
  },

  equipment: {
    weapons: [],
    soulWeapon: {
      name: '',
      engravingProgress: 0,
      effects: [],
    },
    accessories: [],
    awakenedOrrLevel: 0,
  },

  companions: [
    {
      name: 'Ellie',
      skin: '',
      element: 'Wind',
      level: 1,
      advancementSteps: [],
      specialBuffs: { companion: 'Ellie', windsSong: 0 },
    },
    {
      name: 'Zeke',
      skin: '',
      element: 'Fire',
      level: 1,
      advancementSteps: [],
      specialBuffs: { companion: 'Zeke', bladeDance: 0, wisdom: 0, soulCatch: 0 },
    },
    {
      name: 'Miho',
      skin: '',
      element: 'Earth',
      level: 1,
      advancementSteps: [],
      specialBuffs: { companion: 'Miho', redGreed: 0 },
    },
    {
      name: 'Luna',
      skin: '',
      element: 'Water',
      level: 1,
      advancementSteps: [],
      specialBuffs: { companion: 'Luna', deepSeaSong: 0 },
    },
  ],

  skills: {
    skillLevels: {},
    masteryPages: [[], [], [], [], [], [], [], []],
    proficiency: 0,
  },

  memoryTree: {
    nodeLevels: {},
  },

  constellation: {
    unlockedStars: {},
    farmingMode: '',
  },

  blackOrb: DEFAULT_BLACK_ORB,

  stageSelection: {
    selectedStageId: 1,
  },
};
