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

  // Arena (inner frame the ball bounces inside)
  arenaInsetX: 26,      // left/right wall inset
  arenaInsetTop: 22,    // ceiling inset
  arenaInsetBottom: 18, // (visual only for now, paddle stays above bottom)
  arenaWallRadius: 22,  // for rounded frame drawing

  // Anti-kjedelig: aldri helt flate vinkler
  minAbsVX: 120,
  minAbsVY: 160,

  // Bricks
  brickCols: 11,
  brickRows: 7,
  brickGap: 4,
  brickTop: 18,
  brickSidePad: 10,
  brickH: 16
} as const;
