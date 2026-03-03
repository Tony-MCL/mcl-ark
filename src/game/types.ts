export type Settings = {
  sound: boolean;
  haptics: boolean;
  retroOverlay: boolean;
};

export type HudState = {
  score: number;
  lives: number;
  level: number;
  paused: boolean;
  gameOver: boolean;
};

export type Vec2 = { x: number; y: number };

export type Paddle = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Ball = {
  p: Vec2;
  v: Vec2;
  r: number;
  stuckToPaddle: boolean;
};

export type Brick = {
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number; // 1 for MVP
  alive: boolean;

  // FX
  hitFlash: number; // seconds remaining
};

export type World = {
  width: number;
  height: number;
  paddle: Paddle;
  ball: Ball;
  bricks: Brick[];
  score: number;
  lives: number;
  level: number;
  paused: boolean;
  gameOver: boolean;

  // FX
  levelClearFx: number; // seconds remaining
};
