import React from "react";

export default function EmptyState({ icon = "📭", title, subtitle, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center px-4">
      <span className="text-5xl">{icon}</span>
      <p className="text-white font-semibold text-lg">{title}</p>
      {subtitle && <p className="text-sm" style={{ color: "#8899BB" }}>{subtitle}</p>}
      {action && (
        <button
          onClick={onAction}
          className="mt-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg, #00BFFF, #9C6FFF)" }}
        >
          {action}
        </button>
      )}
    </div>
  );
}
