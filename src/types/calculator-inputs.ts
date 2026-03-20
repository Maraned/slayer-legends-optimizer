import type { EnhanceableStatKey } from './character';

/**
 * Target enhancement levels for the Gold Enhancement Calculator.
 *
 * Stores the user's desired target level per enhanceable stat.
 * Used by the manual target calculator to compute the gold cost
 * from the character's current enhancement level to the target.
 *
 * Source: CHARACTER sheet MANUAL target calculator (rows 8–15).
 */
export type GoldEnhancementTargets = Record<EnhanceableStatKey, number>;

/**
 * Transient inputs that drive the in-app calculators.
 *
 * These values are entered by the user in calculator UI panels and are
 * intentionally kept separate from UserSaveState — they are ephemeral
 * UI state that does not need to be exported or imported with save files.
 */
export interface CalculatorInputsState {
  /**
   * Current Demon Sanctuary level (0–20).
   * Feeds `calcSanctuaryAtkBonus` in the ATK source calculation.
   * Not stored in UserSaveState because it is a Familiars sheet input
   * that varies independently of the main character save data.
   */
  sanctuaryLevel: number;

  /**
   * Selected class identifier (matches CubeClass.id in cube-optimizer-data).
   * Determines the per-level ATK and CRIT DMG bonuses for this character.
   */
  classId: string;

  /**
   * Current class level.
   * Feeds `critDmgFromClassGrowth` in the CRIT DMG source calculation.
   * Class levels are separate from the slayer level stored in CharacterState.
   */
  classLevel: number;

  /**
   * Target enhancement levels per stat for the Gold Enhancement Calculator.
   * Each entry is the level the user wants to reach for that stat.
   * The calculator computes the gold cost from the current level
   * (stored in CharacterState.enhanceableStats) to this target.
   */
  goldEnhancementTargets: GoldEnhancementTargets;

  /**
   * Number of enhancement levels applied in a single button press.
   * Matches the CHARACTER sheet "Enhance Multiplier" (D5).
   * Default is 1 (one level at a time).
   */
  enhanceMultiplier: number;
}
