import React, { useEffect, useMemo, useRef, useState } from "react";
import { Menu } from "./ui/Menu";
import { Hud } from "./ui/Hud";
import { createEngine } from "./game/engine";
import type { Settings } from "./game/types";

type View = "menu" | "play";

const LS_SETTINGS = "mcl-ark.settings.v1";

const defaultSettings: Settings = {
  sound: true,
  haptics: false,
  retroOverlay: true
};

export function App() {
  const [view, setView] = useState<View>("menu");
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const raw = localStorage.getItem(LS_SETTINGS);
      if (!raw) return defaultSettings;
      const parsed = JSON.parse(raw) as Partial<Settings>;
      return { ...defaultSettings, ...parsed };
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem(LS_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const engine = useMemo(() => createEngine(), []);
  const [hud, setHud] = useState(engine.getHud());

  useEffect(() => {
    engine.onHud(setHud);
    return () => engine.onHud(() => {});
  }, [engine]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (view !== "play") {
      engine.stop();
      return;
    }

    engine.start(canvas, settings);
    return () => engine.stop();
  }, [engine, view, settings]);

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) engine.pause(true);
      else engine.pause(false);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [engine]);

  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div
        style={{
          width: "min(980px, 100%)",
          borderRadius: 24,
          background: "rgba(255,255,255,0.06)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
          overflow: "hidden"
        }}
      >
        <div style={{ display: "flex", gap: 0, flexDirection: "column" }}>
          <div style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 0.2 }}>
                Brick Brew <span style={{ opacity: 0.9 }}>’86</span>
              </div>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                Morning Coffee Labs — coffee break arcade
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {view === "play" ? (
                <>
                  <button className="ghost" onClick={() => engine.togglePause()}>
                    {hud.paused ? "Resume" : "Pause"}
                  </button>
                  <button className="ghost" onClick={() => engine.restart()}>
                    Restart
                  </button>
                  <button className="ghost" onClick={() => setView("menu")}>
                    Menu
                  </button>
                </>
              ) : (
                <button className="ghost" onClick={() => setView("play")}>
                  Quick Play
                </button>
              )}
            </div>
          </div>

          {view === "menu" ? (
            <Menu
              settings={settings}
              onSettings={setSettings}
              onPlay={() => setView("play")}
            />
          ) : (
            <div style={{ padding: 16, paddingTop: 0 }}>
              <Hud hud={hud} />
              <div
                style={{
                  borderRadius: 22,
                  background: "rgba(0,0,0,0.35)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  overflow: "hidden",
                  position: "relative"
                }}
              >
                <canvas
                  ref={canvasRef}
                  style={{
                    width: "100%",
                    aspectRatio: "16 / 9",
                    display: "block",
                    touchAction: "none"
                  }}
                />
              </div>

              <div style={{ marginTop: 10, fontSize: 12, opacity: 0.72 }}>
                Touch/drag to move paddle. Tap with two fingers to pause.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
