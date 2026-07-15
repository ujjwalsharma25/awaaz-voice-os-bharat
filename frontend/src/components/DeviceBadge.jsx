import React from "react";

/*
  Shows exactly which device handled the AI for this request — this is
  what makes the multi-device story demonstrable live, not just claimed
  on a slide. Reads the aiMode/aiDevice fields the backend now returns
  from POST /api/voice/process (see backend/services/aiService.js).
*/

const CONFIG = {
  "edge-local": {
    icon: "⚡",
    label: "Snapdragon PC — On-device AI",
    sub: "Ran fully offline on the NPU",
    color: "#00FF88",
    bg: "rgba(0,255,136,0.10)",
    border: "rgba(0,255,136,0.35)",
  },
  cloud: {
    icon: "☁️",
    label: "Cloud escalation (AI Cloud 100)",
    sub: "Edge was unsure / unreachable",
    color: "#FFA500",
    bg: "rgba(255,165,0,0.10)",
    border: "rgba(255,165,0,0.35)",
  },
  fallback: {
    icon: "☁️",
    label: "Cloud escalation (AI Cloud 100)",
    sub: "Edge was unsure / unreachable",
    color: "#FFA500",
    bg: "rgba(255,165,0,0.10)",
    border: "rgba(255,165,0,0.35)",
  },
  mock: {
    icon: "🧪",
    label: "Demo mode — no AI backend wired",
    sub: "Keyword matching only",
    color: "#8899BB",
    bg: "rgba(136,153,187,0.10)",
    border: "rgba(136,153,187,0.35)",
  },
  offline: {
    icon: "📵",
    label: "Offline — processed on this device only",
    sub: "Backend unreachable, queued for sync",
    color: "#FF4757",
    bg: "rgba(255,71,87,0.10)",
    border: "rgba(255,71,87,0.35)",
  },
  "arduino_uno_q": {
    icon: "🔌",
    label: "Arduino UNO Q — sensor triggered",
    sub: "Auto-filed, no manual input",
    color: "#00D4FF",
    bg: "rgba(0,212,255,0.10)",
    border: "rgba(0,212,255,0.35)",
  },
};

export default function DeviceBadge({ mode, device, className = "" }) {
  const cfg = CONFIG[mode] || CONFIG.mock;
  return (
    <div
      className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl w-fit ${className}`}
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
      title={device || mode}
    >
      <span className="text-base leading-none">{cfg.icon}</span>
      <div className="leading-tight">
        <p className="text-[11px] font-bold" style={{ color: cfg.color }}>{cfg.label}</p>
        <p className="text-[10px] opacity-70" style={{ color: cfg.color }}>{cfg.sub}</p>
      </div>
    </div>
  );
}
