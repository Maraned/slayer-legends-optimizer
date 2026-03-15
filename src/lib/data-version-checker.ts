/**
 * Data version checking system.
 *
 * Compares the version embedded in each loaded data file against the master
 * version registry (`src/data/data-versions.json`).  When versions differ,
 * the checker surfaces which files are outdated so the UI can notify the user.
 *
 * Terminology
 * -----------
 * - **master version**: the expected/latest version recorded in data-versions.json.
 * - **local version**:  the `dataVersion` field embedded inside each data file.
 *
 * A data file is considered *current* when its local version equals the master
 * version.  A file is *outdated* when the versions do not match — the user
 * should re-import that file via the XLSX importer to bring it up to date.
 */

import type { StageData } from '@/types/stage';
import type { EquipmentData } from '@/types/equipment';
import type { CharacterMathsData } from '@/types/character-data';
import type { TOMState } from '@/types/tom';
import type { SkillsMathsData } from '@/types/skills';
import type { SoulsData } from '@/types/souls';
import type { CubeOptimizerData } from '@/types/cube-optimizer';
import type { ConstellationData } from '@/types/constellation';
import type { CompanionsData } from '@/types/companions';
import type { FamiliarsMathsData } from '@/types/familiars';
import type { BlackOrbMathsData } from '@/types/black-orb';
import type { SpritesData } from '@/types/sprites';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Keys identifying each managed data file. */
export type DataFileKey =
  | 'stageData'
  | 'equipment'
  | 'characterMaths'
  | 'tomData'
  | 'skillsData'
  | 'soulsData'
  | 'cubeOptimizer'
  | 'constellationData'
  | 'companionsData'
  | 'familiarsData'
  | 'blackOrbData'
  | 'spritesData';

/** Minimal constraint — any versioned data file must carry this field. */
export interface VersionedDataFile {
  dataVersion: string;
}

/** Version check result for a single data file. */
export interface DataVersionStatus {
  /** Logical key identifying the data file. */
  key: DataFileKey;
  /** Expected version from data-versions.json. */
  masterVersion: string;
  /** Version embedded in the data file itself. */
  localVersion: string;
  /** True when localVersion === masterVersion. */
  isCurrent: boolean;
}

/** Aggregated result of checking all data files. */
export interface DataVersionCheckResult {
  /** True only when every data file is current. */
  allCurrent: boolean;
  /** Per-file statuses, one entry per DataFileKey. */
  statuses: DataVersionStatus[];
  /** Keys of files whose local version does not match the master version. */
  outdatedKeys: DataFileKey[];
}

// ---------------------------------------------------------------------------
// Master version registry
// ---------------------------------------------------------------------------

/**
 * Load the master version registry.
 * Cached after first load — subsequent calls are synchronous-equivalent.
 */
let masterVersionsCache: Record<DataFileKey, string> | null = null;

async function loadMasterVersions(): Promise<Record<DataFileKey, string>> {
  if (masterVersionsCache) return masterVersionsCache;
  const mod = await import('@/data/data-versions.json');
  masterVersionsCache = mod.default as unknown as Record<DataFileKey, string>;
  return masterVersionsCache;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Compare a single data file's local version against the master version.
 *
 * @param key           - The logical key for this data file.
 * @param masterVersion - Expected version from data-versions.json.
 * @param localVersion  - Version embedded in the loaded data file.
 */
export function compareVersions(
  key: DataFileKey,
  masterVersion: string,
  localVersion: string,
): DataVersionStatus {
  return {
    key,
    masterVersion,
    localVersion,
    isCurrent: localVersion === masterVersion,
  };
}

// ---------------------------------------------------------------------------
// Per-file version checks
// ---------------------------------------------------------------------------

/**
 * Check the version of a single data file.
 *
 * @param key  - The logical key identifying the data file.
 * @param data - The loaded data file (must implement VersionedDataFile).
 */
export async function checkFileVersion(
  key: DataFileKey,
  data: VersionedDataFile,
): Promise<DataVersionStatus> {
  const masterVersions = await loadMasterVersions();
  return compareVersions(key, masterVersions[key], data.dataVersion);
}

// ---------------------------------------------------------------------------
// Full check across all data files
// ---------------------------------------------------------------------------

/**
 * Load and version-check all 12 data files against the master registry.
 *
 * Each data file is loaded via a dynamic import (leveraging the existing
 * module-level cache in the bundler).  Results indicate which files are
 * current and which need to be refreshed.
 */
export async function checkAllDataVersions(): Promise<DataVersionCheckResult> {
  const masterVersions = await loadMasterVersions();

  const [
    stageDataMod,
    equipmentMod,
    characterMathsMod,
    tomDataMod,
    skillsDataMod,
    soulsDataMod,
    cubeOptimizerMod,
    constellationMod,
    companionsMod,
    familiarsMod,
    blackOrbMod,
    spritesMod,
  ] = await Promise.all([
    import('@/data/stage-data.json'),
    import('@/data/equipment.json'),
    import('@/data/character-maths-data.json'),
    import('@/data/tom-data.json'),
    import('@/data/skills-datamath.json'),
    import('@/data/souls-data.json'),
    import('@/data/cube-optimizer-data.json'),
    import('@/data/constellation-data.json'),
    import('@/data/companions-data.json'),
    import('@/data/familiars-maths-data.json'),
    import('@/data/black-orb-maths-data.json'),
    import('@/data/sprites.json'),
  ]);

  const files: Array<[DataFileKey, VersionedDataFile]> = [
    ['stageData', stageDataMod.default as unknown as StageData],
    ['equipment', equipmentMod.default as unknown as EquipmentData],
    ['characterMaths', characterMathsMod.default as unknown as CharacterMathsData],
    ['tomData', tomDataMod.default as unknown as TOMState],
    ['skillsData', skillsDataMod.default as unknown as SkillsMathsData],
    ['soulsData', soulsDataMod.default as unknown as SoulsData],
    ['cubeOptimizer', cubeOptimizerMod.default as unknown as CubeOptimizerData],
    ['constellationData', constellationMod.default as unknown as ConstellationData],
    ['companionsData', companionsMod.default as unknown as CompanionsData],
    ['familiarsData', familiarsMod.default as unknown as FamiliarsMathsData],
    ['blackOrbData', blackOrbMod.default as unknown as BlackOrbMathsData],
    ['spritesData', spritesMod.default as unknown as SpritesData],
  ];

  const statuses: DataVersionStatus[] = files.map(([key, data]) =>
    compareVersions(key, masterVersions[key], data.dataVersion),
  );

  const outdatedKeys = statuses.filter((s) => !s.isCurrent).map((s) => s.key);

  return {
    allCurrent: outdatedKeys.length === 0,
    statuses,
    outdatedKeys,
  };
}

/**
 * Convenience helper — returns true when all data files match the master version.
 */
export async function isAllDataCurrent(): Promise<boolean> {
  const result = await checkAllDataVersions();
  return result.allCurrent;
}
