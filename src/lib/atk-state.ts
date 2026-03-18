/**
 * ATK source values pulled from user state.
 *
 * Bridges the Zustand user state slices to the individual calc* functions
 * in atk-sources.ts by extracting the required scalar values and forwarding
 * them to each pure calculator.
 *
 * Returns an AtkSources object ready to pass to aggregateAtk or
 * aggregateAtkDetailed.
 */

import type { GrowthStats } from '../types/character';
import type {
  PromotionEntry,
  PromotionBonusEntry,
  GrowthKnowledgeEntry,
} from '../types/character-data';
import type { Weapon, LevelMultiplier } from '../types/equipment';
import type { CubeWeapon } from '../types/cube-optimizer';
import type { TOMNode } from '../types/tom';
import type { AppearanceBonusTotals } from '../types/appearance';
import type { ConstellationBuffTotals } from '../types/constellation';
import type { DemonSanctuaryEntry } from '../types/familiars';
import type { CompanionsState } from '../types/companions';
import type { AtkSources } from './atk-aggregation';
import {
  calcWeaponAtk,
  calcGrowthStrAtk,
  calcPromotionAtkPct,
  calcPromotionBonusAtkPct,
  calcGrowingKnowledgeMultiplier,
  calcAllCompanionsAtkBuff,
  calcTomAtkBonus,
  calcAppearanceAtkBonus,
  calcConstellationAtkBonus,
  calcSanctuaryAtkBonus,
} from './atk-sources';

// ---------------------------------------------------------------------------
// Parameter types
// ---------------------------------------------------------------------------

/**
 * ATK-relevant slices from the player's user state.
 *
 * Each field corresponds to a section of the save state that contributes
 * to ATK. Pass values directly from the Zustand store selectors.
 */
export interface AtkStateInputs {
  /** STR, HP, VIT growth levels and pre-computed bonuses (CHARACTER sheet). */
  growthStats: GrowthStats;
  /** Current promotion tier (1–10). */
  promotionTier: number;
  /** Current Growing Knowledge grade (1–91). */
  growingKnowledgeGrade: number;
  /** All weapons from the player's equipment state (owned and unowned). */
  weapons: Weapon[];
  /** Pre-computed bonus totals from owned clothing items (APPEARANCE sheet). */
  appearanceBonusTotals: AppearanceBonusTotals;
  /** All four companion states (COMPANIONS sheet). */
  companions: CompanionsState;
  /** Per-node upgrade levels keyed by node ID (0 = locked). */
  tomNodeLevels: Record<string, number>;
  /** Pre-computed buff totals from active constellation star nodes. */
  constellationBuffTotals: ConstellationBuffTotals;
  /** Current Demon Sanctuary level (0–20). */
  sanctuaryLevel: number;
}

/**
 * Game data tables required by the ATK source calculators.
 *
 * These are loaded from JSON data files. Pass them in so the function
 * remains pure and testable without module-level data imports.
 */
export interface AtkGameTables {
  /** PROMOTION table from character-maths-data.json. */
  promotionTable: PromotionEntry[];
  /** PROMOTION_BONUS table from character-maths-data.json. */
  promotionBonusTable: PromotionBonusEntry[];
  /** GROWTH_KNOWLEDGE table from character-maths-data.json. */
  growthKnowledgeTable: GrowthKnowledgeEntry[];
  /** All TOM node definitions from tom-data.json. */
  tomNodes: TOMNode[];
  /** DEMON_SANCTUARY table from familiars-maths-data.json. */
  sanctuaryTable: DemonSanctuaryEntry[];
  /** Level multiplier table from equipment.json. */
  levelMultipliers: LevelMultiplier[];
  /** Weapon definitions from cube-optimizer-data.json. */
  cubeWeapons: CubeWeapon[];
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Resolves the base ATK and current enhance level of the active weapon.
 *
 * The active weapon is the highest-tier owned weapon. Tier rank comes from
 * the numeric `tier` field in cube-optimizer-data.json (higher = stronger).
 * Weapons are matched by comparing `Weapon.tier` (WeaponTier enum string)
 * against `CubeWeapon.name` (e.g. both equal "Common 4").
 *
 * @returns `{ baseAtk, enhanceLevel }` of the active weapon, or zeros if
 *   no weapons are owned.
 */
function resolveActiveWeapon(
  weapons: Weapon[],
  cubeWeapons: CubeWeapon[],
): { baseAtk: number; enhanceLevel: number } {
  let bestTierRank = -1;
  let bestBaseAtk = 0;
  let bestEnhanceLevel = 0;

  for (const weapon of weapons) {
    if (!weapon.owned) continue;
    const cubeWeapon = cubeWeapons.find((cw) => cw.name === weapon.tier);
    if (!cubeWeapon) continue;
    const tierRank = Number(cubeWeapon.tier);
    if (tierRank > bestTierRank) {
      bestTierRank = tierRank;
      bestBaseAtk = cubeWeapon.baseAtk;
      bestEnhanceLevel = weapon.enhanceLevel;
    }
  }

  return { baseAtk: bestBaseAtk, enhanceLevel: bestEnhanceLevel };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Builds an AtkSources object by pulling all ATK-relevant values from the
 * player's user state and forwarding them to the individual calc* functions.
 *
 * This function bridges the Zustand store slices to the pure source
 * calculators. Call `aggregateAtk(result)` or `aggregateAtkDetailed(result)`
 * on the returned value to get the final ATK figure.
 *
 * Active weapon selection: the highest-tier owned weapon is used. If no
 * weapons are owned, weaponAtk is 0.
 *
 * @param inputs - ATK-relevant slices from the player's save state.
 * @param data   - Game data tables loaded from JSON data files.
 * @returns      AtkSources with all fields populated.
 */
export function atkSourcesFromState(
  inputs: AtkStateInputs,
  data: AtkGameTables,
): AtkSources {
  const { baseAtk, enhanceLevel } = resolveActiveWeapon(
    inputs.weapons,
    data.cubeWeapons,
  );

  return {
    weaponAtk: calcWeaponAtk(baseAtk, enhanceLevel, data.levelMultipliers),
    growthStrAtk: calcGrowthStrAtk(inputs.growthStats),
    promotionAtkPct: calcPromotionAtkPct(
      inputs.promotionTier,
      data.promotionTable,
    ),
    promotionBonusAtkPct: calcPromotionBonusAtkPct(
      inputs.promotionTier,
      data.promotionBonusTable,
    ),
    companionsAtkPct: calcAllCompanionsAtkBuff(inputs.companions),
    tomAtkPct: calcTomAtkBonus(inputs.tomNodeLevels, data.tomNodes),
    appearanceAtkPct: calcAppearanceAtkBonus(inputs.appearanceBonusTotals),
    constellationAtkPct: calcConstellationAtkBonus(
      inputs.constellationBuffTotals,
    ),
    sanctuaryAtkPct: calcSanctuaryAtkBonus(
      inputs.sanctuaryLevel,
      data.sanctuaryTable,
    ),
    growingKnowledgeMultiplier: calcGrowingKnowledgeMultiplier(
      inputs.growingKnowledgeGrade,
      data.growthKnowledgeTable,
    ),
  };
}
