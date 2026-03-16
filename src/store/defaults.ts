import type { UserSaveState } from '@/types/save-state';
import { DEFAULT_CONSTELLATION_STATE } from './constellation-slice';

import { DEFAULT_BLACK_ORB } from './blackOrbSlice';
import { DEFAULT_CHARACTER } from './characterSlice';


import { DEFAULT_COMPANIONS } from './companionsSlice';

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

  companions: DEFAULT_COMPANIONS,

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
