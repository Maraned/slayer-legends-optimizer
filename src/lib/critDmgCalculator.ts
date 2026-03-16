/**
 * CRIT DMG source calculations.
 *
 * Provides one pure function per CRIT DMG source so each can be called
 * independently. The additive aggregation across all sources is handled
 * separately (MAR-51 / 3.3.2).
 *
 * Sources covered:
 *   1. Enhancement      — CRIT_DMG stat enhancement level
 *   2. Class growth     — class level × critDmgBonusPctPerLevel (cube data)
 *   3. Weapon tier      — flat critDmgBonusPct for the equipped weapon tier
 *   4. Soul Weapon      — engraving effect values that reference CRIT DMG
 *   5. Skill Mastery    — unlocked mastery nodes whose effect is CRIT DMG
 *   6. Constellation    — pre-aggregated 'Crit DMG' buff total
 *   7. Accessories      — owned accessories with bonusType 'CritDMG'
 *   8. Appearance       — pre-aggregated 'Crit DMG' clothing bonus total
 *   9. Tree of Memory   — TOM nodes with effectType 'Crit DMG'
 */

import type { Accessory, SoulWeaponEffect } from '../types/equipment';
import type { AppearanceBonusTotals } from '../types/appearance';
import type { ConstellationBuffTotals } from '../types/constellation';
import type { SkillMasteryPage } from '../types/skills';
import type { TOMNode } from '../types/tom';

// ---------------------------------------------------------------------------
// Breakdown type
// ---------------------------------------------------------------------------

/**
 * Per-source CRIT DMG breakdown.
 * All values are additive percentage points (e.g. 5 = +5% CRIT DMG).
 */
export interface CritDmgBreakdown {
  /** CRIT_DMG stat enhancement level contribution */
  enhancement: number;
  /** Class growth contribution (class level × per-level bonus) */
  classGrowth: number;
  /** Equipped weapon tier flat bonus */
  weaponTier: number;
  /** Soul Weapon engraving effects that grant CRIT DMG */
  soulWeapon: number;
  /** Unlocked Skill Mastery nodes that grant CRIT DMG */
  skillMastery: number;
  /** Constellation star node buffs (pre-aggregated) */
  constellation: number;
  /** Owned accessories with CritDMG bonus type */
  accessories: number;
  /** Owned appearance (clothing) items (pre-aggregated) */
  appearance: number;
  /** Tree of Memory nodes with Crit DMG effect type */
  treeOfMemory: number;
}

// ---------------------------------------------------------------------------
// Source 1 — Enhancement
// ---------------------------------------------------------------------------

/**
 * Calculate the CRIT DMG contribution from the CRIT_DMG enhancement stat.
 *
 * Each enhancement level adds a flat `bonusPerLevel` percentage.
 *
 * @param level        - Current CRIT_DMG enhancement level
 * @param bonusPerLevel - CRIT DMG percentage points added per level
 * @returns CRIT DMG percentage points from enhancement
 */
export function critDmgFromEnhancement(
  level: number,
  bonusPerLevel: number,
): number {
  return level * bonusPerLevel;
}

// ---------------------------------------------------------------------------
// Source 2 — Class growth
// ---------------------------------------------------------------------------

/**
 * Calculate the CRIT DMG contribution from class level growth.
 *
 * Each class grants `critDmgBonusPctPerLevel` percentage points of CRIT DMG
 * per class level (sourced from CUBE_OPTIMIZER_DATA CLASSES table).
 *
 * @param classLevel              - Current class level
 * @param critDmgBonusPctPerLevel - Per-level CRIT DMG bonus for this class
 * @returns CRIT DMG percentage points from class growth
 */
export function critDmgFromClassGrowth(
  classLevel: number,
  critDmgBonusPctPerLevel: number,
): number {
  return classLevel * critDmgBonusPctPerLevel;
}

// ---------------------------------------------------------------------------
// Source 3 — Weapon tier
// ---------------------------------------------------------------------------

/**
 * Calculate the CRIT DMG contribution from the equipped weapon tier.
 *
 * Weapons provide a flat `critDmgBonusPct` bonus determined by their tier
 * (sourced from CUBE_OPTIMIZER_DATA WEAPONS table).
 *
 * @param critDmgBonusPct - Flat CRIT DMG bonus for the current weapon tier
 * @returns CRIT DMG percentage points from the weapon tier
 */
