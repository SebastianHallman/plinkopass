export type CharacterGroup = "lowercase" | "uppercase" | "numbers" | "symbols";

export type CharacterSettings = Record<CharacterGroup, boolean>;

export type PegRule = CharacterGroup | "shuffle";

export interface BallResult {
  id: number;
  character: string;
  binIndex: number;
  rulesHit: PegRule[];
}
