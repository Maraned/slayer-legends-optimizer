'use client';

import { useMemo } from 'react';

import { NumberInput } from '@/components/NumberInput';
import { Toggle } from '@/components/Toggle/Toggle';
import { useUserSaveStore, type UserSaveStore } from '@/store/useUserSaveStore';
import { useStagesStore, type StagesStore, type FarmingBonusMode } from '@/store/useStagesStore';
import { aggregateFarmingBonuses } from '@/lib/bonus-aggregator';
import { calcSpiritAtkBonus } from '@/components/SpiritBuffToggles/SpiritBuffToggles';
import type { TOMState } from '@/types/tom';
import tomDataRaw from '@/data/tom-data.json';

const tomData = tomDataRaw as unknown as TOMState;

function formatBonus(value: number): string {
  const pct = value * 100;
  const rounded = Math.round(pct * 10) / 10;
  return `+${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}%`;
}

function formatRaw(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return `+${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}`;
}

interface SourceRowProps {
  label: string;
  value: number;
  formatter?: (v: number) => string;
}

function SourceRow({ label, value, formatter = formatBonus }: SourceRowProps) {
  if (value === 0) return null;
  return (
    <div className="flex items-center justify-between rounded px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800/60">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="tabular-nums font-medium text-gray-700 dark:text-gray-300">
        {formatter(value)}
      </span>
    </div>
  );
}

interface BonusSource {
  label: string;
  value: number;
  formatter?: (v: number) => string;
}

interface BonusTypeCardProps {
  title: string;
  autoTotal: number;
  totalFormatter?: (v: number) => string;
  sources: BonusSource[];
  mode: FarmingBonusMode;
  manualValue: number;
  toggleId: string;
  onModeChange: (manual: boolean) => void;
  onManualValueChange: (pct: number) => void;
  inputLabel: string;
}

