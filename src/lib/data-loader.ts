/**
 * Data loader utility with module-level caching.
 *
 * Uses dynamic imports so large JSON files are only parsed once per process.
 * All caches are populated lazily on first access and reused thereafter.
 */

import type {
  StageData,
  Stage,
  StageIndex,
  StageSummary,
  StageSummaryIndex,
} from '@/types/stage';
import type {
  EquipmentData,
  LevelMultiplier,
  SoulWeaponData,
} from '@/types/equipment';
import type { CharacterMathsData } from '@/types/character-data';

// ---------------------------------------------------------------------------
// Module-level caches
// ---------------------------------------------------------------------------

let stageDataCache: StageData | null = null;
let stageIndexCache: StageIndex | null = null;
let stageSummaryIndexCache: StageSummaryIndex | null = null;

let equipmentDataCache: EquipmentData | null = null;
let levelMultiplierIndexCache: Record<number, LevelMultiplier> | null = null;
let soulWeaponsCache: SoulWeaponData[] | null = null;

let characterDataCache: CharacterMathsData | null = null;

// ---------------------------------------------------------------------------
// Stage data
// ---------------------------------------------------------------------------

/**
 * Load and cache the full stage dataset.
 * Subsequent calls return the cached value without re-parsing.
 */
export async function loadStageData(): Promise<StageData> {
  if (stageDataCache) return stageDataCache;
  const mod = await import('@/data/stage-data.json');
  stageDataCache = mod.default as unknown as StageData;
  return stageDataCache;
}

/**
 * Build and cache a stage index keyed by stage id for O(1) lookups.
 */
export async function getStageIndex(): Promise<StageIndex> {
  if (stageIndexCache) return stageIndexCache;
  const data = await loadStageData();
  const index: StageIndex = {};
  for (const stage of data.STAGES) {
    index[stage.id] = stage;
  }
  stageIndexCache = index;
  return stageIndexCache;
}

/**
 * Build and cache a lightweight summary index keyed by stage id.
 * Omits mob details, suitable for list/filter UIs.
 */
export async function getStageSummaryIndex(): Promise<StageSummaryIndex> {
  if (stageSummaryIndexCache) return stageSummaryIndexCache;
  const data = await loadStageData();
  const index: StageSummaryIndex = {};
  for (const stage of data.STAGES) {
    const summary: StageSummary = {
      id: stage.id,
      label: stage.label,
      areaId: stage.areaId,
      areaName: stage.areaName,
      zoneId: stage.zoneId,
      zoneName: stage.zoneName,
      stageNumber: stage.stageNumber,
      energyCost: stage.energyCost,
      hasBoss: stage.hasBoss,
      recommendedLevel: stage.recommendedLevel,
      bonusTypes: stage.bonuses.map((b) => b.type),
    };
    index[stage.id] = summary;
  }
  stageSummaryIndexCache = index;
  return stageSummaryIndexCache;
}

/**
 * Retrieve a single stage by id from a pre-built index.
 *
 * @param index - A StageIndex returned by {@link getStageIndex}
 * @param id    - The numeric stage id to look up
 * @returns The Stage, or undefined if the id does not exist
 */
export function getStageById(index: StageIndex, id: number): Stage | undefined {
  return index[id];
}

// ---------------------------------------------------------------------------
// Equipment data
// ---------------------------------------------------------------------------

/**
 * Load and cache the equipment data (level multipliers + cost factors).
 */
export async function loadEquipmentData(): Promise<EquipmentData> {
  if (equipmentDataCache) return equipmentDataCache;
  const mod = await import('@/data/equipment.json');
  equipmentDataCache = mod.default as unknown as EquipmentData;
  return equipmentDataCache;
}

/**
 * Build and cache a level-multiplier index keyed by enhancement level for O(1) lookups.
 */
export async function getLevelMultiplierIndex(): Promise<Record<number, LevelMultiplier>> {
  if (levelMultiplierIndexCache) return levelMultiplierIndexCache;
  const data = await loadEquipmentData();
  const index: Record<number, LevelMultiplier> = {};
  for (const entry of data.levelMultipliers) {
    index[entry.level] = entry;
  }
  levelMultiplierIndexCache = index;
  return levelMultiplierIndexCache;
}

/**
 * Load and cache the list of all available soul weapons.
 */
export async function loadSoulWeapons(): Promise<SoulWeaponData[]> {
  if (soulWeaponsCache) return soulWeaponsCache;
  const data = await loadEquipmentData();
  soulWeaponsCache = data.soulWeapons;
  return soulWeaponsCache;
}

/**
 * Retrieve a level multiplier entry by enhancement level.
 *
 * @param index - A level-multiplier index from {@link getLevelMultiplierIndex}
 * @param level - The enhancement level to look up (1–1400)
 * @returns The LevelMultiplier entry, or undefined if the level does not exist
 */
export function getLevelMultiplier(
  index: Record<number, LevelMultiplier>,
  level: number,
): LevelMultiplier | undefined {
  return index[level];
}

// ---------------------------------------------------------------------------
// Character maths data
// ---------------------------------------------------------------------------

/**
 * Load and cache the character maths data (slayer levels, promotions, growth knowledge).
 */
export async function loadCharacterMathsData(): Promise<CharacterMathsData> {
  if (characterDataCache) return characterDataCache;
  const mod = await import('@/data/character-maths-data.json');
  characterDataCache = mod.default as unknown as CharacterMathsData;
  return characterDataCache;
}

// ---------------------------------------------------------------------------
// Cache management
// ---------------------------------------------------------------------------

/**
 * Clear all cached data.
 * Intended for testing; not needed in normal application use.
 */
export function clearDataCaches(): void {
  stageDataCache = null;
  stageIndexCache = null;
  stageSummaryIndexCache = null;
  equipmentDataCache = null;
  levelMultiplierIndexCache = null;
  soulWeaponsCache = null;
  characterDataCache = null;
}
