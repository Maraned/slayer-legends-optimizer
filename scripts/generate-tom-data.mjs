/**
 * generate-tom-data.mjs
 *
 * Generates src/data/tom-data.json — the static Tree of Memory node catalogue.
 *
 * Tree of Memory (TOM) overview:
 *   370 nodes spread across 5 categories: Combat, Defense, Support, Utility, Passive.
 *   Each node has 1–5 upgrade levels with per-level effects and resource costs.
 *   Costs progress from Gold (early) → Essence (mid) → Gems (late) → Shards (end-game).
 *
 * Category breakdown:
 *   Combat  (100 nodes): ATK, Crit %, Crit DMG, Death Strike, Skill DMG
 *   Defense  (80 nodes): HP, DEF, HP Recovery
 *   Support  (60 nodes): Monster Gold, Extra EXP
 *   Utility  (70 nodes): Accuracy, Dodge, Movement Speed, Cooldown Reduction
 *   Passive  (60 nodes): Death Strike %, mixed passive bonuses
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../src/data/tom-data.json');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build cost entries for one node.
 * Tier controls which resource is used and the base amount.
 *   tier 0 = Gold only         (early access nodes)
 *   tier 1 = Gold + Essence    (mid-tree)
 *   tier 2 = Essence + Gems    (deep-tree)
 *   tier 3 = Gems + Shards     (end-game)
 */
function buildCosts(maxLevel, tier, row) {
  const costs = [];

  // Base amounts scale with both tier and row (position within tier)
  const goldAmounts   = [500, 1000, 2500, 5000, 12500];
  const essenceAmounts= [10,  25,   60,   150,  375 ];
  const gemAmounts    = [3,   8,    20,   50,   125 ];
  const shardAmounts  = [1,   2,    5,    12,   30  ];

  const rowScale = 1 + row * 0.5; // deeper nodes cost more

  for (let lvl = 1; lvl <= maxLevel; lvl++) {
    const idx = lvl - 1;
    if (tier === 0) {
      costs.push({ level: lvl, resource: 'Gold',    amount: Math.round(goldAmounts[idx]    * rowScale) });
    } else if (tier === 1) {
      const primary = lvl <= 2 ? 'Gold' : 'Essence';
      const amt     = lvl <= 2 ? Math.round(goldAmounts[idx]    * rowScale * 2)
                               : Math.round(essenceAmounts[idx] * rowScale);
      costs.push({ level: lvl, resource: primary, amount: amt });
    } else if (tier === 2) {
      const primary = lvl <= 2 ? 'Essence' : 'Gems';
      const amt     = lvl <= 2 ? Math.round(essenceAmounts[idx] * rowScale * 3)
                               : Math.round(gemAmounts[idx]     * rowScale);
      costs.push({ level: lvl, resource: primary, amount: amt });
    } else {
      const primary = lvl <= 2 ? 'Gems' : 'Shards';
      const amt     = lvl <= 2 ? Math.round(gemAmounts[idx]   * rowScale * 2)
                               : Math.round(shardAmounts[idx] * rowScale);
      costs.push({ level: lvl, resource: primary, amount: amt });
    }
  }
  return costs;
}

/**
 * Build level-effect entries. effectValue is the incremental bonus per level.
 */
function buildLevels(maxLevel, effectType, baseValue, growthFactor = 1) {
  const levels = [];
  for (let lvl = 1; lvl <= maxLevel; lvl++) {
    levels.push({
      level: lvl,
      effectType,
      effectValue: parseFloat((baseValue * Math.pow(growthFactor, lvl - 1)).toFixed(5)),
    });
  }
  return levels;
}

// ---------------------------------------------------------------------------
// Node factory
// ---------------------------------------------------------------------------

const nodes = [];
const dependencies = [];

function node(id, name, description, category, dependsOn, maxLevel, effectType, baseValue, growthFactor, costTier, costRow) {
  nodes.push({
    id,
    name,
    description,
    category,
    dependsOn,
    maxLevel,
    currentLevel: 0,
    levels: buildLevels(maxLevel, effectType, baseValue, growthFactor),
    costs: buildCosts(maxLevel, costTier, costRow),
  });
  for (const dep of dependsOn) {
    dependencies.push({ nodeId: id, requiresNodeId: dep });
  }
  return id;
}

