import React, { useState, useEffect, useRef } from "react";
import { speak, stopSpeaking, t, getServiceName } from "../utils/tts";

const SERVICE_ICONS = {
  ration:"🍚", hospital:"🏥", pension:"💰", emergency:"🚨",
  documents:"📄", pm_kisan:"🌾", scholarship:"🏫", bijli:"⚡",
  jal_jeevan:"💧", mnrega:"🏗️", anganwadi:"👶", pm_awaas:"🏠", unknown:"📋",
};

const COMPLAINT_TEXTS = {
  hi: {
    ration:"पिछले 3 महीनों से राशन नहीं मिल रहा है। उचित मूल्य दुकान से सेवा मिलना बंद है।",
    hospital:"सरकारी अस्पताल में OPD सेवा उचित रूप से नहीं मिल रही है।",
    pension:"पेंशन की राशि कई महीनों से बैंक खाते में नहीं आई है।",
    bijli:"बिजली की आपूर्ति ठीक नहीं है अथवा बिल में गड़बड़ी है।",
    jal_jeevan:"नल में पानी नहीं आ रहा है। जल जीवन मिशन के तहत नल लगाया गया था।",
    mnrega:"मनरेगा में काम किया परंतु मजदूरी नहीं मिली।",
    pm_kisan:"PM किसान योजना की किस्त का पैसा खाते में नहीं आया।",
    scholarship:"छात्रवृत्ति की राशि अभी तक नहीं मिली है।",
    documents:"दस्तावेज़ बनाने में अनावश्यक देरी हो रही है।",
    anganwadi:"आंगनवाड़ी केंद्र में सेवाएं ठीक से नहीं मिल रही हैं।",
    pm_awaas:"PM आवास योजना में आवेदन के बावजूद घर आवंटित नहीं हुआ।",
    emergency:"आपातकालीन स्थिति में समय पर सहायता नहीं मिली।",
    unknown:"सरकारी सेवा में समस्या है, सहायता की आवश्यकता है।",
  },
  en: {
    ration:"Not receiving ration for the past 3 months from the fair price shop.",
    hospital:"Government hospital OPD service is not functioning properly.",
    pension:"Pension amount has not been credited for several months.",
    bijli:"Electricity supply issue or billing discrepancy reported.",
    jal_jeevan:"No water supply from tap installed under Jal Jeevan Mission.",
    mnrega:"Worked under MNREGA but wages have not been received.",
    pm_kisan:"PM Kisan instalment not credited to bank account.",
    scholarship:"Scholarship amount has not been received yet.",
    documents:"Unnecessary delay in making government documents.",
    anganwadi:"Anganwadi centre services not functioning properly.",
    pm_awaas:"Despite applying for PM Awaas Yojana, house not allotted.",
    emergency:"Did not receive timely help during emergency situation.",
    unknown:"Issue with government service, assistance required.",
  },
};

