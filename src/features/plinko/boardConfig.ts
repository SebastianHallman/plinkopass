import type { PegRule } from "../../types";

export const BOARD_WIDTH = 720;
export const BOARD_HEIGHT = 520;
export const PEG_RADIUS = 6;
export const BALL_RADIUS = 9;
export const SLOT_LABELS = "abcdefghijklmnopqrstuvwxyz".split("");
export const BIN_COUNT = SLOT_LABELS.length;
export const RULES: PegRule[] = ["lowercase", "uppercase", "numbers", "symbols", "shuffle"];

export function getPegRule(row: number, col: number): PegRule {
  return RULES[(row + col) % RULES.length];
}