// Shorthand — adds one node and returns its id
const N = node;

// ---------------------------------------------------------------------------
// COMBAT (100 nodes)  tom_c_001 – tom_c_100
// ---------------------------------------------------------------------------

// Root
N('tom_c_001','Primal Strike','Increases base attack power.','Combat',[],3,'ATK',0.02,1,0,0);

// ATK chain (nodes 2–20)
let prev = 'tom_c_001';
const atkChain = ['tom_c_002','tom_c_003','tom_c_004','tom_c_005','tom_c_006','tom_c_007','tom_c_008','tom_c_009','tom_c_010'];
const atkNames = ['Raw Power','Muscle Memory','Iron Fist','Focused Strike','Battle Hardened','Relentless Assault','Unstoppable Force','War Instinct','Apex Predator'];
const atkDescs = [
  'Sharpens attack instincts for increased damage.',
  'Repeated training reinforces muscle memory for stronger attacks.',
  'Your fists become weapons of iron.',
  'Concentrate force into each blow.',
  'Battles fought have hardened your resolve.',
  'Press the assault without relenting.',
  'Nothing can stop your advance.',
  'Instincts forged through countless battles.',
  'Reach the apex of physical combat.',
];
for (let i = 0; i < atkChain.length; i++) {
  const tier = Math.floor(i / 3);
  N(atkChain[i], atkNames[i], atkDescs[i], 'Combat', [prev], 3, 'ATK', 0.02 + i * 0.002, 1.05, tier, i);
  prev = atkChain[i];
}

// ATK deep chain (nodes 11–20)
const atkDeep = ['tom_c_011','tom_c_012','tom_c_013','tom_c_014','tom_c_015','tom_c_016','tom_c_017','tom_c_018','tom_c_019','tom_c_020'];
const atkDeepNames = ['Warlord\'s Edge','Titan\'s Grip','Crushing Blow','Shatter Strike','Annihilation','War God\'s Blessing','Fury Unleashed','Destroyer\'s Path','Chaos Reign','Supreme Warrior'];
const atkDeepDescs = [
  'The edge of a warlord cuts deeper than any blade.',
  'A titan\'s grip crushes anything in its path.',
  'Each blow is meant to break.',
  'A strike that shatters defenses.',
  'Complete destruction of the enemy.',
  'Blessed by the god of war.',
  'Unleash unbridled fury.',
  'Walk the path of the destroyer.',
  'Chaos and destruction reign supreme.',
  'Reach supremacy in combat.',
];
prev = 'tom_c_010';
for (let i = 0; i < atkDeep.length; i++) {
  const tier = 1 + Math.floor(i / 3);
  N(atkDeep[i], atkDeepNames[i], atkDeepDescs[i], 'Combat', [prev], 3, 'ATK', 0.03 + i * 0.003, 1.08, tier, i + 9);
  prev = atkDeep[i];
}

// Crit % branch (nodes 21–40), branches from tom_c_001
prev = 'tom_c_001';
const critPctNodes = ['tom_c_021','tom_c_022','tom_c_023','tom_c_024','tom_c_025','tom_c_026','tom_c_027','tom_c_028','tom_c_029','tom_c_030',
                      'tom_c_031','tom_c_032','tom_c_033','tom_c_034','tom_c_035','tom_c_036','tom_c_037','tom_c_038','tom_c_039','tom_c_040'];
const critPctNames = ['Sharp Eye','Weak Point','Lucky Blow','Critical Focus','Exploit Weakness','Opportunist','Lethal Precision','Eagle Eye','Razor Focus','Critical Instinct',
                      'Mortal Eye','Death Gaze','Predator\'s Mark','Lethal Aim','Hunter\'s Focus','Sniper\'s Calm','Perfect Timing','Fatal Precision','Critical Mastery','Eye of Doom'];
