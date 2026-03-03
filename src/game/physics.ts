import { CFG } from "./config";
import type { Ball, Paddle, Vec2 } from "./types";

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

/**
 * Resolve circle-vs-rect collision robustly:
 * - returns a collision normal (nx, ny)
 * - pushes the ball out of the rectangle along the normal
 * - reflects velocity around the normal
 *
 * This reduces "edge tunneling" artifacts and makes corner hits behave.
 */
export function resolveCircleRectCollision(
  ball: Ball,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean {
  // Closest point on rect to circle center
  const cx = clamp(ball.p.x, rx, rx + rw);
  const cy = clamp(ball.p.y, ry, ry + rh);

  let dx = ball.p.x - cx;
  let dy = ball.p.y - cy;

  const distSq = dx * dx + dy * dy;
  const r = ball.r;

  if (distSq > r * r) return false;

  let nx = 0;
  let ny = 0;

  // If center is not exactly on edge point, normal is from closest point to center
  const dist = Math.sqrt(distSq);
  if (dist > 1e-8) {
    nx = dx / dist;
    ny = dy / dist;
  } else {
    // Center is exactly on/inside corner/edge numerically -> pick the smallest penetration axis
    const toLeft = Math.abs(ball.p.x - rx);
    const toRight = Math.abs((rx + rw) - ball.p.x);
    const toTop = Math.abs(ball.p.y - ry);
    const toBottom = Math.abs((ry + rh) - ball.p.y);

    const min = Math.min(toLeft, toRight, toTop, toBottom);
    if (min === toLeft) { nx = -1; ny = 0; }
    else if (min === toRight) { nx = 1; ny = 0; }
    else if (min === toTop) { nx = 0; ny = -1; }
    else { nx = 0; ny = 1; }
  }

  // Push ball out of rect along normal
  const push = (r - dist) + 0.5; // 0.5px safety margin in world units
  ball.p.x += nx * push;
  ball.p.y += ny * push;

  // Reflect velocity around normal: v' = v - 2*(v·n)*n
  const dot = ball.v.x * nx + ball.v.y * ny;
  ball.v.x = ball.v.x - 2 * dot * nx;
  ball.v.y = ball.v.y - 2 * dot * ny;

  ensureInterestingVelocity(ball);
  return true;
}
