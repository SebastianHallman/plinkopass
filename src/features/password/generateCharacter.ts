import type { CharacterGroup, CharacterSettings, PegRule } from "../../types";
import { SLOT_LABELS } from "../plinko/boardConfig";
import { CHARACTER_POOLS, getEnabledGroups } from "./characterPools";

export function getActiveCharacterGroup(settings: CharacterSettings, rulesHit: PegRule[]): CharacterGroup | null {
  const enabledGroups = getEnabledGroups(settings);
  if (enabledGroups.length === 0) {
    return null;
  }

  const preferredRules = rulesHit.filter(
    (rule): rule is keyof typeof CHARACTER_POOLS => rule !== "shuffle" && settings[rule],
  );
  const preferredGroup = preferredRules[preferredRules.length - 1];
  const fallbackGroup = settings.lowercase ? "lowercase" : enabledGroups[0];

  return preferredGroup ?? fallbackGroup;
}

export function chooseCharacter(
  settings: CharacterSettings,
  rulesHit: PegRule[],
  binIndex: number,
) {
  const activeGroup = getActiveCharacterGroup(settings, rulesHit);
  if (!activeGroup) {
    return "";
  }

  const slotLetter = SLOT_LABELS[binIndex] ?? SLOT_LABELS[0];

  if (activeGroup === "uppercase") {
    return slotLetter.toUpperCase();
  }

  if (activeGroup === "numbers" || activeGroup === "symbols") {
    const pool = CHARACTER_POOLS[activeGroup];
    return pool[binIndex % pool.length] ?? "";
  }

  return slotLetter;
}
