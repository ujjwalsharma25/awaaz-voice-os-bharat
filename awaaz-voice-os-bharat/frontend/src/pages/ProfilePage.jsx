import React from "react";
import { speak, t } from "../utils/tts";

export default function ProfilePage({ user, lang = "hi", onLogout }) {
  if (!user) return null;

  const fields = [
    { icon:"👤", label: t(lang,"nameLabel"),         value: user.nameHi || user.name },
    { icon:"📱", label: t(lang,"mobileLabel"),      value: `+91 ${user.phone}` },
    { icon:"🪪", label: "Aadhaar",                                       value: user.aadhaar },
    { icon:"🏘️", label: t(lang,"village"),      value: user.villageHi || user.village },
    { icon:"📍", label: t(lang,"district"),     value: user.districtHi || user.district },
    { icon:"🗺️", label: t(lang,"state"),        value: user.stateHi || user.state },
    { icon:"📮", label: "Pincode",                                        value: user.pincode },
    { icon:"🍚", label: t(lang,"rationCard"),  value: user.rationCard },
    { icon:"💼", label: t(lang,"jobCard"),      value: user.jobCard },
  ].filter(f => f.value);

  const handleSpeak = () => {
    const msg = lang === "en"
      ? `Name: ${user.name}. Mobile: ${user.phone}. Village: ${user.village}. ${user.state}.`
      : `नाम: ${user.nameHi}। मोबाइल: ${user.phone}। गाँव: ${user.villageHi || ""}। ${user.stateHi || ""}।`;
    speak(msg, lang);
  };

  return (
    <div className="bg-premium min-h-dvh pb-24">
      <div className="px-5 pt-6 pb-4" style={{ borderBottom:"1px solid #1E3060" }}>
        <h2 className="text-2xl font-black text-white">
          {t(lang,"profile")}
        </h2>
        <p className="text-sm mt-0.5" style={{ color:"#6B7FA3" }}>
          {t(lang,"autoFetchedDb")}
        </p>
      </div>

      <div className="px-4 pt-5 flex flex-col gap-4">
        {/* Avatar card */}
        <div className="glass rounded-3xl p-5 flex items-center gap-4"
             style={{ border:"1px solid rgba(0,212,255,0.2)",
                      background:"linear-gradient(135deg,rgba(0,212,255,0.05),rgba(168,85,247,0.05))" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
               style={{ background:"rgba(0,212,255,0.1)", border:"1px solid rgba(0,212,255,0.2)" }}>
            {user.avatar || "👤"}
          </div>
          <div className="flex-1">
            <p className="text-white font-black text-xl">{user.nameHi || user.name}</p>
            <p className="text-sm" style={{ color:"#6B7FA3" }}>
              {user.villageHi || user.village}, {user.stateHi || user.state}
            </p>
            <p className="text-xs mt-0.5 font-mono" style={{ color:"#00D4FF" }}>+91 {user.phone}</p>
          </div>
        </div>

        {/* Speak profile */}
        <button onClick={handleSpeak}
          className="btn-secondary w-full py-3.5 flex items-center justify-center gap-2 text-sm">
          🔊 {t(lang,"hearProfile")}
        </button>

        {/* Fields — read only */}
        <div className="glass rounded-2xl overflow-hidden" style={{ border:"1px solid #1E3060" }}>
          <div className="px-4 py-3" style={{ borderBottom:"1px solid #1E3060" }}>
            <p className="text-xs font-semibold" style={{ color:"#6B7FA3" }}>
              ✨ {t(lang,"autoFetchedNoTyping")}
            </p>
          </div>
          {fields.map((f, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5"
                 style={{ borderBottom: i < fields.length - 1 ? "1px solid #1E3060" : "none" }}>
              <span className="text-xl w-7 text-center">{f.icon}</span>
              <div className="flex-1">
                <p className="text-xs" style={{ color:"#6B7FA3" }}>{f.label}</p>
                <p className="text-white font-semibold text-sm">{f.value}</p>
              </div>
              <span style={{ color:"#00FF88", fontSize:"12px" }}>✓</span>
            </div>
          ))}
        </div>

        {/* Security note */}
        <div className="rounded-2xl p-4 text-sm"
             style={{ background:"rgba(0,255,136,0.05)", border:"1px solid rgba(0,255,136,0.15)" }}>
          <p className="font-semibold text-white mb-1">
            🔒 {t(lang,"dataSecure")}
          </p>
          <p style={{ color:"#6B7FA3", fontSize:"12px" }}>
            {lang === "en"
              ? "Profile auto-loads from your phone number. Never shared. Only used for govt forms."
              : "यह profile आपके mobile number से automatically load होती है। कहीं share नहीं होती।"}
          </p>
        </div>

        {/* Logout */}
        <button onClick={() => { localStorage.clear(); onLogout?.(); }}
          className="w-full py-3.5 rounded-2xl text-sm font-semibold transition-all hover:opacity-80"
          style={{ background:"rgba(255,71,87,0.1)", color:"#FF4757", border:"1px solid rgba(255,71,87,0.3)" }}>
          🚪 {t(lang,"logout")}
        </button>
      </div>
    </div>
  );
}
