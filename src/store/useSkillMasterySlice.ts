import type { SkillMasteryPageIndex } from '@/types/skills';
import type { SkillsState } from '@/types/save-state';

import { useUserSaveStore } from './useUserSaveStore';

/**
 * Slice hook for the Skill Mastery state.
 *
 * Wraps the relevant segment of `useUserSaveStore` and exposes
 * fine-grained actions for toggling individual mastery node unlock
 * states without requiring callers to reconstruct the full SkillsState
 * on every update.
 *
 * Mastery pages store the IDs of unlocked nodes only. An empty array
 * means no nodes are unlocked on that page.
 */
export function useSkillMasterySlice() {
  const masteryPages = useUserSaveStore((state) => state.skills.masteryPages);
  const setSkills = useUserSaveStore((state) => state.setSkills);
  const skills = useUserSaveStore((state) => state.skills);

  /**
   * Toggle a single mastery node's unlock state on the given page.
   * If the node is currently unlocked, it will be locked, and vice versa.
   */
  function toggleMasteryNode(pageIndex: SkillMasteryPageIndex, nodeId: string): void {
    const updatedPages = masteryPages.map((page, i) => {
      if (i !== pageIndex) return page;
      return page.includes(nodeId) ? page.filter((id) => id !== nodeId) : [...page, nodeId];
    }) as SkillsState['masteryPages'];

    setSkills({ ...skills, masteryPages: updatedPages });
  }

  /**
   * Unlock a specific mastery node on the given page.
   * No-op if the node is already unlocked.
   */
  function unlockMasteryNode(pageIndex: SkillMasteryPageIndex, nodeId: string): void {
    if (masteryPages[pageIndex].includes(nodeId)) return;

    const updatedPages = masteryPages.map((page, i) =>
      i === pageIndex ? [...page, nodeId] : page,
    ) as SkillsState['masteryPages'];

    setSkills({ ...skills, masteryPages: updatedPages });
  }

  /**
   * Lock (remove) a specific mastery node on the given page.
   * No-op if the node is not unlocked.
   */
  function lockMasteryNode(pageIndex: SkillMasteryPageIndex, nodeId: string): void {
    if (!masteryPages[pageIndex].includes(nodeId)) return;

    const updatedPages = masteryPages.map((page, i) =>
      i === pageIndex ? page.filter((id) => id !== nodeId) : page,
    ) as SkillsState['masteryPages'];

    setSkills({ ...skills, masteryPages: updatedPages });
  }

  /**
   * Replace all unlocked node IDs on a single mastery page.
   */
  function setMasteryPage(pageIndex: SkillMasteryPageIndex, nodeIds: string[]): void {
    const updatedPages = masteryPages.map((page, i) =>
      i === pageIndex ? nodeIds : page,
    ) as SkillsState['masteryPages'];

    setSkills({ ...skills, masteryPages: updatedPages });
  }

  /**
   * Replace all mastery pages at once
   * (e.g. when applying an optimizer result or loading an import).
   */
  function setAllMasteryPages(pages: SkillsState['masteryPages']): void {
    setSkills({ ...skills, masteryPages: pages });
  }

  /**
   * Reset all mastery pages to empty (no nodes unlocked).
   */
  function resetMastery(): void {
    setSkills({ ...skills, masteryPages: [[], [], [], [], [], [], [], []] });
  }

  return {
    masteryPages,
    toggleMasteryNode,
    unlockMasteryNode,
    lockMasteryNode,
    setMasteryPage,
    setAllMasteryPages,
    resetMastery,
  };
}
