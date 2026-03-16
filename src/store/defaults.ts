import type { UserSaveState } from '@/types/save-state';
import { DEFAULT_CONSTELLATION_STATE } from './constellation-slice';

import { DEFAULT_BLACK_ORB } from './blackOrbSlice';
import { DEFAULT_CHARACTER } from './characterSlice';


export const DEFAULT_STATE: UserSaveState = {
  version: 1,

  appearance: {
    items: [],
    bonusTotals: {},
  },

  character: DEFAULT_CHARACTER,

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

  constellation: DEFAULT_CONSTELLATION_STATE,

  blackOrb: DEFAULT_BLACK_ORB,

  stageSelection: {
    selectedStageId: 1,
  },
};
