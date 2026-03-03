import { CFG } from "./config";
import type { Ball, Brick, Paddle, Vec2 } from "./types";

export function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

export function length(v: Vec2) {
  return Math.hypot(v.x, v.y);
}

export function normalize(v: Vec2): Vec2 {
  const len = length(v) || 1;
  return { x: v.x / len, y: v.y / len };
}

export function setSpeed(ball: Ball, speed: number) {
  const n = normalize(ball.v);
  ball.v.x = n.x * speed;
  ball.v.y = n.y * speed;
}

export function ensureInterestingVelocity(ball: Ball) {
  if (Math.abs(ball.v.x) < CFG.minAbsVX) ball.v.x = Math.sign(ball.v.x || 1) * CFG.minAbsVX;
  if (Math.abs(ball.v.y) < CFG.minAbsVY) ball.v.y = Math.sign(ball.v.y || -1) * CFG.minAbsVY;
}

export function circleRectHit(ball: Ball, rx: number, ry: number, rw: number, rh: number) {
  const cx = clamp(ball.p.x, rx, rx + rw);
  const cy = clamp(ball.p.y, ry, ry + rh);
  const dx = ball.p.x - cx;
  const dy = ball.p.y - cy;
  return (dx * dx + dy * dy) <= (ball.r * ball.r);
}

export function bounceOffPaddle(ball: Ball, paddle: Paddle) {
  // Determine hit position on paddle (-1..1)
  const t = ((ball.p.x - paddle.x) / paddle.w) * 2 - 1;
  const maxAngle = (70 * Math.PI) / 180; // Arkanoid-ish
  const angle = t * maxAngle;

  const speed = length(ball.v) || CFG.ballSpeed;

  // Upwards always after paddle
  ball.v.x = Math.sin(angle) * speed;
  ball.v.y = -Math.cos(angle) * speed;

  ensureInterestingVelocity(ball);
}

export function bounceOffBrick(ball: Ball, brick: Brick) {
  // Simple side resolution based on penetration direction
  const prev = { x: ball.p.x - ball.v.x * 0.016, y: ball.p.y - ball.v.y * 0.016 };

  const left = brick.x;
  const right = brick.x + brick.w;
  const top = brick.y;
  const bottom = brick.y + brick.h;

  const wasLeft = prev.x < left;
  const wasRight = prev.x > right;
  const wasAbove = prev.y < top;
  const wasBelow = prev.y > bottom;

  if ((wasLeft && ball.p.x >= left) || (wasRight && ball.p.x <= right)) {
    ball.v.x *= -1;
  } else if ((wasAbove && ball.p.y >= top) || (wasBelow && ball.p.y <= bottom)) {
    ball.v.y *= -1;
  } else {
    // Fallback
    ball.v.y *= -1;
  }

  ensureInterestingVelocity(ball);
}
