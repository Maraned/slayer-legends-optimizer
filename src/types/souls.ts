/**
 * TypeScript types for the Soul Dungeon system.
 * Matches the structure of src/data/souls-data.json (SOULSDATA).
 *
 * The Soul Dungeon is a separate dungeon mode where players fight increasingly
 * powerful bosses to earn Souls (currency) and unlock Soul Weapons at milestone
 * stages. Souls are used as a farming resource tracked in the optimizer
 * alongside EXP, Cubes, Stones, and Diamonds.
 */

import type { SoulElement } from './equipment';

/**
 * Progression tier of a Soul Dungeon stage.
 * Tiers gate access and scale rewards/difficulty.
 */
export type SoulDungeonTier =
  | 'Novice'
  | 'Apprentice'
  | 'Intermediate'
  | 'Advanced'
  | 'Expert'
  | 'Master'
  | 'Grandmaster';

/**
 * Reward range for a Soul Dungeon stage (inclusive min/max per run).
 */
export interface SoulRewardRange {
  /** Minimum quantity dropped per run */
  min: number;
  /** Maximum quantity dropped per run */
  max: number;
}

/**
 * The boss enemy encountered at a Soul Dungeon stage.
 */
export interface SoulDungeonBoss {
  /** Display name of the boss */
  name: string;
  /** Elemental affinity of the boss */
  element: SoulElement;
  /** Boss HP at this stage */
  hp: number;
  /** Boss ATK at this stage */
  atk: number;
  /** Boss DEF at this stage */
  def: number;
}

/**
 * A single stage entry in the Soul Dungeon.
 */
export interface SoulDungeonStage {
  /** Stage number (1–130) */
  stage: number;
  /** Display name for this stage */
  name: string;
  /** Difficulty tier this stage belongs to */
  tier: SoulDungeonTier;
  /** Dominant element for this stage's enemies */
  element: SoulElement;
  /** Minimum recommended Combat Power to attempt this stage */
  recommendedPower: number;
  /** Energy cost per attempt */
  energyCost: number;
  /** Souls currency earned per run */
  soulsReward: SoulRewardRange;
  /** Gold earned per run */
  goldReward: SoulRewardRange;
  /** EXP earned per run */
  expReward: number;
  /**
   * ID of the Soul Weapon unlocked at this milestone stage, or null if this
   * stage has no weapon reward.
   */
  soulWeaponId: string | null;
  /** The boss fought on this stage */
  boss: SoulDungeonBoss;
}

/**
 * Root shape of souls-data.json (SOULSDATA).
 */
export interface SoulsData {
  /** All 130 Soul Dungeon stages, sorted ascending by stage number */
  SOUL_DUNGEON: SoulDungeonStage[];
}
