/**
 * xlsx-parser.ts
 *
 * Parses XLSX spreadsheet files and converts them to the typed game-data
 * structures used by the Slayer Legends Optimizer.
 *
 * Supported sheet names and their target types:
 *   "StageData"       → StageData  (STAGES + reconstructed AREAS/ZONES)
 *   "LevelMultipliers"→ EquipmentData.levelMultipliers
 *   "CostFactors"     → EquipmentData.costFactors  (first data row = globals,
 *                        subsequent rows = threshold bands)
 *   "SlayerLevel"     → CharacterMathsData.SLAYER_LEVEL
 *   "Promotion"       → CharacterMathsData.PROMOTION
 *   "PromotionBonus"  → CharacterMathsData.PROMOTION_BONUS
 *   "GrowthKnowledge" → CharacterMathsData.GROWTH_KNOWLEDGE
 *
 * SECURITY NOTE: The xlsx (SheetJS) community package has a known prototype-
 * pollution vulnerability (GHSA-4r6h-8v6p-xvw6). This parser mitigates risk
 * by using read-only mode, disabling formula evaluation, and sanitising every
 * cell value before use. Only import XLSX files from trusted sources.
 *
 * Stage XLSX column layout (43 columns, matches generate-stage-data.mjs):
 *  A  StageId          B  AreaNum        C  AreaName
 *  D  ZoneNum          E  ZoneName       F  StageNum
 *  G  Label            H  RecLevel       I  EnergyCost
 *  J  Mob1Name         K  Mob1HP         L  Mob1ATK
 *  M  Mob1DEF          N  Mob1Speed      O  Mob1Element
 *  P  Mob1Count        Q  Mob1EXP        R  Mob1Gold
 *  S  Mob1Drop1Item    T  Mob1Drop1Rate  U  Mob1Drop2Item
 *  V  Mob1Drop2Rate    W  Mob2Name       X  Mob2HP
 *  Y  Mob2ATK          Z  Mob2DEF        AA Mob2Speed
 *  AB Mob2Element      AC Mob2Count      AD Mob2EXP
 *  AE Mob2Gold         AF Mob2Drop1Item  AG Mob2Drop1Rate
 *  AH Mob2Drop2Item    AI Mob2Drop2Rate  AJ Bonus1Type
 *  AK Bonus1Mult       AL Bonus2Type     AM Bonus2Mult
 *  AN Bonus3Type       AO Bonus3Mult     AP HasBoss
 *  AQ StageTier
 */

import * as XLSX from 'xlsx';

import type {
  Stage,
  Area,
  Zone,
  StageData,
  Mob,
  MobDrop,
  StageBonus,
  StageBonusType,
  Element,
} from '@/types/stage';
import type {
  EquipmentData,
  LevelMultiplier,
  CostThreshold,
} from '@/types/equipment';
import type {
  CharacterMathsData,
  SlayerLevelEntry,
  PromotionEntry,
  PromotionBonusEntry,
  GrowthKnowledgeEntry,
} from '@/types/character-data';

// ---------------------------------------------------------------------------
// Public result types
// ---------------------------------------------------------------------------

export type ParsedDataType =
  | 'stage'
  | 'equipment'
  | 'characterMaths'
  | 'mixed';

export interface XlsxParseResult {
  /** Which top-level data categories were found in the file */
  type: ParsedDataType;
  /** Parsed stage data, present when the "StageData" sheet exists */
  stageData?: StageData;
  /** Parsed equipment data, present when LevelMultipliers/CostFactors sheets exist */
  equipmentData?: EquipmentData;
  /** Parsed character maths data, present when any character sheet exists */
  characterMathsData?: Partial<CharacterMathsData>;
  /** Non-fatal warnings (skipped rows, unknown values, etc.) */
  warnings: string[];
  /** Fatal parse errors per sheet */
  errors: string[];
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Safely convert a raw cell value to a string, guarding against object injection. */
function cellStr(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  // Disallow objects to guard against prototype pollution payloads
  return '';
}

/** Safely convert a raw cell value to a finite number, or null on failure. */
function cellNum(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = Number(value.trim());
    if (isFinite(n)) return n;
  }
  return null;
}

/** Convert 0/1/"0"/"1"/false/true to boolean, defaulting to false. */
function cellBool(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  const n = cellNum(value);
  if (n !== null) return n !== 0;
  const s = cellStr(value).toLowerCase();
  return s === 'true' || s === 'yes' || s === '1';
}