for (let i = 0; i < critPctNodes.length; i++) {
  const tier = Math.floor(i / 5);
  N(critPctNodes[i], critPctNames[i], `Increases critical hit chance (node ${i+1}/20).`, 'Combat', [prev], 3, 'Crit %', 0.005, 1, tier, i);
  prev = critPctNodes[i];
}

// Crit DMG branch (nodes 41–60), branches from tom_c_021
prev = 'tom_c_021';
const critDmgNodes = ['tom_c_041','tom_c_042','tom_c_043','tom_c_044','tom_c_045','tom_c_046','tom_c_047','tom_c_048','tom_c_049','tom_c_050',
                      'tom_c_051','tom_c_052','tom_c_053','tom_c_054','tom_c_055','tom_c_056','tom_c_057','tom_c_058','tom_c_059','tom_c_060'];
const critDmgNames = ['Savage Strike','Brutal Blow','Execute','Devastation','Carnage','Executioner','Overkill','Slaughter','Massacre','Annihilator',
                      'Obliterate','Shred','Rending Strike','Lacerate','Eviscerate','Disembowel','Rupture','Hemorrhage','Exsanguinate','Death Touch'];
for (let i = 0; i < critDmgNodes.length; i++) {
  const tier = 1 + Math.floor(i / 5);
  N(critDmgNodes[i], critDmgNames[i], `Amplifies critical hit damage (node ${i+1}/20).`, 'Combat', [prev], 3, 'Crit DMG', 0.02, 1.04, tier, i + 20);
  prev = critDmgNodes[i];
}

// Death Strike branch (nodes 61–75), branches from tom_c_001
prev = 'tom_c_001';
const dsNodes = ['tom_c_061','tom_c_062','tom_c_063','tom_c_064','tom_c_065','tom_c_066','tom_c_067','tom_c_068','tom_c_069','tom_c_070',
                 'tom_c_071','tom_c_072','tom_c_073','tom_c_074','tom_c_075'];
const dsNames = ['Fatal Wound','Killing Intent','Soul Rend','Banish Soul','Oblivion Slash','Reaper\'s Touch','Beyond Death','Underworld Mark','Dark Omen','End of Days',
                 'Void Strike','Abyss Slash','Entropy','Nihilism','True Death'];
for (let i = 0; i < dsNodes.length; i++) {
  const tier = Math.floor(i / 4);
  N(dsNodes[i], dsNames[i], `Increases death strike damage (node ${i+1}/15).`, 'Combat', [prev], 3, 'Death Strike', 0.01, 1.03, tier, i + 40);
  prev = dsNodes[i];
}

// Skill DMG branch (nodes 76–100), branches from tom_c_040
prev = 'tom_c_040';
const skillDmgNodes = ['tom_c_076','tom_c_077','tom_c_078','tom_c_079','tom_c_080','tom_c_081','tom_c_082','tom_c_083','tom_c_084','tom_c_085',
                       'tom_c_086','tom_c_087','tom_c_088','tom_c_089','tom_c_090','tom_c_091','tom_c_092','tom_c_093','tom_c_094','tom_c_095',
                       'tom_c_096','tom_c_097','tom_c_098','tom_c_099','tom_c_100'];
const skillDmgNames = ['Technique','Skill Mastery','Battle Technique','Combat Arts','Power Surge','Arcane Strike','Mystic Blow','Spell Blade','Runic Power','Ancient Arts',
                       'War Tome','Forbidden Technique','Lost Art','Ancient Secret','Primordial Skill','Divine Technique','Celestial Art','Sacred Skill','Holy Technique','Transcendent Art',
                       'Awakened Skill','Ascendant Power','Pinnacle Art','Legendary Skill','Apex Technique'];
for (let i = 0; i < skillDmgNodes.length; i++) {
  const tier = 2 + Math.floor(i / 8);
  N(skillDmgNodes[i], skillDmgNames[i], `Enhances skill damage output (node ${i+1}/25).`, 'Combat', [prev], 3, 'Skill DMG', 0.02, 1.03, tier, i + 55);
  prev = skillDmgNodes[i];
}

