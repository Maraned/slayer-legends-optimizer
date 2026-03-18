'use client';

import { useEffect } from 'react';

import { AppearanceCard } from '@/components/AppearanceCard/AppearanceCard';
import { useUserSaveStore } from '@/store/useUserSaveStore';
import appearanceData from '@/data/appearance-data.json';
import type { ClothingItem } from '@/types/appearance';

export default function AppearancePage() {
  const { appearance, setAppearanceItems, toggleItemOwned } = useUserSaveStore();

  useEffect(() => {
    if (appearance.items.length === 0) {
      const items: ClothingItem[] = (appearanceData as Omit<ClothingItem, 'owned'>[]).map((item) => ({
        ...item,
        owned: false,
      }));
      setAppearanceItems(items);
    }
  }, [appearance.items.length, setAppearanceItems]);

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-[var(--color-foreground)]">Appearance</h1>
      <AppearanceCard
        items={appearance.items}
        bonusTotals={appearance.bonusTotals}
        onToggleOwned={toggleItemOwned}
        className="max-w-2xl"
      />
    </div>
  );
}