const VALID_ELEMENTS = new Set<string>([
  'Fire',
  'Water',
  'Earth',
  'Wind',
  'Light',
  'Dark',
  'None',
]);

function cellElement(value: unknown): Element {
  const s = cellStr(value);
  return VALID_ELEMENTS.has(s) ? (s as Element) : 'None';
}

const VALID_BONUS_TYPES = new Set<string>([
  'EXP Boost',
  'Gold Boost',
  'Drop Rate Boost',
  'Rare Drop Boost',
  'ATK Boost',
  'DEF Boost',
  'HP Boost',
]);

function cellBonusType(value: unknown): StageBonusType | null {
  const s = cellStr(value);
  return VALID_BONUS_TYPES.has(s) ? (s as StageBonusType) : null;
}

function makeItemId(itemName: string): string {
  return itemName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
}

// ---------------------------------------------------------------------------
// Stage sheet parser
// ---------------------------------------------------------------------------

/**
 * Parses the "StageData" sheet.
 *
 * Expects a header row followed by one row per stage (43 columns each).
 * AREAS and ZONES are reconstructed from the stage rows — the sheet does not
 * need separate area/zone sections.
 */
function parseStageSheet(
  rows: unknown[][],
  warnings: string[],
): StageData | null {
  if (rows.length < 2) {
    warnings.push('StageData: sheet is empty or has no data rows');
    return null;
  }

  const stages: Stage[] = [];
  const areaMap = new Map<string, Area>();
  const zoneMap = new Map<string, Zone>();

  // Row 0 is the header — skip it
  for (let ri = 1; ri < rows.length; ri++) {
    const row = rows[ri];
    if (!row || row.length < 43) {
      warnings.push(`StageData: row ${ri + 1} has fewer than 43 columns — skipped`);
      continue;
    }

    // Columns A–AQ (0-indexed 0–42)
    const stageId = cellNum(row[0]);
    if (stageId === null) continue; // blank row

    const areaNum = cellNum(row[1]) ?? 0;
    const areaName = cellStr(row[2]);
    const zoneNum = cellNum(row[3]) ?? 0;
    const zoneName = cellStr(row[4]);
    const stageNum = cellNum(row[5]) ?? 0;
    const label = cellStr(row[6]);
    const recommendedLevel = cellNum(row[7]) ?? 1;
    const energyCost = cellNum(row[8]) ?? 1;

    const areaId = `area_${String(areaNum).padStart(2, '0')}`;
    const zoneId = `${areaId}_z${String(zoneNum).padStart(2, '0')}`;

    // Mob 1
    const mob1Name = cellStr(row[9]);
    const mob1: Mob = {
      id: `mob_${makeItemId(mob1Name)}_${stageId}`,
      name: mob1Name,
      stats: {
        hp: cellNum(row[10]) ?? 0,
        atk: cellNum(row[11]) ?? 0,
        def: cellNum(row[12]) ?? 0,
        speed: cellNum(row[13]) ?? 0,
        element: cellElement(row[14]),
      },
      count: cellNum(row[15]) ?? 1,
      expReward: cellNum(row[16]) ?? 0,
      goldReward: cellNum(row[17]) ?? 0,
      drops: buildDrops(
        cellStr(row[18]),
        cellNum(row[19]),
        cellStr(row[20]),
        cellNum(row[21]),
      ),
      isBoss: false,
    };

    // Mob 2
    const mob2Name = cellStr(row[22]);
    const isBossStage = cellBool(row[41]);
    const mob2: Mob = {
      id: `mob_${makeItemId(mob2Name)}_${stageId}`,
      name: mob2Name,
      stats: {
        hp: cellNum(row[23]) ?? 0,
        atk: cellNum(row[24]) ?? 0,
        def: cellNum(row[25]) ?? 0,
        speed: cellNum(row[26]) ?? 0,
        element: cellElement(row[27]),
      },
      count: cellNum(row[28]) ?? 1,
      expReward: cellNum(row[29]) ?? 0,
      goldReward: cellNum(row[30]) ?? 0,
      drops: buildDrops(
        cellStr(row[31]),
        cellNum(row[32]),
        cellStr(row[33]),
        cellNum(row[34]),
      ),
      isBoss: isBossStage,
    };

    // Bonuses (up to 3)
    const bonuses: StageBonus[] = [];
    for (let bi = 0; bi < 3; bi++) {
      const typeRaw = cellBonusType(row[35 + bi * 2]);
      const mult = cellNum(row[36 + bi * 2]);
      if (typeRaw !== null && mult !== null) {
        bonuses.push({ type: typeRaw, multiplier: mult });
      }
    }

    stages.push({
      id: stageId,
      label,
      areaId,
      areaName,
      zoneId,
      zoneName,
      stageNumber: stageNum,
      energyCost,
      mobs: [mob1, mob2],
      bonuses,
      hasBoss: isBossStage,
      recommendedLevel,
    });

    // Build zone/area metadata
    if (!zoneMap.has(zoneId)) {
      zoneMap.set(zoneId, {
        id: zoneId,
        areaId,
        name: zoneName,
        stageCount: 0,
        firstStageId: stageId,
      });
    }
    const zone = zoneMap.get(zoneId)!;
    zone.stageCount += 1;

    if (!areaMap.has(areaId)) {
      areaMap.set(areaId, { id: areaId, name: areaName, zones: [] });
    }
  }

  // Attach zones to areas (preserving insertion order)
  for (const zone of zoneMap.values()) {
    const area = areaMap.get(zone.areaId);
    if (area) area.zones.push(zone);
  }

  return {
    STAGES: stages,
    AREAS: Array.from(areaMap.values()),
    ZONES: Array.from(zoneMap.values()),
  };
}

