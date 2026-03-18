/**
 * Soul requirements lookup utilities.
 *
 * Provides functions to calculate soul costs for Demon Altar and Demon
 * Sanctuary upgrades, and to estimate farming runs needed at a given
 * Soul Dungeon stage.
 */

import familiarsData from '@/data/familiars-maths-data.json';
import soulsData from '@/data/souls-data.json';
import type { DemonAltarEntry, DemonSanctuaryEntry } from '@/types/familiars';
import type { SoulConversionRatio, SoulDungeonStage } from '@/types/souls';

const ALTAR_TABLE = familiarsData.DEMON_ALTAR as DemonAltarEntry[];
const SANCTUARY_TABLE = familiarsData.DEMON_SANCTUARY as DemonSanctuaryEntry[];
const DUNGEON_STAGES = soulsData.SOUL_DUNGEON as SoulDungeonStage[];

/**
 * Total souls required to upgrade Demon Altar from `fromLevel` to `toLevel`.
 * Costs are summed for each level in the range (fromLevel+1 … toLevel).
 *
 * @param fromLevel - Current altar level (0 = not started yet)
 * @param toLevel   - Target altar level (1–50)
 * @returns Total soul cost, or 0 if fromLevel >= toLevel
 */
export function getDemonAltarSoulCost(fromLevel: number, toLevel: number): number {
  if (fromLevel >= toLevel) return 0;
  return ALTAR_TABLE.filter(
    (entry) => entry.level > fromLevel && entry.level <= toLevel,
  ).reduce((sum, entry) => sum + entry.soulCost, 0);
}

/**
 * Total souls required to upgrade Demon Sanctuary from `fromLevel` to
 * `toLevel`.
 *
 * @param fromLevel - Current sanctuary level (0 = not started yet)
 * @param toLevel   - Target sanctuary level (1–20)
 * @returns Total soul cost, or 0 if fromLevel >= toLevel
 */
export function getDemonSanctuarySoulCost(fromLevel: number, toLevel: number): number {
  if (fromLevel >= toLevel) return 0;
  return SANCTUARY_TABLE.filter(
    (entry) => entry.level > fromLevel && entry.level <= toLevel,
  ).reduce((sum, entry) => sum + entry.soulCost, 0);
}

/**
 * Average souls per run at the given Soul Dungeon stage number.
 *
 * @param stageNumber - Stage number (1–130)
 * @returns Average souls per run, or 0 if stage not found
 */
export function getAvgSoulsPerRun(stageNumber: number): number {
  const stage = DUNGEON_STAGES.find((s) => s.stage === stageNumber);
  if (!stage) return 0;
  return (stage.soulsReward.min + stage.soulsReward.max) / 2;
}

/**
 * Number of runs needed at the given stage to farm `totalSouls` souls.
 * Uses average souls per run (ceiling).
 *
 * @param stageNumber - Soul Dungeon stage number
 * @param totalSouls  - Souls needed
 * @returns Runs required, or Infinity if stage not found
 */
export function getRunsNeeded(stageNumber: number, totalSouls: number): number {
  if (totalSouls <= 0) return 0;
  const avgPerRun = getAvgSoulsPerRun(stageNumber);
  if (avgPerRun === 0) return Infinity;
  return Math.ceil(totalSouls / avgPerRun);
}

/**
 * Returns all Soul Dungeon stages, sorted ascending by stage number.
 */
export function getAllDungeonStages(): SoulDungeonStage[] {
  return [...DUNGEON_STAGES].sort((a, b) => a.stage - b.stage);
}

/**
 * Returns the maximum level for the Demon Altar.
 */
export const DEMON_ALTAR_MAX_LEVEL = ALTAR_TABLE.length;

/**
 * Returns the maximum level for the Demon Sanctuary.
 */
export const DEMON_SANCTUARY_MAX_LEVEL = SANCTUARY_TABLE.length;

/**
 * Returns the maximum Soul Dungeon stage number.
 */
export const SOUL_DUNGEON_MAX_STAGE = Math.max(...DUNGEON_STAGES.map((s) => s.stage));

// ---------------------------------------------------------------------------
// Soul conversion ratios
// ---------------------------------------------------------------------------

/**
 * Computes the soul conversion ratio for the given Soul Dungeon stage number.
 *
 * The conversion ratio expresses how many souls a player earns per run and
 * per energy (stamina) spent, using the minimum, maximum, and average of the
 * stage's soul reward range.
 *
 * @param stageNumber - Soul Dungeon stage number (1–130)
 * @returns SoulConversionRatio for the stage, or null if stage not found
 */
export function getSoulConversionRatio(stageNumber: number): SoulConversionRatio | null {
  const stage = DUNGEON_STAGES.find((s) => s.stage === stageNumber);
  if (!stage) return null;

  const { min: minSoulsPerRun, max: maxSoulsPerRun } = stage.soulsReward;
  const avgSoulsPerRun = (minSoulsPerRun + maxSoulsPerRun) / 2;
  const energyCost = stage.energyCost;

  return {
    stageNumber: stage.stage,
    stageName: stage.name,
    tier: stage.tier,
    energyCost,
    minSoulsPerRun,
    maxSoulsPerRun,
    avgSoulsPerRun,
    minSoulsPerEnergy: energyCost > 0 ? minSoulsPerRun / energyCost : 0,
    maxSoulsPerEnergy: energyCost > 0 ? maxSoulsPerRun / energyCost : 0,
    avgSoulsPerEnergy: energyCost > 0 ? avgSoulsPerRun / energyCost : 0,
  };
}

/**
 * Returns soul conversion ratios for all Soul Dungeon stages, sorted
 * ascending by stage number.
 *
 * @returns Array of SoulConversionRatio for every stage
 */
export function getAllSoulConversionRatios(): SoulConversionRatio[] {
  return [...DUNGEON_STAGES]
    .sort((a, b) => a.stage - b.stage)
    .map((stage) => {
      const { min: minSoulsPerRun, max: maxSoulsPerRun } = stage.soulsReward;
      const avgSoulsPerRun = (minSoulsPerRun + maxSoulsPerRun) / 2;
      const energyCost = stage.energyCost;

      return {
        stageNumber: stage.stage,
        stageName: stage.name,
        tier: stage.tier,
        energyCost,
        minSoulsPerRun,
        maxSoulsPerRun,
        avgSoulsPerRun,
        minSoulsPerEnergy: energyCost > 0 ? minSoulsPerRun / energyCost : 0,
        maxSoulsPerEnergy: energyCost > 0 ? maxSoulsPerRun / energyCost : 0,
        avgSoulsPerEnergy: energyCost > 0 ? avgSoulsPerRun / energyCost : 0,
      };
    });
}

/**
 * Returns all Soul Dungeon stages ranked by average souls per energy,
 * descending (most efficient first).
 *
 * Useful for identifying which stage gives the most souls per stamina spent.
 *
 * @returns Array of SoulConversionRatio sorted by avgSoulsPerEnergy descending
 */
export function rankStagesBySoulsPerEnergy(): SoulConversionRatio[] {
  return getAllSoulConversionRatios().sort(
    (a, b) => b.avgSoulsPerEnergy - a.avgSoulsPerEnergy,
  );
}