export function critDmgFromWeaponTier(critDmgBonusPct: number): number {
  return critDmgBonusPct;
}

// ---------------------------------------------------------------------------
// Source 4 — Soul Weapon engraving
// ---------------------------------------------------------------------------

/**
 * Calculate the CRIT DMG contribution from Soul Weapon engraving effects.
 *
 * Iterates over all unlocked engraving effects and sums the `value` of any
 * effect whose description references "CRIT DMG" (case-insensitive).
 *
 * @param effects - Unlocked Soul Weapon engraving effects
 * @returns CRIT DMG percentage points from Soul Weapon engraving
 */
export function critDmgFromSoulWeapon(effects: SoulWeaponEffect[]): number {
  return effects.reduce((sum, effect) => {
    if (effect.value != null && /crit\s*dmg/i.test(effect.description)) {
      return sum + effect.value;
    }
    return sum;
  }, 0);
}

// ---------------------------------------------------------------------------
// Source 5 — Skill Mastery
// ---------------------------------------------------------------------------

/**
 * Calculate the CRIT DMG contribution from unlocked Skill Mastery nodes.
 *
 * Sums `effectValue` from every unlocked node across all 8 mastery pages
 * whose `effectDescription` references "CRIT DMG" (case-insensitive).
 *
 * @param pages - All 8 Skill Mastery pages with per-node unlock states
 * @returns CRIT DMG percentage points from Skill Mastery nodes
 */
export function critDmgFromSkillMastery(pages: SkillMasteryPage[]): number {
  return pages.reduce((total, page) => {
    return (
      total +
      page.nodes.reduce((pageSum, node) => {
        if (
          node.unlocked &&
          /crit\s*dmg/i.test(node.nodeData.effectDescription)
        ) {
          return pageSum + node.nodeData.effectValue;
        }
        return pageSum;
      }, 0)
    );
  }, 0);
}

// ---------------------------------------------------------------------------
// Source 6 — Constellation
// ---------------------------------------------------------------------------

/**
 * Calculate the CRIT DMG contribution from Constellation star node buffs.
 *
 * Reads the pre-aggregated `buffTotals['Crit DMG']` value computed by the
 * Constellation sheet state.
 *
 * @param buffTotals - Pre-computed constellation buff totals keyed by buff type
 * @returns CRIT DMG percentage points from Constellation buffs
 */
export function critDmgFromConstellation(
  buffTotals: ConstellationBuffTotals,
): number {
  return buffTotals['Crit DMG'] ?? 0;
}

// ---------------------------------------------------------------------------
// Source 7 — Accessories
// ---------------------------------------------------------------------------

/**
 * Calculate the CRIT DMG contribution from owned accessories.
 *
 * Filters for owned accessories with `bonusType === 'CritDMG'` and extracts
 * the first numeric value found in the `effect` description string.
 *
 * @param accessories - All player accessories (owned and unowned)
 * @returns CRIT DMG percentage points from owned CritDMG accessories
 */
export function critDmgFromAccessories(accessories: Accessory[]): number {
  return accessories.reduce((sum, acc) => {
    if (!acc.owned || acc.bonusType !== 'CritDMG') return sum;
    const match = acc.effect.match(/(\d+(?:\.\d+)?)/);
    return sum + (match != null ? parseFloat(match[1]) : 0);
  }, 0);
}

// ---------------------------------------------------------------------------
// Source 8 — Appearance
// ---------------------------------------------------------------------------

/**
 * Calculate the CRIT DMG contribution from owned appearance (clothing) items.
 *
 * Reads the pre-aggregated `bonusTotals['Crit DMG']` value computed by the
 * Appearance sheet state.
 *
 * @param bonusTotals - Pre-computed appearance bonus totals keyed by bonus type
 * @returns CRIT DMG percentage points from owned clothing items
 */
export function critDmgFromAppearance(
  bonusTotals: AppearanceBonusTotals,
): number {
  return bonusTotals['Crit DMG'] ?? 0;
}

// ---------------------------------------------------------------------------
// Source 9 — Tree of Memory
// ---------------------------------------------------------------------------