function buildDrops(
  item1: string,
  rate1: number | null,
  item2: string,
  rate2: number | null,
): MobDrop[] {
  const drops: MobDrop[] = [];
  if (item1) {
    drops.push({
      itemId: makeItemId(item1),
      itemName: item1,
      dropRate: rate1 ?? 0,
      minQty: 1,
      maxQty: 3,
    });
  }
  if (item2) {
    drops.push({
      itemId: makeItemId(item2),
      itemName: item2,
      dropRate: rate2 ?? 0,
      minQty: 1,
      maxQty: 2,
    });
  }
  return drops;
}

// ---------------------------------------------------------------------------
// Equipment sheet parsers
// ---------------------------------------------------------------------------

/**
 * Parses the "LevelMultipliers" sheet.
 *
 * Expected columns: Level | AtkMultiplier | HpMultiplier | GoldCost
 */
function parseLevelMultipliersSheet(
  rows: unknown[][],
  warnings: string[],
): LevelMultiplier[] {
  const result: LevelMultiplier[] = [];
  for (let ri = 1; ri < rows.length; ri++) {
    const row = rows[ri];
    if (!row || row.length < 4) continue;
    const level = cellNum(row[0]);
    if (level === null) continue;
    const atkMultiplier = cellNum(row[1]);
    const hpMultiplier = cellNum(row[2]);
    const goldCost = cellNum(row[3]);
    if (atkMultiplier === null || hpMultiplier === null || goldCost === null) {
      warnings.push(`LevelMultipliers: row ${ri + 1} has missing numeric values — skipped`);
      continue;
    }
    result.push({ level, atkMultiplier, hpMultiplier, goldCost });
  }
  return result;
}

/**
 * Parses the "CostFactors" sheet.
 *
 * Expected layout:
 *   Row 1 (header): BaseGoldCost | GoldGrowthRate | FromLevel | ToLevel | GoldMultiplier
 *   Row 2         : global values (BaseGoldCost, GoldGrowthRate) + first threshold band
 *   Row 3+        : additional threshold bands (columns C-E only)
 */
function parseCostFactorsSheet(
  rows: unknown[][],
  warnings: string[],
): EquipmentData['costFactors'] | null {
  if (rows.length < 2) {
    warnings.push('CostFactors: sheet has no data rows');
    return null;
  }

  const firstData = rows[1];
  if (!firstData || firstData.length < 2) {
    warnings.push('CostFactors: first data row is empty or too short');
    return null;
  }

  const baseGoldCost = cellNum(firstData[0]);
  const goldGrowthRate = cellNum(firstData[1]);

  if (baseGoldCost === null || goldGrowthRate === null) {
    warnings.push('CostFactors: could not read BaseGoldCost / GoldGrowthRate');
    return null;
  }

  const thresholds: CostThreshold[] = [];
  for (let ri = 1; ri < rows.length; ri++) {
    const row = rows[ri];
    if (!row || row.length < 5) continue;
    const fromLevel = cellNum(row[2]);
    const toLevel = cellNum(row[3]);
    const goldMultiplier = cellNum(row[4]);
    if (fromLevel === null || toLevel === null || goldMultiplier === null) continue;
    thresholds.push({ fromLevel, toLevel, goldMultiplier });
  }

  return { baseGoldCost, goldGrowthRate, thresholds };
}

