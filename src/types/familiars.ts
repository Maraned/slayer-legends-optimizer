/**
 * FAMILIARS_DATAMATH type definitions.
 * Matches the structure of src/data/familiars-maths-data.json.
 */

/** One row of the DEMON_ALTAR table. */
export interface DemonAltarEntry {
  /** Altar upgrade level (1–50). */
  level: number;
  /**
   * Additive skill damage bonus granted at this altar level
   * (e.g. 0.05 = +5% skill damage per level).
   */
  skillDmgAddPercent: number;
  /** Soul cost required to reach this altar level. */
  soulCost: number;
  /** Minimum familiar level count required to unlock this altar level. */
  needLevelCount: number;
}

/** Demon skill grade labels. */
export type DemonSkillGrade = 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';

/** One row of the DEMON_SKILL table. */
export interface DemonSkillEntry {
  /** Skill upgrade level (1–25). */
  level: number;
  /** Grade tier associated with this skill level. */
  grade: DemonSkillGrade;
}

/** One row of the DEMON_SANCTUARY table. */
export interface DemonSanctuaryEntry {
  /** Sanctuary upgrade level (1–20). */
  level: number;
  /**
   * Cumulative ATK bonus at this sanctuary level
   * (e.g. 0.10 = +10% ATK).
   */
  atkBonusPercent: number;
  /**
   * Cumulative HP bonus at this sanctuary level
   * (e.g. 0.10 = +10% HP).
   */
  hpBonusPercent: number;
  /** Soul cost required to reach this sanctuary level. */
  soulCost: number;
}

/** Root shape of familiars-maths-data.json. */
export interface FamiliarsMathsData {
  DEMON_ALTAR: DemonAltarEntry[];
  DEMON_SKILL: DemonSkillEntry[];
  DEMON_SANCTUARY: DemonSanctuaryEntry[];
}
