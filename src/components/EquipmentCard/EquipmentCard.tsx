'use client';

import { useEffect, useState } from 'react';
import type {
  Accessory,
  AccessoryCategory,
  EquipmentState,
  LevelMultiplier,
  SoulWeapon,
  SoulWeaponData,
  Weapon,
} from '@/types/equipment';
import { WeaponTier } from '@/types/equipment';
import { getLevelMultiplierIndex, loadSoulWeapons } from '@/lib/data-loader';
import { Card } from '@/components/Card';
import { Checkbox } from '@/components/Checkbox';
import { NumberInput } from '@/components/NumberInput';
import { Select } from '@/components/Select';
import { Tabs } from '@/components/Tabs';
import { Toggle } from '@/components/Toggle';

function formatGold(gold: number): string {
  if (gold <= 0) return '—';
  if (gold >= 1e12) return `${(gold / 1e12).toFixed(2)}T`;
  if (gold >= 1e9) return `${(gold / 1e9).toFixed(2)}B`;
  if (gold >= 1e6) return `${(gold / 1e6).toFixed(2)}M`;
  if (gold >= 1e3) return `${(gold / 1e3).toFixed(2)}K`;
  return gold.toFixed(0);
}

function calcEnhanceCost(
  levelIndex: Record<number, LevelMultiplier>,
  fromLevel: number,
  toLevel: number,
): number {
  if (toLevel <= fromLevel || toLevel <= 0) return 0;
  let total = 0;
  for (let lvl = fromLevel + 1; lvl <= toLevel; lvl++) {
    const entry = levelIndex[lvl];
    if (entry) total += entry.goldCost;
  }
  return total;
}

export interface EquipmentCardProps {
  /** Current equipment state */
  equipment: EquipmentState;
  /** Called when any piece of equipment changes */
  onChange: (equipment: EquipmentState) => void;
  /** Additional class names for the Card wrapper */
  className?: string;
}

const WEAPON_TIER_ORDER: WeaponTier[] = [
  WeaponTier.Common4,
  WeaponTier.Common3,
  WeaponTier.Common2,
  WeaponTier.Common1,
  WeaponTier.Uncommon3,
  WeaponTier.Uncommon2,
  WeaponTier.Uncommon1,
  WeaponTier.Rare2,
  WeaponTier.Rare1,
  WeaponTier.Epic2,
  WeaponTier.Epic1,
  WeaponTier.Unique,
  WeaponTier.Legend,
  WeaponTier.Mythic,
  WeaponTier.Ancient,
  WeaponTier.Celestial,
  WeaponTier.Immortal,
];

