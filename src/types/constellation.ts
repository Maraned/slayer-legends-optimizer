/**
 * The 12 zodiac constellations available in the CONSTELLATION sheet.
 */
export type ZodiacConstellation =
  | 'Aries'
  | 'Taurus'
  | 'Gemini'
  | 'Cancer'
  | 'Leo'
  | 'Virgo'
  | 'Libra'
  | 'Scorpio'
  | 'Sagittarius'
  | 'Capricorn'
  | 'Aquarius'
  | 'Pisces';

/**
 * Buff types that star nodes can provide.
 */
export type ConstellationBuffType =
  | 'ATK'
  | 'HP'
  | 'DEF'
  | 'Crit %'
  | 'Crit DMG'
  | 'Extra EXP'
  | 'Monster Gold'
  | 'Dodge'
  | 'Accuracy'
  | 'HP Recovery'
  | 'Death Strike'
  | 'Death Strike %'
  | 'All Stats';

/**
 * Farming modes that affect which constellations or buffs are prioritized.
 */
export type FarmingMode =
  | 'EXP'
  | 'Gold'
  | 'Boss'
  | 'PvP'
  | 'Idle';

/**
 * A single star node within a constellation.
 * Each constellation contains multiple star nodes that can be unlocked and levelled.
 */
export interface StarNode {
  /** Unique identifier for this node (e.g. "aries-1") */
  id: string;
  /** Display name of the node */
  name: string;
  /** Which constellation this node belongs to */
  constellation: ZodiacConstellation;
  /** The buff this node provides when activated */
  buffType: ConstellationBuffType;
  /** Buff value per level (flat or percentage depending on buffType) */
  valuePerLevel: number;
  /** Current level of this node (0 = locked) */
  level: number;
  /** Maximum level this node can reach */
  maxLevel: number;
  /** Star cost to unlock or upgrade this node */
  starCost: number;
}

/**
 * Aggregated buff totals per ConstellationBuffType, summed across all activated star nodes.
 */
export type ConstellationBuffTotals = Partial<Record<ConstellationBuffType, number>>;

/**
 * Full state of a single zodiac constellation, including all its star nodes.
 */
export interface ConstellationState {
  /** Which zodiac this constellation represents */
  zodiac: ZodiacConstellation;
  /** All star nodes belonging to this constellation */
  nodes: StarNode[];
  /** Total stars spent in this constellation */
  starsSpent: number;
}

/**
 * Top-level constellation sheet state: all 12 constellations and their computed buff totals.
 */
export interface ConstellationSheetState {
  /** One entry per zodiac constellation */
  constellations: ConstellationState[];
  /** Pre-computed sum of all active node buffs across all constellations */
  buffTotals: ConstellationBuffTotals;
  /** The farming mode currently selected, used to highlight recommended nodes */
  farmingMode: FarmingMode;
}

/**
 * Root shape of constellation-data.json.
 */
export interface ConstellationData {
  /** Semantic version of this data file (e.g. "1.0.0"). */
  dataVersion: string;
  /** All 12 constellation definitions with their star nodes */
  CONSTELLATIONS: ConstellationState[];
}
