/**
 * generate-stage-data.mjs
 *
 * Generates src/data/stage-data.json from the STAGE_DATA spreadsheet structure.
 *
 * Spreadsheet has 43 columns per row:
 *  Col  1: Stage ID (sequential, 1-based)
 *  Col  2: Area Number
 *  Col  3: Area Name
 *  Col  4: Zone Number (within area)
 *  Col  5: Zone Name
 *  Col  6: Stage Number (within zone)
 *  Col  7: Stage Label (e.g. "1-1-5")
 *  Col  8: Recommended Level
 *  Col  9: Energy Cost
 *  Col 10: Mob1 Name
 *  Col 11: Mob1 HP
 *  Col 12: Mob1 ATK
 *  Col 13: Mob1 DEF
 *  Col 14: Mob1 Speed
 *  Col 15: Mob1 Element
 *  Col 16: Mob1 Count
 *  Col 17: Mob1 EXP Reward
 *  Col 18: Mob1 Gold Reward
 *  Col 19: Mob1 Drop1 Item
 *  Col 20: Mob1 Drop1 Rate
 *  Col 21: Mob1 Drop2 Item
 *  Col 22: Mob1 Drop2 Rate
 *  Col 23: Mob2 Name (Boss or elite)
 *  Col 24: Mob2 HP
 *  Col 25: Mob2 ATK
 *  Col 26: Mob2 DEF
 *  Col 27: Mob2 Speed
 *  Col 28: Mob2 Element
 *  Col 29: Mob2 Count
 *  Col 30: Mob2 EXP Reward
 *  Col 31: Mob2 Gold Reward
 *  Col 32: Mob2 Drop1 Item
 *  Col 33: Mob2 Drop1 Rate
 *  Col 34: Mob2 Drop2 Item
 *  Col 35: Mob2 Drop2 Rate
 *  Col 36: Bonus1 Type
 *  Col 37: Bonus1 Multiplier
 *  Col 38: Bonus2 Type
 *  Col 39: Bonus2 Multiplier
 *  Col 40: Bonus3 Type
 *  Col 41: Bonus3 Multiplier
 *  Col 42: Has Boss (0/1)
 *  Col 43: Stage Tier (normal/elite/event)
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, '../src/data/stage-data.json');

// ── Area definitions ─────────────────────────────────────────────────────────
// 20 areas, each with a primary element and 10 zone names
const AREAS = [
  {
    num: 1, id: 'area_01', name: 'Verdant Forest', element: 'Earth',
    zones: ['Mossy Path','Ancient Grove','Fungal Hollow','Treant Woods','Canopy Trail',
             'Root Cavern','Spirit Glade','Corrupted Thicket','Elder Heartwood','Forest Sanctum'],
  },
  {
    num: 2, id: 'area_02', name: 'Ashen Peaks', element: 'Fire',
    zones: ['Cinder Slopes','Ember Gorge','Lava Fields','Scorched Ridge','Flame Cavern',
             'Volcanic Vent','Magma Flow','Inferno Pass','Caldera Rim','Peak Forge'],
  },
  {
    num: 3, id: 'area_03', name: 'Frosted Wastes', element: 'Water',
    zones: ['Ice Flats','Blizzard Pass','Frozen Lake','Glacial Rift','Snowdrift Vale',
             'Permafrost Caves','Crystal Tundra','Avalanche Run','Frostbite Hollow','Glacial Sanctum'],
  },
  {
    num: 4, id: 'area_04', name: 'Storm Highlands', element: 'Wind',
    zones: ['Gale Ridge','Thunder Bluff','Cyclone Valley','Storm Spire','Lightning Flats',
             'Tempest Crossing','Whirlwind Mesa','Squall Peaks','Thunderhead Pass','Sky Bastion'],
  },
  {
    num: 5, id: 'area_05', name: 'Radiant Shrine', element: 'Light',
    zones: ['Gilded Gate','Sunlit Hall','Prism Gallery','Sacred Nave','Celestial Court',
             'Holy Vaults','Beacon Cloister','Divine Spire','Empyrean Terrace','Sanctum of Light'],
  },
  {
    num: 6, id: 'area_06', name: 'Shadow Hollow', element: 'Dark',
    zones: ['Dusk Thicket','Twilight Bog','Shade Ravine','Umbra Grotto','Phantom Fen',
             'Nightmare Crypt','Void Rift','Dark Sanctum','Abyss Edge','Heart of Shadow'],
  },
  {
    num: 7, id: 'area_07', name: 'Obsidian Depths', element: 'Fire',
    zones: ['Smoldering Pit','Char Mines','Brimstone Halls','Magma Chamber','Slag Vaults',
             'Cinder Forge','Hellfire Tunnels','Obsidian Core','Ember Throne Room','Infernal Keep'],
  },
  {
    num: 8, id: 'area_08', name: 'Coral Seas', element: 'Water',
    zones: ['Shallows','Kelp Forest','Tide Pool','Reef Passage','Sunken Galleon',
             'Deep Current','Abyssal Trench','Hydra Lair','Pearl Grotto','Ocean Throne'],
  },
  {
    num: 9, id: 'area_09', name: 'Thunder Plateau', element: 'Wind',
    zones: ['Static Plains','Shock Dunes','Lightning Grove','Thunderstruck Mesa','Arc Canyon',
             'Bolt Hollow','Storm Front','Tempest Flats','Gale Vortex','Sky Citadel'],
  },
  {
    num: 10, id: 'area_10', name: 'Sacred Citadel', element: 'Light',
    zones: ['Outer Ramparts','Guard Halls','Chapel Nave','Tower Ascent','Armory','Knight Barracks',
              'Throne Antechamber','Paladin Vault','High Altar','Inner Sanctum'],
  },
  {
    num: 11, id: 'area_11', name: 'Crimson Bog', element: 'Dark',
    zones: ['Murky Shallows','Bloodweed Marsh','Thorn Maze','Rot Hollow','Miasma Vale',
             'Plague Fen','Leech Hollow','Cursed Mire','Black Water','Bog Heart'],
  },
  {
    num: 12, id: 'area_12', name: 'Magma Core', element: 'Fire',
    zones: ['Vent Network','Heat Fractures','Lava Tubes','Incandescent Halls','Pressure Chamber',
             'Core Fissure','Molten Sea','Pyroclast Cavern','Magma Heart','Core Throne'],
  },
  {
    num: 13, id: 'area_13', name: 'Glacial Keep', element: 'Water',
    zones: ['Frost Gate','Icebound Hall','Frozen Armory','Blizzard Barracks','Cryo Vault',
             'Rime Tower','Permafrost Treasury','Glacier Citadel','Ice Throne Room','Eternal Winter'],
  },
  {
    num: 14, id: 'area_14', name: 'Cyclone Steppes', element: 'Wind',
    zones: ['Wind Swept Plains','Dust Devil Flats','Vortex Plateau','Gale Ravine','Sky Bridge',
             'Cloudbreak Reach','Aerial Fortress','Skyward Spire','Eye of the Storm','Apex Citadel'],
  },
  {
    num: 15, id: 'area_15', name: 'Aurora Sanctum', element: 'Light',
    zones: ['Glowing Foyer','Spectrum Hall','Rainbow Bridge','Prism Vault','Luminary Court',
             'Solar Terrace','Stellar Gallery','Radiant Peak','Heaven\'s Gate','Celestial Apex'],
  },
  {
    num: 16, id: 'area_16', name: 'Void Wastes', element: 'Dark',
    zones: ['Null Fields','Entropy Dunes','Oblivion Rift','Nether Hollow','Chaos Flats',
             'Void Surge','Dark Matter Cave','Annihilation Rift','Singularity Edge','Void Core'],
  },
  {
    num: 17, id: 'area_17', name: 'Ember Throne', element: 'Fire',
    zones: ['Smoldering Approach','Ash Courtyard','Cinder Halls','Ember Spire','Flame Court',
             'Pyroclast Throne','Inferno Vault','Blaze Citadel','Pyre Keep','Throne of Fire'],
  },
  {
    num: 18, id: 'area_18', name: 'Tempest Reef', element: 'Water',
    zones: ['Surge Shallows','Riptide Flats','Geyser Fields','Torrent Caves','Maelstrom Depths',
             'Undertow Vaults','Typhoon Grotto','Whirlpool Core','Tsunami Keep','Eye of Tide'],
  },
  {
    num: 19, id: 'area_19', name: 'Gale Summit', element: 'Wind',
    zones: ['Cloud Base','Updraft Rise','Gust Ridge','Howling Peak','Storm Nest',
             'Cyclone Pinnacle','Aerial Sanctum','Wind\'s Edge','Sky Throne','Summit of Storms'],
  },
  {
    num: 20, id: 'area_20', name: 'Celestial Apex', element: 'None',
    zones: ['Gateway Arch','Astral Corridor','Cosmic Hall','Eternity\'s Gate','Void Nexus',
             'Infinite Atrium','Apex Crossroads','Reality\'s Edge','Transcendence Vault','Celestial Core'],
  },
];

// ── Mob definitions per element ───────────────────────────────────────────────
const MOBS_BY_ELEMENT = {
  Earth: {
    regular: [
      { name: 'Vine Crawler', drops: ['Rough Vine', 'Earth Shard'] },
      { name: 'Rock Imp',     drops: ['Gravel Shard', 'Stone Fragment'] },
      { name: 'Mud Golem',    drops: ['Clay Lump', 'Earth Shard'] },
      { name: 'Forest Boar',  drops: ['Tusk Chip', 'Rough Hide'] },
      { name: 'Treant Sapling', drops: ['Bark Strip', 'Sap Vial'] },
      { name: 'Stone Crab',   drops: ['Crab Shell', 'Stone Fragment'] },
      { name: 'Dirt Wyrm',    drops: ['Wyrm Scale', 'Earth Shard'] },
      { name: 'Mossy Slime',  drops: ['Slime Gel', 'Moss Clump'] },
    ],
    boss: [
      { name: 'Elder Treant',   drops: ['Ancient Bark', 'Earth Crystal'] },
      { name: 'Stone Colossus', drops: ['Colossus Chip', 'Earth Crystal'] },
      { name: 'Rock Drake',     drops: ['Drake Scale', 'Earth Crystal'] },
    ],
  },
  Fire: {
    regular: [
      { name: 'Fire Imp',         drops: ['Ember Shard', 'Ash Dust'] },
      { name: 'Lava Salamander',  drops: ['Lava Scale', 'Ember Shard'] },
      { name: 'Ember Wolf',       drops: ['Scorched Fang', 'Ash Dust'] },
      { name: 'Flame Sprite',     drops: ['Flame Core', 'Ember Shard'] },
      { name: 'Ash Crawler',      drops: ['Ash Dust', 'Char Fragment'] },
      { name: 'Cinder Bat',       drops: ['Wing Ash', 'Ember Shard'] },
      { name: 'Magma Slug',       drops: ['Magma Ooze', 'Char Fragment'] },
      { name: 'Scorched Hound',   drops: ['Scorched Fang', 'Ember Shard'] },
    ],
    boss: [
      { name: 'Inferno Titan',  drops: ['Titan Ember', 'Fire Crystal'] },
      { name: 'Flame Drake',    drops: ['Drake Flame', 'Fire Crystal'] },
      { name: 'Magma Overlord', drops: ['Overlord Core', 'Fire Crystal'] },
    ],
  },
  Water: {
    regular: [
      { name: 'Frost Bat',     drops: ['Frost Fang', 'Ice Shard'] },
      { name: 'Coral Crab',    drops: ['Claw Fragment', 'Ice Shard'] },
      { name: 'Sea Serpent',   drops: ['Scale Fragment', 'Tidal Essence'] },
      { name: 'Ice Elemental', drops: ['Ice Shard', 'Cryo Core'] },
      { name: 'Tide Sprite',   drops: ['Tidal Essence', 'Ice Shard'] },
      { name: 'Glacier Slug',  drops: ['Icy Ooze', 'Ice Shard'] },
      { name: 'Jellyfish',     drops: ['Jelly Film', 'Tidal Essence'] },
      { name: 'Cryo Hound',    drops: ['Ice Fang', 'Cryo Core'] },
    ],
    boss: [
      { name: 'Tide Dragon',  drops: ['Dragon Scale', 'Water Crystal'] },
      { name: 'Glacier Giant', drops: ['Glacial Core', 'Water Crystal'] },
      { name: 'Deep Kraken',  drops: ['Kraken Ink', 'Water Crystal'] },
    ],
  },
  Wind: {
    regular: [
      { name: 'Storm Eagle',    drops: ['Storm Feather', 'Wind Shard'] },
      { name: 'Thunder Hawk',   drops: ['Talon Chip', 'Wind Shard'] },
      { name: 'Cyclone Sprite', drops: ['Wind Core', 'Gale Dust'] },
      { name: 'Gust Bat',       drops: ['Wing Gust', 'Wind Shard'] },
      { name: 'Zephyr Imp',     drops: ['Gale Dust', 'Wind Shard'] },
      { name: 'Lightning Viper',drops: ['Venom Spark', 'Wind Shard'] },
      { name: 'Tornado Worm',   drops: ['Tornado Core', 'Gale Dust'] },
      { name: 'Sky Jellyfish',  drops: ['Sky Gel', 'Wind Shard'] },
    ],
    boss: [
      { name: 'Gale Phoenix',    drops: ['Phoenix Plume', 'Wind Crystal'] },
      { name: 'Sky Leviathan',   drops: ['Leviathan Scale', 'Wind Crystal'] },
      { name: 'Thunder Wyrm',    drops: ['Wyrm Thunder', 'Wind Crystal'] },
    ],
  },
  Light: {
    regular: [
      { name: 'Holy Imp',         drops: ['Holy Dust', 'Light Shard'] },
      { name: 'Radiant Sprite',   drops: ['Light Core', 'Light Shard'] },
      { name: 'Blessed Slime',    drops: ['Holy Gel', 'Light Shard'] },
      { name: 'Light Moth',       drops: ['Luminous Wing', 'Holy Dust'] },
      { name: 'Sacred Hound',     drops: ['Blessed Fang', 'Light Shard'] },
      { name: 'Prism Crab',       drops: ['Prism Shell', 'Holy Dust'] },
      { name: 'Aureate Serpent',  drops: ['Gold Scale', 'Light Shard'] },
      { name: 'Celestial Bat',    drops: ['Starwing Chip', 'Holy Dust'] },
    ],
    boss: [
      { name: 'Divine Angel',    drops: ['Angel Halo', 'Light Crystal'] },
      { name: 'Holy Paladin',    drops: ['Paladin Crest', 'Light Crystal'] },
      { name: 'Sacred Dragon',   drops: ['Sacred Scale', 'Light Crystal'] },
    ],
  },
  Dark: {
    regular: [
      { name: 'Shadow Fiend',  drops: ['Shadow Essence', 'Dark Shard'] },
      { name: 'Dark Wraith',   drops: ['Wraith Veil', 'Dark Shard'] },
      { name: 'Void Crawler',  drops: ['Void Fragment', 'Null Core'] },
      { name: 'Nightmare Bat', drops: ['Nightmare Fang', 'Dark Shard'] },
      { name: 'Shade Imp',     drops: ['Shade Dust', 'Dark Shard'] },
      { name: 'Cursed Slime',  drops: ['Cursed Gel', 'Null Core'] },
      { name: 'Umbra Hound',   drops: ['Dark Fang', 'Dark Shard'] },
      { name: 'Phantom Moth',  drops: ['Phantom Wing', 'Null Core'] },
    ],
    boss: [
      { name: 'Nightmare Beast',   drops: ['Nightmare Core', 'Dark Crystal'] },
      { name: 'Chaos Dragon',      drops: ['Chaos Scale', 'Dark Crystal'] },
      { name: 'Void Overlord',     drops: ['Void Heart', 'Dark Crystal'] },
    ],
  },
  None: {
    regular: [
      { name: 'Astral Construct', drops: ['Astral Fragment', 'Cosmic Shard'] },
      { name: 'Cosmic Sprite',    drops: ['Cosmic Shard', 'Void Particle'] },
      { name: 'Reality Wraith',   drops: ['Reality Dust', 'Cosmic Shard'] },
      { name: 'Infinity Imp',     drops: ['Infinity Sliver', 'Cosmic Shard'] },
      { name: 'Nexus Crawler',    drops: ['Nexus Core', 'Void Particle'] },
      { name: 'Paradox Hound',    drops: ['Paradox Fang', 'Cosmic Shard'] },
      { name: 'Entropy Serpent',  drops: ['Entropy Scale', 'Void Particle'] },
      { name: 'Chaos Golem',      drops: ['Chaos Stone', 'Cosmic Shard'] },
    ],
    boss: [
      { name: 'Cosmic Titan',   drops: ['Cosmic Heart', 'Celestial Crystal'] },
      { name: 'Void Sovereign', drops: ['Sovereign Shard', 'Celestial Crystal'] },
      { name: 'Apex Leviathan', drops: ['Apex Scale', 'Celestial Crystal'] },
    ],
  },
};

// Bonus types available
const BONUS_TYPES = [
  'EXP Boost', 'Gold Boost', 'Drop Rate Boost',
  'Rare Drop Boost', 'ATK Boost', 'DEF Boost', 'HP Boost',
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function r(n) { return Math.round(n); }

/** Exponential stat scale. Base × 1.025^globalStageIndex */
function scaleExp(base, idx, rate = 1.025) {
  return r(base * Math.pow(rate, idx));
}

