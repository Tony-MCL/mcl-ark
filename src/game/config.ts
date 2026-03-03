export const CFG = {
  worldW: 960,
  worldH: 540,

  paddleW: 140,
  paddleH: 18,
  paddleY: 500,

  ballR: 8,
  ballSpeed: 430,

  // “2026 dryss” uten å miste Arkanoid-presisjon:
  // Litt mer fart etter hvert, men MVP: moderat.
  speedRampPerHit: 0.35,

  // Anti-kjedelig: aldri helt flate vinkler
  minAbsVX: 120,
  minAbsVY: 160,

  // Bricks
  brickCols: 12,
  brickRows: 6,
  brickGap: 10,
  brickTop: 72,
  brickSidePad: 48,
  brickH: 26
} as const;