function BonusTypeCard({
  title,
  autoTotal,
  totalFormatter = formatBonus,
  sources,
  mode,
  manualValue,
  toggleId,
  onModeChange,
  onManualValueChange,
  inputLabel,
}: BonusTypeCardProps) {
  const isAuto = mode === 'auto';
  const activeSources = sources.filter((s) => s.value > 0);
  const displayTotal = isAuto ? autoTotal : manualValue / 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold tabular-nums text-gray-900 dark:text-gray-100">
            {totalFormatter(displayTotal)}
          </span>
          <Toggle
            id={toggleId}
            checked={!isAuto}
            onCheckedChange={onModeChange}
            label={isAuto ? 'Auto' : 'Manual'}
            size="sm"
            aria-label={`Toggle ${title} input mode`}
          />
        </div>
      </div>
      {!isAuto ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Enter a custom value. Disable manual mode to restore auto-calculation.
          </p>
          <NumberInput
            label={inputLabel}
            value={manualValue}
            onChange={onManualValueChange}
            min={0}
            step={0.1}
            ariaLabel={`Manual ${title} override`}
          />
        </div>
      ) : activeSources.length > 0 ? (
        <div className="space-y-1">
          {activeSources.map((source) => (
            <SourceRow key={source.label} label={source.label} value={source.value} formatter={source.formatter} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400 dark:text-gray-500 px-2">No active sources</p>
      )}
    </div>
  );
}

export function FarmingBonusSummary() {
  const appearanceBonusTotals = useUserSaveStore((s: UserSaveStore) => s.appearance.bonusTotals);
  const promotion = useUserSaveStore((s: UserSaveStore) => s.character.promotion);
  const companions = useUserSaveStore((s: UserSaveStore) => s.companions);
  const constellationBuffTotals = useUserSaveStore(
    (s: UserSaveStore) => s.constellation.buffTotals,
  );
  const nodeLevels = useUserSaveStore((s: UserSaveStore) => s.memoryTree.nodeLevels);
  const spiritBuffs = useUserSaveStore((s: UserSaveStore) => s.stageSelection.spiritBuffs);

  const extraExpMode = useStagesStore((s: StagesStore) => s.extraExpMode);
  const manualExtraExpBonus = useStagesStore((s: StagesStore) => s.manualExtraExpBonus);
  const setExtraExpMode = useStagesStore((s: StagesStore) => s.setExtraExpMode);
  const setManualExtraExpBonus = useStagesStore((s: StagesStore) => s.setManualExtraExpBonus);

  const monsterGoldMode = useStagesStore((s: StagesStore) => s.monsterGoldMode);
  const manualMonsterGoldBonus = useStagesStore((s: StagesStore) => s.manualMonsterGoldBonus);
  const setMonsterGoldMode = useStagesStore((s: StagesStore) => s.setMonsterGoldMode);
  const setManualMonsterGoldBonus = useStagesStore((s: StagesStore) => s.setManualMonsterGoldBonus);

  const extraAtkMode = useStagesStore((s: StagesStore) => s.extraAtkMode);
  const manualExtraAtkBonus = useStagesStore((s: StagesStore) => s.manualExtraAtkBonus);
  const setExtraAtkMode = useStagesStore((s: StagesStore) => s.setExtraAtkMode);
  const setManualExtraAtkBonus = useStagesStore((s: StagesStore) => s.setManualExtraAtkBonus);

  const hpRecoveryMode = useStagesStore((s: StagesStore) => s.hpRecoveryMode);
  const manualHpRecoveryBonus = useStagesStore((s: StagesStore) => s.manualHpRecoveryBonus);
  const setHpRecoveryMode = useStagesStore((s: StagesStore) => s.setHpRecoveryMode);
  const setManualHpRecoveryBonus = useStagesStore((s: StagesStore) => s.setManualHpRecoveryBonus);

  const tomNodes = useMemo(
    () => tomData.nodes.map((node) => ({ ...node, currentLevel: nodeLevels[node.id] ?? 0 })),
    [nodeLevels],
  );

  const breakdown = useMemo(
    () =>
      aggregateFarmingBonuses({
        appearanceBonusTotals,
        companions,
        promotion,
        constellationBuffTotals,
        tomNodes,
      }),
    [appearanceBonusTotals, companions, promotion, constellationBuffTotals, tomNodes],
  );

  const spiritAtkBonus = useMemo(() => calcSpiritAtkBonus(spiritBuffs), [spiritBuffs]);
  const totalExtraAtkBonus = breakdown.totals.extraAtkBonus + spiritAtkBonus;

  function handleExtraExpToggle(manual: boolean) {
    setExtraExpMode(manual ? 'manual' : 'auto');
    if (manual && manualExtraExpBonus === 0) {
      setManualExtraExpBonus(parseFloat((breakdown.totals.extraExpBonus * 100).toFixed(1)));
    }
  }

  function handleMonsterGoldToggle(manual: boolean) {
    setMonsterGoldMode(manual ? 'manual' : 'auto');
    if (manual && manualMonsterGoldBonus === 0) {
      setManualMonsterGoldBonus(parseFloat((breakdown.totals.monsterGoldBonus * 100).toFixed(1)));
    }
  }

  function handleExtraAtkToggle(manual: boolean) {
    setExtraAtkMode(manual ? 'manual' : 'auto');
    if (manual && manualExtraAtkBonus === 0) {
      setManualExtraAtkBonus(parseFloat((totalExtraAtkBonus * 100).toFixed(1)));
    }
  }

  function handleHpRecoveryToggle(manual: boolean) {
    setHpRecoveryMode(manual ? 'manual' : 'auto');
    if (manual && manualHpRecoveryBonus === 0) {
      setManualHpRecoveryBonus(parseFloat((breakdown.totals.hpRecoveryBonus * 100).toFixed(1)));
    }
  }

  return (
    <section
      aria-labelledby="farming-bonuses-heading"
      className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-700"
    >
      <h2
        id="farming-bonuses-heading"
        className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4"
      >
        Farming Bonuses
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <BonusTypeCard
          title="Extra EXP"
          autoTotal={breakdown.totals.extraExpBonus}
          mode={extraExpMode}
          manualValue={manualExtraExpBonus}
          toggleId="extra-exp-mode-toggle"
          onModeChange={handleExtraExpToggle}
          onManualValueChange={setManualExtraExpBonus}
          inputLabel="Extra EXP %"
          sources={[
            { label: 'Appearance', value: breakdown.extraExp.appearance },
            { label: 'Companions', value: breakdown.extraExp.companions },
            { label: 'Constellation', value: breakdown.extraExp.constellation },
            { label: 'Memory Tree', value: breakdown.extraExp.memoryTree },
          ]}
        />

        <BonusTypeCard
          title="Monster Gold"
          autoTotal={breakdown.totals.monsterGoldBonus}
          mode={monsterGoldMode}
          manualValue={manualMonsterGoldBonus}
          toggleId="monster-gold-mode-toggle"
          onModeChange={handleMonsterGoldToggle}
          onManualValueChange={setManualMonsterGoldBonus}
          inputLabel="Monster Gold %"
          sources={[
            { label: 'Appearance', value: breakdown.monsterGold.appearance },
            { label: 'Companions', value: breakdown.monsterGold.companions },
            { label: 'Character', value: breakdown.monsterGold.character },
            { label: 'Constellation', value: breakdown.monsterGold.constellation },
            { label: 'Memory Tree', value: breakdown.monsterGold.memoryTree },
          ]}
        />

        <BonusTypeCard
          title="Extra ATK"
          autoTotal={totalExtraAtkBonus}
          mode={extraAtkMode}
          manualValue={manualExtraAtkBonus}
          toggleId="extra-atk-mode-toggle"
          onModeChange={handleExtraAtkToggle}
          onManualValueChange={setManualExtraAtkBonus}
          inputLabel="Extra ATK %"
          sources={[
            { label: 'Appearance', value: breakdown.extraAtk.appearance, formatter: formatRaw },
            { label: 'Companions', value: breakdown.extraAtk.companions, formatter: formatBonus },
            { label: 'Character', value: breakdown.extraAtk.character, formatter: formatBonus },
            { label: 'Constellation', value: breakdown.extraAtk.constellation, formatter: formatRaw },
            { label: 'Memory Tree', value: breakdown.extraAtk.memoryTree, formatter: formatBonus },
            { label: 'Spirit Buffs', value: spiritAtkBonus, formatter: formatBonus },
          ]}
        />

        <BonusTypeCard
          title="HP Recovery"
          autoTotal={breakdown.totals.hpRecoveryBonus}
          mode={hpRecoveryMode}
          manualValue={manualHpRecoveryBonus}
          toggleId="hp-recovery-mode-toggle"
          onModeChange={handleHpRecoveryToggle}
          onManualValueChange={setManualHpRecoveryBonus}
          inputLabel="HP Recovery %"
          sources={[
            { label: 'Appearance', value: breakdown.hpRecovery.appearance, formatter: formatRaw },
            { label: 'Companions', value: breakdown.hpRecovery.companions, formatter: formatBonus },
            { label: 'Constellation', value: breakdown.hpRecovery.constellation, formatter: formatRaw },
            { label: 'Memory Tree', value: breakdown.hpRecovery.memoryTree, formatter: formatBonus },
          ]}
        />
      </div>
    </section>
  );
}
