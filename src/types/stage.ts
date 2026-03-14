/**
 * Stage data type definitions.
 * Matches the structure of src/data/stage-data.json.
 *
 * The spreadsheet source has 43 columns per stage row:
 *   cols 1-9   : stage identification & properties
 *   cols 10-22 : regular mob (Mob1) stats and drops
 *   cols 23-35 : boss/elite mob (Mob2) stats and drops
 *   cols 36-41 : stage bonus modifiers (up to 3)
 *   cols 42-43 : boss flag & stage tier
 */

/**
 * Top-level area (world/continent) identifiers.
 * Stages are grouped first by area, then by zone.
 */
export type AreaId = string;

/**
 * Zone identifiers within an area (e.g. "area_01_z03").
 */
export type ZoneId = string;

/**
 * Element types for mobs and gear interactions.
 */
export type Element =
  | 'Fire'
  | 'Water'
  | 'Earth'
  | 'Wind'
  | 'Light'
  | 'Dark'
  | 'None';

/**
 * Combat stats for a mob.
 */
export interface MobStats {
  /** Maximum HP of the mob */
  hp: number;
  /** Base attack damage */
  atk: number;
  /** Defense / damage reduction */
  def: number;
  /** Movement / action speed */
  speed: number;
  /** Elemental affinity */
  element: Element;
}

/**
 * A single item that a mob can drop, with its associated probability.
 */
export interface MobDrop {
  /** Canonical item identifier (snake_case) */
  itemId: string;
  /** Display name of the item */
  itemName: string;
  /** Drop probability in the range [0, 1] */
  dropRate: number;
  /** Minimum quantity dropped when the drop triggers */
  minQty: number;
  /** Maximum quantity dropped when the drop triggers */
  maxQty: number;
}

/**
 * A single mob (enemy) that appears in a stage.
 */
export interface Mob {
  /** Unique mob identifier scoped to the stage (e.g. "mob_vine_crawler_1") */
  id: string;
  /** Display name */
  name: string;
  /** Combat stats */
  stats: MobStats;
  /** Items this mob can drop */
  drops: MobDrop[];
  /** EXP rewarded on kill */
  expReward: number;
  /** Gold rewarded on kill */
  goldReward: number;
  /** Number of this mob that appear in the stage */
  count: number;
  /** Whether this mob is the stage boss */
  isBoss: boolean;
}

/**
 * Bonus type specific to a stage (not tied to clothing items).
 * These can stack with AppearanceBonusTotals at runtime.
 */
export type StageBonusType =
  | 'EXP Boost'
  | 'Gold Boost'
  | 'Drop Rate Boost'
  | 'Rare Drop Boost'
  | 'ATK Boost'
  | 'DEF Boost'
  | 'HP Boost';

/**
 * A single stage-level bonus modifier.
 */
export interface StageBonus {
  /** The stat being boosted */
  type: StageBonusType;
  /**
   * Multiplier value (e.g. 1.5 = +50%).
   * Values > 1 are bonuses; values < 1 are penalties.
   */
  multiplier: number;
}

/**
 * Full data for a single stage.
 * There are 2000+ stages indexed by their numeric `id`.
 */
export interface Stage {
  /** Unique numeric stage identifier (1-based, sequential across all areas) */
  id: number;
  /** Human-readable stage label (e.g. "3-2-7" for area 3, zone 2, stage 7) */
  label: string;
  /** Area this stage belongs to */
  areaId: AreaId;
  /** Display name of the area */
  areaName: string;
  /** Zone within the area */
  zoneId: ZoneId;
  /** Display name of the zone */
  zoneName: string;
  /** Sequential stage number within the zone (1-based) */
  stageNumber: number;
  /** Stamina / energy cost to attempt the stage */
  energyCost: number;
  /** All mobs that appear in this stage */
  mobs: Mob[];
  /** Stage-level bonus modifiers */
  bonuses: StageBonus[];
  /** Whether this stage has a boss encounter */
  hasBoss: boolean;
  /** Recommended player level to attempt this stage */
  recommendedLevel: number;
}

/**
 * Lightweight stage summary for list views and stage-selection UIs.
 * Omits mob details to keep 2000+ entry indexes fast to load.
 */
export interface StageSummary {
  id: number;
  label: string;
  areaId: AreaId;
  areaName: string;
  zoneId: ZoneId;
  zoneName: string;
  stageNumber: number;
  energyCost: number;
  hasBoss: boolean;
  recommendedLevel: number;
  /** Aggregated bonus types present, for quick filtering */
  bonusTypes: StageBonusType[];
}

/**
 * Area metadata, grouping zones and their stages.
 */
export interface Area {
  id: AreaId;
  name: string;
  /** Ordered list of zones within this area */
  zones: Zone[];
}

/**
 * Zone metadata within an area.
 */
export interface Zone {
  id: ZoneId;
  areaId: AreaId;
  name: string;
  /** Total number of stages in this zone */
  stageCount: number;
  /** Stage id of the first stage in this zone */
  firstStageId: number;
}

/**
 * Root shape of stage-data.json.
 */
export interface StageData {
  /** All 2000 stage entries ordered by id */
  STAGES: Stage[];
  /** All 20 area definitions (each contains its zones) */
  AREAS: Area[];
  /** Flat list of all 200 zones across all areas */
  ZONES: Zone[];
}

/**
 * Top-level stage index keyed by stage id for O(1) lookup.
 * Populated at build time from the stage data source.
 */
export type StageIndex = Record<number, Stage>;

/**
 * Summary index keyed by stage id — lighter weight than StageIndex.
 */
export type StageSummaryIndex = Record<number, StageSummary>;
