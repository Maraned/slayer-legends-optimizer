'use client';

import { NumberInput } from '@/components/NumberInput';
import { Select } from '@/components/Select/Select';
import { Toggle } from '@/components/Toggle/Toggle';
import { useSkillsStore, type SkillsStore } from '@/store/useSkillsStore';
import type { CompanionName } from '@/types/companions';
import type { SkillSlot } from '@/types/skills';

const COMPANION_NAMES: CompanionName[] = ['Ellie', 'Zeke', 'Miho', 'Luna'];

const COMPANION_OPTIONS = [
  { value: '', label: 'None' },
  ...COMPANION_NAMES.map((name) => ({ value: name, label: name })),
];

export interface SkillSlotListProps {
  slots: SkillSlot[];
}

export function SkillSlotList({ slots }: SkillSlotListProps) {
  const setSlot = useSkillsStore((s: SkillsStore) => s.setSlot);

  function handleCompanionChange(index: number, value: string) {
    const companion = value === '' ? null : (value as CompanionName);
    setSlot(index, {
      ...slots[index],
      companionName: companion,
      partnerBonusActive: companion === null ? false : slots[index].partnerBonusActive,
    });
  }

  function handlePartnerBonusChange(index: number, checked: boolean) {
    setSlot(index, { ...slots[index], partnerBonusActive: checked });
  }

  function handleModifiedValueChange(index: number, value: number) {
    setSlot(index, { ...slots[index], modifiedValue: value });
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {slots.map((slot, index) => (
        <div key={index} className="flex items-center gap-4 px-6 py-4">
          <span className="w-16 text-sm font-medium text-gray-500 dark:text-gray-400 shrink-0">
            Slot {index + 1}
          </span>
          <div className="w-48">
            <Select
              value={slot.companionName ?? ''}
              onValueChange={(value) => handleCompanionChange(index, value)}
              options={COMPANION_OPTIONS}
              aria-label={`Companion for skill slot ${index + 1}`}
            />
          </div>
          <Toggle
            id={`partner-bonus-toggle-${index}`}
            checked={slot.partnerBonusActive}
            onCheckedChange={(checked) => handlePartnerBonusChange(index, checked)}
            disabled={!slot.companionName}
            label="Partner Bonus"
            size="sm"
            aria-label={`Partner bonus for skill slot ${index + 1}`}
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">Modified Value</span>
            <NumberInput
              value={slot.modifiedValue}
              onChange={(value) => handleModifiedValueChange(index, value)}
              min={0}
              step={0.01}
              ariaLabel={`Modified skill value for slot ${index + 1}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
