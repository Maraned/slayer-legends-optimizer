/**
 * Indexed lookup helpers for equipment data.
 *
 * All helpers are pure functions that transform the raw arrays from
 * equipment.json into Record-based indexes for O(1) access.
 * Callers are responsible for memoising the results if needed.
 */

import type { LevelMultiplier } from '@/types';

/**
 * Build an O(1) level multiplier index keyed by enhancement level (1–1400).
 *
 * @param multipliers - The levelMultipliers array from equipment.json
 */
export function buildLevelMultiplierIndex(
  multipliers: LevelMultiplier[],
): Record<number, LevelMultiplier> {
  const index: Record<number, LevelMultiplier> = {};
  for (const entry of multipliers) {
    index[entry.level] = entry;
  }
  return index;
}
