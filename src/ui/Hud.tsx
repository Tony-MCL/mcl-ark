import React from "react";
import type { HudState } from "../game/types";

export function Hud({ hud }: { hud: HudState }) {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
      <div style={pillStyle}>Score: <b style={{ marginLeft: 6 }}>{hud.score}</b></div>
      <div style={pillStyle}>Lives: <b style={{ marginLeft: 6 }}>{hud.lives}</b></div>
      <div style={pillStyle}>Level: <b style={{ marginLeft: 6 }}>{hud.level}</b></div>
      {hud.paused && <div style={{ ...pillStyle, background: "rgba(255,255,255,0.14)" }}>Paused</div>}
      {hud.gameOver && <div style={{ ...pillStyle, background: "rgba(255,107,107,0.22)" }}>Game Over</div>}
    </div>
  );
}

const pillStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  fontSize: 12,
  boxShadow: "0 12px 25px rgba(0,0,0,0.22)",
};
