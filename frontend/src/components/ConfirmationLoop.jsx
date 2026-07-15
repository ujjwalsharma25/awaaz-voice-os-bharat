import React, { useEffect, useRef } from "react";
import { speak, stopSpeaking, t, getServiceName } from "../utils/tts";
import DeviceBadge from "./DeviceBadge";

const SERVICE_ICONS = {
  ration:"🍚", hospital:"🏥", pension:"💰", emergency:"🚨",
  documents:"📄", pm_kisan:"🌾", scholarship:"🏫", bijli:"⚡",
  jal_jeevan:"💧", mnrega:"🏗️", anganwadi:"👶", pm_awaas:"🏠", unknown:"❓",
};

export default function ConfirmationLoop({ transcript, serviceType, lang, deviceInfo, aiResult, onInfo, onForm, onComplaint, onRetry }) {
  const spokenRef = useRef(false);

  const svcName = getServiceName(lang, serviceType);

  const whatToDo3 = t(lang, "whatToDo3");

  // Cancel any leftover audio (e.g. previous screen's prompt still
  // playing/queued) so this screen's own announcement starts almost
  // instantly instead of waiting in line behind it.
  useEffect(() => {
    if (spokenRef.current) return;
    spokenRef.current = true;
    stopSpeaking();
    speak(t(lang,"youSaid", transcript.slice(0,60)), lang)
      .then(() => speak(whatToDo3, lang));
  }, []);

  const OPTIONS = [
    {
      key: "info", onClick: onInfo,
      icon: "ℹ️",
      title: t(lang,"infoBtn"),
      subtitle: t(lang,"infoSubtitle34lines"),
      color: "#00D4FF", bg: "rgba(0,212,255,0.07)", border: "rgba(0,212,255,0.3)", iconBg: "rgba(0,212,255,0.15)",
    },
    {
      key: "form", onClick: onForm,
      icon: "📋",
      title: t(lang,"formBtn"),
      subtitle: t(lang,"formSubtitleAuto"),
      color: "#00FF88", bg: "rgba(0,255,136,0.07)", border: "rgba(0,255,136,0.3)", iconBg: "rgba(0,255,136,0.15)",
    },
    {
      key: "complaint", onClick: onComplaint,
      icon: "📢",
      title: t(lang,"registerComplaint"),
      subtitle: t(lang,"complaintSubtitleSms"),
      color: "#FFA500", bg: "rgba(255,165,0,0.07)", border: "rgba(255,165,0,0.3)", iconBg: "rgba(255,165,0,0.15)",
    },
  ];

  return (
    <div className="w-full flex flex-col gap-5 slide-up">

      {/* ── Hero: detected service + what was heard ─────────── */}
      <div className="glass rounded-3xl px-6 py-7 flex flex-col items-center text-center gap-4"
           style={{border:"1px solid rgba(0,255,136,0.25)"}}>

        <div className="relative">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
               style={{background:"rgba(0,255,136,0.12)", border:"1px solid rgba(0,255,136,0.3)"}}>
            {SERVICE_ICONS[serviceType]||"❓"}
          </div>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full animate-pulse"
                style={{background:"#00FF88", boxShadow:"0 0 10px rgba(0,255,136,0.7)", border:"2px solid #0F1A35"}}/>
        </div>

        <div>
          <p className="text-[11px] font-bold tracking-widest uppercase" style={{color:"#6B7FA3"}}>
            {t(lang,"serviceDetected")}
          </p>
          <p className="text-white font-black text-2xl mt-1 leading-tight">{svcName}</p>
        </div>

        <div className="w-full rounded-2xl px-4 py-3.5"
             style={{background:"rgba(255,255,255,0.04)", border:"1px solid #1E3060"}}>
          <p className="text-[11px] font-semibold mb-1.5 flex items-center justify-center gap-1.5" style={{color:"#6B7FA3"}}>
            <span>🎙️</span> {t(lang,"youSaidLabel")}
          </p>
          <p className="text-sm text-white text-center leading-relaxed italic">
            "{transcript.slice(0,90)}{transcript.length>90?"...":""}"
          </p>
        </div>
      </div>

      {deviceInfo?.mode && (
        <DeviceBadge mode={deviceInfo.mode} device={deviceInfo.device} className="mx-auto" />
      )}

      {aiResult?.intent && (
        <div className="glass rounded-2xl p-4" style={{border:"1px solid rgba(168,85,247,0.25)"}}>
          <p className="text-[11px] font-bold mb-1.5" style={{color:"#A855F7"}}>🧠 AI ने समझा (live model output)</p>
          <p className="text-sm text-white leading-relaxed">{aiResult.intent}</p>
          {aiResult.voiceReply && (
            <p className="text-xs mt-2 italic" style={{color:"#8899BB"}}>"{aiResult.voiceReply}"</p>
          )}
        </div>
      )}

      {/* ── Decision card: question + 3 options ──────────────── */}
      <div className="glass rounded-3xl p-5 flex flex-col gap-4"
           style={{border:"1px solid rgba(0,212,255,0.2)"}}>

        <p className="text-center font-bold text-white text-[15px] leading-relaxed px-2">
          {whatToDo3}
        </p>

        <div className="flex flex-col gap-3">
          {OPTIONS.map(opt => (
            <button key={opt.key} onClick={opt.onClick}
              className="w-full rounded-2xl px-4 py-4 flex items-center gap-4 text-left transition-all duration-200 active:scale-[0.97] hover:translate-y-[-1px]"
              style={{background:opt.bg, border:`1.5px solid ${opt.border}`}}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                   style={{background:opt.iconBg}}>
                {opt.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[15px] leading-tight" style={{color:opt.color}}>{opt.title}</p>
                <p className="text-xs mt-1 leading-snug opacity-80" style={{color:opt.color}}>{opt.subtitle}</p>
              </div>
              <span className="text-xl shrink-0 opacity-60" style={{color:opt.color}}>›</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Footer utilities: replay + retry side by side ─────── */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={()=>{ stopSpeaking(); speak(`${t(lang,"youSaid",transcript.slice(0,60))}. ${whatToDo3}`,lang); }}
          className="btn-secondary py-3 flex items-center justify-center gap-2 text-sm">
          🔊 {t(lang,"replay")}
        </button>
        <button onClick={onRetry}
          className="py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
          style={{background:"rgba(255,71,87,0.08)", border:"1px solid rgba(255,71,87,0.3)", color:"#FF4757"}}>
          🔄 {t(lang,"retry")}
        </button>
      </div>
    </div>
  );
}
