import type { StateCreator } from 'zustand';

import blackOrbData from '@/data/black-orb-maths-data.json';
import type { BlackOrbAmpMode, BlackOrbState } from '@/types/black-orb';
import type { Element } from '@/types/companions';

export interface BlackOrbActions {
  /** Replace the entire black orb state */
  setBlackOrb: (blackOrb: BlackOrbState) => void;
  /** Toggle the active flag on a damage source by name */
  toggleDamageSource: (name: string) => void;
  /** Set the owned flag on an element accessory by name */
  setAccessoryOwned: (name: string, owned: boolean) => void;
  /** Update the level and bonus value of an element accessory by name */
  setAccessoryLevel: (name: string, level: number, bonusValue: number) => void;
  /** Update the AMP calculation mode (auto or manual) */
  setAmpMode: (mode: BlackOrbAmpMode) => void;
  /** Update a single element's manual AMP override value */
  setManualAmpValue: (element: Element, value: number) => void;
}

export type BlackOrbSlice = { blackOrb: BlackOrbState } & BlackOrbActions;

export const DEFAULT_BLACK_ORB: BlackOrbState = {
  damageSources: blackOrbData.ELEMENTAL_DAMAGE_SOURCES as BlackOrbState['damageSources'],
  elementAccessories: blackOrbData.ELEMENT_ACCESSORIES as BlackOrbState['elementAccessories'],
  ampCalculation: {
    elementalBonuses: {},
    totalAmp: 0,
  },
  ampMode: 'auto',
  manualAmp: {},
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

  setAmpMode: (ampMode) =>
    set((state) => ({
      blackOrb: { ...state.blackOrb, ampMode },
    })),

  setManualAmpValue: (element, value) =>
    set((state) => ({
      blackOrb: {
        ...state.blackOrb,
        manualAmp: { ...state.blackOrb.manualAmp, [element]: value },
      },
    })),
});
