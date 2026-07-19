import React from "react";

const STATUS_COLORS = {
  pending:    "#FFD54F",
  submitted:  "#00BFFF",
  processing: "#9C6FFF",
  resolved:   "#00E676",
  rejected:   "#FF4444",
};

export default function ResultCard({ result, onSubmit, loading }) {
  if (!result) return null;

  const { serviceType, voiceReply, referenceNumber, formData, intent, estimatedDays } = result;

  return (
    <div className="card p-5 flex flex-col gap-4 animate-fadeIn">
      {/* Service detected */}
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
        <div>
          <p className="text-xs" style={{ color: "#8899BB" }}>सेवा पहचानी गई / Service Detected</p>
          <p className="text-lg font-bold text-white capitalize">
            {serviceType?.replace("_", " ")}
          </p>
        </div>
      </div>

      {/* Voice reply box */}
      {voiceReply && (
        <div
          className="rounded-xl p-4 text-sm leading-relaxed"
          style={{ background: "rgba(0,191,255,0.08)", border: "1px solid rgba(0,191,255,0.2)", color: "#E0F7FF" }}
        >
          🔊 {voiceReply}
        </div>
      )}

      {/* Reference number */}
      {referenceNumber && (
        <div
          className="rounded-lg p-3 flex items-center justify-between"
          style={{ background: "#1A2240" }}
        >
          <span className="text-xs" style={{ color: "#8899BB" }}>Reference No.</span>
          <span className="font-mono font-bold text-cyan-400">{referenceNumber}</span>
        </div>
      )}

      {/* Form data preview */}
      {formData && (
        <div>
          <p className="text-xs mb-2 font-semibold" style={{ color: "#8899BB" }}>
            📋 Auto-filled Form Data
          </p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(formData)
              .filter(([k, v]) => v && k !== "submittedAt" && k !== "gpsLat" && k !== "gpsLng")
              .slice(0, 8)
              .map(([key, value]) => (
                <div key={key} className="rounded-lg p-2" style={{ background: "#1A2240" }}>
                  <p className="text-xs capitalize" style={{ color: "#8899BB" }}>
                    {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}
                  </p>
                  <p className="text-xs font-medium text-white truncate">{String(value)}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Estimated resolution */}
      {estimatedDays !== undefined && (
        <p className="text-xs text-center" style={{ color: "#8899BB" }}>
          ⏱️ अनुमानित समाधान: <span className="text-yellow-400 font-bold">{estimatedDays} दिन</span>
        </p>
      )}

      {/* Submit button */}
      {onSubmit && !result.submitted && (
        <button
          onClick={onSubmit}
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-white text-base transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #00BFFF, #9C6FFF)" }}
        >
          {loading ? "जमा हो रहा है..." : "✅ आवेदन जमा करें / Submit"}
        </button>
      )}

      {result.submitted && (
        <div
          className="text-center py-3 rounded-xl font-bold"
          style={{ background: "rgba(0,230,118,0.15)", color: "#00E676" }}
        >
          ✅ आवेदन सफलतापूर्वक जमा हो गया!
        </div>
      )}
    </div>
  );
}
