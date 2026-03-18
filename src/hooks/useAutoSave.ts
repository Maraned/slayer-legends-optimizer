'use client';

import { useEffect, useState } from 'react';

import { useUserSaveStore } from '@/store/useUserSaveStore';

/**
 * Subscribes to the user save store and returns the timestamp of the last
 * auto-save. The persist middleware writes to localStorage on every mutation,
 * so each store change constitutes a completed save.
 */
export function useAutoSave(): Date | null {
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    // Record the initial save time on mount (state was already persisted)
    setLastSavedAt(new Date());

    // Subscribe to any future store mutations
    const unsubscribe = useUserSaveStore.subscribe(() => {
      setLastSavedAt(new Date());
    });

    return unsubscribe;
  }, []);

  return lastSavedAt;
}
