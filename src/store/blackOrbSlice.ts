import type { StateCreator } from 'zustand';

import blackOrbData from '@/data/black-orb-maths-data.json';
import type { BlackOrbState } from '@/types/black-orb';

export interface BlackOrbActions {
  /** Replace the entire black orb state */
  setBlackOrb: (blackOrb: BlackOrbState) => void;
  /** Toggle the active flag on a damage source by name */
  toggleDamageSource: (name: string) => void;
  /** Set the owned flag on an element accessory by name */
  setAccessoryOwned: (name: string, owned: boolean) => void;
  /** Update the level and bonus value of an element accessory by name */
  setAccessoryLevel: (name: string, level: number, bonusValue: number) => void;
}

export type BlackOrbSlice = { blackOrb: BlackOrbState } & BlackOrbActions;

export const DEFAULT_BLACK_ORB: BlackOrbState = {
  damageSources: blackOrbData.ELEMENTAL_DAMAGE_SOURCES as BlackOrbState['damageSources'],
  elementAccessories: blackOrbData.ELEMENT_ACCESSORIES as BlackOrbState['elementAccessories'],
  ampCalculation: {
    elementalBonuses: {},
    totalAmp: 0,
  },
};

export const createBlackOrbSlice: StateCreator<BlackOrbSlice, [], [], BlackOrbSlice> = (set) => ({
  blackOrb: DEFAULT_BLACK_ORB,

  setBlackOrb: (blackOrb) => set({ blackOrb }),

  toggleDamageSource: (name) =>
    set((state) => ({
      blackOrb: {
        ...state.blackOrb,
        damageSources: state.blackOrb.damageSources.map((src) =>
          src.name === name ? { ...src, active: !src.active } : src,
        ),
      },
    })),

  setAccessoryOwned: (name, owned) =>
    set((state) => ({
      blackOrb: {
        ...state.blackOrb,
        elementAccessories: state.blackOrb.elementAccessories.map((acc) =>
          acc.name === name ? { ...acc, owned } : acc,
        ),
      },
    })),

  setAccessoryLevel: (name, level, bonusValue) =>
    set((state) => ({
      blackOrb: {
        ...state.blackOrb,
        elementAccessories: state.blackOrb.elementAccessories.map((acc) =>
          acc.name === name ? { ...acc, level, bonusValue } : acc,
        ),
      },
    })),
});