// ---------------------------------------------------------------------------
// DEFENSE (80 nodes)  tom_d_001 – tom_d_080
// ---------------------------------------------------------------------------

N('tom_d_001','Iron Skin','Increases maximum HP.','Defense',[],3,'HP',0.025,1,0,0);

// HP chain (nodes 2–25)
prev = 'tom_d_001';
const hpChain = Array.from({length:24},(_,i)=>`tom_d_${String(i+2).padStart(3,'0')}`);
const hpChainNames = ['Vitality','Endurance','Resilience','Tenacity','Fortitude','Steel Body','Unyielding','Ironclad','Bulwark','Bastion',
                      'Impenetrable','Invincible','Eternal Flame','Life Surge','Living Fortress','Mountain\'s Heart','Ocean Depth','Sky Pillar','Earth Core','Storm\'s Eye',
                      'Phoenix Blood','Dragon\'s Heart','Titan Body','Ancient Vitality'];
for (let i = 0; i < hpChain.length; i++) {
  const tier = Math.floor(i / 6);
  N(hpChain[i], hpChainNames[i], `Increases maximum HP (node ${i+1}/24).`, 'Defense', [prev], 3, 'HP', 0.025 + i * 0.001, 1.02, tier, i);
  prev = hpChain[i];
}

// DEF chain (nodes 26–50), branches from tom_d_001
prev = 'tom_d_001';
const defChain = Array.from({length:25},(_,i)=>`tom_d_${String(i+26).padStart(3,'0')}`);
const defChainNames = ['Toughened Skin','Armor Mastery','Shield Wall','Iron Guard','Stalwart Defense','Indomitable','Fortress','Rampart','Citadel','Aegis',
                       'Barrier','Bulwark','Unbreakable','Adamantine','Mythril Guard','Celestial Armor','Divine Shield','Sacred Barrier','Holy Guard','Transcendent Defense',
                       'Awakened Defense','Ascendant Guard','Pinnacle Defense','Legendary Armor','Apex Defender'];
for (let i = 0; i < defChain.length; i++) {
  const tier = Math.floor(i / 6);
  N(defChain[i], defChainNames[i], `Increases physical defense (node ${i+1}/25).`, 'Defense', [prev], 3, 'DEF', 0.02 + i * 0.001, 1.02, tier, i + 24);
  prev = defChain[i];
}

// HP Recovery chain (nodes 51–65), branches from tom_d_024
prev = 'tom_d_024';
const hpRecNodes = Array.from({length:15},(_,i)=>`tom_d_${String(i+51).padStart(3,'0')}`);
const hpRecNames = ['Quick Recovery','Natural Healing','Regeneration','Life Drain','Vampiric Touch','Soul Steal','Sustain','Lifeblood','Restoration','Rejuvenation',
                    'Eternal Recovery','Divine Mending','Sacred Heal','Holy Restoration','Transcendent Healing'];
for (let i = 0; i < hpRecNodes.length; i++) {
  const tier = 1 + Math.floor(i / 5);
  N(hpRecNodes[i], hpRecNames[i], `Increases HP recovery rate (node ${i+1}/15).`, 'Defense', [prev], 3, 'HP Recovery', 0.01, 1.03, tier, i + 48);
  prev = hpRecNodes[i];
}

// Bonus HP+DEF combined (nodes 66–80), branches from tom_d_050
prev = 'tom_d_050';
for (let i = 0; i < 15; i++) {
  const id = `tom_d_${String(i+66).padStart(3,'0')}`;
  const effectType = i % 2 === 0 ? 'HP' : 'DEF';
  N(id, `Enduring Might ${i+1}`, `Combined HP and DEF enhancement (node ${i+1}/15).`, 'Defense', [prev], 5, effectType, 0.03, 1.05, 3, i + 63);
  prev = id;
}

// ---------------------------------------------------------------------------
// SUPPORT (60 nodes)  tom_s_001 – tom_s_060
// ---------------------------------------------------------------------------

N('tom_s_001','Treasure Nose','Increases gold gained from monsters.','Support',[],3,'Monster Gold',0.03,1,0,0);

