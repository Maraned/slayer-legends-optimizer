/**
 * Resource types used to pay for TOM node upgrades.
 * Source: TOM sheet cost columns.
 */
export type TOMResourceType = 'Gems' | 'Gold' | 'Essence' | 'Shards';

/**
 * Broad categories grouping TOM nodes in the tree.
 * Source: TOM sheet category/section column.
 */
export type TOMNodeCategory =
  | 'Combat'
  | 'Defense'
  | 'Support'
  | 'Utility'
  | 'Passive';

/**
 * The stat or effect type a TOM node modifies.
 * Mirrors BonusType where applicable, plus TOM-specific effects.
 */
export type TOMEffectType =
  | 'ATK'
  | 'HP'
  | 'DEF'
  | 'Crit %'
  | 'Crit DMG'
  | 'Dodge'
  | 'Accuracy'
  | 'Extra EXP'
  | 'Monster Gold'
  | 'HP Recovery'
  | 'Death Strike'
  | 'Death Strike %'
  | 'Skill DMG'
  | 'Cooldown Reduction'
  | 'Movement Speed';

/**
 * Cost to advance a TOM node to a specific level.
 * Represents a single resource expenditure for one upgrade step.
 */
export interface TOMNodeCost {
  /** The level being purchased (1-based; cost to go from level-1 → level) */
  level: number;
  /** The resource required */
  resource: TOMResourceType;
  /** Amount of the resource required */
  amount: number;
}

/**
 * Effect granted by a TOM node at a specific level.
 * Represents the incremental or total bonus at that level.
 */
export interface TOMNodeLevel {
  /** The level index (1-based) */
  level: number;
  /** The stat this level modifies */
  effectType: TOMEffectType;
  /**
   * Bonus value granted at this level.
   * Percentage-based effects (e.g. Crit %) are stored as decimals (0.05 = 5%).
   */
  effectValue: number;
}

/**
 * A single node in the Tree of Memory.
 * The tree contains 370 nodes total.
 * Source: TOM sheet, one row per node.
 */
export interface TOMNode {
  /** Unique node identifier (e.g. "tom_001") */
  id: string;
  /** Display name of the node */
  name: string;
  /** Short description of what the node does */
  description: string;
  /** Broad grouping within the tree */
  category: TOMNodeCategory;
  /** IDs of nodes that must be unlocked before this node becomes available */
  dependsOn: string[];
  /** Maximum number of upgrade levels for this node */
  maxLevel: number;
  /** Current level the player has reached (0 = not unlocked) */
  currentLevel: number;
  /** Per-level effects — length equals maxLevel */
  levels: TOMNodeLevel[];
  /** Per-level costs — length equals maxLevel */
  costs: TOMNodeCost[];
}

/**
 * An explicit directed dependency edge between two TOM nodes.
 * Useful for graph traversal and topological sorting during optimization.
 */
export interface TOMDependency {
  /** The node that has the prerequisite */
  nodeId: string;
  /** The prerequisite node that must be unlocked first */
  requiresNodeId: string;
}

/**
 * Aggregated upgrade cost across multiple nodes or levels.
 * Used by the optimizer to summarise total resource requirements.
 */
export type TOMCostSummary = Partial<Record<TOMResourceType, number>>;

/**
 * Full Tree of Memory state: all 370 nodes and precomputed relationships.
 */
export interface TOMState {
  /** All TOM nodes (owned and not yet unlocked) */
  nodes: TOMNode[];
  /**
   * Flattened dependency list derived from node.dependsOn fields.
   * Precomputed to avoid repeated traversal during optimization.
   */
  dependencies: TOMDependency[];
  /** Total resources spent across all currently unlocked nodes */
  totalSpent: TOMCostSummary;
}

/**
 * Player's Tree of Memory (TOM) node progression saved to UserSaveState.
 * Tracks the current upgrade level for each of the 370 nodes.
 * Source: TOM sheet, player-specific data.
 */
export interface MemoryTreeState {
  /** Current level of each TOM node, keyed by node ID (0 = locked) */
  nodeLevels: Record<string, number>;
}
