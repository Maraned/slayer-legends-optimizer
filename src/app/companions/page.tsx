'use client';

import { CompanionCard } from '@/components/CompanionCard/CompanionCard';
import { useUserSaveStore } from '@/store/useUserSaveStore';

export default function CompanionsPage() {
  const { companions } = useUserSaveStore();

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-[var(--color-foreground)]">Companions</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {companions.map((companion) => (
          <CompanionCard key={companion.name} companion={companion} />
        ))}
      </div>
    </div>
  );
}
