'use client';

import { CompanionCard } from '@/components/CompanionCard/CompanionCard';
import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import type { AdvancementStepOrdinal, BuffType, CompanionName, Element } from '@/types/companions';
import spritesData from '@/data/sprites.json';
import type { SpritesData } from '@/types/sprites';

const sprites = spritesData as unknown as SpritesData;

const COMPANION_ORDER: CompanionName[] = ['Ellie', 'Zeke', 'Miho', 'Luna'];

export default function CompanionsPage() {
  const companions = useUserSaveStore((s: UserSaveStore) => s.companions);
  const setCompanion = useUserSaveStore((s: UserSaveStore) => s.setCompanion);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white border-b border-gray-200 px-6 py-8 dark:bg-gray-900 dark:border-gray-700">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Companions</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your companion skins and advancement</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {COMPANION_ORDER.map((name, index) => {
            const companion = companions[index];
            const skins = sprites.companionSkins[name] ?? [];
            return (
              <CompanionCard
                key={name}
                companion={companion}
                skins={skins}
                onSkinChange={(skin) => setCompanion(index, { ...companion, skin })}
                onElementChange={(element: Element) => setCompanion(index, { ...companion, element })}
                onLevelChange={(level) => setCompanion(index, { ...companion, level })}
                onPromotionStageChange={(promotionStage) => setCompanion(index, { ...companion, promotionStage })}
                onAdvancementChange={(advancement) => setCompanion(index, { ...companion, advancement })}
                onAdvancementStepBuffTypeChange={(step: AdvancementStepOrdinal, buffType: BuffType) =>
                  setCompanion(index, {
                    ...companion,
                    advancementSteps: companion.advancementSteps.map((s) =>
                      s.step === step ? { ...s, buffType } : s
                    ),
                  })
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
