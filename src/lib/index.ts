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
  calculateStageResourceRates,
  rankStagesByResource,
  normalizeStageRankings,
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
