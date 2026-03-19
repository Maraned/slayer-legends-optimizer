export {
  stageToSummary,
  buildStageIndex,
  buildStageSummaryIndex,
  buildAreaIndex,
  buildZoneIndex,
  buildSummariesByAreaIndex,
  buildSummariesByZoneIndex,
  buildSummariesByBonusTypeIndex,
} from './stage-lookups';

export {
  buildSlayerLevelIndex,
  buildPromotionIndex,
  buildPromotionBonusIndex,
  buildGrowthKnowledgeIndex,
} from './character-data-lookups';

export { buildLevelMultiplierIndex } from './equipment-lookups';

export { cumulativeCost, segmentCost, costForRange, SEGMENT_SIZE } from './gold-calculator';

export {
  getDemonAltarSoulCost,
  getDemonSanctuarySoulCost,
  getAvgSoulsPerRun,
  getRunsNeeded,
  getTimeToCraft,
  getAllDungeonStages,
  DEMON_ALTAR_MAX_LEVEL,
  DEMON_SANCTUARY_MAX_LEVEL,
  SOUL_DUNGEON_MAX_STAGE,
} from './souls';
export type { TimeToCraft } from './souls';

export {
  calculateStageResourceRates,
  rankStagesByResource,
  normalizeStageRankings,
  findBestStagePerResource,
  bonusesFromAppearance,
  bonusesFromCompanions,
  mergeFarmingBonuses,
} from './stage-calculator';

export {
  calcWeaponAtk,
  calcGrowthStrAtk,
  calcPromotionAtkPct,
  calcPromotionBonusAtkPct,
  calcGrowingKnowledgeMultiplier,
  calcCompanionAtkBuff,
  calcAllCompanionsAtkBuff,
  calcTomAtkBonus,
  calcAppearanceAtkBonus,
  calcConstellationAtkBonus,
  calcSanctuaryAtkBonus,
} from './atk-sources';

export type { AtkSources } from './atk-aggregation';
export { aggregateAtk, aggregateAtkDetailed } from './atk-aggregation';

export type {
  CritDmgBreakdown,
  CritDmgParams,
  WeaponTierCritDmgEfficiency,
} from './critDmgCalculator';
export {
  critDmgFromEnhancement,
  critDmgFromClassGrowth,
  critDmgFromWeaponTier,
  critDmgFromSoulWeapon,
  critDmgFromSkillMastery,
  critDmgFromConstellation,
  critDmgFromAccessories,
  critDmgFromAppearance,
  critDmgFromTOM,
  aggregateCritDmg,
  calculateTotalCritDmg,
  critDmgEfficiencyForWeaponTier,
  critDmgEfficiencyPerWeaponTier,
} from './critDmgCalculator';

export {
  expBonusFromAppearance,
  goldBonusFromAppearance,
  expBonusFromCompanions,
  goldBonusFromCompanions,
  goldBonusFromPromotion,
  expBonusFromConstellation,
  goldBonusFromConstellation,
  expBonusFromMemoryTree,
  goldBonusFromMemoryTree,
  aggregateFarmingBonuses,
} from './bonus-aggregator';

export type { AggregateFarmingBonusesInput } from './bonus-aggregator';

export {
  getDemonAltarSoulCost,
  getDemonSanctuarySoulCost,
  getAvgSoulsPerRun,
  getRunsNeeded,
  getAllDungeonStages,
  getSoulConversionRatio,
  getAllSoulConversionRatios,
  rankStagesBySoulsPerEnergy,
  DEMON_ALTAR_MAX_LEVEL,
  DEMON_SANCTUARY_MAX_LEVEL,
  SOUL_DUNGEON_MAX_STAGE,
} from './souls';

export type { AtkStateInputs, AtkGameTables } from './atk-state';
export { atkSourcesFromState } from './atk-state';

export type { BaseDamageInputs } from './base-damage-calculator';
export {
  calcBaseDamageAtk,
  calcProficiencyMultiplier,
  calculateBaseDamage,
  calculateBaseDamageDetailed,
} from './base-damage-calculator';

export type { DamageFormulaInputs } from './damage-formula';
export {
  calcAmpMultiplier,
  calculateDamage,
  calculateDamageDetailed,
} from './damage-formula';

export type {
  EnhancementStatConfig,
  EnhancementEfficiency,
  RankedEnhancementTarget,
} from './enhancement-optimizer';
export {
  calculateEnhancementEfficiency,
  calculateAllEnhancementEfficiencies,
  rankEnhancementTargets,
} from './enhancement-optimizer';

export type { ExpectedDamageInputs } from './total-expected-damage';
export {
  calcCritDmgMultiplier,
  calcCritExpectedMultiplier,
  calculateExpectedDamage,
  calculateExpectedDamageDetailed,
} from './total-expected-damage';