export default function AutoFillFormPreview({ user, serviceType, lang, mode="form", complaintOverride, onDone, onBack }) {
  const [visibleFields, setVisibleFields] = useState([]);
  const [submitting,    setSubmitting]    = useState(false);
  const announcedRef = useRef(false);

  const isComplaint = mode === "complaint";
  const title       = getServiceName(lang, serviceType);
  const icon        = SERVICE_ICONS[serviceType] || "📋";
  // Use the complaint description the user just gave us (collected by
  // ComplaintDetails) when available; otherwise fall back to the
  // existing default text exactly as before.
  const complaintTxt = (complaintOverride && complaintOverride.trim())
    ? complaintOverride.trim()
    : ((COMPLAINT_TEXTS[lang]||COMPLAINT_TEXTS.hi)[serviceType] || (COMPLAINT_TEXTS[lang]||COMPLAINT_TEXTS.hi).unknown);

  const name    = user?.nameHi    || user?.name    || "—";
  const phone   = user?.phone     || "—";
  const address = [user?.villageHi||user?.village, user?.districtHi||user?.district, user?.stateHi||user?.state].filter(Boolean).join(", ") || "—";
  const aadhaar = user?.aadhaar   || "—";

  const formFields = [
    { icon:"👤", label: t(lang,"nameLabel"),            value: name },
    { icon:"📱", label: t(lang,"mobileLabel"),        value: `+91 ${phone}` },
    { icon:"🏠", label: t(lang,"addressLabel"),          value: address },
    { icon:"🪪", label: "Aadhaar",                            value: aadhaar },
    ...(user?.rationCard ? [{ icon:"🍚", label:t(lang,"rationCard"),  value: user.rationCard }] : []),
    ...(user?.jobCard    ? [{ icon:"💼", label:t(lang,"jobCard"),     value: user.jobCard    }] : []),
    ...(isComplaint      ? [{ icon:"📢", label: t(lang,"complaintDetailsLabel"), value: complaintTxt }] : []),
  ];

  useEffect(() => {
    if (announcedRef.current) return;
    announcedRef.current = true;
    // Stop any leftover audio from the previous screen first, so this
    // announcement starts right away instead of waiting in line.
    stopSpeaking();

    const msg = isComplaint
      ? `${name}. ${t(lang,"registerComplaint")}.`
      : `${name}. ${t(lang,"formSubtitleAuto")}.`;
    speak(msg, lang);

    // Animate fields staggered
    formFields.forEach((_, i) => setTimeout(() => setVisibleFields(p=>[...p, i]), i * 200));
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 900));
    setSubmitting(false);
    onDone();
  };

  return (
    <div className="flex flex-col gap-4 slide-up">

      {/* Header card */}
      <div className="glass rounded-3xl p-4 flex items-center gap-3"
           style={{border:`1px solid ${isComplaint?"rgba(255,165,0,0.35)":"rgba(0,212,255,0.2)"}`}}>
        <span className="text-3xl">{isComplaint?"📢":icon}</span>
        <div className="flex-1">
          <p className="text-xs font-semibold" style={{color:"#6B7FA3"}}>
            {isComplaint ? t(lang,"officialComplaint") : t(lang,"officialForm")}
          </p>
          <p className="text-white font-black text-sm">{title}</p>
        </div>
        <div className="px-2.5 py-1 rounded-full text-xs font-bold"
             style={{
               background: isComplaint?"rgba(255,165,0,0.12)":"rgba(0,255,136,0.12)",
               color:      isComplaint?"#FFA500":"#00FF88",
               border:     isComplaint?"1px solid rgba(255,165,0,0.3)":"1px solid rgba(0,255,136,0.3)",
             }}>
          ✨ Auto-filled
        </div>
      </div>

      {/* Fields list */}
      <div className="glass rounded-2xl overflow-hidden" style={{border:"1px solid #1E3060"}}>
        <p className="text-xs font-semibold px-4 py-3" style={{color:"#6B7FA3",borderBottom:"1px solid #1E3060"}}>
          📋 {t(lang,"yourDetailsNoTyping")}
        </p>
        {formFields.map((f, i) => (
          <div key={i}
            style={{
              display:"flex", alignItems:"flex-start", gap:"12px",
              padding:"14px 16px",
              background: visibleFields.includes(i)?"rgba(0,212,255,0.04)":"transparent",
              borderBottom: i < formFields.length-1 ? "1px solid #1E3060" : "none",
              opacity: visibleFields.includes(i) ? 1 : 0,
              transform: visibleFields.includes(i) ? "translateX(0)" : "translateX(-12px)",
              transition: "all 0.4s ease",
            }}>
            <span style={{fontSize:"18px",width:"28px",textAlign:"center",marginTop:"2px"}}>{f.icon}</span>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:"11px",color:"#6B7FA3",fontWeight:600,marginBottom:"3px"}}>{f.label}</p>
              <p style={{color:"white",fontSize:"13px",lineHeight:1.5,wordBreak:"break-word",
                         whiteSpace: (f.label.includes("विवरण")||f.label.includes("Details"))?"pre-wrap":"normal"}}>
                {f.value}
              </p>
            </div>
            {visibleFields.includes(i) && <span style={{color:"#00FF88",fontSize:"12px",marginTop:"2px"}}>✓</span>}
          </div>
        ))}
      </div>

      {/* SMS notice */}
      <div className="rounded-2xl p-3 flex items-center gap-2"
           style={{background:"rgba(0,255,136,0.05)",border:"1px solid rgba(0,255,136,0.15)"}}>
        <span>📱</span>
        <p className="text-xs" style={{color:"#C8D8F0"}}>
          {lang==="en"
            ? `Confirmation SMS will be sent to +91 ${phone}`
            : `+91 ${phone} ${t(lang,"complaintSubtitleSms")}`}
        </p>
      </div>

      {/* Back */}
      <button onClick={onBack}
        className="btn-secondary w-full py-3 text-sm flex items-center justify-center gap-2">
        🔄 {t(lang,"retry")}
      </button>

      {/* Submit */}
      <button onClick={handleSubmit}
        disabled={submitting || visibleFields.length < formFields.length}
        className="btn-primary w-full py-4 text-base disabled:opacity-50 flex items-center justify-center gap-2"
        style={isComplaint ? {background:"linear-gradient(135deg,#FFA500,#FF6B00)"} : {}}>
        {submitting
          ? <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
              {t(lang,"submitting")}</>
          : isComplaint
            ? `📢 ${t(lang,"registerComplaint")}`
            : `✅ ${t(lang,"submitBtn")}`}
      </button>

      <p className="text-center text-xs" style={{color:"#6B7FA3"}}>
        🔒 {t(lang,"dataSecure")}
      </p>
    </div>
  );
}
