import type { StateCreator } from 'zustand';

import type { Accessory, EquipmentState, SoulWeapon, Weapon } from '@/types/equipment';

export interface EquipmentSliceActions {
  /** Replace the entire equipment section */
  setEquipment: (equipment: EquipmentState) => void;

  /** Mark a weapon as owned or unowned by name */
  setWeaponOwned: (name: string, owned: boolean) => void;
  /** Update the enhance level of a weapon by name */
  setWeaponEnhanceLevel: (name: string, enhanceLevel: number) => void;
  /** Apply a partial update to a weapon by name */
  updateWeapon: (name: string, updates: Partial<Weapon>) => void;

  /** Mark an accessory as owned or unowned by name */
  setAccessoryOwned: (name: string, owned: boolean) => void;
  /** Update the upgrade level of an accessory by name */
  setAccessoryLevel: (name: string, level: number) => void;
  /** Apply a partial update to an accessory by name */
  updateAccessory: (name: string, updates: Partial<Accessory>) => void;

  /** Replace the soul weapon */
  setSoulWeapon: (soulWeapon: SoulWeapon) => void;
  /** Update the Awakened Orr enhancement level */
  setAwakenedOrrLevel: (level: number) => void;
}

export type EquipmentSlice = { equipment: EquipmentState } & EquipmentSliceActions;

export const createEquipmentSlice: StateCreator<
  EquipmentSlice,
  [],
  [],
  EquipmentSliceActions
> = (set) => ({
  setEquipment: (equipment) => set({ equipment }),

  setWeaponOwned: (name, owned) =>
    set((state) => ({
      equipment: {
        ...state.equipment,
        weapons: state.equipment.weapons.map((w) => (w.name === name ? { ...w, owned } : w)),
      },
    })),

  setWeaponEnhanceLevel: (name, enhanceLevel) =>
    set((state) => ({
      equipment: {
        ...state.equipment,
        weapons: state.equipment.weapons.map((w) =>
          w.name === name ? { ...w, enhanceLevel } : w,
        ),
      },
    })),

  updateWeapon: (name, updates) =>
    set((state) => ({
      equipment: {
        ...state.equipment,
        weapons: state.equipment.weapons.map((w) =>
          w.name === name ? { ...w, ...updates } : w,
        ),
      },
    })),

  setAccessoryOwned: (name, owned) =>
    set((state) => ({
      equipment: {
        ...state.equipment,
        accessories: state.equipment.accessories.map((a) =>
          a.name === name ? { ...a, owned } : a,
        ),
      },
    })),

  setAccessoryLevel: (name, level) =>
    set((state) => ({
      equipment: {
        ...state.equipment,
        accessories: state.equipment.accessories.map((a) =>
          a.name === name ? { ...a, level } : a,
        ),
      },
    })),

  updateAccessory: (name, updates) =>
    set((state) => ({
      equipment: {
        ...state.equipment,
        accessories: state.equipment.accessories.map((a) =>
          a.name === name ? { ...a, ...updates } : a,
        ),
      },
    })),

  setSoulWeapon: (soulWeapon) =>
    set((state) => ({
      equipment: { ...state.equipment, soulWeapon },
    })),

  setAwakenedOrrLevel: (awakenedOrrLevel) =>
    set((state) => ({
      equipment: { ...state.equipment, awakenedOrrLevel },
    })),
});
