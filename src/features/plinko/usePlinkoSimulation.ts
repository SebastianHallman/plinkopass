import { useCallback, useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import type { BallResult, CharacterGroup, CharacterSettings, PegRule } from "../../types";
import { chooseCharacter, getActiveCharacterGroup } from "../password/generateCharacter";
import { BALL_RADIUS, BIN_COUNT, BOARD_HEIGHT, BOARD_WIDTH } from "./boardConfig";
import { createBoard, type PegMeta } from "./createBoard";

interface ActiveBall {
  id: number;
  body: Matter.Body;
  rulesHit: PegRule[];
  settledTicks: number;
  touchedPegIds: Set<number>;
}

export interface BallMarker {
  id: number;
  x: number;
  y: number;
  label: string;
  group: CharacterGroup | null;
}

const GROUP_MARKERS: Record<CharacterGroup, string> = {
  lowercase: "a",
  uppercase: "A",
  numbers: "#",
  symbols: "@",
};
const GRAVITY_Y = 0.55;
const BALL_AIR_FRICTION = 0.006;
const INITIAL_SIDEWAYS_DAMPING = 34;
const RESULT_Y = BOARD_HEIGHT - BALL_RADIUS - 3;
const REQUIRED_SETTLED_TICKS = 10;
const SETTLED_SPEED = 0.9;

export function usePlinkoSimulation(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  settings: CharacterSettings,
  onResult: (result: BallResult) => void,
) {
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const pegsRef = useRef<PegMeta[]>([]);
  const ballsRef = useRef<Map<number, ActiveBall>>(new Map());
  const nextIdRef = useRef(1);
  const settingsRef = useRef(settings);
  const onResultRef = useRef(onResult);
  const [activeCount, setActiveCount] = useState(0);
  const [ballMarkers, setBallMarkers] = useState<BallMarker[]>([]);

  settingsRef.current = settings;
  onResultRef.current = onResult;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const engine = Matter.Engine.create({ gravity: { x: 0, y: GRAVITY_Y } });
    const render = Matter.Render.create({
      canvas,
      engine,
      options: {
        width: BOARD_WIDTH,
        height: BOARD_HEIGHT,
        wireframes: false,
        background: "transparent",
        pixelRatio: window.devicePixelRatio,
      },
    });
    const runner = Matter.Runner.create();

    pegsRef.current = createBoard(engine.world);
    engineRef.current = engine;
    renderRef.current = render;
    runnerRef.current = runner;

    Matter.Events.on(engine, "collisionStart", (event) => {
      for (const pair of event.pairs) {
        const ballBody = pair.bodyA.label === "ball" ? pair.bodyA : pair.bodyB.label === "ball" ? pair.bodyB : null;
        const pegBody = pair.bodyA.label === "peg" ? pair.bodyA : pair.bodyB.label === "peg" ? pair.bodyB : null;
        if (!ballBody || !pegBody) continue;

        const activeBall = ballsRef.current.get(ballBody.id);
        const peg = pegsRef.current.find((item) => item.body.id === pegBody.id);
        if (!activeBall || !peg || activeBall.touchedPegIds.has(pegBody.id)) continue;

        activeBall.touchedPegIds.add(pegBody.id);
        activeBall.rulesHit.push(peg.rule);
      }
    });

    Matter.Events.on(engine, "afterUpdate", () => {
      const binWidth = BOARD_WIDTH / BIN_COUNT;
      for (const [bodyId, activeBall] of ballsRef.current) {
        if (activeBall.body.position.y < RESULT_Y) continue;
        if (activeBall.body.speed <= SETTLED_SPEED) {
          activeBall.settledTicks += 1;
        } else {
          activeBall.settledTicks = 0;
        }
        if (activeBall.settledTicks < REQUIRED_SETTLED_TICKS) continue;

        const x = Math.max(0, Math.min(BOARD_WIDTH - 1, activeBall.body.position.x));
        const binIndex = Math.max(0, Math.min(BIN_COUNT - 1, Math.floor(x / binWidth)));
        const character = chooseCharacter(settingsRef.current, activeBall.rulesHit, binIndex);
        Matter.Composite.remove(engine.world, activeBall.body);
        ballsRef.current.delete(bodyId);
        setActiveCount(ballsRef.current.size);
        onResultRef.current({ id: activeBall.id, character, binIndex, rulesHit: activeBall.rulesHit });
      }

      setBallMarkers(
        Array.from(ballsRef.current.values()).map((activeBall) => {
          const group = getActiveCharacterGroup(settingsRef.current, activeBall.rulesHit);
          return {
            id: activeBall.id,
            x: activeBall.body.position.x,
            y: activeBall.body.position.y,
            label: group ? GROUP_MARKERS[group] : "?",
            group,
          };
        }),
      );
    });

    Matter.Render.run(render);
    Matter.Runner.run(runner, engine);

    return () => {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
      render.canvas.removeAttribute("style");
      render.textures = {};
      ballsRef.current.clear();
      setBallMarkers([]);
    };
  }, [canvasRef]);

  const dropBall = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const id = nextIdRef.current;
    nextIdRef.current += 1;
    const offset = ((id % 7) - 3) * 8;
    const body = Matter.Bodies.circle(BOARD_WIDTH / 2 + offset, 24, BALL_RADIUS, {
      label: "ball",
      restitution: 0.78,
      friction: 0.01,
      frictionAir: BALL_AIR_FRICTION,
      density: 0.003,
      render: { fillStyle: "#e8edf4" },
    });

    ballsRef.current.set(body.id, { id, body, rulesHit: [], settledTicks: 0, touchedPegIds: new Set() });
    Matter.Composite.add(engine.world, body);
    Matter.Body.setVelocity(body, { x: offset / INITIAL_SIDEWAYS_DAMPING, y: 0 });
    setActiveCount(ballsRef.current.size);
  }, []);

  const clearBalls = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;

    for (const ball of ballsRef.current.values()) {
      Matter.Composite.remove(engine.world, ball.body);
    }
    ballsRef.current.clear();
    setActiveCount(0);
    setBallMarkers([]);
  }, []);

  return { activeCount, ballMarkers, dropBall, clearBalls };
}
