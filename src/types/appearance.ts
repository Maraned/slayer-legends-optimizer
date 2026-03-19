/**
 * Bonus types provided by clothing items in the APPEARANCE sheet.
 * Source: APPEARANCE sheet rows 6–64, BONUS TYPE column.
 */
export type BonusType =
  | 'Dodge'
  | 'Extra EXP'
  | 'Monster Gold'
  | 'Accuracy'
  | 'Extra ATK'
  | 'Extra HP'
  | 'HP Recovery'
  | 'Crit DMG'
  | 'Crit %'
  | 'Death Strike'
  | 'Death Strike %';

/**
 * Clothing categories corresponding to the slot/type of the item.
 */
export type ClothingCategory = 'hat' | 'top' | 'bottom' | 'shoes' | 'acc';

/**
 * A single clothing item from the APPEARANCE sheet.
 * Corresponds to one row in the APPEARANCE data range (rows 6–64).
 */
export interface ClothingItem {
  /** Unique identifier for the clothing item */
  id: string;
  /** Display name of the clothing item (CLOTHING column) */
  name: string;
  /** Category / slot this item belongs to */
  category: ClothingCategory;
  /** The stat this item boosts (BONUS TYPE column) */
  bonusType: BonusType;
  /** The numeric bonus value when owned (EFFECT column, e.g. 3.0, 0.05) */
  effectValue: number;
  /** Whether the player owns this item (OWN checkbox column) */
  owned: boolean;
}

/**
 * Aggregated bonus totals per BonusType, computed from all owned clothing items.
 * Equivalent to the SUMIF output columns in the APPEARANCE sheet.
 */
export type AppearanceBonusTotals = Partial<Record<BonusType, number>>;

/**
 * Full appearance state: the collection of clothing items and their computed totals.
 */
export interface AppearanceState {
  /** All clothing items (owned and not owned) */
  items: ClothingItem[];
  /** Pre-computed sum of effectValue for each BonusType across owned items only */
  bonusTotals: AppearanceBonusTotals;
}
