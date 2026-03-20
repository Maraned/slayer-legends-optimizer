'use client';

import characterMathsData from '@/data/character-maths-data.json';
import { NumberInput } from '@/components/NumberInput';
import { useUserSaveStore } from '@/store/useUserSaveStore';

const GROWTH_KNOWLEDGE = characterMathsData.GROWTH_KNOWLEDGE as Array<{
  grade: number;
  atkEffectMultiplier: number;
}>;

const MIN_GRADE = 1;
const MAX_GRADE = GROWTH_KNOWLEDGE.length;

export function GrowingKnowledgeSelector() {
  const grade = useUserSaveStore((state) => state.character.growingKnowledge.grade);
  const setGrowingKnowledge = useUserSaveStore((state) => state.setGrowingKnowledge);

  const entry = GROWTH_KNOWLEDGE.find((e) => e.grade === grade);
  const multiplier = entry?.atkEffectMultiplier ?? 1;

  function handleGradeChange(newGrade: number) {
    const newEntry = GROWTH_KNOWLEDGE.find((e) => e.grade === newGrade);
    setGrowingKnowledge({
      grade: newGrade,
      atkEffectPct: newEntry?.atkEffectMultiplier ?? 1,
    });
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-[var(--color-foreground)]">
          Growing Knowledge
        </span>
        <span className="text-xs text-[var(--color-foreground)]/50">
          +{((multiplier - 1) * 100).toFixed(0)}% ATK effect
        </span>
      </div>
      <NumberInput
        label="Grade"
        value={grade}
        onChange={handleGradeChange}
        min={MIN_GRADE}
        max={MAX_GRADE}
      />
    </div>
  );
}
