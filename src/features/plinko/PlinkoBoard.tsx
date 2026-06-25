import { useEffect, useRef, useState } from "react";
import type { BallResult, CharacterSettings } from "../../types";
import { BOARD_HEIGHT, BOARD_WIDTH, SLOT_LABELS, getPegRule } from "./boardConfig";
import { usePlinkoSimulation } from "./usePlinkoSimulation";

const DROP_INTERVAL_MS = 360;

interface PlinkoBoardProps {
  settings: CharacterSettings;
  length: number;
  isGenerating: boolean;
  onResult: (result: BallResult) => void;
  onComplete: () => void;
}

export function PlinkoBoard({ settings, length, isGenerating, onResult, onComplete }: PlinkoBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const droppedRef = useRef(0);
  const [landingPopups, setLandingPopups] = useState<BallResult[]>([]);
  const { activeCount, ballMarkers, dropBall, clearBalls } = usePlinkoSimulation(canvasRef, settings, (result) => {
    onResult(result);
    setLandingPopups((current) => [...current.slice(-5), result]);
    window.setTimeout(() => {
      setLandingPopups((current) => current.filter((item) => item.id !== result.id));
    }, 900);
  });

  useEffect(() => {
    if (!isGenerating) {
      droppedRef.current = 0;
      return;
    }

    clearBalls();
    const interval = window.setInterval(() => {
      if (droppedRef.current >= length) {
        window.clearInterval(interval);
        return;
      }
      droppedRef.current += 1;
      dropBall();
    }, DROP_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [clearBalls, dropBall, isGenerating, length]);

  useEffect(() => {
    if (isGenerating && droppedRef.current >= length && activeCount === 0) {
      onComplete();
    }
  }, [activeCount, isGenerating, length, onComplete]);

  return (
    <section className="board-panel" aria-label="Plinko password board">
      <div className="board-frame">
        <div className="peg-overlay" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, row) => {
            const cols = row % 2 === 0 ? 8 : 9;
            return Array.from({ length: cols }).map((__, col) => (
              <span
                className={`peg-dot rule-${getPegRule(row, col)}`}
                key={`${row}-${col}`}
                style={{
                  left: `${50 + (col - (cols - 1) / 2) * 8.05}%`,
                  top: `${15.8 + row * 8.1}%`,
                }}
              />
            ));
          })}
        </div>
        <canvas ref={canvasRef} width={BOARD_WIDTH} height={BOARD_HEIGHT} />
        <div className="ball-marker-layer" aria-hidden="true">
          {ballMarkers.map((ball) => (
            <span
              className={`ball-marker marker-${ball.group ?? "unknown"} ${ball.y > BOARD_HEIGHT - 76 ? "is-in-bin" : ""}`}
              key={ball.id}
              style={{
                left: `${(ball.x / BOARD_WIDTH) * 100}%`,
                top: `${(ball.y / BOARD_HEIGHT) * 100}%`,
              }}
            >
              {ball.label}
            </span>
          ))}
        </div>
        <div className="landing-popup-layer" aria-live="polite">
          {landingPopups.map((result) => (
            <span
              className="landing-popup"
              key={result.id}
              style={{ left: `${((result.binIndex + 0.5) / SLOT_LABELS.length) * 100}%` }}
            >
              <span>{result.character}</span>
            </span>
          ))}
        </div>
        <div className="bin-row" aria-hidden="true">
          {SLOT_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
