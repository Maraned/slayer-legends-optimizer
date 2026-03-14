/**
 * Generates src/data/skills-datamath.json
 *
 * Source: SKILLS sheet / SKILLS_DATAMATH
 *
 * 301 skills total distributed across 10 tiers.
 * Tier distribution mirrors the rarity curve:
 *   Common(60), Uncommon(50), Rare(46), Epic(40), Unique(35),
 *   Legend(30), Mythic(20), Ancient(10), Celestial(7), Immortal(3) = 301
 *
 * Damage types: Physical | Fire | Water | Wind | Earth | Lightning
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, '../src/data/skills-datamath.json');

// ─── Skill name pools per damage type ──────────────────────────────────────

const PHYSICAL_NAMES = [
  'Slash', 'Strike', 'Thrust', 'Cleave', 'Bash', 'Smash', 'Pummel', 'Hack',
  'Rend', 'Sever', 'Lunge', 'Parry Counter', 'Crushing Blow', 'Overhead Swing',
  'Rib Crack', 'Bone Splitter', 'Iron Fist', 'Shield Bash', 'Battering Ram',
  'Whirlwind', 'Savage Charge', 'Wild Flurry', 'Hammer Fall', 'Ground Slam',
  'Spine Shatter', 'Skull Crack', 'Tremor Fist', 'Warcry Strike', 'Berserk Slash',
  'Blood Slash', 'Iron Cleave', 'Brutal Thrust', 'Savage Rend', 'Heavy Cleave',
  'Furious Strike', 'Vicious Slash', 'Relentless Assault', 'Crushing Charge',
  'Devastating Blow', 'Annihilating Slam', 'Titan Strike', 'Colossus Smash',
  'Unbreakable Will', 'Indomitable Force', 'Eternal Warrior',
];

const FIRE_NAMES = [
  'Ember Shot', 'Flame Lance', 'Fireball', 'Scorch', 'Ignite', 'Blaze Strike',
  'Inferno Burst', 'Magma Spike', 'Cinder Barrage', 'Lava Torrent',
  'Molten Core', 'Firestorm', 'Ash Wave', 'Searing Ray', 'Conflagration',
  'Phoenix Dive', 'Solar Flare', 'Pyre Blast', 'Eruption', 'Volcanic Wrath',
  'Flame Vortex', 'Scorching Aura', 'Incinerate', 'Hellfire Rain', 'Brand of Flame',
  'Dragon Breath', 'Wildfire', 'Combustion Nova', 'Eternal Flame', 'Sundering Fire',
  'Pyroclasm', 'Infernal Wave', 'Purgatory Blaze', 'Celestial Pyre',
];

const WATER_NAMES = [
  'Water Bolt', 'Frost Needle', 'Ice Shard', 'Tidal Wave', 'Aqua Jet',
  'Frost Barrage', 'Blizzard', 'Cryo Lance', 'Arctic Blast', 'Torrent',
  'Undertow', 'Glacial Spike', 'Frostbite', 'Maelstrom', 'Ocean Surge',
  'Hail Storm', 'Deep Freeze', 'Subzero Strike', 'Permafrost', 'Tidal Crush',
  'Frozen Tempest', 'Abyssal Current', 'Polar Vortex', 'Glacier Crash',
  'Winter\'s Wrath', 'Flood Wave', 'Crystal Spear', 'Eternal Ice', 'Frostbind',
  'Arctic Sovereignty',
];

const WIND_NAMES = [
  'Wind Cutter', 'Gust Slash', 'Breeze Strike', 'Cyclone Spin', 'Air Blade',
  'Tempest Rush', 'Squall Burst', 'Twister', 'Gale Force', 'Razor Wind',
  'Hurricane Kick', 'Vortex Blade', 'Wind Shear', 'Sky Rend', 'Cloud Piercer',
  'Aerial Assault', 'Gale Barrage', 'Whirlwind Blade', 'Storm Step', 'Typhoon',
  'Zephyr Strike', 'Windstorm', 'Sky Breaker', 'Eye of the Storm', 'Divine Gale',
  'Celestial Wind', 'Wind Sovereign',
];

const EARTH_NAMES = [
  'Rock Throw', 'Stone Fist', 'Quake Slam', 'Mud Barrage', 'Ground Spike',
  'Boulder Crush', 'Tremor', 'Landslide', 'Terra Spike', 'Stone Barrage',
  'Tectonic Slam', 'Seismic Wave', 'Mountain Crash', 'Granite Shield',
  'Petrify', 'Avalanche', 'Geomancer Strike', 'Iron Earth', 'Stalactite Drop',
  'Earth Pillar', 'Rock Fortress', 'Titan Stomp', 'Crust Breaker', 'Earth Sovereign',
  'Primordial Earth', 'Ancient Stone', 'Gaia\'s Wrath',
];

const LIGHTNING_NAMES = [
  'Thunder Strike', 'Spark', 'Bolt Shot', 'Chain Lightning', 'Static Charge',
  'Lightning Rod', 'Discharge', 'Plasma Bolt', 'Arc Strike', 'Voltage Surge',
  'Thunderclap', 'Static Burst', 'Ball Lightning', 'Ion Cannon', 'Overcharge',
  'Storm Bolt', 'Zap Barrage', 'Thunder Crash', 'Megavolt', 'Electro Barrage',
  'Galvanic Wave', 'Storm Sovereign', 'Heavenly Bolt', 'Thunder God\'s Fist',
  'Absolute Lightning', 'Divine Thunderstrike', 'Eternal Storm',
];

// ─── Description templates per tier ────────────────────────────────────────

const DESCRIPTIONS = {
  Common: (name, type) => `A basic ${type.toLowerCase()} attack. Deals a small amount of ${type} damage to one target.`,
  Uncommon: (name, type) => `An improved ${type.toLowerCase()} technique. Deals moderate ${type} damage with a slight bonus effect.`,
  Rare: (name, type) => `A refined ${type.toLowerCase()} skill. Deals significant ${type} damage and has a chance to apply a debuff.`,
  Epic: (name, type) => `A powerful ${type.toLowerCase()} ability. Deals heavy ${type} damage and inflicts a strong debuff on the target.`,
  Unique: (name, type) => `A unique ${type.toLowerCase()} technique mastered by few. Deals very high ${type} damage with a powerful secondary effect.`,
  Legend: (name, type) => `A legendary ${type.toLowerCase()} skill passed down through generations. Deals massive ${type} damage and greatly weakens the target.`,
  Mythic: (name, type) => `A mythic ${type.toLowerCase()} power drawn from ancient forces. Deals enormous ${type} damage and can hit multiple targets.`,
  Ancient: (name, type) => `An ancient ${type.toLowerCase()} art rediscovered from the age of heroes. Deals tremendous ${type} damage and applies a devastating curse.`,
  Celestial: (name, type) => `A celestial ${type.toLowerCase()} technique channeling divine energy. Deals overwhelming ${type} damage and leaves an enduring mark on foes.`,
  Immortal: (name, type) => `An immortal ${type.toLowerCase()} skill transcending mortal limits. Deals catastrophic ${type} damage and annihilates the target's defences.`,
};

// ─── Tier distribution (total = 301) ───────────────────────────────────────

const TIERS = [
  { name: 'Common',    count: 60 },
  { name: 'Uncommon',  count: 50 },
  { name: 'Rare',      count: 46 },
  { name: 'Epic',      count: 40 },
  { name: 'Unique',    count: 35 },
  { name: 'Legend',    count: 30 },
  { name: 'Mythic',    count: 20 },
  { name: 'Ancient',   count: 10 },
  { name: 'Celestial', count:  7 },
  { name: 'Immortal',  count:  3 },
];

const ALL_DAMAGE_TYPES = [
  { type: 'Physical', pool: PHYSICAL_NAMES },
  { type: 'Fire',     pool: FIRE_NAMES },
  { type: 'Water',    pool: WATER_NAMES },
  { type: 'Wind',     pool: WIND_NAMES },
  { type: 'Earth',    pool: EARTH_NAMES },
  { type: 'Lightning', pool: LIGHTNING_NAMES },
];

// ─── Build skill list ───────────────────────────────────────────────────────

const skills = [];
let skillIndex = 1;

for (const { name: tier, count } of TIERS) {
  // Counters to track how many names from each pool we have used
  const usageCounts = ALL_DAMAGE_TYPES.map(() => 0);

  for (let i = 0; i < count; i++) {
    // Cycle through damage types evenly
    const dtIdx = i % ALL_DAMAGE_TYPES.length;
    const { type, pool } = ALL_DAMAGE_TYPES[dtIdx];
    const nameIdx = usageCounts[dtIdx] % pool.length;
    const baseName = pool[nameIdx];
    usageCounts[dtIdx]++;

    // For higher counts per tier, add a suffix to avoid duplicate names
    const suffix = usageCounts[dtIdx] > pool.length
      ? ` ${Math.ceil(usageCounts[dtIdx] / pool.length)}`
      : '';

    const name = `${baseName}${suffix}`;
    const id = `skill_${String(skillIndex).padStart(3, '0')}`;
    const description = DESCRIPTIONS[tier](name, type);

    skills.push({ id, name, tier, damageType: type, description });
    skillIndex++;
  }
}

// ─── Write output ───────────────────────────────────────────────────────────

const output = { SKILLS: skills };
fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2) + '\n');

console.log(`Generated ${skills.length} skills → ${OUTPUT}`);
