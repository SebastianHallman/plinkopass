import Matter from "matter-js";
import { BIN_COUNT, BOARD_HEIGHT, BOARD_WIDTH, PEG_RADIUS, getPegRule } from "./boardConfig";

const BIN_HEIGHT = 64;
const DIVIDER_TOP_INSET = 16;
const DIVIDER_HEIGHT = BIN_HEIGHT - DIVIDER_TOP_INSET;

export interface PegMeta {
  body: Matter.Body;
  rule: ReturnType<typeof getPegRule>;
}

export function createBoard(world: Matter.World) {
  const pegs: PegMeta[] = [];
  const bodies: Matter.Body[] = [];
  const wallOptions = { isStatic: true, render: { visible: false } };

  bodies.push(Matter.Bodies.rectangle(BOARD_WIDTH / 2, BOARD_HEIGHT + 10, BOARD_WIDTH, 20, wallOptions));
  bodies.push(Matter.Bodies.rectangle(-10, BOARD_HEIGHT / 2, 20, BOARD_HEIGHT, wallOptions));
  bodies.push(Matter.Bodies.rectangle(BOARD_WIDTH + 10, BOARD_HEIGHT / 2, 20, BOARD_HEIGHT, wallOptions));

  const startY = 82;
  const rowGap = 42;
  const colGap = 58;

  for (let row = 0; row < 8; row += 1) {
    const cols = row % 2 === 0 ? 8 : 9;
    const rowWidth = (cols - 1) * colGap;
    const startX = BOARD_WIDTH / 2 - rowWidth / 2;

    for (let col = 0; col < cols; col += 1) {
      const x = startX + col * colGap;
      const y = startY + row * rowGap;
      const peg = Matter.Bodies.circle(x, y, PEG_RADIUS, {
        isStatic: true,
        restitution: 0.9,
        label: "peg",
        render: { visible: false },
      });
      pegs.push({ body: peg, rule: getPegRule(row, col) });
      bodies.push(peg);
    }
  }

  const binWidth = BOARD_WIDTH / BIN_COUNT;
  for (let index = 1; index < BIN_COUNT; index += 1) {
    bodies.push(
      Matter.Bodies.rectangle(index * binWidth, BOARD_HEIGHT - DIVIDER_HEIGHT / 2, 3, DIVIDER_HEIGHT, {
        isStatic: true,
        label: "divider",
        render: { visible: false },
      }),
    );
  }

  Matter.Composite.add(world, bodies);
  return pegs;
}
