import type { MemoryTreeState } from '@/types/tom';

import { useUserSaveStore } from './useUserSaveStore';

/**
 * Slice hook for the Tree of Memory (TOM) state.
 *
 * Wraps the relevant segment of `useUserSaveStore` and exposes
 * fine-grained actions for working with individual TOM node levels
 * without requiring callers to reconstruct the full MemoryTreeState
 * on every update.
 */
export function useMemoryTreeSlice() {
  const nodeLevels = useUserSaveStore((state) => state.memoryTree.nodeLevels);
  const setMemoryTree = useUserSaveStore((state) => state.setMemoryTree);

  /**
   * Set the upgrade level for a single TOM node.
   * Pass `0` to lock the node (e.g. when resetting prerequisites).
   */
  function setNodeLevel(nodeId: string, level: number): void {
    setMemoryTree({ nodeLevels: { ...nodeLevels, [nodeId]: level } });
  }

  /**
   * Reset all TOM node levels to 0 (fully locked / fresh save).
   */
  function resetNodeLevels(): void {
    setMemoryTree({ nodeLevels: {} });
  }

  /**
   * Replace the entire nodeLevels map at once
   * (e.g. when applying an optimizer result or loading an import).
   */
  function setAllNodeLevels(levels: MemoryTreeState['nodeLevels']): void {
    setMemoryTree({ nodeLevels: levels });
  }

  return {
    nodeLevels,
    setNodeLevel,
    resetNodeLevels,
    setAllNodeLevels,
  };
}
