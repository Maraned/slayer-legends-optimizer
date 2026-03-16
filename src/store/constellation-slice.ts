import type { StateCreator } from 'zustand';

import type {
  ConstellationBuffTotals,
  ConstellationSheetState,
  FarmingMode,
} from '@/types/constellation';
import constellationData from '@/data/constellation-data.json';

function computeBuffTotals(
  constellations: ConstellationSheetState['constellations'],
): ConstellationBuffTotals {
  const totals: Record<string, number> = {};
  for (const constellation of constellations) {
    for (const node of constellation.nodes) {
      if (node.level > 0) {
        totals[node.buffType] = (totals[node.buffType] ?? 0) + node.level * node.valuePerLevel;
      }
    }
  }
  return totals as ConstellationBuffTotals;
}

export const DEFAULT_CONSTELLATION_STATE: ConstellationSheetState = {
  constellations: constellationData.CONSTELLATIONS as ConstellationSheetState['constellations'],
  buffTotals: {},
  farmingMode: 'EXP',
};

export interface ConstellationSlice {
  constellation: ConstellationSheetState;
  /** Set the level of a single star node, recomputing starsSpent and buffTotals. */
  setNodeLevel: (nodeId: string, level: number) => void;
  /** Set the active farming mode for constellation recommendations. */
  setFarmingMode: (mode: FarmingMode) => void;
  /** Replace the entire constellation sheet state (e.g. on import). */
  setConstellation: (constellation: ConstellationSheetState) => void;
}

export const createConstellationSlice: StateCreator<
  ConstellationSlice,
  [],
  [],
  ConstellationSlice
> = (set) => ({
  constellation: DEFAULT_CONSTELLATION_STATE,

  setNodeLevel: (nodeId, level) =>
    set((state) => {
      const constellations = state.constellation.constellations.map((c) => {
        if (!c.nodes.some((n) => n.id === nodeId)) return c;
        const nodes = c.nodes.map((n) => (n.id === nodeId ? { ...n, level } : n));
        const starsSpent = nodes.reduce((sum, n) => sum + n.level * n.starCost, 0);
        return { ...c, nodes, starsSpent };
      });
      return {
        constellation: {
          ...state.constellation,
          constellations,
          buffTotals: computeBuffTotals(constellations),
        },
      };
    }),

  setFarmingMode: (farmingMode) =>
    set((state) => ({
      constellation: { ...state.constellation, farmingMode },
    })),

  setConstellation: (constellation) => set({ constellation }),
});
