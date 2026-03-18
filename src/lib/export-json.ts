import type { UserSaveState } from '@/types/save-state';

/**
 * Serializes the given save state to a JSON string and triggers a file
 * download in the browser.
 *
 * The downloaded file is named `slayer-legends-save-<ISO date>.json`.
 */
export function exportSaveStateAsJson(state: UserSaveState): void {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().slice(0, 10);
  const filename = `slayer-legends-save-${date}.json`;

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}
