# Slayer Legend – Master Optimizer: Complete Technical Summary

> **Version:** 1.5.0 | **Format:** Google Sheets (xlsx export)  
> **Purpose:** A comprehensive player optimization tool for the mobile game *Slayer Legend*, covering character progression, equipment, skills, companions, constellations, and farming efficiency.

---

## Table of Contents

1. [Overview & Architecture](#overview--architecture)
2. [User-Facing Input Sheets](#user-facing-input-sheets)
   - [HOME](#home)
   - [APPEARANCE](#appearance)
   - [CHARACTER](#character)
   - [EQUIPMENT](#equipment)
   - [COMPANIONS](#companions)
   - [SKILLS](#skills)
   - [SKILL MASTERY](#skill-mastery)
   - [MEMORY TREE](#memory-tree)
   - [CONSTELLATION](#constellation)
   - [BLACK ORB](#black-orb)
3. [Calculator / Tool Sheets](#calculator--tool-sheets)
   - [Cube Optimizer](#cube-optimizer)
   - [Stage Farming Calculator](#stage-farming-calculator)
   - [Stage Search](#stage-search)
   - [Daily Diamonds](#daily-diamonds)
   - [Gold Enhancement Calculator](#gold-enhancement-calculator)
4. [Backend Math / Data Sheets](#backend-math--data-sheets)
   - [DMG EFFICIENCY MATHS](#dmg-efficiency-maths)
   - [CHARACTER MATHSDATA](#character-mathsdata)
   - [EQUIPMENT DATA](#equipment-data)
   - [Stage Farming Math](#stage-farming-math)
   - [Black Orb MATHSDATA](#black-orb-mathsdata)
   - [COMPANIONS DATA](#companions-data)
   - [SKILLS DATAMATH](#skills-datamath)
   - [SW Calculator MATH](#sw-calculator-math)
   - [CONSTELLATION DATA](#constellation-data)
   - [FAMILIARS DATAMATH](#familiars-datamath)
   - [TOM DATA](#tom-data)
   - [SOULSDATA](#soulsdata)
   - [Stage Data](#stage-data)
   - [Cube Optimizer Data](#cube-optimizer-data)
5. [Supporting / Reference Sheets](#supporting--reference-sheets)
   - [SPRITES](#sprites)
   - [Claude Cache](#claude-cache)
   - [TODO](#todo)
   - [W.I.P STATS](#wip-stats)
6. [Cross-Sheet Data Flow](#cross-sheet-data-flow)
7. [Key Formulas & Calculations Deep Dive](#key-formulas--calculations-deep-dive)
8. [Website Implementation Notes](#website-implementation-notes)

---

## Overview & Architecture

The spreadsheet is organized into three conceptual layers:

| Layer | Sheets | Purpose |
|---|---|---|
| **User Input** | HOME, APPEARANCE, CHARACTER, EQUIPMENT, COMPANIONS, SKILLS, SKILL MASTERY, MEMORY TREE, CONSTELLATION, BLACK ORB | Player enters their in-game data here (green cells only) |
| **Calculators** | Cube Optimizer, Stage Farming Calculator, Stage Search, Daily Diamonds, Gold Enhancement Calculator | Interactive tools producing recommendations |
| **Data/Math Backend** | DMG EFFICIENCY MATHS, CHARACTER MATHSDATA, EQUIPMENT DATA, Stage Farming Math, Black Orb MATHSDATA, COMPANIONS DATA, SKILLS DATAMATH, SW Calculator MATH, CONSTELLATION DATA, FAMILIARS DATAMATH, TOM DATA, SOULSDATA, Stage Data, Cube Optimizer Data | Lookup tables, game data, and intermediate computation |

The spreadsheet makes heavy use of Google Sheets-specific functions (`QUERY`, `SPARKLINE`, `IMPORTRANGE`, `ARRAYFORMULA`, `JOIN`) that are stored as `IFERROR(__xludf.DUMMYFUNCTION(...))` wrappers when exported to `.xlsx`, falling back to static or empty values. These will need to be re-implemented as native JavaScript logic in a web application.

---

## User-Facing Input Sheets

### HOME

**Purpose:** Navigation hub and version checker.

- Contains hyperlinks to every section of the document.
- Pulls the **MAIN VERSION** from an external Google Sheet via `IMPORTRANGE` (the authoritative master sheet URL is embedded).
- Stores the **YOUR VERSION** (`1.5.0`) as a hardcoded value and displays `UPDATE AVAILABLE!` if versions differ.
- Displays a summary of total constellation buff points pulled from `CONSTELLATION DATA!X29`.
- Sections listed: APPEARANCE, CHARACTER, EQUIPMENT, COMPANIONS, SKILLS, SKILL MASTERY, MEMORY TREE, CONSTELLATIONS, BLACK ORB, plus calculator tools.

---

### APPEARANCE

**Purpose:** Track owned clothing items and calculate their cumulative stat bonuses.

**Input (green cells):** Checkbox per clothing item (`TRUE`/`FALSE` = owned/not owned).

**Data structure (rows 6–64):**
- `OWN` (boolean checkbox)
- `CLOTHING` (item name)
- `BONUS TYPE` (e.g., Dodge, Extra EXP, Monster Gold, Accuracy)
- `EFFECT` (numeric value, e.g., 3.0, 0.05)
- `BONUS` – formula: `=IF(C6=TRUE, G6, 0)` — applies effect only if owned

**Output (column J+):** `SUMIF` totals per bonus type:
```
=SUMIF($F$6:$F$64, $J$6, $H$6:$H$64)
```
This aggregates total Dodge, Extra EXP, Monster Gold, Accuracy, etc. bonuses from all owned clothing.

**Note:** Yellow-highlighted clothing items affect character promotion optimization — the sheet warns users to check these.

**Bonus types tracked:** Dodge, Extra EXP, Monster Gold, Accuracy (and others in the data range).

---

### CHARACTER

**Purpose:** Central character stat input and upgrade prioritization engine.

**Sections:**

#### 1. ENHANCE (Auto Priority Table)
User enters current enhancement levels for 5 stats:

| Stat | Current Level (example) |
|---|---|
| ATK | 54,700 |
| CRIT DMG | 10,000 |
| CRIT % | 1,000 |
| DEATH STRIKE | 1,630 |
| DEATH STRIKE % | 1,000 |

- **Enhance Multiplier** (D5): How many levels to enhance at once (default: 10). This controls `ENHANCED LVL` calculations.
- **ENHANCED LVL** formula: `=IF(D8>=Q8, "MAX", IF((D8+$D$5)>=Q8, D8+(Q8-D8), D8+$D$5))`  
  Clamps to the max level cap, or adds the multiplier amount.
- **ENHANCE COST**: Pulled from the Gold Enhancement Calculator sheet for the exact gold required to enhance from current → enhanced level.
- **EFFICIENCY**: Pulled from `DMG EFFICIENCY MATHS` — a relative score for how much damage-per-gold each enhancement provides.
- **LVL UP PRIORITY**: Array formula that ranks all stats by their efficiency score (highest efficiency = enhance first).

#### 2. MANUAL Target Level Calculator
User can enter a custom `CURRENT LVL` and `TARGET LVL` for any stat to get the exact gold cost for that specific upgrade range.

- Stats covered: ATK, CRIT DMG, CRIT %, DEATH STRIKE, DEATH STRIKE %, HP, HP Recovery.
- **LVL DIFFERENCE**: `=IF(L8>M8, 0, M8-L8)`
- **TOTAL GOLD NEEDED FOR TARGET LEVELS**: `=SUM(R8:S12, R14:S15)` — sums all manual gold costs across all stats.

#### 3. Slayer Level
- User inputs current Slayer Level (e.g., 667).
- **EXP REQUIRED** for next level: `=VLOOKUP(F14, CHARACTER_MATHSDATA!A2:B4002, 2, 0)` — looks up from the 4,000-row EXP table.

#### 4. Growing Knowledge & Superhuman
- User selects a Growing Knowledge grade (e.g., Grade 2).
- **ATK EFFECT**: `=VLOOKUP(F17, CHARACTER_MATHSDATA!M3:N93, 2, 0)` — looks up the % bonus for the selected grade.
- Superhuman status (e.g., "Not Obtained") also tracked here.

#### 5. GROWTH Stats
User inputs levels for base growth stats:
- **STR** (ATK Damage) — level × growth factor from CHARACTER MATHSDATA
- **HP** (Health)
- **VIT** (Health Regen)

#### 6. LATENT POWER
Tracks 5 "pages" (Ⅰ–Ⅴ) of latent power upgrades for stats:
- STR, HP, CRI, LUK, VIT
- **REPLACEMENT PRIORITY**: Uses RANK formulas against `CHARACTER MATHSDATA` to show which latent power page to replace when a new slot opens.

#### 7. PROMOTIONS
Tracks promotion tier and associated bonuses (ATK%, Monster Gold%, etc.) pulled from `CHARACTER MATHSDATA` via `IF` chains matching promotion background options.

#### 8. CLASS
Tracks the character's equipped class bonuses (ATK from class type).

---

### EQUIPMENT

**Purpose:** Track weapon and accessory ownership, enhancement levels, and soul weapon engraving progress.

**Sections:**

#### 1. WEAPON ENHANCEMENTS
Lists all weapon tiers from Common 4 down to Immortal:

| Column | Content |
|---|---|
| OWN | Checkbox (owned/not owned) |
| WEAPON | Weapon tier name |
| ENHANCE LVL | Current enhancement level (user input) |
| EQUIPPED | Auto-calculated: `=IF(G7=TRUE, IF(M7=$E$14, "Equipped", "Owned"), "Not Owned")` |
| ENHANCE COST | `=IF(J7=VLOOKUP($C$6, EQUIPMENT_DATA!$W$104:$Z$128, 2, 0), "MAX", VLOOKUP(I7, EQUIPMENT_DATA!...))` — shows max or next cost |
| EQUIP EFFECT | `=ROUNDDOWN(EQUIPMENT_DATA!I3, 0) / 100` — weapon ATK bonus |
| OWNED EFFECT | `=M7 / 10 * 3` — passive owned bonus (30% of equip effect) |
| CRITICAL HIT | Weapon-specific crit hit bonus |

- **Awakened ORR** level (C6): Affects max weapon enhance level cap via `=200 + 50 * EQUIPMENT!$C$6`.

#### 2. SOUL WEAPON
- User selects which Soul Weapon they have (e.g., "Hatred").
- Soul weapon engraving progress and effects are tracked, feeding into DMG EFFICIENCY MATHS.

#### 3. ACCESSORY ENHANCEMENTS (Classes, Relics, Accessories)
Multiple accessory categories tracked similarly to weapons, each with own/not own, level, effect, and bonus columns.

#### 4. EXTRA GOLD / EXP from Equipment
Certain equipment pieces provide Extra Gold % and Extra EXP % bonuses — these are summed and fed into the Stage Farming Calculator.

---

### COMPANIONS

**Purpose:** Track the 4 companions (Ellie, Zeke, Miho, Luna) and their skill levels, element, promotion choices, and passive buff contributions.

**Structure (per companion):**
- **Name**, **Skin** (with sprite image lookup), **Element**, **Level**
- **Progress**: Uses `SPARKLINE` in Google Sheets (stored as fallback in xlsx) to show advancement progress bar.
- **Promotion Stage**: `=VLOOKUP('COMPANIONS DATA'!D3, 'COMPANIONS DATA'!U$7:V$55, 2, FALSE) * F5` — calculates total cube cost for advancement.

**Companion Skills tracked (rows 42–48 for each companion):**
- 7 promotion/advancement steps with buff types and values (Extra ATK, Extra EXP, Monster Gold, Extra HP).
- Each step mapped to a buff ID and calculated value using complex `IFS` and nested `IF` chains.

**Special Buffs tracked per companion:**
- **Ellie**: Wind's Song (%, cube/gold farming buff), passive ATK buff, elemental bonuses
- **Zeke**: Blade Dance ATK, Wisdom %, Soul Catch %, passive bonuses
- **Miho**: Red Greed %, passive HP/ATK
- **Luna**: Deep Sea Song %, passive bonuses

These values flow directly into the Stage Farming Calculator and DMG EFFICIENCY MATHS.

---

### SKILLS

**Purpose:** Input elemental damage multipliers and character combat stats for skill damage calculations.

**Sections:**

#### 1. Elemental Damage Inputs
- **Fire, Water, Wind, Earth, Lightning** — each element's damage multiplier.
- Can use `Auto Values` (pulled from BLACK ORB sheet) or `Manual Inputs`.

#### 2. Character Stats (for skill calculation)
- Total ATK, Crit DMG — auto-pulled from `DMG EFFICIENCY MATHS` or manual override.

#### 3. Companion Bonuses per Skill
- Tracks which companion (Noah, Loar/Mum, etc.) applies to each skill slot.
- **Modified Value** formula: `=IF(N8<>"None", IF(P8, N8*1.1, N8), 1)` — applies 10% partner bonus if applicable.

#### 4. Skill Proficiency
- User inputs their proficiency level.
- Proficiency bonus applied to all skill damage calculations.

**Output:** Calculated damage values per skill based on ATK, Crit DMG, element multipliers, and companion bonuses.

---

### SKILL MASTERY

**Purpose:** Track 8 pages of skill mastery unlocks across all skills.

**Layout:** 8 pages spread horizontally across 183 columns.

**Per skill node:**
- **Status**: Boolean (unlocked/not) or numeric level
- **COST display**: Dynamic formula e.g., `=IF(J9=TRUE, "MAX", "COST: " & 100)` — shows unlock cost or MAX
- **REQUIREMENT display**: Shows what must be completed first (e.g., "ACC M4", "WEAPON M3")
- **BONUS display**: `=IF(J9=TRUE, "BONUS: 3x DMG", "ACC M4")` — shows the bonus when maxed

**Bonus types tracked:**
- 3x DMG bonus (boolean unlock)
- ATK % bonus (numeric, e.g., `=BR9*2.5`)
- HP AMP bonus
- EXP bonus
- Feather upgrades

**Each mastery page covers different skill categories** (SKILL, ATK, HP AMP, EXP, FEATHER, etc.).

---

### MEMORY TREE

**Purpose:** Track the Immortal Memory Tree (TOM — Tree of Memory) node levels, costs, and upgrade recommendations.

**Summary Section (top):**
- **CURRENT LEVEL** (pulled from `AC21`)
- **BREAKTHROUGH** level (from `AC20`)
- **Progress**: "Main Node Progress: X / Y" and "Sub Node Progress: X / Y"

**Resource Cost Lookup (per farm mode):**
Resources tracked: Cube, Gold, EXP, Mana Crystal — costs per farming type (FoC, TC, ALL, STAGE, CM, RIFT).

All costs use `QUERY` functions (Google Sheets specific) against the backend TOM DATA table, falling back via `IFERROR` in xlsx.

**Bonus Stats:**
- **BONUS ATK** (`=AC43`) and **BONUS HP** (`=AC44`) — total bonuses from all unlocked nodes.

**Upgrade Recommendations:**
- Auto Set Level input (row 9)
- ADD / MULT modifiers
- Level recommendation pulled from TOM DATA subnode structure

**Node Tree:** 370 rows tracking individual sub-nodes with their level states, costs, and dependencies.

---

### CONSTELLATION

**Purpose:** Track the 12 zodiac constellation systems and their star crafting progress.

**Constellations tracked:** Aries, Cancer, Libra, Taurus, Capricorn, Aquarius, Leo, Pisces (and more).

**Per constellation:**
- **LEVEL**: Pulled from `CONSTELLATION DATA`
- **STARS CRAFTED**: Count of crafted stars
- **Resource costs per star** (CUBE, GOLD, EXP): Using `VLOOKUP` against constellation data by type (Dimensional Rift, All, Stage, etc.)

**Buff summaries by farming mode:**
- Chaos Soul - All
- Gold - Dragon Valley  
- Dragon Spark - SoSF
- Extra ATK
- Extra HP Recovery

**Bonus contributions to other sheets:**
- `AH11`: Extra ATK bonus → fed into DMG EFFICIENCY MATHS
- `AH12`: Completion bonus
- `AW11`: Wind element bonus → fed into BLACK ORB
- `U9`, `U10`: Cube bonuses → fed into Stage Farming Calculator
- `BB8`: Dice bonus → fed into Stage Farming Calculator

---

### BLACK ORB

**Purpose:** Calculate elemental damage bonuses from all sources for each element.

**Elemental Damage Source Aggregation:**
For each element (WIND, EARTH, FIRE, WATER, LIGHTNING), sums bonuses from:
- Companion bonuses (e.g., Ellie's bonus via `COMPANIONS!D9`)
- Understanding bonuses (e.g., Wind's Understanding from `COMPANIONS!G24`)
- Equipment bonuses (Eye of Typhoon, Sealed Shrine, etc.)
- Constellation bonuses (`CONSTELLATION!AW11`)
- Companion companion bonuses (Zeke's bonus)

**Element Accessory System:**
- For each accessory slot, tracks which element(s) it applies to (WIND, EARTH, FIRE, WATER, ALL).
- If the equipped element matches the accessory element, a 2x multiplier is applied: `=IF(I$5=H6, "(x2)", "")`.
- **Total AMP per element formula:** `=SUMIF(H$6:I$9, H10, J$6:J$9) * IF(I$5=H10, 2, 1) + SUMIF(H$6:I$9, "ALL", J$6:J$9)`

**Overwrite Toggle (D27):** When `TRUE`, all manual inputs are overwritten with auto-calculated values from their source sheets.

**Output:** Total elemental multipliers per element type, fed into SKILLS sheet for damage calculations.

---

## Calculator / Tool Sheets

### Cube Optimizer

**Purpose:** Recommend optimal weapon and class enhancement targets based on CRIT DMG efficiency.

**Inputs (green cells):**
- OWN (checkbox) and CURRENT LVL for each weapon tier (Common 4 → Immortal, ~16 tiers)
- OWN (checkbox) and CURRENT LVL for each class grade (Grade 1 → Grade 17)
- CRIT DAMAGE values input section

**"ENHANCE TO" Calculation:**
Uses array formula against `Cube Optimizer Data` to determine the optimal next enhancement level for each item based on CRIT DMG efficiency scores.

**HOW TO USE:**
1. Input current levels and CRIT DAMAGE values
2. Press "Calculate" button (script-driven)
3. Sheet displays which levels to enhance to

**Output:** Per-item "Enhance To" targets that maximize CRIT DMG return per cube spent.

---

### Stage Farming Calculator

**Purpose:** The main farming optimization hub. Determines the best stage to farm given the player's character stats, bonuses, and goals.

**Input sections:**

#### Basic Details
- Extra Gold %
- Extra EXP %
- Cubes - Stage bonus %
- Cubes - ALL bonus %
- Dice - Stage bonus %
- Ellie's Wind Song % (auto-pulled from COMPANIONS)
- Miho's Red Greed % (auto-pulled from COMPANIONS)
- Luna's Deep Sea Song % (auto-pulled from COMPANIONS)
- Zeke's Wisdom % (auto-pulled from COMPANIONS)
- Soul Catch % (auto-pulled from COMPANIONS)
- **Overwrite toggle** (F29): `TRUE` = use auto values from other sheets

#### Soul Weapon Calculator
- CURRENT FARM STAGE (e.g., Stage 1,389)
- Current Soul Weapon and target Soul Weapon
- Crafting requirements lookup: `=VLOOKUP(W18, EQUIPMENT_DATA!$X$4:$Y$100, 2, 0)` for souls needed
- **Hours Remaining**: `=IF(Y13>0, "READY!", STAGE_FARMING_MATH!N39 * 60)` — time to craft at current farming rate
- **Minutes Remaining**: Similar calculation

#### Offline Hunt
- IDLE TIME (minutes): User input
- Shows per-minute rates for Gold, EXP, Cubes, Stones, Souls, Dice, Diamonds during idle period
- VS BEST OVERALL comparison ratios

#### Spirit Buffs
- Toggles for TODD, LUGA spirit buffs (and others)
- Each uses `VLOOKUP` against companion data to get buff multipliers

#### Scroll Blessing
Toggles for: Gold, EXP, Cubes, Equipment, Hot Time — each multiplies farming rates (×2 or ×3)

#### Farming Efficiency Rankings (Best Stage)
Auto-calculated rankings for:
- **BEST GOLD**: `=VLOOKUP(MAX(Stage_Farming_Math!P3:P12), ...)` — Stage # with highest gold/minute
- **BEST EXP**: Stage with highest EXP/minute
- **BEST CUBES**: Stage with highest cubes/minute
- **BEST STONES**: Stage with highest stones/minute
- **BEST DIAMONDS**: Stage with highest diamonds/minute
- **BEST SOULS**: Stage with highest souls/minute

#### Stage Comparison Table (rows 41–44)
Up to 10 stage candidates (user-entered or auto-populated from search) are scored and ranked:
- Columns: Stage#, Gold, EXP, Cubes, Stones, Diamonds, Souls
- Per-stage score normalized by MAX of each resource column
- Composite "BEST OVERALL" score = weighted sum of normalized scores

#### Layout Visualizer (right side)
Visual representation of Soul Weapon progression pulled from `SW Calculator MATH`.

---

### Stage Search

**Purpose:** Look up full details for any stage number.

**Input:** Enter stage number (e.g., 201) in cell E4.

**Outputs via VLOOKUP against Stage Data (2,002 rows):**
- Area name and Stage name
- Zone (I, II, III, etc.)
- Region Soul type
- Mobs Per Wave
- Mob HP
- Current Gold Bonus (e.g., "x2.5" for stages > 90)
- Boss image (sprite lookup)
- Region image (sprite lookup)

**Data availability notes:**
- Boss images: Stages 1–1,560
- Region images: Stages 1–1,660
- Stage & region names: Stages 1–1,560

---

### Daily Diamonds

**Purpose:** Track diamond income, equipment inventory, and calculate time/diamonds needed to reach target equipment.

**Equipment Calculator:**
- **TARGET EQUIP**: User selects desired equipment rarity (e.g., Mythic 1)
- **EQUIP TYPE RETURNED**: What rarity actually comes from the pity system
- **Online hours/day** and **Equip Scroll hours/day** inputs
- Equipment inventory counts by rarity (Common 4 → Mythic 1, ~24 tiers)

**Equipment Count Table:**
```
=SUM(N10, Q10) - FLOOR(SUM(N10, Q10), 5)   // REMAINDER after combining
=FLOOR(SUM(N10, Q9), 5) / 5                  // COMBINE count (5→1 per tier)
```
This models the equipment combination system where 5 of one tier combine into 1 of the next.

**Equip Total (combined value):**
`=N10 * 5^(MATCH(R10, $R$10:$R$33, 0)-1)` — normalizes all rarities to equivalent Common 4 value.

**Weapon/Accessory Pity Summons:**
Tracks pity counters and diamonds required per summon type across multiple class summon levels.

**Class Summon Level table:** 17 levels, each with diamonds per pull and pity threshold.

**BEST OVERALL STAGE** recommendation integrated from Stage Farming Calculator.

---

### Gold Enhancement Calculator

**Purpose:** Precisely calculate the gold cost to enhance any stat from a current level to a target level.

**The Core Formula:**
Enhancement cost uses a polynomial-based formula that changes at 5,000-level intervals (break points at 70,000, 75,000, 80,000, ... up to 1,000,000+).

The cumulative cost up to level N formula (per segment):
```
= J * (N*(N+1)*(2*N+1)*(3*N^2+3*N-1)) / (100^4 * 30)
  + (N*(N+1)/2)^2 / 100^2
  + (N*(N+1)/2) / 100
```
Where J is the **extra multiplier** that increases at each 5,000-level threshold.

**Gold for range [from, to] = CumulativeCost(to) - CumulativeCost(from)**

This is computed across up to 388 segments to cover the full level range, then summed.

**Auto Table (ATK, CRIT DMG, CRIT %, DEATH STRIKE, DEATH STRIKE %, HP, HP Recovery):**
Each stat has its own column with current→enhanced level lookups, returning the gold cost for the auto-enhance step.

**Manual Table:**
Separate columns for user-defined current→target ranges for each stat.

---

## Backend Math / Data Sheets

### DMG EFFICIENCY MATHS

**Purpose:** The core damage calculation engine. Computes total ATK and total damage output, then calculates enhancement efficiency for each stat.

#### ATK Calculation (column A–D, rows 3–24)
Additive bonus sources (each as a multiplier stacked):
| Source | Formula |
|---|---|
| Mantra (skill) | `=SKILLS!T13` |
| Weapon Total | `=SUM(EQUIPMENT!$E$14:$E$15)` |
| Zeke Blade Dance ATK | `=COMPANIONS!$P$18` |
| Class ATK | `=SUM(CHARACTER!$J$52:$K$53)` |
| Promotion | `=CHARACTER!$D$51` |
| Spirits ATK | Array formula against spirit data |
| ATK Stats | `=CHARACTER!$D$8 * EQUIPMENT_DATA!$V$31 * D40` |
| ATK Growth | `=CHARACTER!$V$25 * D40` |
| Soul Weapon | `=EQUIPMENT!$E$11 * (1 + EQUIPMENT!S11 + EQUIPMENT!N83)` |
| Growing Knowledge | `=CHARACTER!$F$19 * D40` |
| SW Engraving | `=EQUIPMENT_DATA!V65` |
| Relic Strength Gloves | `=EQUIPMENT!$E$73 * EQUIPMENT_DATA!$AA$132` |
| Companion Promotion | `=COMPANIONS_DATA!$V$2` |
| Slayer Promotion | `=IF(CHARACTER!$C$55=TRUE, CHARACTER!$G$49, 0)` |
| Skill Mastery | `=SKILLS_DATAMATH!AW3` |
| Ellie BOF | `=COMPANIONS!$G$17` |
| TOM - Growth | `=MEMORY_TREE!AC43` |
| Constellation Level up | `=CONSTELLATION!AH11` |
| TOM - Breakthrough | `=MEMORY_TREE!AC46` |
| Constellation Completion | `=CONSTELLATION!AH12` |
| Companions - Beast - Passive | `=COMPANIONS_DATA!GH2` |
| Companions - Beast - Mounted | conditional |

**Total ATK Product:** `=PRODUCT(C3:C24)` — all sources multiplied together.

#### CRIT DMG Calculation (rows 27–36)
Additive CRIT DMG sources:
- CRIT Stats from CHARACTER
- Growth bonus
- Soul Weapon engraving
- Skill Mastery bonus
- Constellation bonus
- Accessory bonuses

**Total CRIT DMG:** `=ROUND(PRODUCT(C29:C37), 3)`

#### Total Damage Formula
```
ATK_DMG = BASE_ATK * (1 - CRIT_CHANCE) * (1 - DS_CHANCE)
         + BASE_ATK * CRIT_DMG * DS_DMG * CRIT_CHANCE * DS_CHANCE
         + BASE_ATK * CRIT_DMG * (CRIT_CHANCE - CRIT_CHANCE*DS_CHANCE)
         + BASE_ATK * DS_DMG * (DS_CHANCE - CRIT_CHANCE*DS_CHANCE)
```
Where CRIT_CHANCE = crit hit probability, DS_CHANCE = death strike probability.

#### Enhancement Efficiency Calculations
For each stat (ATK, CRIT DMG, CRIT %, Death Strike, Death Strike %):
1. **NEW STAT**: Calculates new total with the enhancement applied
2. **NEW ATK DMG**: Recalculates full damage formula with new stat
3. **ATK EFF**: `= NEW_ATK_DMG / CURRENT_ATK_DMG` — damage multiplier from enhancement
4. **ENHANCE COST**: Gold cost for this enhancement step (from Gold Enhancement Calculator)
5. **ENHANCE EFF**: `= (ATK_EFF - 1) / ENHANCE_COST` — damage gain per gold spent

These efficiency values are what feed the priority rankings in the CHARACTER sheet.

---

### CHARACTER MATHSDATA

**Purpose:** Game data tables used for character-level lookups.

**Tables included:**

| Table | Rows | Content |
|---|---|---|
| SLAYER LEVEL | 4,002 rows | Level → EXP required |
| PROMOTION | ~10 rows | Promotion tier → rank, ATK/HP bonus |
| PROMOTION BONUS | ~10 rows | Tier → Extra ATK%, Monster Gold% bonus |
| GROWTH KNOWLEDGE | ~90 rows | Grade → ATK effect multiplier |
| ABILITY OPTIONS | Various | Promotion ability option names |
| NUMBER TO WORDS CONVERTOR | Reference | Large number formatting (e.g., 10^33 → text) |

**Promotion Bonus Formula:**
```
=IF(CHARACTER!D57 = "Extra ATK(%)", CHARACTER!E57/100, 0)
```
Cumulative stacking: each row adds the previous row's total: `=(IF(...))/100 + G3`

**Growth Multipliers** (column AF): Factor per growth stat level — used in CHARACTER sheet growth calculations.

**ATK/HP Growth Formula (with Latent Power):**
When a latent power bonus applies, it only affects promotions above a certain tier:
```
=G9 + (IF(CHARACTER!D57 = "Extra ATK(%)", CHARACTER!E57, 0) * H10) / 100
```

---

### EQUIPMENT DATA

**Purpose:** Comprehensive equipment database (1,704 rows, 300 columns).

**Major sections:**

| Section | Content |
|---|---|
| WEAPONS | ~17 tiers, with multiplier, crit factors, gold bonus factors |
| SOUL WEAPONS | Level data, engraving values, ATK/CRIT bonuses |
| LEVEL (Equip ATK factor) | Level → ATK multiplier lookup table (1,400 rows) |
| Orr Cost | Awakened ORR → max level cap |
| Weapon Cost Factor | Grade-specific cost multiplier |
| Class Cost Factor | Class grade-specific cost multiplier |
| ACCESSORIES | Various accessory types, their effects and costs |
| RELIC data | Relic items and their enhancement bonuses |

**Key lookup: Equip ATK factor** (column L–M, 1,400 rows):
Every weapon uses `VLOOKUP(current_level, $L$3:$M$1403, 2, FALSE)` to get the ATK multiplier for that level.

**Soul Weapon Lookup** (column X–AE):
Maps soul weapon names to their Dignity/stage requirements, soul cost, and crafting parameters.

**ATK Stat Multiplier** (V31, V33, V35, V37, V65): Pre-computed multipliers for each stat's contribution to base ATK, referenced by DMG EFFICIENCY MATHS.

---

### Stage Farming Math

**Purpose:** All intermediate farming rate calculations feeding into the Stage Farming Calculator display.

**User Input Block** (pulls from Stage Farming Calculator):
- MAX STAGE (B2)
- Stage Gold Bonus: `=VLOOKUP(B2, Stage_Data!$A$2:$T$2002, 13, 0)`
- Extra Gold, Extra EXP (from Stage Farming Calculator)
- Wind Song %, Red Greed %, Deep Sea Song % (companion bonuses)
- Scroll Blessing multipliers (Gold ×3/×1, EXP ×3/×1, Cubes ×3, Equipment ×2, Hot Time ×2)

**Spirit Buff Block:**
- Per spirit (TODD, LUGA, etc.): `=IF(VLOOKUP(G2, Stage_Farming_Calculator!$C$43:$F$44, 4, 0)=TRUE, VLOOKUP(...), 1)` — applies spirit modifier only if active.

**Spirit Skill Level table:** Levels I–V with multipliers (0.1, 0.22, 0.35, 0.5, 0.8, etc.)

**Offline Hunt Rates** (per stage):
```
EXP GAIN    = VLOOKUP(MAX_STAGE, Stage_Data!..., 24, 0) * (1 + ExtraEXP) * N2
CUBE GAIN   = VLOOKUP(MAX_STAGE, Stage_Data!..., 25, 0) * (1 + ExtraCube + N13) * N2 * (1 + N12)
STONE GAIN  = ROUNDDOWN(VLOOKUP(..., 26, 0) * N2 / 4, 0) * 4
SOUL GAIN   = VLOOKUP(..., 28, 0) * N2
DICE GAIN   = N2 * VLOOKUP(..., 27, 0) * (1 + N14)
DIAMOND GAIN= VLOOKUP(..., 29, 0) * N2
```
Where N2 = offline time factor.

**Stage Ranking** (columns P–W): Scores each of 10 candidate stages across 5–6 resource dimensions, normalized and combined into composite score.

**Soul Weapon Crafting Math** (N31–N39): Calculates souls remaining needed for each SW tier, conversion ratios, and time remaining.

---

### Black Orb MATHSDATA

**Purpose:** Black Orb (Black Mana system) level data and gacha probabilities.

**Tables:**

| Table | Content |
|---|---|
| BLACK MANA INFO DATA | Level, Stage unlock, Soul amount required, Maximum soul cap |
| LEVEL DATA | Level, Main Ability Value (ATK bonus) |
| GATCHA DATA | Gacha pull probabilities per level |

**Soul Cost scaling:** Exponential — `Level 1: 100 souls, Level 2: 300, Level 3: 900, Level 4: 2,700...` (×3 each level).

**Maximum Count:** Similarly exponential — `500,000 → 1,500,000 → 4,500,000...`

---

### COMPANIONS DATA

**Purpose:** All companion advancement data and buff calculations.

**Per companion (Ellie, Zeke, Miho, Luna):**

**Buff Aggregation** (rows 2–4):
```
Extra ATK total   = SUMIF(COMPANIONS!$D$42:$G$48, "Extra ATK", COMPANIONS_DATA!$D$7:$D$13)
Extra EXP total   = SUMIF(..., "Extra EXP", ...)
Monster Gold total= SUMIF(..., "Monster Gold", ...)
Max Advancement   = MAX(advancement step column)
```

**Advancement Step → Buff ID Mapping** (rows 7–13):
Complex `IF` chains map each advancement step (1st, 2nd, 3rd... through 14th) to an internal ID:
```
=IF(step=0, 0, IF(step="1st", 1, IF(step="2nd", 8, IF(step="3rd", 15, ...))))
```

**Buff Value Calculation** (column D):
```
=IFS(
  TYPE(step)=128, 0,                              // Empty
  step="1st", companion_value * 1,
  step="2nd", companion_value * cumulative_factor,
  ...
)
```

**Cross-companion totals** (column U–V):
- Extra HP total = `B4 + G4 + L4 + Q4` (sum of all 4 companions' HP bonus)

**Promotion Options Table** (column X+): Maps promotion option IDs to names and values.

**Beast Companion Data** (column GH): Special passive and mounted bonus calculations for beast-type companions.

---

### SKILLS DATAMATH

**Purpose:** Complete skill database for all game skills (301 rows).

**Per skill:**
- Skill name, tier (Common/Great/Rare/Epic/Legendary/Mythic)
- Internal ID, Slot Index
- Damage type (`dmgType`)
- Basic description and specific damage formula description
- Current level (array formula lookup)

**Damage type values:** 1 = Fire, 2 = Water, 3 = Wind, 4 = Earth, etc.

**Used by:** SKILLS sheet to display current skill levels and the mastery bonus calculation.

---

### SW Calculator MATH

**Purpose:** Soul Weapon crafting requirement calculations across all weapon tiers.

**1,772 rows covering all soul weapon levels and tiers.**

**Auto vs Manual modes:** 
- Auto: pulls current SW from `EQUIPMENT!E8` and target from Stage Farming Calculator
- Manual: user-entered values with toggle overrides

**Per SW tier lookup table** (AI column):
```
=IF($AH$2="Current Tier", B24, B38)  // Switches between tier calculation blocks
```

**Souls needed calculation** for each weapon name/level combination, accounting for:
- Soul conversion ratios between stages
- Current accumulated soul count
- Farming rate per hour at current stage

**Output to Stage Farming Calculator:** Hours remaining, souls remaining, crafting feasibility.

---

### CONSTELLATION DATA

**Purpose:** Complete constellation buff database (365 rows, 94 columns).

**Per constellation node:**
- NodeId, Sign (zodiac), SubNodeId
- StarSize (Small/Medium/Large), StarEnergy cost
- BuffType (EXP, Cube, Dragon Spark, Chaos Soul, Gold, etc.)
- AppliesTo (Training Cave, Dimensional Rift, SoSF, Stage, All, etc.)
- BuffValue (%)

**Aggregation functions** (column M–N, rows 20–43):
Pre-computed resource totals per farming mode (using QUERY in Google Sheets), referenced by the CONSTELLATION sheet:
```
=VLOOKUP(resource_type & " - " & farm_mode, $M$20:$N$43, 2, 0)
```

**Summary stats** (column Q, X):
- Total buff contributions per zodiac sign
- Grand total across all signs (X29) — displayed on HOME sheet

---

### FAMILIARS DATAMATH

**Purpose:** Demon/Familiar system data.

**Tables:**

| Table | Content |
|---|---|
| DemonAltarData | Level, SkillDmgAdd (%), Soul cost, NeedLevelCount |
| DemonSkillData | Level, Grade |
| DemonLevelData | Level thresholds |
| DemonSanctuaryData | Sanctuary bonuses |

---

### TOM DATA

**Purpose:** Memory Tree node dependency and cost data.

**Tables:**

| Table | Columns | Content |
|---|---|---|
| ImmortalTreeSubNodeData | Id, NeedTreeLevel, MainNodeIndex, NodeNumber, NeedNodeNumber__001–003, NodeType | Dependency graph for each sub-node |
| ImmortalTreeMainNodeData | Main node definitions | |
| ImmortalTreeUpgradeData | Cube costs per upgrade level | |

**Dependency structure:** Each sub-node references up to 3 prerequisite node numbers that must be unlocked first.

---

### SOULSDATA

**Purpose:** Stage soul drop data for soul weapon farming calculations.

**100 rows** covering:
- Stage Main Number (1–100)
- Stage Number (actual stage)
- Soul Type (0 = common, 13/14/15 = element specific)
- Soul Probability (drop rate multiplier)
- Soul Amount per drop

---

### Stage Data

**Purpose:** Master stage database (2,006 rows covering all 2,000+ stages).

**Per stage (43 columns):**
- NUMBER, AREA, STAGE name, ZONE (I–V)
- Full Stage Name (combined)
- MOBS per wave
- ITEM TYPE (Weapon/Accessory), ITEM RATING (Common 4 → Mythic)
- Gold Bonus multiplier
- EXP per stage run
- Cube drop rate
- Stone drop rate
- Soul data (type, amount)
- Dice drop rate
- Diamond drop rate
- Region Soul type
- Boss image reference
- Region image reference

---

### Cube Optimizer Data

**Purpose:** Backend data for the Cube Optimizer tool.

**Weapon Grade table:**
- Grade name (Common 4 → Immortal)
- Cost Factor (cube cost multiplier per level)
- Eq Factor (equipment ATK contribution per enhance level)
- Crit Factor (CRIT DMG contribution per enhance level)

**Class Grade table:**
- Grade 1–17, cost factor, Eq factor, additional factors

**User Item Data:** Mirrors current and target levels from Cube Optimizer sheet for script processing.

**Script Output block:** Where the optimization algorithm writes its results (typically via a Google Apps Script).

---

## Supporting / Reference Sheets

### SPRITES

**Purpose:** Lookup table mapping companion skin names and in-game page numbers to image URLs (Google Sheets IMAGE formula references in xlsx).

**Per companion:** 554 rows covering all available skins for Ellie, Zeke, Miho, Luna.

**Also contains:**
- Page number → image mappings
- Cube/Diamond/Dice/Equipment Scroll/EXP/Gold scroll drop type icons
- Stage boss image index
- Stage ranking table (column N–Q): drop reward icons by level thresholds (e.g., level 20 → 20 scrolls, level 40 → 40 scrolls)

---

### Claude Cache

**Purpose:** Reserved cache sheet for `=CLAUDE()` custom function calls.

- Stores Key, Value, Expiration columns.
- Users are warned not to edit this sheet.
- Used by AI-assisted features within the Google Sheets environment.

---

### TODO

**Purpose:** Development tracking and changelog.

**Sections:**
- **Checklist**: Feature completion status (Level, Enhance, Growing Knowledge, Growth, Latent Power, Promotions, Class, HP promotion)
- **To Do / Possible Ideas**: Missing data (boss images 1560+, spirit level multipliers 700–800, sealed shrine buffs, Black Orb level 63+ values, SW names 1700+)
- **Update Logs**: v0.2.1 through v1.5.0 changelogs

---

### W.I.P STATS

**Purpose:** Work-in-progress summary stats display.

Shows current character level and key stats (ATK, HP, HP Recovery, CRIT %) pulled from `DMG EFFICIENCY MATHS`, with array formulas for additional metrics.

---

## Cross-Sheet Data Flow

```
User Inputs (APPEARANCE, CHARACTER, EQUIPMENT, COMPANIONS, SKILLS,
             SKILL MASTERY, MEMORY TREE, CONSTELLATION, BLACK ORB)
                    │
                    ▼
         DMG EFFICIENCY MATHS
         (aggregates ALL damage sources)
                    │
          ┌─────────┼──────────┐
          ▼         ▼          ▼
     CHARACTER    SKILLS    W.I.P STATS
   (priority     (damage    (summary)
    rankings)     calcs)
   
   
User Inputs + DMG EFFICIENCY MATHS + Stage Data
                    │
                    ▼
        Stage Farming Math
        (per-stage resource rates)
                    │
                    ▼
     Stage Farming Calculator
     (best stage recommendations,
      SW crafting timer,
      offline hunt rewards)
   
   
CHARACTER → Gold Enhancement Calculator
(current level, target level)
        │
        ▼
   Gold cost per stat
        │
        └──────► DMG EFFICIENCY MATHS (efficiency = damage gain / gold)
                        │
                        └──────► CHARACTER (priority rankings)
```

---

## Key Formulas & Calculations Deep Dive

### Enhancement Gold Cost (Polynomial Formula)

The gold cost to enhance from level `A` to level `B` uses a degree-5 polynomial that changes multiplier at every 5,000-level breakpoint. In each segment with multiplier `J`:

```
CumulativeCost(N) = J * (N*(N+1)*(2*N+1)*(3*N^2+3*N-1)) / (100^4 * 30)
                  + (N*(N+1)/2)^2 / 100^2
                  + (N*(N+1)/2) / 100
```

Cost for range = `CumulativeCost(B-1) - CumulativeCost(A-1)`

### Total Damage Formula (4-Component Model)

All damage calculations use this model accounting for CRIT and Death Strike as independent random events:

```
Total_DMG = BASE * (1 - C%) * (1 - DS%)           // No crit, no DS
          + BASE * CRIT_DMG * DS_DMG * C% * DS%    // Both crit and DS
          + BASE * CRIT_DMG * (C% - C%*DS%)        // Crit only
          + BASE * DS_DMG * (DS% - C%*DS%)          // DS only
```

Where:
- `BASE` = Total ATK (product of all multiplicative ATK sources)
- `C%` = CRIT hit chance
- `DS%` = Death Strike chance
- `CRIT_DMG` = Crit damage multiplier
- `DS_DMG` = Death Strike damage multiplier

### Enhancement Efficiency

```
Efficiency = (new_damage / old_damage - 1) / enhance_gold_cost
```

Higher = better return on gold investment. Used to rank which stat to enhance next.

### Soul Amount Scaling (Black Orb)

```
Level N souls required = 100 * 3^(N-1)
Level N max capacity   = 500,000 * 3^(N-1)
```

### Companion Buff Aggregation

```
Total_Extra_ATK = SUMIF(advancement_choices, "Extra ATK", buff_values)
```
Advancement steps map nonlinearly: step 1=1, step 2=8, step 3=15... (internal ID system).

---

## Website Implementation Notes

The following considerations are critical for translating this spreadsheet to a web application:

### Data Import System
The spreadsheet supports sharing between players — the "DATA" sheets (EQUIPMENT DATA, Stage Data, CONSTELLATION DATA, TOM DATA, SKILLS DATAMATH, etc.) are maintained externally and imported. A website should support:
- **Import via file upload**: Accept `.xlsx` files containing updated data sheets.
- **Selective import**: Only update specific data sheets, preserving user progress data.
- **Version checking**: Compare against a master version (currently via `IMPORTRANGE` from a public Google Sheets URL).
- **Data sheet identification**: Sheets named `*DATA*` or `*DATAMATH*` or `*MATH*` should be treated as importable game data, separate from user state.

### User State (Saveable Fields)
All boolean checkboxes and numeric inputs from the user-facing sheets constitute the save state. Key user data to persist:
- Clothing ownership flags (APPEARANCE)
- Enhancement levels, Slayer level (CHARACTER)
- Equipment ownership + levels (EQUIPMENT)
- Companion skin selections + advancement steps (COMPANIONS)
- Skill mastery unlock states (SKILL MASTERY)
- Memory Tree node levels (MEMORY TREE)
- Constellation node levels (CONSTELLATION)
- Black Orb manual inputs (BLACK ORB)
- Stage Farming Calculator inputs (farming stage, bonus percentages)
- Cube Optimizer current levels

### Google Sheets Specific Functions to Reimplement
These functions are used throughout and require JavaScript equivalents:
- `QUERY(range, sql)` → client-side data filtering/aggregation
- `SPARKLINE(...)` → small inline chart components
- `IMPORTRANGE(...)` → HTTP fetch from master spreadsheet or API
- `ARRAYFORMULA(...)` → map operations over arrays
- `JOIN(delimiter, range)` → `Array.join()`
- `REGEXMATCH(text, pattern)` → `RegExp.test()`
- `FILTER(range, condition)` → `Array.filter()`

### Calculation Architecture
All major computation modules to implement as JavaScript functions:
1. **Gold Cost Calculator**: `calcEnhanceCost(stat, fromLevel, toLevel)` using the polynomial formula
2. **ATK Aggregator**: Multiply all 24 ATK sources
3. **Damage Model**: 4-component formula with CRIT and Death Strike
4. **Efficiency Ranker**: For each stat, compute efficiency score and rank
5. **Stage Ranker**: Normalize and weight multi-resource farming scores
6. **Cube Optimizer**: Efficiency scoring per weapon/class tier

### Performance Considerations
- `CHARACTER MATHSDATA`: 4,002 rows — should be indexed by level for O(1) lookup
- `EQUIPMENT DATA`: 1,704 rows × 300 columns — load only required columns
- `Stage Data`: 2,006 rows — should be loaded once and cached
- `Gold Enhancement Calculator`: 388 segment formula can be computed inline, no table needed
- `SKILLS DATAMATH`: 301 skills — small enough for full in-memory use

### Importable Data Sheets (Updated by Community)
These sheets contain game data that changes with game updates and should be importable:
- `EQUIPMENT DATA`
- `Stage Data`
- `CONSTELLATION DATA`
- `TOM DATA`
- `SKILLS DATAMATH`
- `FAMILIARS DATAMATH`
- `SOULSDATA`
- `Black Orb MATHSDATA`
- `COMPANIONS DATA` (advancement options and buff tables)
- `Cube Optimizer Data`
- `SPRITES`
- `CHARACTER MATHSDATA`

### Non-Importable Sheets (User Data)
- `APPEARANCE`, `CHARACTER`, `EQUIPMENT`, `COMPANIONS`, `SKILLS`, `SKILL MASTERY`, `MEMORY TREE`, `CONSTELLATION`, `BLACK ORB`
- All calculator sheets with user inputs

---

*This document was generated by analyzing the Slayer Legend Master Optimizer spreadsheet v1.5.0. All formula logic, data structures, and cross-sheet dependencies have been documented to support a full web application implementation.*
