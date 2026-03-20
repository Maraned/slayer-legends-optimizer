'use client';

import type {
  Accessory,
  AccessoryCategory,
  EquipmentState,
  SoulWeapon,
  Weapon,
} from '@/types/equipment';
import { WeaponTier } from '@/types/equipment';
import { Card } from '@/components/Card';
import { Checkbox } from '@/components/Checkbox';
import { NumberInput } from '@/components/NumberInput';
import { Tabs } from '@/components/Tabs';
import { Toggle } from '@/components/Toggle';

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
}: {
  weapons: Weapon[];
  onChange: (weapons: Weapon[]) => void;
}) {
  function updateWeapon(index: number, patch: Partial<Weapon>) {
    const updated = weapons.map((w, i) => (i === index ? { ...w, ...patch } : w));
    onChange(updated);
  }

  if (weapons.length === 0) {
    return (
      <p className="text-sm text-[var(--color-foreground)]/50 italic">No weapons configured.</p>
    );
  }

  const tierGroups = WEAPON_TIER_ORDER.map((tier) => ({
    tier,
    weapons: weapons.filter((w) => w.tier === tier),
  })).filter((g) => g.weapons.length > 0);

  return (
    <div className="flex flex-col gap-4">
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
              return (
                <div
                  key={weapon.name}
                  className="flex items-center justify-between gap-4 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                >
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
                          max={weapon.maxLevel > 0 ? weapon.maxLevel : undefined}
                        />
                        {weapon.maxLevel > 0 && weapon.enhanceLevel >= weapon.maxLevel ? (
                          <span className="rounded px-1.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            MAX
                          </span>
                        ) : weapon.maxLevel > 0 ? (
                          <span className="text-xs tabular-nums text-[var(--color-foreground)]/50">
                            / {weapon.maxLevel}
                          </span>
                        ) : null}
                      </div>
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

  return (
    <div className="flex flex-col gap-3">
      {accessories.map((accessory, index) => (
        <div
          key={accessory.name}
          className="flex items-start justify-between gap-4 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-sm font-semibold text-[var(--color-foreground)] truncate">
              {accessory.name}
            </span>
            <span className="text-xs text-[var(--color-foreground)]/50">
              {ACCESSORY_CATEGORY_LABELS[accessory.category]}
              {accessory.bonusType && ` · ${accessory.bonusType}`}
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <NumberInput
              label="Level"
              value={accessory.level}
              onChange={(val) => updateAccessory(index, { level: val })}
              min={0}
            />
            <Toggle
              checked={accessory.owned}
              onCheckedChange={(checked) => updateAccessory(index, { owned: checked })}
              label="Owned"
              size="sm"
              id={`accessory-owned-${index}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function SoulWeaponTab({
  soulWeapon,
  onChange,
}: {
  soulWeapon: SoulWeapon;
  onChange: (soulWeapon: SoulWeapon) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-[var(--color-foreground)]">
            {soulWeapon.name || 'Soul Weapon'}
          </span>
          {soulWeapon.element && (
            <span className="text-xs text-[var(--color-foreground)]/50">{soulWeapon.element}</span>
          )}
        </div>
        <NumberInput
          label="Engraving"
          value={soulWeapon.engravingProgress}
          onChange={(val) => onChange({ ...soulWeapon, engravingProgress: val })}
          min={0}
        />
      </div>

      {soulWeapon.effects.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-foreground)]/50">
            Effects
          </span>
          <ul className="flex flex-col gap-1">
            {soulWeapon.effects.map((effect, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800"
              >
                <span className="text-[var(--color-foreground)]/80">{effect.description}</span>
                {effect.value !== undefined && (
                  <span className="font-semibold tabular-nums text-[var(--color-foreground)]">
                    {effect.value}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function EquipmentCard({ equipment, onChange, className = '' }: EquipmentCardProps) {
  const tabs = [
    {
      value: 'weapons',
      label: `Weapons${equipment.weapons.length > 0 ? ` (${equipment.weapons.filter((w) => w.owned).length}/${equipment.weapons.length})` : ''}`,
      content: (
        <WeaponsTab
          weapons={equipment.weapons}
          onChange={(weapons) => onChange({ ...equipment, weapons })}
        />
      ),
    },
    {
      value: 'accessories',
      label: `Accessories${equipment.accessories.length > 0 ? ` (${equipment.accessories.length})` : ''}`,
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
