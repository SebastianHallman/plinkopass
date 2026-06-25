import { useCallback, useMemo, useState } from "react";
import { Play } from "lucide-react";
import { PasswordOutput } from "./components/PasswordOutput";
import { SettingsPanel } from "./components/SettingsPanel";
import { DEFAULT_SETTINGS } from "./features/password/characterPools";
import { PlinkoBoard } from "./features/plinko/PlinkoBoard";
import type { BallResult, CharacterSettings } from "./types";

export function App() {
  const [length, setLength] = useState(16);
  const [settings, setSettings] = useState<CharacterSettings>(DEFAULT_SETTINGS);
  const [results, setResults] = useState<BallResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const password = useMemo(() => results.map((result) => result.character).join(""), [results]);

  const startGeneration = () => {
    setResults([]);
    setIsGenerating(true);
  };

  const handleResult = useCallback((result: BallResult) => {
    setResults((current) => [...current, result]);
  }, []);

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <h1>PlinkoPass</h1>
        </div>
      </header>

      <PasswordOutput password={password} length={length} />

      <section className="board-stage">
        <PlinkoBoard
          settings={settings}
          length={length}
          isGenerating={isGenerating}
          onResult={handleResult}
          onComplete={() => setIsGenerating(false)}
        />
      </section>

      <section className="bottom-controls">
        <SettingsPanel
          length={length}
          settings={settings}
          isGenerating={isGenerating}
          onLengthChange={setLength}
          onSettingsChange={setSettings}
        />
        <button className="icon-button" onClick={startGeneration} disabled={isGenerating} type="button">
          <Play size={18} />
          <span>{isGenerating ? "Dropping" : "Drop the balls"}</span>
        </button>
      </section>
    </main>
  );
}
