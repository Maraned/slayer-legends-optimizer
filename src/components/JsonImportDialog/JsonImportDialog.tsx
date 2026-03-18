'use client';

import { useRef, useState } from 'react';

import type { UserSaveState } from '@/types/save-state';
import { useUserSaveStore } from '@/store/useUserSaveStore';
import { Dialog } from '@/components/Dialog/Dialog';

const REQUIRED_KEYS: Array<keyof UserSaveState> = [
  'version',
  'appearance',
  'character',
  'equipment',
  'companions',
  'skills',
  'memoryTree',
  'constellation',
  'blackOrb',
  'stageSelection',
];

function validateSaveState(data: unknown): data is UserSaveState {
  if (typeof data !== 'object' || data === null) return false;
  return REQUIRED_KEYS.every((key) => key in (data as object));
}

export function JsonImportDialog({ trigger }: { trigger: React.ReactNode }) {
  const loadState = useUserSaveStore((s) => s.loadState);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function handleFile(file: File) {
    if (!file.name.endsWith('.json')) {
      setError('Please select a .json file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (!validateSaveState(parsed)) {
          setError('Invalid save file: missing required fields.');
          return;
        }
        loadState(parsed);
        setOpen(false);
        setError(null);
      } catch {
        setError('Failed to parse JSON. Make sure the file is valid.');
      }
    };
    reader.readAsText(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so the same file can be re-imported
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setError(null);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      trigger={trigger}
      title="Import Save (JSON)"
      description="Select a previously exported .json save file to load your configuration."
    >
      <div
        className="mt-2 flex flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-gray-600 p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        aria-label="Click or drag to upload a JSON save file"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-400"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="text-sm text-gray-300">
          Click to browse or drag &amp; drop a <code className="font-mono">.json</code> file
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleInputChange}
          aria-label="JSON save file input"
        />
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}
    </Dialog>
  );
}
