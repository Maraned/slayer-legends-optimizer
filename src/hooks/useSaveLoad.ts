'use client';

import { useCallback } from 'react';

import type { UserSaveState } from '@/types/save-state';
import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import { DEFAULT_STATE } from '@/store/defaults';
import { migrateSaveState } from '@/lib/save-migrations';

const EXPORT_FILE_NAME = 'slayer-legends-save.json';

/**
 * Provides export, import, and reset actions for the user's save state.
 *
 * - `exportSave`  – downloads the current store state as a JSON file.
 * - `importSave`  – reads a JSON file chosen by the user and loads it into the store.
 * - `resetSave`   – resets the store back to `DEFAULT_STATE`.
 */
export function useSaveLoad() {
  const loadState = useUserSaveStore((s: UserSaveStore) => s.loadState);
  const reset = useUserSaveStore((s: UserSaveStore) => s.reset);

  const exportSave = useCallback(() => {
    const state = useUserSaveStore.getState();
    // Extract only the UserSaveState fields (exclude store actions)
    const save: UserSaveState = {
      version: state.version,
      appearance: state.appearance,
      character: state.character,
      equipment: state.equipment,
      companions: state.companions,
      skills: state.skills,
      memoryTree: state.memoryTree,
      constellation: state.constellation,
      blackOrb: state.blackOrb,
      stageSelection: state.stageSelection,
    };

    const blob = new Blob([JSON.stringify(save, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = EXPORT_FILE_NAME;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importSave = useCallback(
    (file: File): Promise<void> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const parsed = JSON.parse(e.target?.result as string) as Record<string, unknown>;
            const fromVersion = typeof parsed.version === 'number' ? parsed.version : 0;
            const migrated = migrateSaveState(parsed, fromVersion) as unknown as UserSaveState;
            loadState({ ...DEFAULT_STATE, ...migrated });
            resolve();
          } catch {
            reject(new Error('Invalid save file: could not parse JSON.'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file.'));
        reader.readAsText(file);
      });
    },
    [loadState],
  );

  const resetSave = useCallback(() => {
    reset();
  }, [reset]);

  return { exportSave, importSave, resetSave };
}
