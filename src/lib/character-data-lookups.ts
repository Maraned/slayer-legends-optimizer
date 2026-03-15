/**
 * Indexed lookup helpers for character maths data.
 *
 * All helpers are pure functions that transform the raw arrays from
 * character-maths-data.json into Record-based indexes for O(1) access.
 * Callers are responsible for memoising the results if needed.
 */

import type {
  SlayerLevelEntry,
  PromotionEntry,
  PromotionBonusEntry,
  GrowthKnowledgeEntry,
} from '@/types';

/**
 * Build an O(1) slayer level index keyed by level number (1–4002).
 *
 * @param entries - The SLAYER_LEVEL array from character-maths-data.json
 */
export function buildSlayerLevelIndex(
  entries: SlayerLevelEntry[],
): Record<number, SlayerLevelEntry> {
  const index: Record<number, SlayerLevelEntry> = {};
  for (const entry of entries) {
    index[entry.level] = entry;
  }
  return index;
}

/**
 * Build an O(1) promotion index keyed by tier number (1–10).
 *
 * @param entries - The PROMOTION array from character-maths-data.json
 */
export function buildPromotionIndex(
  entries: PromotionEntry[],
): Record<number, PromotionEntry> {
  const index: Record<number, PromotionEntry> = {};
  for (const entry of entries) {
    index[entry.tier] = entry;
  }
  return index;
}

/**
 * Build an O(1) promotion bonus index keyed by tier number (1–10).
 *
 * @param entries - The PROMOTION_BONUS array from character-maths-data.json
 */
export function buildPromotionBonusIndex(
  entries: PromotionBonusEntry[],
): Record<number, PromotionBonusEntry> {
  const index: Record<number, PromotionBonusEntry> = {};
  for (const entry of entries) {
    index[entry.tier] = entry;
  }
  return index;
}

/**
 * Build an O(1) growing knowledge index keyed by grade (1–91).
 *
 * @param entries - The GROWTH_KNOWLEDGE array from character-maths-data.json
 */
export function buildGrowthKnowledgeIndex(
  entries: GrowthKnowledgeEntry[],
): Record<number, GrowthKnowledgeEntry> {
  const index: Record<number, GrowthKnowledgeEntry> = {};
  for (const entry of entries) {
    index[entry.grade] = entry;
  }
  return index;
}
