import type { AppearanceState } from './appearance';
import type { BlackOrbState } from './black-orb';
import type { CharacterState } from './character';
import type { CompanionsState } from './companions';
import type { ConstellationSheetState } from './constellation';
import type { EquipmentState } from './equipment';
import type { Stage } from './stage';
import type { MemoryTreeState } from './tom';

export type { BlackOrbState, MemoryTreeState };
export type { ConstellationSheetState };

// ---------------------------------------------------------------------------
// Forward-reference placeholders for types defined in parallel tasks.
// Each will be replaced by the proper import once the corresponding PR merges.
// ---------------------------------------------------------------------------

/**
 * Player's skill ownership and mastery state.
 * Placeholder for MAR-20 (1.2.5 Define types for skills and skill mastery).
 * Shape: per-skill levels for 301 skills, mastery node selections across 8 pages,
 * and overall proficiency level.
 */
export interface SkillsState {
  /** Skill level keyed by skill ID (0 = not owned) */
  skillLevels: Record<string, number>;
  /**
   * Active mastery node IDs for each of the 8 mastery pages.
   * Index 0 = Page 1 … index 7 = Page 8.
   */
  masteryPages: [
    string[],
    string[],
    string[],
    string[],
    string[],
    string[],
    string[],
    string[],
  ];
  /** Overall proficiency level */
  proficiency: number;
}

/**
 * Player's constellation progression across all 12 zodiac constellations.
 * Placeholder for MAR-22 (1.2.7 Define types for constellation nodes).
 * Shape: unlocked star nodes per constellation and selected farming mode.
 */
export interface ConstellationState {
  /**
   * Number of unlocked star nodes per constellation, keyed by constellation ID.
   * Each constellation contains multiple star node tiers.
   */
  unlockedStars: Record<string, number>;
  /** Selected farming mode for constellation calculations */
  farmingMode: string;
}


/**
 * Player's selected stage and related farming preferences.
 * Uses the Stage type defined in MAR-24 (1.2.9 Define types for stage data).
 */
export interface StageSelectionState {
  /** Numeric ID of the currently selected farming stage */
  selectedStageId: Stage['id'];
}

// ---------------------------------------------------------------------------
// UserSaveState
// ---------------------------------------------------------------------------

/**
 * Complete user save state: all user-input data that must be persisted
 * across sessions and exported/imported via JSON.
 *
 * Combines:
 *  - AppearanceState    (1.2.1) — owned clothing items
 *  - CharacterState     (1.2.2) — enhancements, growth, latent power, etc.
 *  - EquipmentState     (1.2.3) — weapons, soul weapon, accessories
 *  - CompanionsState    (1.2.4) — all four companions
 *  - SkillsState        (1.2.5) — skill levels and mastery pages
 *  - MemoryTreeState    (1.2.6) — TOM node levels
 *  - ConstellationState (1.2.7) — zodiac star nodes and farming mode
 *  - BlackOrbState      (1.2.8) — elemental sources, accessories, AMP
 *  - StageSelectionState(1.2.9) — selected farming stage
 */
export interface UserSaveState {
  /**
   * Schema version for forward-compatible migration.
   * Increment whenever the shape of UserSaveState changes in a breaking way.
   */
  version: number;

  /** Owned clothing items and computed bonus totals (APPEARANCE sheet) */
  appearance: AppearanceState;

  /** Character enhancements, growth stats, latent power, promotions (CHARACTER sheet) */
  character: CharacterState;

  /** Owned weapons, soul weapon, accessories (EQUIPMENT sheet) */
  equipment: EquipmentState;

  /** All four companion states (COMPANIONS sheet) */
  companions: CompanionsState;

  /** Skill ownership, mastery page selections, proficiency (SKILLS sheet) */
  skills: SkillsState;

  /** Tree of Memory node levels (TOM sheet) */
  memoryTree: MemoryTreeState;

  /** Constellation star node progress and farming mode (CONSTELLATIONS sheet) */
  constellation: ConstellationSheetState;

  /** Black Orb elemental sources and AMP configuration (BLACK ORB sheet) */
  blackOrb: BlackOrbState;

  /** Currently selected farming stage (STAGES sheet) */
  stageSelection: StageSelectionState;
}
