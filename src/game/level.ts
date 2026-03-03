import { CFG } from "./config";
import type { Brick } from "./types";

export function makeLevel1(): Brick[] {
  const cols = CFG.brickCols;
  const rows = CFG.brickRows;
  const gap = CFG.brickGap;

  // Arena walls (match engine)
  const left = 26;
  const right = CFG.worldW - 26;
  const top = 22;

  // Bricks live inside the arena, with a small side padding
  const usableW = (right - left) - CFG.brickSidePad * 2;
  const brickW = Math.floor((usableW - gap * (cols - 1)) / cols);

  const bricks: Brick[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = left + CFG.brickSidePad + c * (brickW + gap);
      const y = top + CFG.brickTop + r * (CFG.brickH + gap);

      bricks.push({
        x,
        y,
        w: brickW,
        h: CFG.brickH,
        hp: 1,
        alive: true,
        hitFlash: 0
      });
    }
  }

  return bricks;
}
