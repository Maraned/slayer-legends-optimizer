/**
 * Indexed lookup helpers for stage data.
 *
 * All helpers are pure functions that transform the raw arrays from
 * stage-data.json into Record-based indexes for O(1) access.
 * Callers are responsible for memoising the results if needed.
 */

import type {
  Stage,
  StageIndex,
  StageSummary,
  StageSummaryIndex,
  Area,
  Zone,
  AreaId,
  ZoneId,
  StageBonusType,
} from '@/types';

/**
 * Convert a full Stage into a lightweight StageSummary (no mob details).
 */
export function stageToSummary(stage: Stage): StageSummary {
  return {
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
}

/**
 * Build an O(1) stage index keyed by stage id.
 *
 * @param stages - The STAGES array from stage-data.json
 */
export function buildStageIndex(stages: Stage[]): StageIndex {
  const index: StageIndex = {};
  for (const stage of stages) {
    index[stage.id] = stage;
  }
  return index;
}

/**
 * Build an O(1) lightweight summary index keyed by stage id.
 * Omits mob arrays to keep the index memory-efficient.
 *
 * @param stages - The STAGES array from stage-data.json
 */
export function buildStageSummaryIndex(stages: Stage[]): StageSummaryIndex {
  const index: StageSummaryIndex = {};
  for (const stage of stages) {
    index[stage.id] = stageToSummary(stage);
  }
  return index;
}

/**
 * Build an O(1) area index keyed by area id.
 *
 * @param areas - The AREAS array from stage-data.json
 */
export function buildAreaIndex(areas: Area[]): Record<AreaId, Area> {
  const index: Record<AreaId, Area> = {};
  for (const area of areas) {
    index[area.id] = area;
  }
  return index;
}

/**
 * Build an O(1) zone index keyed by zone id.
 *
 * @param zones - The ZONES array from stage-data.json
 */
export function buildZoneIndex(zones: Zone[]): Record<ZoneId, Zone> {
  const index: Record<ZoneId, Zone> = {};
  for (const zone of zones) {
    index[zone.id] = zone;
  }
  return index;
}

/**
 * Build a grouped index of stage summaries keyed by area id.
 * Useful for rendering area-level stage lists without full mob data.
 *
 * @param stages - The STAGES array from stage-data.json
 */
export function buildSummariesByAreaIndex(
  stages: Stage[],
): Record<AreaId, StageSummary[]> {
  const index: Record<AreaId, StageSummary[]> = {};
  for (const stage of stages) {
    const { areaId } = stage;
    if (!index[areaId]) {
      index[areaId] = [];
    }
    index[areaId].push(stageToSummary(stage));
  }
  return index;
}

/**
 * Build a grouped index of stage summaries keyed by zone id.
 * Useful for rendering zone-level stage lists without full mob data.
 *
 * @param stages - The STAGES array from stage-data.json
 */
export function buildSummariesByZoneIndex(
  stages: Stage[],
): Record<ZoneId, StageSummary[]> {
  const index: Record<ZoneId, StageSummary[]> = {};
  for (const stage of stages) {
    const { zoneId } = stage;
    if (!index[zoneId]) {
      index[zoneId] = [];
    }
    index[zoneId].push(stageToSummary(stage));
  }
  return index;
}

/**
 * Build a grouped index of stage summaries keyed by bonus type.
 * A stage appears once per distinct bonus type it contains.
 * Useful for filtering stages by farming goal (EXP, Gold, etc.).
 *
 * @param stages - The STAGES array from stage-data.json
 */
export function buildSummariesByBonusTypeIndex(
  stages: Stage[],
): Partial<Record<StageBonusType, StageSummary[]>> {
  const index: Partial<Record<StageBonusType, StageSummary[]>> = {};
  for (const stage of stages) {
    const summary = stageToSummary(stage);
    for (const bonus of stage.bonuses) {
      if (!index[bonus.type]) {
        index[bonus.type] = [];
      }
      index[bonus.type]!.push(summary);
    }
  }
  return index;
}
