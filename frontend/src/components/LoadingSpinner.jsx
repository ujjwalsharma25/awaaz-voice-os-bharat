import React from "react";

export default function LoadingSpinner({ text = "लोड हो रहा है..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm" style={{ color: "#8899BB" }}>{text}</p>
    </div>
  );
}
