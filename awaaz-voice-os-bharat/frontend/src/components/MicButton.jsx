import React from "react";
import { t } from "../utils/tts";

export default function MicButton({ isListening, onClick, disabled, lang = "hi", size = "lg" }) {
  const dim = size === "lg" ? "w-32 h-32" : "w-20 h-20";
  const fs  = size === "lg" ? "text-5xl"  : "text-3xl";

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative flex items-center justify-center">
        {isListening && (
          <>
            <span className={`absolute ${size==="lg"?"w-40 h-40":"w-28 h-28"} rounded-full mic-ring-1`}
                  style={{background:"rgba(0,212,255,0.15)"}} />
            <span className={`absolute ${size==="lg"?"w-52 h-52":"w-36 h-36"} rounded-full mic-ring-2`}
                  style={{background:"rgba(0,212,255,0.08)"}} />
            <span className={`absolute ${size==="lg"?"w-64 h-64":"w-44 h-44"} rounded-full mic-ring-3`}
                  style={{background:"rgba(0,212,255,0.04)"}} />
          </>
        )}
        <button onClick={onClick} disabled={disabled}
          className={`relative ${dim} rounded-full ${fs} flex items-center justify-center
                      transition-all duration-300 select-none z-10
                      ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
          style={{
            background: isListening
              ? "linear-gradient(135deg,#FF4757,#CC0020)"
              : "linear-gradient(135deg,#00D4FF,#0066AA)",
            boxShadow: isListening
              ? "0 0 40px rgba(255,71,87,0.5),0 8px 32px rgba(255,71,87,0.3)"
              : "0 0 40px rgba(0,212,255,0.4),0 8px 32px rgba(0,212,255,0.25)",
            transform: isListening ? "scale(1.08)" : "scale(1)",
          }}>
          {isListening ? "⏹️" : "🎙️"}
        </button>
      </div>

      {isListening && (
        <div className="flex items-center gap-1.5 h-10">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="wave-bar w-2"
                 style={{background:"linear-gradient(to top,#00D4FF,#A855F7)"}} />
          ))}
        </div>
      )}

      <p className="text-sm font-semibold tracking-wide"
         style={{color: isListening ? "#00FF88" : "#6B7FA3"}}>
        {isListening ? t(lang, "listening") : t(lang, "micTap")}
      </p>
    </div>
  );
}