/** Linear stat scale. */
function scaleLin(base, idx, step) {
  return r(base + step * idx);
}

function pick(arr, seed) {
  return arr[seed % arr.length];
}

function dropRate(baseRate, idx) {
  // Slightly improved drop rates at higher stages
  return parseFloat(Math.min(baseRate + idx * 0.0001, 0.95).toFixed(4));
}

function makeItemId(itemName) {
  return itemName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
}

// ── Main generation ───────────────────────────────────────────────────────────
const STAGES_PER_ZONE = 10;
const ZONES_PER_AREA = 10;

const stages = [];
const areasOut = [];
const zonesOut = [];

let globalStageId = 1;

for (const area of AREAS) {
  const areaZones = [];

  for (let zoneNum = 1; zoneNum <= ZONES_PER_AREA; zoneNum++) {
    const zoneId = `${area.id}_z${String(zoneNum).padStart(2, '0')}`;
    const zoneName = area.zones[zoneNum - 1];
    const firstStageId = globalStageId;

    for (let stageNum = 1; stageNum <= STAGES_PER_ZONE; stageNum++) {
      const stageId = globalStageId++;
      // Global progression index (0-based)
      const gIdx = stageId - 1;

      const areaIdx = area.num - 1;         // 0-19
      const zoneIdx = zoneNum - 1;          // 0-9
      const sIdx = stageNum - 1;            // 0-9

      const isBossStage = stageNum === STAGES_PER_ZONE;
      const label = `${area.num}-${zoneNum}-${stageNum}`;
      const recommendedLevel = r(gIdx * 0.5) + 1;  // 1 at stage 1, ~1000 at stage 2000
      const energyCost = Math.min(1 + Math.floor(areaIdx / 4), 5);

      const element = area.element;
      const mobPool = MOBS_BY_ELEMENT[element];

      // ── Mob 1 (regular) ───────────────────────────────────────────────────
      const mob1Def = pick(mobPool.regular, areaIdx * 37 + zoneIdx * 7 + sIdx);
      const mob1HpBase = 100;
      const mob1Hp  = scaleExp(mob1HpBase, gIdx, 1.018);
      const mob1Atk = scaleExp(r(mob1HpBase * 0.12), gIdx, 1.018);
      const mob1Def2 = scaleExp(r(mob1HpBase * 0.06), gIdx, 1.018);
      const mob1Spd = scaleLin(50, gIdx, 0.04);
      const mob1Exp = scaleExp(10, gIdx, 1.02);
      const mob1Gold= scaleExp(5, gIdx, 1.02);
      const mob1Count = isBossStage ? 4 : (3 + (stageNum % 3));

      const mob1Drop1Item = mob1Def.drops[0];
      const mob1Drop2Item = mob1Def.drops[1];
      const mob1Drop1Rate = dropRate(0.6, gIdx);
      const mob1Drop2Rate = dropRate(0.25, gIdx);

      // ── Mob 2 (boss or elite) ─────────────────────────────────────────────
      const mob2DefPool = isBossStage ? mobPool.boss : mobPool.regular;
      const mob2Def = pick(mob2DefPool, areaIdx * 53 + zoneIdx * 11 + sIdx + 3);
      const mob2HpMult = isBossStage ? 8 : 3;
      const mob2AtkMult = isBossStage ? 5 : 2;
      const mob2Hp  = scaleExp(r(mob1HpBase * mob2HpMult), gIdx, 1.018);
      const mob2Atk = scaleExp(r(mob1HpBase * 0.12 * mob2AtkMult), gIdx, 1.018);
      const mob2Def2= scaleExp(r(mob1HpBase * 0.06 * 2), gIdx, 1.018);
      const mob2Spd = scaleLin(40, gIdx, 0.03);
      const mob2Exp = scaleExp(r(10 * mob2HpMult), gIdx, 1.02);
      const mob2Gold= scaleExp(r(5 * mob2HpMult), gIdx, 1.02);
      const mob2Count = isBossStage ? 1 : 2;

      const mob2Drop1Item = mob2Def.drops[0];
      const mob2Drop2Item = mob2Def.drops[1];
      const mob2Drop1Rate = dropRate(isBossStage ? 0.85 : 0.4, gIdx);
      const mob2Drop2Rate = dropRate(isBossStage ? 0.5 : 0.15, gIdx);

      // ── Stage bonuses ─────────────────────────────────────────────────────
      // Rotate bonus types based on area+zone
      const bonusSeed = (areaIdx * 10 + zoneIdx);
      const bonus1Type = BONUS_TYPES[bonusSeed % BONUS_TYPES.length];
      const bonus2Type = BONUS_TYPES[(bonusSeed + 2) % BONUS_TYPES.length];
      const bonus3Type = isBossStage
        ? BONUS_TYPES[(bonusSeed + 4) % BONUS_TYPES.length]
        : null;

      const bonus1Mult = parseFloat((1.1 + (areaIdx * 0.02)).toFixed(2));
      const bonus2Mult = parseFloat((1.05 + (areaIdx * 0.01)).toFixed(2));
      const bonus3Mult = isBossStage
        ? parseFloat((1.2 + (areaIdx * 0.03)).toFixed(2))
        : null;

      // ── Assemble stage ────────────────────────────────────────────────────
      const mobs = [
        {
          id: `mob_${makeItemId(mob1Def.name)}_${stageId}`,
          name: mob1Def.name,
          stats: { hp: mob1Hp, atk: mob1Atk, def: mob1Def2, speed: mob1Spd, element },
          drops: [
            { itemId: makeItemId(mob1Drop1Item), itemName: mob1Drop1Item, dropRate: mob1Drop1Rate, minQty: 1, maxQty: 3 },
            { itemId: makeItemId(mob1Drop2Item), itemName: mob1Drop2Item, dropRate: mob1Drop2Rate, minQty: 1, maxQty: 2 },
          ],
          expReward: mob1Exp,
          goldReward: mob1Gold,
          count: mob1Count,
          isBoss: false,
        },
        {
          id: `mob_${makeItemId(mob2Def.name)}_${stageId}`,
          name: mob2Def.name,
          stats: { hp: mob2Hp, atk: mob2Atk, def: mob2Def2, speed: mob2Spd, element },
          drops: [
            { itemId: makeItemId(mob2Drop1Item), itemName: mob2Drop1Item, dropRate: mob2Drop1Rate, minQty: 1, maxQty: isBossStage ? 5 : 2 },
            { itemId: makeItemId(mob2Drop2Item), itemName: mob2Drop2Item, dropRate: mob2Drop2Rate, minQty: 1, maxQty: isBossStage ? 3 : 1 },
          ],
          expReward: mob2Exp,
          goldReward: mob2Gold,
          count: mob2Count,
          isBoss: isBossStage,
        },
      ];

      const bonuses = [
        { type: bonus1Type, multiplier: bonus1Mult },
        { type: bonus2Type, multiplier: bonus2Mult },
        ...(bonus3Type ? [{ type: bonus3Type, multiplier: bonus3Mult }] : []),
      ];

      stages.push({
        id: stageId,
        label,
        areaId: area.id,
        areaName: area.name,
        zoneId,
        zoneName,
        stageNumber: stageNum,
        energyCost,
        mobs,
        bonuses,
        hasBoss: isBossStage,
        recommendedLevel,
      });
    }

    const zone = {
      id: zoneId,
      areaId: area.id,
      name: zoneName,
      stageCount: STAGES_PER_ZONE,
      firstStageId,
    };
    zonesOut.push(zone);
    areaZones.push(zone);
  }

  areasOut.push({
    id: area.id,
    name: area.name,
    zones: areaZones,
  });
}

const output = {
  STAGES: stages,
  AREAS: areasOut,
  ZONES: zonesOut,
};

mkdirSync(join(__dirname, '../src/data'), { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify(output, null, 2));

console.log(`Generated ${stages.length} stages, ${areasOut.length} areas, ${zonesOut.length} zones`);
console.log(`Output: ${OUT_PATH}`);
