import { create } from 'zustand';

export type FarmingBonusMode = 'auto' | 'manual';

export interface StagesState {
  extraExpMode: FarmingBonusMode;
  manualExtraExpBonus: number;
  monsterGoldMode: FarmingBonusMode;
  manualMonsterGoldBonus: number;
  extraAtkMode: FarmingBonusMode;
  manualExtraAtkBonus: number;
  hpRecoveryMode: FarmingBonusMode;
  manualHpRecoveryBonus: number;
  currentSoulWeaponId: string;
  targetSoulWeaponId: string;
  soulDungeonRunsPerDay: number;
}

export interface StagesActions {
  setExtraExpMode: (mode: FarmingBonusMode) => void;
  setManualExtraExpBonus: (value: number) => void;
  setMonsterGoldMode: (mode: FarmingBonusMode) => void;
  setManualMonsterGoldBonus: (value: number) => void;
  setExtraAtkMode: (mode: FarmingBonusMode) => void;
  setManualExtraAtkBonus: (value: number) => void;
  setHpRecoveryMode: (mode: FarmingBonusMode) => void;
  setManualHpRecoveryBonus: (value: number) => void;
  setCurrentSoulWeaponId: (id: string) => void;
  setTargetSoulWeaponId: (id: string) => void;
  setSoulDungeonRunsPerDay: (value: number) => void;
}

export type StagesStore = StagesState & StagesActions;

const DEFAULT_STAGES_STATE: StagesState = {
  extraExpMode: 'auto',
  manualExtraExpBonus: 0,
  monsterGoldMode: 'auto',
  manualMonsterGoldBonus: 0,
  extraAtkMode: 'auto',
  manualExtraAtkBonus: 0,
  hpRecoveryMode: 'auto',
  manualHpRecoveryBonus: 0,
  currentSoulWeaponId: '',
  targetSoulWeaponId: '',
  soulDungeonRunsPerDay: 10,
};

export const useStagesStore = create<StagesStore>()((set) => ({
  ...DEFAULT_STAGES_STATE,

  setExtraExpMode: (extraExpMode) => set({ extraExpMode }),
  setManualExtraExpBonus: (manualExtraExpBonus) => set({ manualExtraExpBonus }),
  setMonsterGoldMode: (monsterGoldMode) => set({ monsterGoldMode }),
  setManualMonsterGoldBonus: (manualMonsterGoldBonus) => set({ manualMonsterGoldBonus }),
  setExtraAtkMode: (extraAtkMode) => set({ extraAtkMode }),
  setManualExtraAtkBonus: (manualExtraAtkBonus) => set({ manualExtraAtkBonus }),
  setHpRecoveryMode: (hpRecoveryMode) => set({ hpRecoveryMode }),
  setManualHpRecoveryBonus: (manualHpRecoveryBonus) => set({ manualHpRecoveryBonus }),
  setCurrentSoulWeaponId: (currentSoulWeaponId) => set({ currentSoulWeaponId }),
  setTargetSoulWeaponId: (targetSoulWeaponId) => set({ targetSoulWeaponId }),
  setSoulDungeonRunsPerDay: (soulDungeonRunsPerDay) => set({ soulDungeonRunsPerDay }),
}));
