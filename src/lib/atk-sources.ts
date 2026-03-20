/**
 * Individual ATK source calculation functions.
 *
 * Each function computes the ATK contribution from one specific game source.
 * Return value semantics per source:
 *  - Weapon ATK: absolute attack power (e.g. 150 = 150 raw ATK)
 *  - Growth STR bonus: absolute attack bonus (pre-computed as level × growth_factor)
 *  - Percentage bonuses: decimal fractions (e.g. 0.09 = +9% ATK)
 *  - Multiplicative factors: decimals ≥ 1 (e.g. 1.10 = ×1.10 ATK)
 *
 * These individual results are combined by the multiplicative aggregation in
 * issue 3.2.2. All functions are pure — no side effects, no external state.
 */

import type { GrowthStats } from '../types/character';
import type {
  PromotionEntry,
  PromotionBonusEntry,
  GrowthKnowledgeEntry,
} from '../types/character-data';
import type { LevelMultiplier } from '../types/equipment';
import type { TOMNode } from '../types/tom';
import type { AppearanceBonusTotals } from '../types/appearance';
import type { ConstellationBuffTotals } from '../types/constellation';
import type { DemonSanctuaryEntry } from '../types/familiars';
import type {
  AdvancementStepOrdinal,
  Companion,
  CompanionsState,
} from '../types/companions';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Maps advancement step ordinal labels to their 1-based index. */
const STEP_ORDINAL_INDEX: Record<AdvancementStepOrdinal, number> = {
  '1st': 1,
  '2nd': 2,
  '3rd': 3,
  '4th': 4,
  '5th': 5,
  '6th': 6,
  '7th': 7,
  '8th': 8,
  '9th': 9,
  '10th': 10,
  '11th': 11,
  '12th': 12,
  '13th': 13,
  '14th': 14,
};

// ---------------------------------------------------------------------------
// Weapon ATK
// ---------------------------------------------------------------------------

/**
 * Computes the absolute ATK contributed by the active weapon at a given
 * enhancement level.
 *
 * Formula: baseAtk × atkMultiplier(enhanceLevel)
 *
 * @param baseAtk - Base ATK of the weapon tier (from cube-optimizer-data.json)
 * @param enhanceLevel - Current weapon enhancement level (1–maxLevel)
 * @param levelMultipliers - Full level-multiplier table from equipment.json
 * @returns Absolute weapon ATK value; 0 if enhanceLevel is out of range
 */
export function calcWeaponAtk(
  baseAtk: number,
  enhanceLevel: number,
  levelMultipliers: LevelMultiplier[],
): number {
  const entry = levelMultipliers.find((m) => m.level === enhanceLevel);
  if (!entry) return 0;
  return baseAtk * entry.atkMultiplier;
}

// ---------------------------------------------------------------------------
// Growth STR bonus
// ---------------------------------------------------------------------------

/**
 * Returns the ATK contribution from the character's STR growth stat.
 *
 * The bonus is pre-computed in CharacterState as `level × growth_factor`
 * (column AF of CHARACTER_MATHSDATA). This function extracts it explicitly
 * so downstream aggregation can treat it as a named source.
 *
 * @param growthStats - Character growth stats from CharacterState
 * @returns Flat ATK bonus from STR growth
 */
export function calcGrowthStrAtk(growthStats: GrowthStats): number {
  return growthStats.STR.bonus;
}

// ---------------------------------------------------------------------------
// Promotion ATK bonuses
// ---------------------------------------------------------------------------

/**
 * Returns the cumulative ATK% bonus granted by the character's current
 * promotion tier, as defined in the PROMOTION table.
 *
 * @param tier - Current promotion tier (1–10)
 * @param promotionTable - PROMOTION table from character-maths-data.json
 * @returns Additive ATK% bonus (e.g. 0.09 = +9% ATK); 0 if tier not found
 */
export function calcPromotionAtkPct(
  tier: number,
  promotionTable: PromotionEntry[],
): number {
  const entry = promotionTable.find((p) => p.tier === tier);
  return entry?.atkBonus ?? 0;
}

/**
 * Returns the cumulative extra ATK% bonus from the PROMOTION_BONUS table
 * at the character's current promotion tier.
 *
 * @param tier - Current promotion tier (1–10)
 * @param promotionBonusTable - PROMOTION_BONUS table from character-maths-data.json
 * @returns Additive extra ATK% bonus (e.g. 0.04 = +4% ATK); 0 if tier not found
 */
export function calcPromotionBonusAtkPct(
  tier: number,
  promotionBonusTable: PromotionBonusEntry[],
): number {
  const entry = promotionBonusTable.find((p) => p.tier === tier);
  return entry?.extraAtkPercent ?? 0;
}

// ---------------------------------------------------------------------------
// Growing Knowledge multiplier
// ---------------------------------------------------------------------------

/**
 * Returns the multiplicative ATK factor granted by the character's current
 * Growing Knowledge grade.
 *
 * @param grade - Selected Growing Knowledge grade (1–91)
 * @param growthKnowledgeTable - GROWTH_KNOWLEDGE table from character-maths-data.json
 * @returns Multiplicative ATK factor (e.g. 1.10 = ×1.10 ATK); 1.0 if not found
 */
