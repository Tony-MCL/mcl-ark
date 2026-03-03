import { CFG } from "./config";
import { makeLevel1 } from "./level";
import { bounceOffBrick, bounceOffPaddle, circleRectHit, ensureInterestingVelocity, setSpeed } from "./physics";
import { render } from "./render";
import type { HudState, Settings, World } from "./types";

type HudListener = (h: HudState) => void;

export function createEngine() {
  let raf = 0;
  let running = false;

  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let dpr = 1;

  let settings: Settings = { sound: true, haptics: false, retroOverlay: true };

  let hudListener: HudListener = () => {};

  const world: World = makeWorld();

  let lastT = 0;
  let accumulator = 0;
  const FIXED_DT = 1 / 120; // stable, smooth

  let pointerActive = false;
  let pointerX = CFG.worldW / 2;
  let twoFingerDown = false;

  function makeWorld(): World {
    const paddleY = CFG.paddleY;
    return {
      width: CFG.worldW,
      height: CFG.worldH,
      paddle: { x: (CFG.worldW - CFG.paddleW) / 2, y: paddleY, w: CFG.paddleW, h: CFG.paddleH },
      ball: {
        p: { x: CFG.worldW / 2, y: paddleY - 24 },
        v: { x: 220, y: -CFG.ballSpeed },
        r: CFG.ballR,
        stuckToPaddle: true
      },
      bricks: makeLevel1(),
      score: 0,
      lives: 3,
      level: 1,
      paused: false,
      gameOver: false
    };
  }

  function emitHud() {
    hudListener({
      score: world.score,
      lives: world.lives,
      level: world.level,
      paused: world.paused,
      gameOver: world.gameOver
    });
  }

  function resetBall(stuck = true) {
    world.ball.stuckToPaddle = stuck;
    world.ball.p.x = world.paddle.x + world.paddle.w / 2;
    world.ball.p.y = world.paddle.y - 22;
    world.ball.v.x = 220;
    world.ball.v.y = -CFG.ballSpeed;
    ensureInterestingVelocity(world.ball);
  }

  function restart() {
    const fresh = makeWorld();
    Object.assign(world, fresh);
    emitHud();
  }

  function pause(p: boolean) {
    world.paused = p;
    emitHud();
  }

  function togglePause() {
    if (world.gameOver) return;
    world.paused = !world.paused;
    emitHud();
  }

  function onPointerMove(clientX: number, rect: DOMRect) {
    const nx = (clientX - rect.left) / rect.width;
    pointerX = nx * world.width;
  }

  function applyInput() {
    const target = pointerX - world.paddle.w / 2;
    // Slight smoothing so it feels “premium”
    world.paddle.x += (target - world.paddle.x) * 0.35;
    world.paddle.x = Math.max(0, Math.min(world.width - world.paddle.w, world.paddle.x));

    if (world.ball.stuckToPaddle) {
      world.ball.p.x = world.paddle.x + world.paddle.w / 2;
      world.ball.p.y = world.paddle.y - 22;
    }
  }

  function step(dt: number) {
    if (world.paused || world.gameOver) return;

    applyInput();

    const ball = world.ball;

    if (ball.stuckToPaddle) return;

    ball.p.x += ball.v.x * dt;
    ball.p.y += ball.v.y * dt;

    // Walls
    if (ball.p.x - ball.r < 0) { ball.p.x = ball.r; ball.v.x *= -1; }
    if (ball.p.x + ball.r > world.width) { ball.p.x = world.width - ball.r; ball.v.x *= -1; }
    if (ball.p.y - ball.r < 0) { ball.p.y = ball.r; ball.v.y *= -1; }

    // Paddle hit
    if (circleRectHit(ball, world.paddle.x, world.paddle.y, world.paddle.w, world.paddle.h) && ball.v.y > 0) {
      ball.p.y = world.paddle.y - ball.r - 0.5;
      bounceOffPaddle(ball, world.paddle);
    }

    // Brick hits
    for (const br of world.bricks) {
      if (!br.alive) continue;
      if (circleRectHit(ball, br.x, br.y, br.w, br.h)) {
        br.hp -= 1;
        if (br.hp <= 0) br.alive = false;

        bounceOffBrick(ball, br);
        world.score += 10;

        // 2026-dryss: mild speed ramp per hit
        const speed = Math.hypot(ball.v.x, ball.v.y);
        setSpeed(ball, speed + CFG.speedRampPerHit);
        ensureInterestingVelocity(ball);

        emitHud();
        break;
      }
    }

    // Lose ball
    if (ball.p.y - ball.r > world.height) {
      world.lives -= 1;
      emitHud();
      if (world.lives <= 0) {
        world.gameOver = true;
        world.paused = true;
        emitHud();
      } else {
        resetBall(true);
      }
    }

    // Level clear (MVP: restart level)
    if (world.bricks.every(b => !b.alive)) {
      world.bricks = makeLevel1();
      resetBall(true);
      emitHud();
    }
  }

  function frame(t: number) {
    if (!running || !canvas || !ctx) return;
    if (!lastT) lastT = t;
    const dt = Math.min(0.05, (t - lastT) / 1000);
    lastT = t;

    accumulator += dt;
    while (accumulator >= FIXED_DT) {
      step(FIXED_DT);
      accumulator -= FIXED_DT;
    }

    render(ctx, world, settings, dpr);

    raf = requestAnimationFrame(frame);
  }

  function attachEvents(c: HTMLCanvasElement) {
    const getRect = () => c.getBoundingClientRect();

    const onPointerDown = (e: PointerEvent) => {
      pointerActive = true;
      c.setPointerCapture(e.pointerId);
      onPointerMove(e.clientX, getRect());

      // If stuck, launch on first touch
      if (world.ball.stuckToPaddle && !world.paused && !world.gameOver) {
        world.ball.stuckToPaddle = false;
        ensureInterestingVelocity(world.ball);
      }
    };

    const onPointerMoveEv = (e: PointerEvent) => {
      if (!pointerActive) return;
      onPointerMove(e.clientX, getRect());
    };

    const onPointerUp = (e: PointerEvent) => {
      pointerActive = false;
      try { c.releasePointerCapture(e.pointerId); } catch {}
    };

    // Two-finger tap to pause/resume
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        if (!twoFingerDown) {
          twoFingerDown = true;
          togglePause();
        }
      }
    };
    const onTouchEnd = () => {
      if (twoFingerDown) twoFingerDown = false;
    };

    c.addEventListener("pointerdown", onPointerDown);
    c.addEventListener("pointermove", onPointerMoveEv);
    c.addEventListener("pointerup", onPointerUp);
    c.addEventListener("pointercancel", onPointerUp);

    c.addEventListener("touchstart", onTouchStart, { passive: true });
    c.addEventListener("touchend", onTouchEnd, { passive: true });
    c.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      c.removeEventListener("pointerdown", onPointerDown);
      c.removeEventListener("pointermove", onPointerMoveEv);
      c.removeEventListener("pointerup", onPointerUp);
      c.removeEventListener("pointercancel", onPointerUp);

      c.removeEventListener("touchstart", onTouchStart);
      c.removeEventListener("touchend", onTouchEnd);
      c.removeEventListener("touchcancel", onTouchEnd);
    };
  }

  let detach: null | (() => void) = null;

  function start(nextCanvas: HTMLCanvasElement, nextSettings: Settings) {
    canvas = nextCanvas;
    ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Canvas 2D context unavailable");

    settings = nextSettings;

    // Resize for DPR
    dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);

    // Fit world into canvas
    ctx.setTransform(canvas.width / world.width, 0, 0, canvas.height / world.height, 0, 0);

    detach?.();
    detach = attachEvents(canvas);

    running = true;
    emitHud();
    raf = requestAnimationFrame(frame);

    // On resize: keep it stable
    const onResize = () => {
      if (!canvas || !ctx) return;
      dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(canvas.width / world.width, 0, 0, canvas.height / world.height, 0, 0);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    lastT = 0;
    accumulator = 0;
    detach?.();
    detach = null;
  }

  function onHud(fn: HudListener) {
    hudListener = fn;
    emitHud();
  }

  function getHud(): HudState {
    return {
      score: world.score,
      lives: world.lives,
      level: world.level,
      paused: world.paused,
      gameOver: world.gameOver
    };
  }

  return { start, stop, restart, pause, togglePause, onHud, getHud };
}
