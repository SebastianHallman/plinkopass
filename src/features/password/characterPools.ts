import type { CharacterGroup, CharacterSettings } from "../../types";

export const GROUP_LABELS: Record<CharacterGroup, string> = {
  lowercase: "Lowercase",
  uppercase: "Uppercase",
  numbers: "Numbers",
  symbols: "Symbols",
};

export const CHARACTER_POOLS: Record<CharacterGroup, string> = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*_-+=?",
};

export const DEFAULT_SETTINGS: CharacterSettings = {
  lowercase: true,
  uppercase: true,
  numbers: true,
  symbols: true,
};

export const CHARACTER_GROUPS = Object.keys(CHARACTER_POOLS) as CharacterGroup[];

export function getEnabledGroups(settings: CharacterSettings) {
  return CHARACTER_GROUPS.filter((group) => settings[group]);
}

export function getAllowedPool(settings: CharacterSettings) {
  return getEnabledGroups(settings)
    .map((group) => CHARACTER_POOLS[group])
    .join("");
}
