import React from "react";
import type { Settings } from "../game/types";

type Props = {
  settings: Settings;
  onSettings: (s: Settings) => void;
  onPlay: () => void;
};

export function Menu({ settings, onSettings, onPlay }: Props) {
  return (
    <div style={{ padding: 16, paddingTop: 0 }}>
      <div
        style={{
          borderRadius: 22,
          padding: 18,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)"
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: 0.2 }}>
          Brick Brew <span style={{ opacity: 0.9 }}>’86</span>
        </div>
        <div style={{ marginTop: 6, opacity: 0.78 }}>
          Take a coffee break. One level. Pure feel first.
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          <button className="primary" onClick={onPlay}>Play</button>
          <button className="ghost" onClick={() => onSettings({ ...settings, retroOverlay: !settings.retroOverlay })}>
            Retro overlay: {settings.retroOverlay ? "On" : "Off"}
          </button>
          <button className="ghost" onClick={() => onSettings({ ...settings, sound: !settings.sound })}>
            Sound: {settings.sound ? "On" : "Off"}
          </button>
          <button className="ghost" onClick={() => onSettings({ ...settings, haptics: !settings.haptics })}>
            Haptics: {settings.haptics ? "On" : "Off"}
          </button>
        </div>

        <div style={{ marginTop: 14, fontSize: 12, opacity: 0.72 }}>
          MVP build: paddle + ball + bricks + 3 lives. Powerups later.
        </div>
      </div>
    </div>
  );
}
