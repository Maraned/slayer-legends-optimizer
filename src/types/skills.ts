import type { Element, CompanionName } from './companions';

/**
 * Skill rarity tier from lowest to highest.
 * Source: SKILLS sheet, TIER column.
 */
export type SkillTier =
  | 'Common'
  | 'Uncommon'
  | 'Rare'
  | 'Epic'
  | 'Unique'
  | 'Legend'
  | 'Mythic'
  | 'Ancient'
  | 'Celestial'
  | 'Immortal';

/**
 * Skill damage type — elemental or physical.
 * Source: SKILLS sheet, DAMAGE TYPE column.
 */
export type SkillDamageType = Element | 'Physical';

/**
 * Static skill definition from game data (301 skills total).
 * Source: SKILLS sheet / SKILLS_DATAMATH JSON.
 */
export interface SkillData {
  /** Unique skill identifier */
  id: string;
  /** Display name of the skill */
  name: string;
  /** Rarity/power tier */
  tier: SkillTier;
  /** Elemental or physical damage type */
  damageType: SkillDamageType;
  /** Human-readable description of the skill's effect */
  description: string;
}

/**
 * Player's current state for an equipped skill slot.
 * Source: SKILLS sheet player input section.
 */
export interface SkillSlot {
  /** ID of the SkillData entry assigned to this slot */
  skillId: string;
  /** Current level of the skill */
  level: number;
  /** Companion assigned to boost this slot, or null if unassigned */
  companionName: CompanionName | null;
  /** Whether the partner bonus is active for this slot */
  partnerBonusActive: boolean;
  /** Modified skill damage value after companion/partner bonuses are applied */
  modifiedValue: number;
}

/**
 * Per-element damage multipliers entered by the player.
 * Source: SKILLS sheet, elemental inputs section.
 */
export type ElementalMultipliers = Record<Element, number>;

/**
 * Player proficiency level and derived bonus.
 * Source: SKILLS sheet, proficiency section.
 */
export interface Proficiency {
  /** Player's current proficiency level */
  level: number;
  /** Bonus derived from the current proficiency level */
  bonus: number;
}

/**
 * Full SKILLS page state.
 * Source: SKILLS sheet.
 */
export interface SkillsState {
  /** All equipped skill slots */
  slots: SkillSlot[];
  /** Per-element damage multiplier inputs */
  elementalMultipliers: ElementalMultipliers;
  /** Player proficiency */
  proficiency: Proficiency;
}

// ---------------------------------------------------------------------------
// Skill Mastery
// ---------------------------------------------------------------------------

/**
 * The 8 pages of the Skill Mastery tree (0-indexed).
 * Source: SKILL MASTERY sheet, 8-page tab layout.
 */
export type SkillMasteryPageIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * Static definition of a single skill mastery node.
 * Source: SKILL MASTERY sheet node data.
 */
export interface SkillMasteryNodeData {
  /** Unique node identifier */
  id: string;
  /** Display name or label for the node */
  name: string;
  /** Which mastery page this node belongs to (0-indexed) */
  page: SkillMasteryPageIndex;
  /** Row position in the page grid (0-indexed) */
  row: number;
  /** Column position in the page grid (0-indexed) */
  col: number;
  /** Human-readable description of the node's effect */
  effectDescription: string;
  /** Numeric value of the effect bonus */
  effectValue: number;
}

/**
 * Player unlock state for a single skill mastery node.
 */
export interface SkillMasteryNodeState {
  /** Reference to the static node definition */
  nodeData: SkillMasteryNodeData;
  /** Whether the player has unlocked this node */
  unlocked: boolean;
}

/**
 * All mastery nodes on a single page.
 */
export interface SkillMasteryPage {
  /** 1-indexed page number for display */
  pageNumber: number;
  /** All nodes on this page with their unlock states */
  nodes: SkillMasteryNodeState[];
}

/**
 * Complete skill mastery state: exactly 8 pages.
 * Source: SKILL MASTERY sheet (8-page tab layout).
 */
export interface SkillMasteryState {
  pages: [
    SkillMasteryPage,
    SkillMasteryPage,
    SkillMasteryPage,
    SkillMasteryPage,
    SkillMasteryPage,
    SkillMasteryPage,
    SkillMasteryPage,
    SkillMasteryPage,
  ];
}
