import { CFG } from "./config";
import type { Brick } from "./types";

export function makeLevel1(): Brick[] {
  const cols = CFG.brickCols;
  const rows = CFG.brickRows;
  const gap = CFG.brickGap;

  const usableW = CFG.worldW - CFG.brickSidePad * 2;
  const brickW = Math.floor((usableW - gap * (cols - 1)) / cols);

  const bricks: Brick[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = CFG.brickSidePad + c * (brickW + gap);
      const y = CFG.brickTop + r * (CFG.brickH + gap);
      bricks.push({
        x, y,
        w: brickW,
        h: CFG.brickH,
        hp: 1,
        alive: true
      });
    }
  }
  return bricks;
}
