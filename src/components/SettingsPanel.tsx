import { type CSSProperties, useState } from "react";
import type { CharacterGroup, CharacterSettings } from "../types";
import { CHARACTER_GROUPS, GROUP_LABELS } from "../features/password/characterPools";

const MIN_LENGTH = 8;
const MAX_LENGTH = 32;

interface SettingsPanelProps {
  length: number;
  settings: CharacterSettings;
  isGenerating: boolean;
  onLengthChange: (length: number) => void;
  onSettingsChange: (settings: CharacterSettings) => void;
}

export function SettingsPanel({
  length,
  settings,
  isGenerating,
  onLengthChange,
  onSettingsChange,
}: SettingsPanelProps) {
  const [isAdjustingLength, setIsAdjustingLength] = useState(false);
  const lengthProgress = ((length - MIN_LENGTH) / (MAX_LENGTH - MIN_LENGTH)) * 100;

  const toggleGroup = (group: CharacterGroup) => {
    const next = { ...settings, [group]: !settings[group] };
    const hasEnabledGroup = CHARACTER_GROUPS.some((item) => next[item]);
    if (hasEnabledGroup) {
      onSettingsChange(next);
    }
  };

  return (
    <section className="controls-panel" aria-label="Password settings">
      <label className="field">
        <span className="field-label">Length</span>
        <span className="field-track">
          <span
            className={`range-control ${isAdjustingLength ? "is-adjusting" : ""}`}
            style={{ "--length-progress": `${lengthProgress}%` } as CSSProperties}
          >
            <input
              type="range"
              min={MIN_LENGTH}
              max={MAX_LENGTH}
              value={length}
              onBlur={() => setIsAdjustingLength(false)}
              onChange={(event) => onLengthChange(Number(event.target.value))}
              onFocus={() => setIsAdjustingLength(true)}
              onPointerCancel={() => setIsAdjustingLength(false)}
              onPointerDown={() => setIsAdjustingLength(true)}
              onPointerUp={() => setIsAdjustingLength(false)}
              disabled={isGenerating}
            />
            <span className="range-bubble">{length}</span>
          </span>
        </span>
      </label>

      <div className="toggle-grid">
        {CHARACTER_GROUPS.map((group) => (
          <label className="toggle" key={group}>
            <input
              type="checkbox"
              checked={settings[group]}
              onChange={() => toggleGroup(group)}
              disabled={isGenerating}
            />
            <span className="toggle-label">{GROUP_LABELS[group]}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
