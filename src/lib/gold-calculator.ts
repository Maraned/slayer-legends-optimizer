/**
 * Computes the cumulative gold cost to enhance a stat from level 0 to level N
 * using the degree-5 polynomial closed-form formula.
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
 * @param N - Target enhancement level (non-negative integer).
 *            Returns 0 for N ≤ 0.
 * @param J - Scaling coefficient for the quartic term (game-data constant,
 *            e.g. a stat-specific base cost factor).
 * @returns  Total gold cost to reach level N from level 0.
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