// ---------------------------------------------------------------------------
// Character maths sheet parsers
// ---------------------------------------------------------------------------

/**
 * Parses the "SlayerLevel" sheet.
 *
 * Expected columns: Level | ExpRequired
 */
function parseSlayerLevelSheet(
  rows: unknown[][],
  warnings: string[],
): SlayerLevelEntry[] {
  const result: SlayerLevelEntry[] = [];
  for (let ri = 1; ri < rows.length; ri++) {
    const row = rows[ri];
    if (!row || row.length < 2) continue;
    const level = cellNum(row[0]);
    const expRequired = cellNum(row[1]);
    if (level === null || expRequired === null) {
      warnings.push(`SlayerLevel: row ${ri + 1} has invalid values — skipped`);
      continue;
    }
    result.push({ level, expRequired });
  }
  return result;
}

/**
 * Parses the "Promotion" sheet.
 *
 * Expected columns: Tier | Rank | AtkBonus | HpBonus
 */
function parsePromotionSheet(
  rows: unknown[][],
  warnings: string[],
): PromotionEntry[] {
  const result: PromotionEntry[] = [];
  for (let ri = 1; ri < rows.length; ri++) {
    const row = rows[ri];
    if (!row || row.length < 4) continue;
    const tier = cellNum(row[0]);
    const rank = cellStr(row[1]);
    const atkBonus = cellNum(row[2]);
    const hpBonus = cellNum(row[3]);
    if (tier === null || atkBonus === null || hpBonus === null) {
      warnings.push(`Promotion: row ${ri + 1} has invalid values — skipped`);
      continue;
    }
    result.push({ tier, rank, atkBonus, hpBonus });
  }
  return result;
}

/**
 * Parses the "PromotionBonus" sheet.
 *
 * Expected columns: Tier | ExtraAtkPercent | MonsterGoldPercent
 */
function parsePromotionBonusSheet(
  rows: unknown[][],
  warnings: string[],
): PromotionBonusEntry[] {
  const result: PromotionBonusEntry[] = [];
  for (let ri = 1; ri < rows.length; ri++) {
    const row = rows[ri];
    if (!row || row.length < 3) continue;
    const tier = cellNum(row[0]);
    const extraAtkPercent = cellNum(row[1]);
    const monsterGoldPercent = cellNum(row[2]);
    if (tier === null || extraAtkPercent === null || monsterGoldPercent === null) {
      warnings.push(`PromotionBonus: row ${ri + 1} has invalid values — skipped`);
      continue;
    }
    result.push({ tier, extraAtkPercent, monsterGoldPercent });
  }
  return result;
}

/**
 * Parses the "GrowthKnowledge" sheet.
 *
 * Expected columns: Grade | AtkEffectMultiplier
 */
