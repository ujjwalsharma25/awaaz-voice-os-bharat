import React, { useState, useEffect, useRef } from "react";
import { speak, stopSpeaking, t } from "../utils/tts";
import { useVoice } from "../hooks/useVoice";
import MicButton from "./MicButton";

/* ── Step 1 of the complaint flow ────────────────────────────
   Asks "What is your complaint?", lets the user speak or type
   it, reads it back for confirmation, and only then hands the
   confirmed text up so the existing complaint form can open.
   This uses its own isolated useVoice() instance so the main
   homepage mic/transcript state is left completely untouched. */
export default function ComplaintDetails({ lang, onConfirm, onBack }) {
  const [stage, setStage] = useState("ask"); // "ask" | "review"
  const [text,  setText]  = useState("");
  const askedRef = useRef(false);

  const { isListening, transcript, interimText, isSupported,
          startListening, stopListening, clearTranscript } = useVoice(lang);

  const askMsg = t(lang, "askComplaint");

  const isCorrectMsg = t(lang, "isCorrect");

  // Cancel any leftover audio first so this question starts almost
  // instantly instead of waiting behind whatever was playing before.
  useEffect(() => {
    if (askedRef.current) return;
    askedRef.current = true;
    stopSpeaking();
    speak(askMsg, lang);
  }, []);

  // Keep the text box in sync with live speech transcript
  useEffect(() => {
    if (transcript) setText(transcript);
  }, [transcript]);

  const handleMic = () => {
    if (isListening) { stopListening(); return; }
    clearTranscript();
    startListening();
  };

  const handleContinue = () => {
    if (!text.trim()) return;
    setStage("review");
    stopSpeaking();
    speak(`${t(lang,"youSaid", text.slice(0,90))}. ${isCorrectMsg}`, lang);
  };

  const handleEdit = () => {
    setStage("ask");
  };

  const handleConfirm = () => onConfirm(text.trim());

  return (
    <div className="w-full flex flex-col gap-5 slide-up">

      {/* Header */}
      <div className="glass rounded-3xl px-6 py-6 flex flex-col items-center text-center gap-3"
           style={{border:"1px solid rgba(255,165,0,0.3)"}}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
             style={{background:"rgba(255,165,0,0.12)", border:"1px solid rgba(255,165,0,0.3)"}}>
          📢
        </div>
        <div>
          <p className="text-[11px] font-bold tracking-widest uppercase" style={{color:"#6B7FA3"}}>
            {t(lang,"registerComplaint")}
          </p>
          <p className="text-white font-bold text-base mt-1 leading-relaxed">
            {stage === "ask" ? askMsg : t(lang,"pleaseConfirmComplaint")}
          </p>
        </div>
      </div>

      {/* ── Stage: ASK (speak or type) ───────────────────────── */}
      {stage === "ask" && (
        <div className="glass rounded-3xl p-5 flex flex-col gap-4" style={{border:"1px solid #1E3060"}}>

          {isSupported && (
            <div className="flex flex-col items-center py-2">
              <p className="text-xs font-semibold mb-2" style={{color:"#00D4FF"}}>
                🎙️ {t(lang,"micTap")}
              </p>
              <MicButton isListening={isListening} onClick={handleMic} lang={lang} size="lg" />
            </div>
          )}

          <div className="flex items-center gap-2 my-1">
            <div className="flex-1 h-px" style={{background:"#1E3060"}} />
            <span className="text-xs font-semibold" style={{color:"#6B7FA3"}}>•</span>
            <div className="flex-1 h-px" style={{background:"#1E3060"}} />
          </div>

          <div>
            <p className="text-xs font-semibold mb-2" style={{color:"#6B7FA3"}}>
              {t(lang,"orTypeComplaint")}
            </p>
            <textarea
              value={text}
              onChange={e=>setText(e.target.value)}
              placeholder={t(lang,"describeComplaintPlaceholder")}
              rows={4}
              className="w-full rounded-2xl p-3.5 text-sm text-white outline-none resize-none leading-relaxed"
              style={{background:"rgba(255,255,255,0.04)", border:"1px solid #1E3060"}}
            />
            {interimText && (
              <p className="text-xs mt-1.5" style={{color:"#6B7FA3"}}>{interimText}...</p>
            )}
          </div>

          <button onClick={handleContinue} disabled={!text.trim()}
            className="btn-primary w-full py-3.5 disabled:opacity-40">
            {t(lang,"continueBtn")}
          </button>
        </div>
      )}

      {/* ── Stage: REVIEW (read back + confirm) ──────────────── */}
      {stage === "review" && (
        <div className="glass rounded-3xl p-5 flex flex-col gap-4" style={{border:"1px solid rgba(255,165,0,0.25)"}}>

          <div className="rounded-2xl p-4" style={{background:"rgba(255,165,0,0.06)", border:"1px solid rgba(255,165,0,0.2)"}}>
            <p className="text-xs font-semibold mb-1.5" style={{color:"#6B7FA3"}}>
              {t(lang,"yourComplaintLabel")}
            </p>
            <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{text}</p>
          </div>

          <button onClick={()=>{ stopSpeaking(); speak(`${t(lang,"youSaid",text.slice(0,90))}. ${isCorrectMsg}`, lang); }}
            className="btn-secondary w-full py-2.5 flex items-center justify-center gap-2 text-sm">
            🔊 {t(lang,"replay")}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleEdit}
              className="py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95"
              style={{background:"rgba(255,71,87,0.1)",border:"1px solid rgba(255,71,87,0.3)",color:"#FF4757"}}>
              ✏️ {t(lang,"edit")}
            </button>
            <button onClick={handleConfirm}
              className="py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95"
              style={{background:"rgba(0,255,136,0.12)",border:"2px solid #00FF88",color:"#00FF88"}}>
              ✅ {t(lang,"confirmBtn")}
            </button>
          </div>
        </div>
      )}

      {/* Back / cancel */}
      <button onClick={onBack}
        className="w-full py-2.5 rounded-2xl text-sm transition-all"
        style={{background:"rgba(255,71,87,0.08)",border:"1px solid rgba(255,71,87,0.3)",color:"#FF4757"}}>
        🔄 {t(lang,"retry")}
      </button>
    </div>
  );
}