function WeaponsTab({
  weapons,
  onChange,
  levelIndex,
  awakenedOrrLevel,
  onAwakenedOrrLevelChange,
}: {
  weapons: Weapon[];
  onChange: (weapons: Weapon[]) => void;
  levelIndex: Record<number, LevelMultiplier> | null;
  awakenedOrrLevel: number;
  onAwakenedOrrLevelChange: (level: number) => void;
}) {
  const effectiveMaxLevel = 200 + 50 * awakenedOrrLevel;

  function updateWeapon(index: number, patch: Partial<Weapon>) {
    const updated = weapons.map((w, i) => (i === index ? { ...w, ...patch } : w));
    onChange(updated);
  }

  const tierGroups = WEAPON_TIER_ORDER.map((tier) => ({
    tier,
    weapons: weapons.filter((w) => w.tier === tier),
  })).filter((g) => g.weapons.length > 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-[var(--color-foreground)]">Awakened ORR</span>
          <span className="text-xs text-[var(--color-foreground)]/50">
            Max enhance level: {effectiveMaxLevel}
          </span>
        </div>
        <NumberInput
          label="Level"
          value={awakenedOrrLevel}
          onChange={onAwakenedOrrLevelChange}
          min={0}
          max={20}
        />
      </div>
      {weapons.length === 0 && (
        <p className="text-sm text-[var(--color-foreground)]/50 italic">No weapons configured.</p>
      )}
      {tierGroups.map(({ tier, weapons: tierWeapons }) => {
        const ownedCount = tierWeapons.filter((w) => w.owned).length;
        return (
          <div key={tier} className="flex flex-col gap-2">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-1 dark:border-gray-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-foreground)]/60">
                {tier}
              </span>
              <span className="text-xs text-[var(--color-foreground)]/40">
                ({ownedCount}/{tierWeapons.length})
              </span>
            </div>
            {tierWeapons.map((weapon) => {
              const globalIndex = weapons.indexOf(weapon);
              const weaponMaxLevel = effectiveMaxLevel;
              return (
                <div
                  key={weapon.name}
                  className="flex flex-col gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-[var(--color-foreground)] truncate min-w-0">
                    {weapon.name}
                  </span>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-[var(--color-foreground)] select-none">
                        Enhance
                      </span>
                      <div className="flex items-center gap-2">
                        <NumberInput
                          value={weapon.enhanceLevel}
                          onChange={(val) => updateWeapon(globalIndex, { enhanceLevel: val })}
                          min={0}
                          max={weaponMaxLevel > 0 ? weaponMaxLevel : undefined}
                        />
                        {weaponMaxLevel > 0 && weapon.enhanceLevel >= weaponMaxLevel ? (
                          <span className="rounded px-1.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            MAX
                          </span>
                        ) : weaponMaxLevel > 0 ? (
                          <span className="text-xs tabular-nums text-[var(--color-foreground)]/50">
                            / {weaponMaxLevel}
                          </span>
                        ) : null}
                      </div>
                      {levelIndex && weaponMaxLevel > 0 && weapon.enhanceLevel < weaponMaxLevel && (
                        <span className="text-xs tabular-nums text-[var(--color-foreground)]/50">
                          {formatGold(calcEnhanceCost(levelIndex, weapon.enhanceLevel, weaponMaxLevel))} to max
                        </span>
                      )}
                    </div>
                    <Checkbox
                      checked={weapon.owned}
                      onCheckedChange={(checked) => updateWeapon(globalIndex, { owned: checked })}
                      label="Owned"
                      id={`weapon-owned-${weapon.name}`}
                    />
                    <Checkbox
                      checked={weapon.equipped}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          const updated = weapons.map((w, i) => ({
                            ...w,
                            equipped: i === globalIndex,
                          }));
                          onChange(updated);
                        } else {
                          updateWeapon(globalIndex, { equipped: false });
                        }
                      }}
                      label="Equipped"
                      id={`weapon-equipped-${weapon.name}`}
                    />
                  </div>
                  </div>
                  {(weapon.equipEffect || weapon.ownedEffect) && (
                    <div className="flex flex-col gap-1">
                      {weapon.equipEffect && (
                        <div className="flex items-start gap-1.5 text-xs">
                          <span className="shrink-0 font-semibold text-[var(--color-foreground)]/60">
                            Equip:
                          </span>
                          <span className="text-[var(--color-foreground)]/80">
                            {weapon.equipEffect}
                          </span>
                        </div>
                      )}
                      {weapon.ownedEffect && (
                        <div className="flex items-start gap-1.5 text-xs">
                          <span className="shrink-0 font-semibold text-[var(--color-foreground)]/60">
                            Owned:
                          </span>
                          <span className="text-[var(--color-foreground)]/80">
                            {weapon.ownedEffect}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

const ACCESSORY_CATEGORY_LABELS: Record<AccessoryCategory, string> = {
  class: 'Class',
  relic: 'Relic',
  accessory: 'Accessory',
};

const ACCESSORY_CATEGORY_ORDER: AccessoryCategory[] = ['class', 'relic', 'accessory'];

function AccessoriesTab({
  accessories,
  onChange,
}: {
  accessories: Accessory[];
  onChange: (accessories: Accessory[]) => void;
}) {
  function updateAccessory(index: number, patch: Partial<Accessory>) {
    const updated = accessories.map((a, i) => (i === index ? { ...a, ...patch } : a));
    onChange(updated);
  }

  if (accessories.length === 0) {
    return (
      <p className="text-sm text-[var(--color-foreground)]/50 italic">
        No accessories configured.
      </p>
    );
  }

  const categoryGroups = ACCESSORY_CATEGORY_ORDER.map((category) => ({
    category,
    accessories: accessories.filter((a) => a.category === category),
  })).filter((g) => g.accessories.length > 0);

  return (
    <div className="flex flex-col gap-4">
      {categoryGroups.map(({ category, accessories: categoryAccessories }) => {
        const ownedCount = categoryAccessories.filter((a) => a.owned).length;
        return (
          <div key={category} className="flex flex-col gap-2">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-1 dark:border-gray-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-foreground)]/60">
                {ACCESSORY_CATEGORY_LABELS[category]}
              </span>
              <span className="text-xs text-[var(--color-foreground)]/40">
                ({ownedCount}/{categoryAccessories.length})
              </span>
            </div>
            {categoryAccessories.map((accessory) => {
              const globalIndex = accessories.indexOf(accessory);
              return (
                <div
                  key={accessory.name}
                  className="flex flex-col gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-[var(--color-foreground)] truncate min-w-0">
                      {accessory.name}
                    </span>
                    <div className="flex items-center gap-4 shrink-0">
                      <NumberInput
                        label="Level"
                        value={accessory.level}
                        onChange={(val) => updateAccessory(globalIndex, { level: val })}
                        min={0}
                      />
                      <Toggle
                        checked={accessory.owned}
                        onCheckedChange={(checked) => updateAccessory(globalIndex, { owned: checked })}
                        label="Owned"
                        size="sm"
                        id={`accessory-owned-${accessory.name}`}
                      />
                    </div>
                  </div>
                  {accessory.effect && (
                    <div className="flex items-start gap-1.5 text-xs">
                      <span className="shrink-0 font-semibold text-[var(--color-foreground)]/60">
                        {accessory.bonusType ?? 'Effect'}:
                      </span>
                      <span className="text-[var(--color-foreground)]/80">{accessory.effect}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

const ELEMENT_COLORS: Record<string, string> = {
  Fire: 'text-red-500 dark:text-red-400',
  Water: 'text-blue-500 dark:text-blue-400',
  Earth: 'text-amber-600 dark:text-amber-400',
  Wind: 'text-green-500 dark:text-green-400',
  Light: 'text-yellow-500 dark:text-yellow-300',
  Dark: 'text-purple-500 dark:text-purple-400',
};

function SoulWeaponTab({
  soulWeapon,
  onChange,
}: {
  soulWeapon: SoulWeapon;
  onChange: (soulWeapon: SoulWeapon) => void;
}) {
  const [availableWeapons, setAvailableWeapons] = useState<SoulWeaponData[]>([]);

  useEffect(() => {
    loadSoulWeapons().then(setAvailableWeapons).catch(() => {});
  }, []);

  const elementGroups = availableWeapons.reduce<Record<string, SoulWeaponData[]>>((acc, w) => {
    (acc[w.element] ??= []).push(w);
    return acc;
  }, {});

  const selectorGroups = Object.entries(elementGroups).map(([element, weapons]) => ({
    label: element,
    options: weapons.map((w) => ({
      value: w.id,
      label: `${w.name} (${w.tier})`,
    })),
  }));

  const selectedData = availableWeapons.find((w) => w.name === soulWeapon.name);

  function handleSelect(id: string) {
    const data = availableWeapons.find((w) => w.id === id);
    if (!data) return;
    onChange({
      ...soulWeapon,
      name: data.name,
      element: data.element,
      effects: [
        { description: data.specialEffect, engravingProgress: 0 },
        { description: `Crit Rate +${data.critRateBonus}%`, engravingProgress: 0 },
        { description: `Crit DMG +${data.critDmgBonus}%`, engravingProgress: 0 },
        { description: `${data.element} DMG +${data.elementBonus}%`, engravingProgress: 0 },
      ],
    });
  }

  function updateEffectProgress(index: number, progress: number) {
    const effects = soulWeapon.effects.map((e, i) =>
      i === index ? { ...e, engravingProgress: progress } : e
    );
    onChange({ ...soulWeapon, effects });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-foreground)]/50">
          Soul Weapon
        </label>
        <Select
          value={selectedData?.id ?? ''}
          onValueChange={handleSelect}
          placeholder="Select soul weapon…"
          groups={selectorGroups}
          aria-label="Soul Weapon selector"
        />
        {soulWeapon.element && (
          <span className={`text-xs font-medium ${ELEMENT_COLORS[soulWeapon.element] ?? ''}`}>
            {soulWeapon.element}
            {selectedData && ` · ${selectedData.acquisitionMethod}`}
          </span>
        )}
      </div>

      {selectedData && (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-foreground)]/50">
            Effects
          </span>
          <ul className="flex flex-col gap-1">
            <li className="flex items-center justify-between rounded px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800">
              <span className="text-[var(--color-foreground)]/60">Base DMG</span>
              <span className="font-semibold tabular-nums text-[var(--color-foreground)]">
                {selectedData.baseDamage.toLocaleString()}
              </span>
            </li>
            <li className="flex items-center justify-between rounded px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800">
              <span className="text-[var(--color-foreground)]/60">Crit Rate</span>
              <span className="font-semibold tabular-nums text-[var(--color-foreground)]">
                +{selectedData.critRateBonus}%
              </span>
            </li>
            <li className="flex items-center justify-between rounded px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800">
              <span className="text-[var(--color-foreground)]/60">Crit DMG</span>
              <span className="font-semibold tabular-nums text-[var(--color-foreground)]">
                +{selectedData.critDmgBonus}%
              </span>
            </li>
            <li className="flex items-center justify-between rounded px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800">
              <span className="text-[var(--color-foreground)]/60">{selectedData.element} DMG</span>
              <span className="font-semibold tabular-nums text-[var(--color-foreground)]">
                +{selectedData.elementBonus}%
              </span>
            </li>
            {selectedData.specialEffect && (
              <li className="flex items-start gap-1.5 rounded px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800">
                <span className="shrink-0 font-semibold text-[var(--color-foreground)]/60">
                  Special:
                </span>
                <span className="text-[var(--color-foreground)]/80">{selectedData.specialEffect}</span>
              </li>
            )}
          </ul>
        </div>
      )}

      {soulWeapon.effects.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-foreground)]/50">
            Engraving Progress
          </span>
          <ul className="flex flex-col gap-1.5">
            {soulWeapon.effects.map((effect, i) => {
              const unlocked = effect.engravingProgress >= 100;
              return (
                <li
                  key={i}
                  className={`flex items-center justify-between rounded px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 ${unlocked ? '' : 'opacity-50'}`}
                >
                  <span className="text-[var(--color-foreground)]/80 flex-1 pr-2">
                    {effect.description}
                    {effect.value !== undefined && (
                      <span className="font-semibold tabular-nums text-[var(--color-foreground)] ml-1">
                        {effect.value}
                      </span>
                    )}
                  </span>
                  <NumberInput
                    label="Progress"
                    value={effect.engravingProgress}
                    onChange={(val) => updateEffectProgress(i, val)}
                    min={0}
                    max={100}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export function EquipmentCard({ equipment, onChange, className = '' }: EquipmentCardProps) {
  const [levelIndex, setLevelIndex] = useState<Record<number, LevelMultiplier> | null>(null);

  useEffect(() => {
    getLevelMultiplierIndex().then(setLevelIndex).catch(() => {});
  }, []);

  const tabs = [
    {
      value: 'weapons',
      label: `Weapons${equipment.weapons.length > 0 ? ` (${equipment.weapons.filter((w) => w.owned).length}/${equipment.weapons.length})` : ''}`,
      content: (
        <WeaponsTab
          weapons={equipment.weapons}
          onChange={(weapons) => onChange({ ...equipment, weapons })}
          levelIndex={levelIndex}
          awakenedOrrLevel={equipment.awakenedOrrLevel}
          onAwakenedOrrLevelChange={(awakenedOrrLevel) => onChange({ ...equipment, awakenedOrrLevel })}
        />
      ),
    },
    {
      value: 'accessories',
      label: `Accessories${equipment.accessories.length > 0 ? ` (${equipment.accessories.filter((a) => a.owned).length}/${equipment.accessories.length})` : ''}`,
      content: (
        <AccessoriesTab
          accessories={equipment.accessories}
          onChange={(accessories) => onChange({ ...equipment, accessories })}
        />
      ),
    },
    {
      value: 'soul-weapon',
      label: 'Soul Weapon',
      content: (
        <SoulWeaponTab
          soulWeapon={equipment.soulWeapon}
          onChange={(soulWeapon) => onChange({ ...equipment, soulWeapon })}
        />
      ),
    },
  ];

  return (
    <Card title="Equipment" className={className}>
      <Tabs tabs={tabs} defaultValue="weapons" />
    </Card>
  );
}
