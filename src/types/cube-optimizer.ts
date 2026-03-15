/**
 * Type definitions for cube-optimizer-data.json.
 */

/** A single weapon entry in the cube optimizer data. */
export interface CubeWeapon {
  id: string;
  name: string;
  tier: string;
  maxLevel: number;
  baseAtk: number;
  critDmgBonusPct: number;
  cubeCostBase: number;
  cubeCostGrowthRate: number;
  cubeCostPerLevel: number;
}

/** A single class entry in the cube optimizer data. */
export interface CubeClass {
  id: string;
  name: string;
  element: string;
  description: string;
  maxLevel: number;
  atkBonusPctPerLevel: number;
  critDmgBonusPctPerLevel: number;
  cubeCostBase: number;
  cubeCostGrowthRate: number;
  cubeCostPerLevel: number;
}

/** Root shape of cube-optimizer-data.json. */
export interface CubeOptimizerData {
  /** Semantic version of this data file (e.g. "1.0.0"). */
  dataVersion: string;
  /** All weapon definitions used in cube optimization */
  WEAPONS: CubeWeapon[];
  /** All class definitions with their stat bonuses */
  CLASSES: CubeClass[];
  /** Cost scaling factors for cube upgrades */
  CUBE_COST_FACTORS: Record<string, number>;
}
