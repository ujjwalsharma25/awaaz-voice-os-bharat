import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { speak, SCHEME_DESCRIPTIONS, t } from "../utils/tts";
import { OFFICIAL_LINKS } from "../utils/constants";

const SERVICES = [
  { id:"ration",      nameHi:"राशन",         nameEn:"Ration",       icon:"🍚", color:"#4488FF", bg:"rgba(68,136,255,0.08)"  },
  { id:"hospital",    nameHi:"अस्पताल",      nameEn:"Hospital",     icon:"🏥", color:"#00D4FF", bg:"rgba(0,212,255,0.08)"   },
  { id:"pension",     nameHi:"पेंशन",         nameEn:"Pension",      icon:"💰", color:"#A855F7", bg:"rgba(168,85,247,0.08)"  },
  { id:"emergency",   nameHi:"आपातकाल",      nameEn:"Emergency",    icon:"🚨", color:"#FF4757", bg:"rgba(255,71,87,0.08)"   },
  { id:"documents",   nameHi:"दस्तावेज़",     nameEn:"Documents",    icon:"📄", color:"#FFFFFF", bg:"rgba(255,255,255,0.05)" },
  { id:"pm_kisan",    nameHi:"PM किसान",      nameEn:"PM Kisan",     icon:"🌾", color:"#00FF88", bg:"rgba(0,255,136,0.08)"   },
  { id:"scholarship", nameHi:"छात्रवृत्ति",   nameEn:"Scholarship", icon:"🏫", color:"#4488FF", bg:"rgba(68,136,255,0.08)"  },
  { id:"bijli",       nameHi:"बिजली",         nameEn:"Bijli",       icon:"⚡", color:"#FFD700", bg:"rgba(255,215,0,0.08)"   },
  { id:"jal_jeevan",  nameHi:"जल जीवन",       nameEn:"Jal Jeevan",  icon:"💧", color:"#26C6DA", bg:"rgba(38,198,218,0.08)"  },
  { id:"mnrega",      nameHi:"मनरेगा",         nameEn:"MNREGA",      icon:"🏗️", color:"#FF9800", bg:"rgba(255,152,0,0.08)"   },
  { id:"anganwadi",   nameHi:"आंगनवाड़ी",     nameEn:"Anganwadi",    icon:"👶", color:"#A855F7", bg:"rgba(168,85,247,0.08)"  },
  { id:"pm_awaas",    nameHi:"PM आवास",        nameEn:"PM Awaas",     icon:"🏠", color:"#00FF88", bg:"rgba(0,255,136,0.08)"   },
];

