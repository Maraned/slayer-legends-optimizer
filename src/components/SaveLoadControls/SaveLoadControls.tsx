'use client';

import { useRef, useState } from 'react';

import { Dialog } from '@/components/Dialog';
import { useSaveLoad } from '@/hooks/useSaveLoad';

/**
 * Toolbar that exposes Export / Import / Reset actions for the user's save.
 * Designed to live in the Sidebar footer.
 */
export function SaveLoadControls({ collapsed = false }: { collapsed?: boolean }) {
  const { exportSave, importSave, resetSave } = useSaveLoad();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    try {
      await importSave(file);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed.');
    } finally {
      // Reset so the same file can be re-selected
      e.target.value = '';
    }
  }

  function handleReset() {
    resetSave();
    setResetOpen(false);
  }

  const btnBase =
    'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50';
  const btnSecondary = `${btnBase} text-gray-300 hover:bg-gray-700 hover:text-white`;
  const btnDanger = `${btnBase} text-red-400 hover:bg-red-900/40 hover:text-red-300`;

  return (
    <div className="flex flex-col gap-1">
      {/* Export */}
      <button
        onClick={exportSave}
        className={`${btnSecondary} ${collapsed ? 'justify-center' : ''}`}
        title={collapsed ? 'Export save' : undefined}
        aria-label="Export save as JSON"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="shrink-0"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {!collapsed && <span>Export save</span>}
      </button>

      {/* Import */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className={`${btnSecondary} ${collapsed ? 'justify-center' : ''}`}
        title={collapsed ? 'Import save' : undefined}
        aria-label="Import save from JSON"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="shrink-0"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        {!collapsed && <span>Import save</span>}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="sr-only"
        onChange={handleFileChange}
        aria-label="Choose save file to import"
      />

      {/* Import error */}
      {importError && !collapsed && (
        <p className="px-3 text-xs text-red-400" role="alert">
          {importError}
        </p>
      )}

      {/* Reset with confirmation dialog */}
      <Dialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        trigger={
          <button
            className={`${btnDanger} ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Reset save' : undefined}
            aria-label="Reset save to defaults"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="shrink-0"
            >
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
            </svg>
            {!collapsed && <span>Reset save</span>}
          </button>
        }
        title="Reset save data"
        description="This will erase all your progress and restore default values. This action cannot be undone."
      >
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={() => setResetOpen(false)}
            className="rounded-md px-4 py-2 text-sm font-medium text-[var(--color-foreground)]/70 hover:bg-[var(--color-foreground)]/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleReset}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            Reset
          </button>
        </div>
      </Dialog>
    </div>
  );
}