// Monster Gold chain (nodes 2–21)
prev = 'tom_s_001';
const goldChain = Array.from({length:20},(_,i)=>`tom_s_${String(i+2).padStart(3,'0')}`);
const goldNames = ['Coin Sense','Gold Rush','Treasure Hunter','Loot Master','Jackpot','Fortune\'s Favor','Midas Touch','Golden Touch','Affluence','Opulence',
                   'Tycoon','Magnate','Mogul','Baron','Lord of Gold','King of Wealth','Emperor\'s Greed','Divine Fortune','Eternal Riches','Transcendent Wealth'];
for (let i = 0; i < goldChain.length; i++) {
  const tier = Math.floor(i / 5);
  N(goldChain[i], goldNames[i], `Increases monster gold drops (node ${i+1}/20).`, 'Support', [prev], 3, 'Monster Gold', 0.03 + i * 0.002, 1.04, tier, i);
  prev = goldChain[i];
}

// Extra EXP chain (nodes 22–41), branches from tom_s_001
prev = 'tom_s_001';
const expChain = Array.from({length:20},(_,i)=>`tom_s_${String(i+22).padStart(3,'0')}`);
const expNames = ['Quick Learner','Battle Scholar','Eager Student','Rapid Growth','Fast Learner','Knowledge Seeker','Wisdom Path','Enlightenment','Sage Mind','Ancient Wisdom',
                  'Scholar\'s Touch','Archivist','Lorekeeper','Chronicler','Sage','Grand Sage','Master Sage','Ancient Sage','Eternal Scholar','Transcendent Mind'];
for (let i = 0; i < expChain.length; i++) {
  const tier = Math.floor(i / 5);
  N(expChain[i], expNames[i], `Increases EXP gained from monsters (node ${i+1}/20).`, 'Support', [prev], 3, 'Extra EXP', 0.03 + i * 0.002, 1.04, tier, i + 20);
  prev = expChain[i];
}

// Utility support (nodes 42–60)
prev = 'tom_s_021';
for (let i = 0; i < 19; i++) {
  const id = `tom_s_${String(i+42).padStart(3,'0')}`;
  const effectType = i % 2 === 0 ? 'Monster Gold' : 'Extra EXP';
  N(id, `Bounty ${i+1}`, `Enhanced resource gain from combat (node ${i+1}/19).`, 'Support', [prev], 4, effectType, 0.04, 1.05, 2 + Math.floor(i / 6), i + 40);
  prev = id;
}

// ---------------------------------------------------------------------------
// UTILITY (70 nodes)  tom_u_001 – tom_u_070
// ---------------------------------------------------------------------------

N('tom_u_001','Keen Eye','Increases accuracy.','Utility',[],3,'Accuracy',0.005,1,0,0);

// Accuracy chain (nodes 2–19)
prev = 'tom_u_001';
for (let i = 0; i < 18; i++) {
  const id = `tom_u_${String(i+2).padStart(3,'0')}`;
  const tier = Math.floor(i / 5);
  N(id, `Accuracy ${i+1}`, `Improves hit accuracy in combat (node ${i+1}/18).`, 'Utility', [prev], 3, 'Accuracy', 0.005, 1, tier, i);
  prev = id;
}

// Dodge chain (nodes 20–37), branches from tom_u_001
prev = 'tom_u_001';
for (let i = 0; i < 18; i++) {
  const id = `tom_u_${String(i+20).padStart(3,'0')}`;
  const tier = Math.floor(i / 5);
  N(id, `Evasion ${i+1}`, `Improves dodge chance (node ${i+1}/18).`, 'Utility', [prev], 3, 'Dodge', 0.005, 1, tier, i + 18);
  prev = id;
}

// Movement Speed chain (nodes 38–52), branches from tom_u_010
prev = 'tom_u_010';
for (let i = 0; i < 15; i++) {
  const id = `tom_u_${String(i+38).padStart(3,'0')}`;
  const tier = 1 + Math.floor(i / 5);
  N(id, `Swift Step ${i+1}`, `Increases movement speed (node ${i+1}/15).`, 'Utility', [prev], 3, 'Movement Speed', 0.01, 1.02, tier, i + 36);
  prev = id;
}

