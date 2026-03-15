/**
 * Sprite data type definitions.
 * Matches the structure of src/data/sprites.json.
 *
 * The spreadsheet source (SPRITES sheet) contains:
 *   - Companion skin name → sprite key lookup (554 rows across all four companions)
 *   - Page number → sprite key mappings
 *   - Drop type icons (Cube, Diamond, Dice, Equipment Scroll, EXP, Gold Scroll)
 *   - Stage boss sprite index
 *   - Stage ranking reward table (level threshold → reward icon)
 */

import type { CompanionName } from './companions';

/**
 * A single companion skin entry mapping a display name to its sprite asset key.
 * Source: SPRITES sheet, companion skins section.
 */
export interface CompanionSkin {
  /** Skin display name (e.g. "Default", "Sakura", "Knight") */
  name: string;
  /** Asset key used to look up the sprite image (snake_case) */
  spriteKey: string;
  /** Which companion this skin belongs to */
  companion: CompanionName;
}

/**
 * Drop item icon types available in the game.
 * Source: SPRITES sheet, drop icons section.
 */
export type DropIconType =
  | 'Cube'
  | 'Diamond'
  | 'Dice'
  | 'Equipment Scroll'
  | 'EXP'
  | 'Gold Scroll';

/**
 * A single drop icon entry mapping a drop type to its sprite asset key.
 * Source: SPRITES sheet, drop icons section.
 */
export interface DropIcon {
  /** The drop item category */
  type: DropIconType;
  /** Asset key used to look up the sprite image */
  spriteKey: string;
}

/**
 * A boss sprite entry for stage boss images.
 * Source: SPRITES sheet, stage boss image index.
 */
export interface BossSprite {
  /** Boss identifier (matches the mob id patterns in stage data) */
  bossId: string;
  /** Display name of the boss */
  name: string;
  /** Asset key used to look up the sprite image */
  spriteKey: string;
}

/**
 * A ranking reward entry mapping a level threshold to a reward icon.
 * Source: SPRITES sheet, stage ranking table.
 */
export interface RankingReward {
  /** Minimum player level required to receive this reward tier */
  levelThreshold: number;
  /** Number of items rewarded at this tier */
  rewardCount: number;
  /** The drop type of the reward item */
  dropType: DropIconType;
  /** Asset key for the reward icon */
  spriteKey: string;
}

/**
 * Root shape of sprites.json.
 * Contains all sprite lookup tables used throughout the optimizer UI.
 */
export interface SpritesData {
  /**
   * All companion skins grouped by companion name.
   * Key: CompanionName ('Ellie' | 'Zeke' | 'Miho' | 'Luna')
   * Value: ordered list of skins available for that companion
   */
  companionSkins: Record<CompanionName, CompanionSkin[]>;
  /** Drop item icon entries for the six drop types */
  dropIcons: DropIcon[];
  /** Boss sprite entries indexed by boss encounter type */
  bossSprites: BossSprite[];
  /** Ranking reward tiers ordered by ascending level threshold */
  rankingRewards: RankingReward[];
}
