'use client';

import { EquipmentCard } from '@/components/EquipmentCard/EquipmentCard';
import { useUserSaveStore } from '@/store/useUserSaveStore';

export default function EquipmentPage() {
  const { equipment, setEquipment } = useUserSaveStore();

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-[var(--color-foreground)]">Equipment</h1>
      <EquipmentCard
        equipment={equipment}
        onChange={setEquipment}
        className="max-w-2xl"
      />
    </div>
  );
}