// Cooldown Reduction chain (nodes 53–70), branches from tom_u_028
prev = 'tom_u_028';
for (let i = 0; i < 18; i++) {
  const id = `tom_u_${String(i+53).padStart(3,'0')}`;
  const tier = 1 + Math.floor(i / 5);
  N(id, `Readiness ${i+1}`, `Reduces skill cooldown times (node ${i+1}/18).`, 'Utility', [prev], 3, 'Cooldown Reduction', 0.01, 1.02, tier, i + 51);
  prev = id;
}

// ---------------------------------------------------------------------------
// PASSIVE (60 nodes)  tom_p_001 – tom_p_060
// ---------------------------------------------------------------------------

N('tom_p_001','Shadow Mark','Increases death strike proc chance.','Passive',[],3,'Death Strike %',0.005,1,0,0);

// Death Strike % chain (nodes 2–16)
prev = 'tom_p_001';
for (let i = 0; i < 15; i++) {
  const id = `tom_p_${String(i+2).padStart(3,'0')}`;
  const tier = Math.floor(i / 4);
  N(id, `Dark Mark ${i+1}`, `Increases death strike proc chance (node ${i+1}/15).`, 'Passive', [prev], 3, 'Death Strike %', 0.005, 1, tier, i);
  prev = id;
}

// Mixed passive ATK/HP nodes (nodes 17–35)
prev = 'tom_p_016';
const mixedEffects = ['ATK','HP','ATK','HP','DEF','ATK','HP','DEF','ATK','HP','Crit %','Crit DMG','ATK','HP','ATK','HP','DEF','ATK','HP'];
for (let i = 0; i < 19; i++) {
  const id = `tom_p_${String(i+17).padStart(3,'0')}`;
  const effectType = mixedEffects[i];
  const baseVal = effectType === 'Crit %' || effectType === 'Death Strike %' ? 0.005 : 0.02;
  const tier = 1 + Math.floor(i / 6);
  N(id, `Passive Force ${i+1}`, `Passive enhancement to ${effectType} (node ${i+1}/19).`, 'Passive', [prev], 4, effectType, baseVal, 1.04, tier, i + 15);
  prev = id;
}

// Special passive nodes (nodes 36–60), branches from tom_p_001
prev = 'tom_p_001';
const specialEffects = ['Extra EXP','Monster Gold','HP Recovery','Skill DMG','Cooldown Reduction','ATK','HP','DEF','Crit %','Crit DMG',
                        'Death Strike','Death Strike %','Accuracy','Dodge','Movement Speed','ATK','HP','Extra EXP','Monster Gold','HP Recovery',
                        'Skill DMG','Cooldown Reduction','Crit %','Crit DMG','ATK'];
for (let i = 0; i < 25; i++) {
  const id = `tom_p_${String(i+36).padStart(3,'0')}`;
  const effectType = specialEffects[i];
  const isPct = ['Crit %','Death Strike %','Accuracy','Dodge','Movement Speed','Cooldown Reduction','HP Recovery'].includes(effectType);
  const baseVal = isPct ? 0.005 : 0.02;
  const tier = 2 + Math.floor(i / 8);
  N(id, `Mystic Passive ${i+1}`, `Mystical passive enhancement (node ${i+1}/25).`, 'Passive', [prev], 5, effectType, baseVal, 1.05, tier, i + 34);
  prev = id;
}

// ---------------------------------------------------------------------------
// Validate 370 nodes
// ---------------------------------------------------------------------------

if (nodes.length !== 370) {
  console.error(`ERROR: expected 370 nodes, got ${nodes.length}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

const tomData = {
  nodes,
  dependencies,
  totalSpent: {},
};

writeFileSync(OUT, JSON.stringify(tomData, null, 2));
console.log(`Wrote ${nodes.length} nodes and ${dependencies.length} dependencies to ${OUT}`);