function parseGrowthKnowledgeSheet(
  rows: unknown[][],
  warnings: string[],
): GrowthKnowledgeEntry[] {
  const result: GrowthKnowledgeEntry[] = [];
  for (let ri = 1; ri < rows.length; ri++) {
    const row = rows[ri];
    if (!row || row.length < 2) continue;
    const grade = cellNum(row[0]);
    const atkEffectMultiplier = cellNum(row[1]);
    if (grade === null || atkEffectMultiplier === null) {
      warnings.push(`GrowthKnowledge: row ${ri + 1} has invalid values — skipped`);
      continue;
    }
    result.push({ grade, atkEffectMultiplier });
  }
  return result;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Sheet name aliases accepted by the parser (case-insensitive).
 * Maps each canonical name to the parser that should handle it.
 */
const SHEET_ALIASES: Record<string, string> = {
  stagedata: 'StageData',
  stage_data: 'StageData',
  stages: 'StageData',
  levelmultipliers: 'LevelMultipliers',
  level_multipliers: 'LevelMultipliers',
  costfactors: 'CostFactors',
  cost_factors: 'CostFactors',
  slayerlevel: 'SlayerLevel',
  slayer_level: 'SlayerLevel',
  slayerlevels: 'SlayerLevel',
  promotion: 'Promotion',
  promotions: 'Promotion',
  promotionbonus: 'PromotionBonus',
  promotion_bonus: 'PromotionBonus',
  promotionbonuses: 'PromotionBonus',
  growthknowledge: 'GrowthKnowledge',
  growth_knowledge: 'GrowthKnowledge',
};

function canonicalSheetName(raw: string): string | null {
  return SHEET_ALIASES[raw.toLowerCase().replace(/\s+/g, '')] ?? null;
}

/**
 * Parse an XLSX file from an ArrayBuffer and return structured game data.
 *
 * @param buffer - Raw bytes of the .xlsx file
 * @returns Parsed data, errors, and warnings
 *
 * @example
 * // Browser
 * const file = event.target.files[0];
 * const buffer = await file.arrayBuffer();
 * const result = parseXlsxBuffer(buffer);
 * if (result.stageData) updateStageData(result.stageData);
 *
 * @example
 * // Node.js (scripts)
 * import { readFileSync } from 'fs';
 * const buffer = readFileSync('data-update.xlsx').buffer;
 * const result = parseXlsxBuffer(buffer);
 */
export function parseXlsxBuffer(buffer: ArrayBuffer): XlsxParseResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, {
      type: 'array',
      // Disable formula evaluation to avoid prototype pollution via crafted formulas
      cellFormula: false,
      cellHTML: false,
      // Parse dates as numbers rather than Date objects (consistent behaviour)
      cellDates: false,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Failed to read XLSX file: ${msg}`);
    return { type: 'mixed', warnings, errors };
  }

  let stageData: StageData | undefined;
  let levelMultipliers: LevelMultiplier[] | undefined;
  let costFactors: EquipmentData['costFactors'] | undefined;
  const charData: Partial<CharacterMathsData> = {};

  for (const rawName of workbook.SheetNames) {
    const canonical = canonicalSheetName(rawName);
    if (!canonical) {
      warnings.push(`Unknown sheet "${rawName}" — skipped`);
      continue;
    }

    const ws = workbook.Sheets[rawName];
    // Convert to array of arrays; raw values, no formatting
    const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, {
      header: 1,
      defval: null,
      raw: true,
    }) as unknown[][];

    switch (canonical) {
      case 'StageData':
        stageData = parseStageSheet(rows, warnings) ?? undefined;
        if (!stageData) errors.push(`StageData: failed to parse sheet "${rawName}"`);
        break;

      case 'LevelMultipliers':
        levelMultipliers = parseLevelMultipliersSheet(rows, warnings);
        break;

      case 'CostFactors':
        costFactors = parseCostFactorsSheet(rows, warnings) ?? undefined;
        break;

      case 'SlayerLevel':
        charData.SLAYER_LEVEL = parseSlayerLevelSheet(rows, warnings);
        break;

      case 'Promotion':
        charData.PROMOTION = parsePromotionSheet(rows, warnings);
        break;

      case 'PromotionBonus':
        charData.PROMOTION_BONUS = parsePromotionBonusSheet(rows, warnings);
        break;

      case 'GrowthKnowledge':
        charData.GROWTH_KNOWLEDGE = parseGrowthKnowledgeSheet(rows, warnings);
        break;
    }
  }

  // Compose equipment data if any equipment sheet was present
  let equipmentData: EquipmentData | undefined;
  if (levelMultipliers !== undefined || costFactors !== undefined) {
    if (!levelMultipliers) {
      warnings.push('EquipmentData: LevelMultipliers sheet not found; equipment data is incomplete');
    }
    if (!costFactors) {
      warnings.push('EquipmentData: CostFactors sheet not found; equipment data is incomplete');
    }
    if (levelMultipliers && costFactors) {
      equipmentData = { levelMultipliers, costFactors };
    }
  }

  // Determine top-level type label
  const hasStage = stageData !== undefined;
  const hasEquipment = equipmentData !== undefined;
  const hasChar = Object.keys(charData).length > 0;

  const typeCount = [hasStage, hasEquipment, hasChar].filter(Boolean).length;
  let type: ParsedDataType;
  if (typeCount === 0) {
    type = 'mixed'; // nothing recognised
  } else if (typeCount > 1) {
    type = 'mixed';
  } else if (hasStage) {
    type = 'stage';
  } else if (hasEquipment) {
    type = 'equipment';
  } else {
    type = 'characterMaths';
  }

  return {
    type,
    stageData,
    equipmentData,
    characterMathsData: hasChar ? charData : undefined,
    warnings,
    errors,
  };
}

/**
 * Convenience wrapper for Node.js environments that have a Buffer from
 * `fs.readFileSync`.  Converts it to an ArrayBuffer before parsing.
 */
export function parseXlsxFile(fileBuffer: Buffer): XlsxParseResult {
  const ab = fileBuffer.buffer.slice(
    fileBuffer.byteOffset,
    fileBuffer.byteOffset + fileBuffer.byteLength,
  ) as ArrayBuffer;
  return parseXlsxBuffer(ab);
}
