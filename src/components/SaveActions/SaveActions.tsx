'use client';

import { useUserSaveStore } from '@/store/useUserSaveStore';
import type { UserSaveState } from '@/types/save-state';
import { exportSaveStateAsJson } from '@/lib/export-json';

const STATE_KEYS: (keyof UserSaveState)[] = [
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

export function SaveActions({ collapsed }: { collapsed: boolean }) {
  const store = useUserSaveStore();

  function handleExport() {
    const state = Object.fromEntries(
      STATE_KEYS.map((key) => [key, store[key]]),
    ) as UserSaveState;
    exportSaveStateAsJson(state);
  }

  return (
    <button
      onClick={handleExport}
      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
        ${collapsed ? 'justify-center' : ''}`}
      title={collapsed ? 'Export JSON' : undefined}
    >
      <span className="shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </span>
      {!collapsed && <span className="truncate">Export JSON</span>}
    </button>
  );
}