export function calcGrowingKnowledgeMultiplier(
  grade: number,
  growthKnowledgeTable: GrowthKnowledgeEntry[],
): number {
  const entry = growthKnowledgeTable.find((g) => g.grade === grade);
  return entry?.atkEffectMultiplier ?? 1;
}

// ---------------------------------------------------------------------------
// Class growth ATK bonus
// ---------------------------------------------------------------------------

/**
 * Calculate the ATK% contribution from class level growth.
 *
 * Each class grants `atkBonusPctPerLevel` percentage points of ATK per class
 * level (sourced from CUBE_OPTIMIZER_DATA CLASSES table).
 *
 * @param classLevel           - Current class level
 * @param atkBonusPctPerLevel  - Per-level ATK bonus for this class
 * @returns ATK percentage points from class growth (e.g. 5 = +5% ATK)
 */
export function calcClassAtkBonus(
  classLevel: number,
  atkBonusPctPerLevel: number,
): number {
  return classLevel * atkBonusPctPerLevel;
}

// ---------------------------------------------------------------------------
// Companion Extra ATK buffs
// ---------------------------------------------------------------------------

/**
 * Returns the total additive ATK% bonus contributed by a single companion's
 * unlocked advancement steps.
 *
 * Steps are unlocked sequentially: step N is active when companion.level ≥ N.
 * Only steps with buffType === 'Extra ATK' contribute.
 *
 * @param companion - Full companion state including level and advancement steps
 * @returns Additive ATK% bonus (e.g. 0.14 = +14% ATK)
 */
export function calcCompanionAtkBuff(companion: Companion): number {
  return companion.advancementSteps
    .filter((step) => {
      const stepIndex = STEP_ORDINAL_INDEX[step.step];
      return step.buffType === 'Extra ATK' && stepIndex <= companion.level;
    })
    .reduce((sum, step) => sum + step.buffValue, 0);
}

/**
 * Returns the total additive ATK% bonus across all four companions.
 *
 * @param companions - All four companion states
 * @returns Combined additive ATK% bonus from all companions
 */
export function calcAllCompanionsAtkBuff(companions: CompanionsState): number {
  return companions.reduce(
    (sum, companion) => sum + calcCompanionAtkBuff(companion),
    0,
  );
}

// ---------------------------------------------------------------------------
// Tree of Memory (TOM) ATK bonus
// ---------------------------------------------------------------------------

/**
 * Returns the total additive ATK% bonus from all Tree of Memory nodes that
 * have effectType === 'ATK'.
 *
 * Each node level grants its listed effectValue; bonuses accumulate across
 * all unlocked levels of all ATK nodes.
 *
 * @param nodeLevels - Player's current level per node ID (0 = locked)
 * @param tomNodes - Full TOM node definitions from tom-data.json
 * @returns Additive ATK% bonus (e.g. 0.06 = +6% ATK from TOM nodes)
 */
export function calcTomAtkBonus(
  nodeLevels: Record<string, number>,
  tomNodes: TOMNode[],
): number {
  let total = 0;
  for (const node of tomNodes) {
    const currentLevel = nodeLevels[node.id] ?? 0;
    if (currentLevel === 0) continue;
    for (const lvl of node.levels) {
      if (lvl.level <= currentLevel && lvl.effectType === 'ATK') {
        total += lvl.effectValue;
      }
    }
  }
  return total;
}

// ---------------------------------------------------------------------------
// Appearance (clothing) Extra ATK bonus
// ---------------------------------------------------------------------------

/**
 * Returns the total ATK bonus from owned clothing items in the APPEARANCE sheet.
 *
 * @param bonusTotals - Pre-computed sum of owned clothing effectValues per BonusType
 * @returns 'Extra ATK' bonus total (unit matches the source data's effectValue scale)
 */
export function calcAppearanceAtkBonus(bonusTotals: AppearanceBonusTotals): number {
  return bonusTotals['Extra ATK'] ?? 0;
}

// ---------------------------------------------------------------------------
// Constellation ATK bonus
// ---------------------------------------------------------------------------

/**
 * Returns the total ATK bonus from unlocked constellation star nodes.
 *
 * Includes contributions from both 'ATK'-typed nodes and 'All Stats' nodes
 * (which boost every combat stat including ATK).
 *
 * @param buffTotals - Pre-computed sum of active star node buffs per ConstellationBuffType
 * @returns Combined ATK bonus from ATK and All Stats constellation nodes
 */
export function calcConstellationAtkBonus(buffTotals: ConstellationBuffTotals): number {
  return (buffTotals['ATK'] ?? 0) + (buffTotals['All Stats'] ?? 0);
}

// ---------------------------------------------------------------------------
// Demon Sanctuary ATK bonus
// ---------------------------------------------------------------------------

/**
 * Returns the cumulative ATK% bonus granted by the Demon Sanctuary at the
 * player's current sanctuary level.
 *
 * @param sanctuaryLevel - Current Demon Sanctuary level (1–20)
 * @param sanctuaryTable - DEMON_SANCTUARY table from familiars-maths-data.json
 * @returns Additive ATK% bonus (e.g. 0.05 = +5% ATK); 0 if level not found
 */
export function calcSanctuaryAtkBonus(
  sanctuaryLevel: number,
  sanctuaryTable: DemonSanctuaryEntry[],
): number {
  const entry = sanctuaryTable.find((s) => s.level === sanctuaryLevel);
  return entry?.atkBonusPercent ?? 0;
}