/**
 * Calculate the CRIT DMG contribution from Tree of Memory (TOM) nodes.
 *
 * For each node whose `currentLevel` is greater than zero, sums the
 * `effectValue` of every level definition up to and including `currentLevel`
 * where `effectType === 'Crit DMG'`.
 *
 * @param nodes - All TOM nodes with current levels and per-level definitions
 * @returns CRIT DMG percentage points from active TOM nodes
 */
export function critDmgFromTOM(nodes: TOMNode[]): number {
  return nodes.reduce((total, node) => {
    if (node.currentLevel === 0) return total;
    const activeEffects = node.levels.filter(
      (l) => l.level <= node.currentLevel && l.effectType === 'Crit DMG',
    );
    return total + activeEffects.reduce((s, l) => s + l.effectValue, 0);
  }, 0);
}

// ---------------------------------------------------------------------------
// Additive aggregation (MAR-51 / 3.3.2)
// ---------------------------------------------------------------------------

/** Parameters required to build a full CRIT DMG breakdown. */
export interface CritDmgParams {
  /** Current CRIT_DMG enhancement level */
  enhancementLevel: number;
  /** CRIT DMG percentage points added per enhancement level */
  enhancementBonusPerLevel: number;
  /** Current class level */
  classLevel: number;
  /** Per-level CRIT DMG bonus for the current class (from cube-optimizer-data) */
  classGrowthBonusPerLevel: number;
  /** Flat CRIT DMG bonus for the equipped weapon tier (from cube-optimizer-data) */
  weaponTierCritDmgBonusPct: number;
  /** Unlocked Soul Weapon engraving effects */
  soulWeaponEffects: SoulWeaponEffect[];
  /** All 8 Skill Mastery pages with per-node unlock states */
  skillMasteryPages: SkillMasteryPage[];
  /** Pre-aggregated constellation buff totals */
  constellationBuffTotals: ConstellationBuffTotals;
  /** All player accessories (owned and unowned) */
  accessories: Accessory[];
  /** Pre-aggregated appearance bonus totals */
  appearanceBonusTotals: AppearanceBonusTotals;
  /** All TOM nodes with current levels and per-level definitions */
  tomNodes: TOMNode[];
}

/**
 * Build a per-source CRIT DMG breakdown from all game sources.
 *
 * Each field maps to one of the nine source functions. All values are additive
 * percentage points (e.g. 5 = +5% CRIT DMG).
 *
 * @param params - All inputs required to compute every CRIT DMG source
 * @returns Breakdown of CRIT DMG contributions by source
 */
export function aggregateCritDmg(params: CritDmgParams): CritDmgBreakdown {
  return {
    enhancement: critDmgFromEnhancement(
      params.enhancementLevel,
      params.enhancementBonusPerLevel,
    ),
    classGrowth: critDmgFromClassGrowth(
      params.classLevel,
      params.classGrowthBonusPerLevel,
    ),
    weaponTier: critDmgFromWeaponTier(params.weaponTierCritDmgBonusPct),
    soulWeapon: critDmgFromSoulWeapon(params.soulWeaponEffects),
    skillMastery: critDmgFromSkillMastery(params.skillMasteryPages),
    constellation: critDmgFromConstellation(params.constellationBuffTotals),
    accessories: critDmgFromAccessories(params.accessories),
    appearance: critDmgFromAppearance(params.appearanceBonusTotals),
    treeOfMemory: critDmgFromTOM(params.tomNodes),
  };
}

/**
 * Sum all source contributions in a CRIT DMG breakdown into a single total.
 *
 * The result is the total additive CRIT DMG percentage across all sources
 * (e.g. 150 = +150% CRIT DMG).
 *
 * @param breakdown - Per-source breakdown produced by `aggregateCritDmg`
 * @returns Total CRIT DMG percentage points
 */
export function calculateTotalCritDmg(breakdown: CritDmgBreakdown): number {
  return (
    breakdown.enhancement +
    breakdown.classGrowth +
    breakdown.weaponTier +
    breakdown.soulWeapon +
    breakdown.skillMastery +
    breakdown.constellation +
    breakdown.accessories +
    breakdown.appearance +
    breakdown.treeOfMemory
  );
}
