/**
 * Enhancement cost calculator for the Gold Enhancement Calculator.
 *
 * Implements the segment-based gold cost formula used by the game.
 * Enhancement levels are divided into segments of SEGMENT_SIZE levels each.
 * Each segment uses its own J multiplier (equal to the segment index), which
 * grows the quartic cost term and provides the increasing difficulty scaling
 * observed at every 5,000-level threshold.
 */

/** Number of levels covered by each cost segment. */
export const SEGMENT_SIZE = 5000;

/**
 * Computes the cumulative gold cost to enhance a stat from level 0 to level N
 * within a single segment, using the degree-5 polynomial closed-form formula.
 *
 * Formula:
 *   CumulativeCost(N) =
 *     J * (N*(N+1)*(2*N+1)*(3*N^2+3*N-1)) / (100^4 * 30)
 *     + (N*(N+1)/2)^2 / 100^2
 *     + (N*(N+1)/2) / 100
 *
 * The three terms correspond to the closed-form sums:
 *   - Σ(n=1..N) of (n/100)^4  scaled by J   (quartic term)
 *   - Σ(n=1..N) of (n/100)^3               (cubic term, via (Σn)^2)
 *   - Σ(n=1..N) of (n/100)                  (linear term)
 *
 * @param N - Local enhancement level within the segment (non-negative integer).
 *            Returns 0 for N ≤ 0.
 * @param J - Scaling coefficient for the quartic term (equals segment index).
 * @returns  Cumulative gold cost to reach local level N from local level 0.
 */
export function cumulativeCost(N: number, J: number): number {
  if (N <= 0) return 0;

  const triangular = (N * (N + 1)) / 2; // Σ n from 1..N

  const term1 =
    (J * (N * (N + 1) * (2 * N + 1) * (3 * N * N + 3 * N - 1))) /
    (1e8 * 30); // 100^4 * 30

  const term2 = (triangular * triangular) / 1e4; // (Σ n)^2 / 100^2

  const term3 = triangular / 100; // Σ n / 100

  return term1 + term2 + term3;
}

/**
 * Calculates the total gold cost to enhance a stat from `fromLevel` to
 * `toLevel` across potentially multiple cost segments.
 *
 * `fromLevel` is the current (already-reached) level and is NOT paid for.
 * `toLevel` is the target level and IS paid for.  Equivalently, the function
 * sums the step costs for each level in the range (fromLevel, toLevel].
 *
 * Enhancement levels are divided into segments of SEGMENT_SIZE (5,000) levels.
 * The J multiplier for each segment equals its 0-based index, providing an
 * inline computation that increases at every 5,000-level threshold — no lookup
 * table required.  Up to 388 segments cover the full game level range (~1.94M).
 *
 * @param fromLevel - Starting enhancement level (exclusive lower bound, ≥ 0).
 * @param toLevel   - Target enhancement level (inclusive upper bound).
 * @returns Total gold cost, or 0 for invalid/empty ranges.
 */
export function segmentCost(fromLevel: number, toLevel: number): number {
  if (toLevel <= 0 || fromLevel >= toLevel) return 0;

  const clampedFrom = Math.max(0, fromLevel);
  if (clampedFrom >= toLevel) return 0;

  // The enhancement that reaches absolute level L belongs to segment
  // floor((L-1) / SEGMENT_SIZE) — so fromLevel determines the starting
  // segment and (toLevel-1) determines the ending segment.
  const startSeg = Math.floor(clampedFrom / SEGMENT_SIZE);
  const endSeg = Math.floor((toLevel - 1) / SEGMENT_SIZE);

  let total = 0;

  for (let seg = startSeg; seg <= endSeg; seg++) {
    const segBase = seg * SEGMENT_SIZE;
    const J = seg; // J equals segment index

    // Local position within this segment for the start and end of the range.
    // Non-starting segments begin at local 0; non-ending segments consume all
    // SEGMENT_SIZE enhancements.
    const localFrom = seg === startSeg ? clampedFrom - segBase : 0;
    const localTo = seg === endSeg ? toLevel - segBase : SEGMENT_SIZE;

    total += cumulativeCost(localTo, J) - cumulativeCost(localFrom, J);
  }

  return total;
}
