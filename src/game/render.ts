import { CFG } from "./config";
import type { Settings, World } from "./types";

export function render(ctx: CanvasRenderingContext2D, world: World, settings: Settings, dpr: number) {
  const W = world.width;
  const H = world.height;

  // Background
  ctx.clearRect(0, 0, W, H);

  // Subtle “coffee + neon” glow
  const g1 = ctx.createRadialGradient(W * 0.25, H * 0.15, 10, W * 0.25, H * 0.15, W * 0.9);
  g1.addColorStop(0, "rgba(211,139,61,0.16)");
  g1.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, W, H);

  const g2 = ctx.createRadialGradient(W * 0.78, H * 0.25, 10, W * 0.78, H * 0.25, W * 0.8);
  g2.addColorStop(0, "rgba(94,234,212,0.10)");
  g2.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, W, H);

  // Bricks
  for (const b of world.bricks) {
    if (!b.alive) continue;
    const grad = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h);
    grad.addColorStop(0, "rgba(255,255,255,0.18)");
    grad.addColorStop(1, "rgba(255,255,255,0.06)");
    ctx.fillStyle = grad;
    roundRect(ctx, b.x, b.y, b.w, b.h, 10);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.lineWidth = 1;
    roundRect(ctx, b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1, 10);
    ctx.stroke();
  }

  // Paddle
  {
    const p = world.paddle;
    const grad = ctx.createLinearGradient(p.x, p.y, p.x + p.w, p.y + p.h);
    grad.addColorStop(0, "rgba(211,139,61,0.75)");
    grad.addColorStop(1, "rgba(211,139,61,0.35)");
    ctx.fillStyle = grad;
    roundRect(ctx, p.x, p.y, p.w, p.h, 12);
    ctx.fill();
  }

  // Ball
  {
    const b = world.ball;
    const rg = ctx.createRadialGradient(b.p.x - 4, b.p.y - 4, 2, b.p.x, b.p.y, b.r * 2.2);
    rg.addColorStop(0, "rgba(255,255,255,0.95)");
    rg.addColorStop(1, "rgba(94,234,212,0.35)");
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(b.p.x, b.p.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Optional retro overlay (very subtle)
  if (settings.retroOverlay) {
    drawScanlines(ctx, W, H, dpr);
    drawVignette(ctx, W, H);
  }

  // Paused overlay
  if (world.paused) {
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "700 28px ui-sans-serif, system-ui";
    ctx.textAlign = "center";
    ctx.fillText(world.gameOver ? "GAME OVER" : "PAUSED", W / 2, H / 2);
    ctx.font = "500 14px ui-sans-serif, system-ui";
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.fillText("Two-finger tap to resume", W / 2, H / 2 + 26);
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawScanlines(ctx: CanvasRenderingContext2D, W: number, H: number, dpr: number) {
  ctx.save();
  ctx.globalAlpha = 0.10;
  ctx.fillStyle = "rgba(0,0,0,1)";
  const step = Math.max(2, Math.round(3 * dpr));
  for (let y = 0; y < H; y += step) {
    ctx.fillRect(0, y, W, 1);
  }
  ctx.restore();
}

function drawVignette(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.save();
  const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.2, W / 2, H / 2, Math.max(W, H) * 0.75);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
