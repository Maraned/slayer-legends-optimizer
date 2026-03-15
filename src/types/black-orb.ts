import type { Element } from './companions';

/**
 * A source of elemental damage — a skill, passive, or item effect that deals
 * or amplifies damage of a specific element.
 * Source: BLACK ORB sheet, ELEMENTAL DAMAGE SOURCES section.
 */
export interface ElementalDamageSource {
  /** Display name of this damage source */
  name: string;
  /** The element this source contributes */
  element: Element;
  /** Damage amplification percentage provided by this source (e.g. 0.15 = +15%) */
  damagePercent: number;
  /** Whether this source is currently active / unlocked */
  active: boolean;
}

/**
 * An element-specific accessory from the BLACK ORB sheet.
 * These accessories provide bonuses tied to a particular element.
 * Source: BLACK ORB sheet, ELEMENT ACCESSORIES section.
 */
export interface ElementAccessory {
  /** Accessory name / identifier */
  name: string;
  /** Elemental affinity of this accessory */
  element: Element;
  /** Current upgrade level */
  level: number;
  /** Stat bonus granted at the current level (e.g. 0.10 = +10%) */
  bonusValue: number;
  /** Whether the player owns this accessory */
  owned: boolean;
}

/**
 * Per-element amplification bonuses, computed from owned element accessories
 * and active elemental damage sources.
 * Each value is the total additive AMP bonus for that element (e.g. 0.25 = +25%).
 * Source: BLACK ORB sheet, AMP CALCULATIONS section.
 */
export type ElementalAmpBonuses = Partial<Record<Element, number>>;

/**
 * Computed AMP result for all elements.
 * Source: BLACK ORB sheet AMP output columns.
 */
export interface AmpCalculation {
  /** Computed amplification bonus per element */
  elementalBonuses: ElementalAmpBonuses;
  /** Total combined AMP value summed across all active elements */
  totalAmp: number;
}

/**
 * Full black orb state: elemental configuration and computed AMP output.
 * Source: BLACK ORB sheet.
 */
export interface BlackOrbState {
  /** All elemental damage sources (active and inactive) */
  damageSources: ElementalDamageSource[];
  /** All element accessories (owned and unowned) */
  elementAccessories: ElementAccessory[];
  /** Computed AMP values derived from active sources and owned accessories */
  ampCalculation: AmpCalculation;
}

/**
 * Root shape of black-orb-maths-data.json.
 */
export interface BlackOrbMathsData {
  /** Semantic version of this data file (e.g. "1.0.0"). */
  dataVersion: string;
  /** All elemental damage sources defined in the game */
  ELEMENTAL_DAMAGE_SOURCES: ElementalDamageSource[];
  /** All element accessories available in the game */
  ELEMENT_ACCESSORIES: ElementAccessory[];
}
