import React from "react";

export default function ServiceCard({ service, onClick, compact = false }) {
  return (
    <button
      onClick={() => onClick?.(service)}
      className={`
        card flex flex-col items-center justify-center text-center
        transition-all duration-200 hover:scale-105 hover:border-cyan-500/50 active:scale-95
        ${compact ? "p-3 gap-1" : "p-4 gap-2"}
      `}
      style={{ borderColor: "#1E2D55" }}
    >
      <span className={compact ? "text-2xl" : "text-3xl"}>{service.icon}</span>
      <span
        className={`font-bold ${compact ? "text-xs" : "text-sm"}`}
        style={{ color: service.color || "#fff" }}
      >
        {service.nameHi || service.name}
      </span>
      {!compact && (
        <span className="text-xs" style={{ color: "#8899BB" }}>{service.desc}</span>
      )}
    </button>
  );
}
