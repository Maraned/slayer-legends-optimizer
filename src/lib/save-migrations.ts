/**
 * Save file versioning and migration pipeline.
 *
 * How to add a new version:
 *  1. Increment CURRENT_SAVE_VERSION.
 *  2. Add a migration function to `migrations` keyed by the NEW version number.
 *     The function receives the state from the previous version and must return
 *     a state that is valid for the new version.
 *
 * Migrations are applied incrementally — version 1 → 2 → 3 — so each function
 * only needs to handle one step.
 */

export const CURRENT_SAVE_VERSION = 2;

type PartialSave = Record<string, unknown>;
type MigrationFn = (state: PartialSave) => PartialSave;

/**
 * Migration functions keyed by the version they produce.
 * migrations[2] transforms a v1 save into a v2 save, and so on.
 */
const migrations: Record<number, MigrationFn> = {
  // v1 → v2: add ampMode and manualAmp fields to blackOrb state.
  2: (state) => ({
    ...state,
    blackOrb: {
      ...(state.blackOrb as Record<string, unknown>),
      ampMode: 'auto',
      manualAmp: {},
    },
  }),
};

/**
 * Applies all necessary migrations to bring `state` from `fromVersion` up to
 * `CURRENT_SAVE_VERSION`.  Returns the upgraded state with `version` set to
 * `CURRENT_SAVE_VERSION`.
 *
 * If `fromVersion` is already current, the state is returned unchanged (aside
 * from ensuring `version` is set correctly).
 */
export function migrateSaveState(state: PartialSave, fromVersion: number): PartialSave {
  let current = state;

  for (let v = fromVersion; v < CURRENT_SAVE_VERSION; v++) {
    const migrate = migrations[v + 1];
    if (migrate) {
      current = migrate(current);
    }
  }

  return { ...current, version: CURRENT_SAVE_VERSION };
}