export default function ServicesPage({ lang = "hi" }) {
  const navigate  = useNavigate();
  const [speaking,   setSpeaking]   = useState(null);   

  const getName = (svc) => lang === "en" ? svc.nameEn : svc.nameHi;

  // ── 🌟 FIXED INSTANT VOICE FUNCTION (0.1s DELAY FIX) ──
  const handleExplain = (e, svc) => {
    e.stopPropagation(); // Home page par redirect hone se turant rokega

    // 1. Agar dubara click kiya toh bina delay ke instantly chup karao
    if (speaking === svc.id) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setSpeaking(null);
      return;
    }

    // 2. React state ko bina wait kiye instantly update karo
    setSpeaking(svc.id);

    // 3. Purani chalti hui aawaz ko turant background me flush karo
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // 4. Thread blocking hatane ke liye direct call kiya (bina async/await ke)
    speak(SCHEME_DESCRIPTIONS[svc.id] || `${getName(svc)} government service.`, lang)
      .then(() => {
        setSpeaking(null);
      })
      .catch(() => {
        setSpeaking(null);
      });
  };

  // ── Official Link Function ────────────────────────
  const handleOpenLink = (e, svc) => {
    e.stopPropagation(); 
    const url = OFFICIAL_LINKS[svc.id];
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-premium min-h-screen pb-48 overflow-y-auto">
      
      {/* Header */}
      <div className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid #1E3060" }}>
        <h2 className="text-2xl font-black text-white tracking-wide">
          {lang === "en" ? "12 Services" : "12 सेवाएं"}
        </h2>
        <p className="text-xs mt-1 font-medium" style={{ color: "#6B7FA3" }}>
          {lang === "en" ? "🔗 Left: Official site  |  🔊 Right: Hear description" : "🔗 लेफ्ट: ऑफिशियल साइट  |  🔊 राइट: विवरण सुनें"}
        </p>
      </div>

      <div className="px-6 pt-6">
        {/* 3 Columns Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {SERVICES.map(svc => (
            <div key={svc.id}
              className="glass rounded-2xl transition-all duration-300 relative flex flex-col justify-between hover:translate-y-[-2px]"
              style={{ 
                border: `1px solid ${svc.color}18`,
                background: svc.bg,
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)"
              }}>

              {/* Card Container */}
              <div className="w-full relative flex flex-col items-center justify-center h-[140px]">
                
                {/* 1. LINK BUTTON (TOP LEFT CORNER) */}
                <button onClick={(e) => handleOpenLink(e, svc)}
                  className="absolute top-2.5 left-2.5 w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all active:scale-90 cursor-pointer shadow-md z-20"
                  style={{
                    background: "rgba(15, 26, 53, 0.7)",
                    border: `1px solid ${svc.color}55`,
                  }}
                  title={lang === "en" ? "Open Official Site" : "साइट खोलें"}>
                  🔗
                </button>

                {/* 2. VOICE AI BUTTON (TOP RIGHT CORNER) */}
                <button onClick={(e) => handleExplain(e, svc)}
                  className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all active:scale-90 cursor-pointer shadow-md z-20"
                  style={{
                    background: speaking === svc.id ? svc.color : "rgba(15, 26, 53, 0.7)",
                    border: `1px solid ${svc.color}55`,
                    color: speaking === svc.id ? "#000" : "#fff"
                  }}
                  title={lang === "en" ? "Hear Explanation" : "बोलकर समझाएं"}>
                  {speaking === svc.id ? "⏹️" : "🔊"}
                </button>

                {/* CENTER CLICK ZONE (Goes to Home Page) */}
                <div onClick={() => navigate("/", { state: { service: svc } })}
                  className="w-full h-full flex flex-col items-center justify-center gap-2 px-8 active:scale-95 transition-all cursor-pointer select-none">
                  <span className="text-4xl drop-shadow-md">{svc.icon}</span>
                  <span className="font-bold text-white text-xs sm:text-sm text-center tracking-wide line-clamp-1 w-full">{getName(svc)}</span>
                </div>

              </div>

              {/* Bottom Progress Bar for Speaking */}
              {speaking === svc.id && (
                <div className="w-full py-1.5 flex items-center justify-center gap-2 text-[11px] font-bold rounded-b-2xl"
                  style={{ background: `${svc.color}22`, color: svc.color, borderTop: "1px solid #1E3060" }}>
                  <span className="w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span className="tracking-wider">{lang === "en" ? "Speaking..." : "बोल रहे हैं..."}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Guidelines Widget at Bottom */}
        <div className="mt-12 mb-24 glass rounded-2xl p-5" style={{ border: "1px solid rgba(0,212,255,0.1)", background: "rgba(30, 48, 96, 0.15)" }}>
          <p className="text-white font-bold text-sm mb-3 tracking-wide flex items-center gap-2">
            💡 {lang === "en" ? "How to use?" : "कैसे इस्तेमाल करें?"}
          </p>
          <ol className="flex flex-col gap-2" style={{ color: "#6B7FA3", fontSize: "12px", lineHeight: "1.6" }}>
            {lang === "en" ? <>
              <li>1️⃣ <span className="text-white/80 font-medium">Tap card center</span> to open the voice dashboard on Home page.</li>
              <li>2️⃣ <span className="text-white/80 font-medium">Tap 🔗 (Top-Left)</span> to instantly launch the official government website.</li>
              <li>3️⃣ <span className="text-white/80 font-medium">Tap 🔊 (Top-Right)</span> to hear the AI explanation directly on this page.</li>
            </> : <>
              <li>1️⃣ <span className="text-white/80 font-medium">कार्ड के बीच में टैप करें</span> और सीधे होम पेज के वॉइस डैशबोर्ड पर जाएं।</li>
              <li>2️⃣ <span className="text-white/80 font-medium">🔗 (Top-Left) पर टैप करें</span> और डायरेक्ट ऑफिशियल सरकारी वेबसाइट खोलें।</li>
              <li>3️⃣ <span className="text-white/80 font-medium">🔊 (Top-Right) पर टैप करें</span> oars इसी पेज पर एआई से पूरी योजना का विवरण सुनें।</li>
            </>}
          </ol>
        </div>
      </div>
    </div>
  );
}