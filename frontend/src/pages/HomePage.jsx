import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import MicButton from "../components/MicButton";
import ConfirmationLoop from "../components/ConfirmationLoop";
import DeviceBadge from "../components/DeviceBadge";
import ComplaintDetails from "../components/ComplaintDetails";
import AutoFillFormPreview from "../components/AutoFillFormPreview";
import { useVoice } from "../hooks/useVoice";
import { speak, stopSpeaking, t, SCHEME_DESCRIPTIONS, EXAMPLE_PHRASES } from "../utils/tts";
import { SERVICES } from "../utils/constants";
import { syncOfflineQueue, getOfflineQueueCount, processVoice } from "../services/api";

// ── Mock keyword detector (no AI, no backend) ───────────────────
const SERVICE_KEYWORDS = {
  ration:      ["ration","राशन","अनाज","चावल","রেশন","రేషన్"],
  hospital:    ["hospital","अस्पताल","डॉक्टर","दवाई","OPD","ambulance","বাসপাতাল"],
  pension:     ["pension","पेंशन","बुढ़ापा","वृद्धावस्था","विधवा","পেনশন"],
  emergency:   ["emergency","आपातकाल","112","खतरा","fire","আগুন"],
  documents:   ["aadhaar","आधार","certificate","प्रमाण","জন্ম"],
  pm_kisan:    ["kisan","किसान","PM Kisan","फसल","కిసాన్"],
  scholarship: ["scholarship","छात्रवृत्ति","पढ़ाई","study"],
  bijli:       ["bijli","बिजली","electricity","current","বিদ্যুৎ"],
  jal_jeevan:  ["water","पानी","jal","जल","নল","నీళ్ళు"],
  mnrega:      ["MNREGA","मनरेगा","job card","मजदूरी"],
  anganwadi:   ["anganwadi","आंगनवाड़ी","बच्चा","baby","nutrition"],
  pm_awaas:    ["ghar","घर","house","awas","आवास","makaan"],
};

const detectService = (text) => {
  const lo = text.toLowerCase();
  for (const [svc, kws] of Object.entries(SERVICE_KEYWORDS))
    if (kws.some(k => lo.includes(k.toLowerCase()))) return svc;
  return "unknown";
};

// ── Mock reference number ────────────────────────────────────────
const mockRef = () => "AWZ" + Date.now().toString().slice(-8);

const FLOW = { IDLE:"idle", LISTENING:"listening", CONFIRMING:"confirming",
               INFO:"info", FORM:"form", COMPLAINT_DETAILS:"complaint_details",
               COMPLAINT:"complaint", DONE:"done" };

export default function HomePage({ user, lang }) {
  const [flow,       setFlow]       = useState(FLOW.IDLE);
  const [serviceType,setSvcType]    = useState(null);
  const [doneMode,   setDoneMode]   = useState("form"); // "form" or "complaint"
  const [refNo,      setRefNo]      = useState("");
  const [deviceInfo, setDeviceInfo] = useState({ mode: null, device: null });
  const [aiResult,   setAiResult]   = useState({ intent: "", voiceReply: "" });
  const [processing, setProcessing] = useState(false);
  const [infoText,   setInfoText]   = useState("");
  const [complaintText, setComplaintText] = useState("");
  const [isOnline,   setIsOnline]   = useState(navigator.onLine);

  const { isListening, transcript, interimText, error, isSupported,
          startListening, stopListening, clearTranscript } = useVoice(lang);

  useEffect(() => {
    const onOnline = async () => {
      setIsOnline(true);
      const synced = await syncOfflineQueue();
      if (synced > 0) toast.success(`✅ ${synced} offline requests synced!`);
    };
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online",  onOnline);
    window.addEventListener("offline", onOffline);
    return () => { window.removeEventListener("online",onOnline); window.removeEventListener("offline",onOffline); };
  }, []);

  // Auto-process when mic stops
  useEffect(() => {
    if (!isListening && transcript.trim().length > 2 && flow === FLOW.LISTENING)
      handleProcess();
  }, [isListening]);

  const handleMicClick = () => {
    if (isListening) { stopListening(); return; }
    clearTranscript();
    setSvcType(null);
    setInfoText("");
    setFlow(FLOW.LISTENING);
    startListening();
    stopSpeaking();
    speak(t(lang, "speakNow"), lang);
  };

  const handleProcess = async () => {
    if (!transcript.trim()) return;
    setProcessing(true);
    try {
      // Real call to the backend — Snapdragon PC (edge) first, Qualcomm
      // AI Cloud 100 escalation only if needed. See backend/services/aiService.js
      const res = await processVoice(transcript, lang, user?.phone);
      setSvcType(res.serviceType || "unknown");
      setRefNo(res.referenceNumber || "");
      setDeviceInfo({ mode: res.aiMode || "mock", device: res.aiDevice || "none" });
      setAiResult({ intent: res.intent || "", voiceReply: res.voiceReply || "" });
    } catch (err) {
      // Backend unreachable — fall back to local keyword matching so the
      // demo never dead-ends, but be honest in the badge that this ran
      // only on this browser, not on the Snapdragon PC.
      console.warn("[AWAAZ] Backend unreachable, using local fallback:", err.message);
      setSvcType(detectService(transcript));
      setRefNo(mockRef());
      setDeviceInfo({ mode: "offline", device: "browser-only" });
      setAiResult({ intent: "", voiceReply: "" });
    } finally {
      setProcessing(false);
      setFlow(FLOW.CONFIRMING);
    }
  };

  const handleInfo = async () => {
    const desc = SCHEME_DESCRIPTIONS[serviceType] || "यह सरकारी सेवा नागरिकों की मदद के लिए है।";
    setInfoText(desc);
    setFlow(FLOW.INFO);
    stopSpeaking();
    await speak(desc, lang);
  };

  const handleForm = () => setFlow(FLOW.FORM);

  // Step 1 of the new complaint flow: ask the user what their complaint
  // is, instead of opening the complaint form immediately.
  const handleComplaint = () => setFlow(FLOW.COMPLAINT_DETAILS);

  // Step 2: called once the user has spoken/typed their complaint and
  // confirmed it in ComplaintDetails — only then do we continue into
  // the existing complaint form workflow (unchanged below this point).
  const handleComplaintConfirm = (collectedText) => {
    setComplaintText(collectedText);
    setFlow(FLOW.COMPLAINT);
  };

  const handleDone = (mode) => {
    const ref = refNo || mockRef();
    setRefNo(ref);
    setDoneMode(mode);
    setFlow(FLOW.DONE);
    // SMS mock log
    console.log(`[SMS Mock] To: +91${user?.phone}\nRef: ${ref}\nService: ${serviceType}\nMode: ${mode}\nUser: ${user?.nameHi||user?.name}`);
    toast.success("📱 SMS भेजा जा रहा है...", { duration: 2500 });
    const submitMsg = lang === "en"
      ? `${user?.name||"Friend"}, your ${mode} has been submitted. Reference number is ${ref}.`
      : `${user?.nameHi||"दोस्त"}, आपका ${mode === "complaint" ? "शिकायत" : "फॉर्म"} जमा हो गया है। Reference number है ${ref}।`;
    stopSpeaking();
    speak(submitMsg, lang);
  };

  const resetFlow = () => {
    setFlow(FLOW.IDLE); setSvcType(null); setInfoText(""); setComplaintText(""); clearTranscript();
  };

  return (
    <div className="bg-premium min-h-dvh pb-36 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{borderBottom:"1px solid #1E3060"}}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
               style={{background:"rgba(0,212,255,0.1)",border:"1px solid rgba(0,212,255,0.2)"}}>🎙️</div>
          <div>
            <h1 className="font-black text-white text-lg tracking-wider">AWAAZ</h1>
            <p className="text-xs" style={{color:"#6B7FA3"}}>Voice OS for Bharat</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isOnline && (
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{background:"rgba(255,71,87,0.15)",color:"#FF4757",border:"1px solid rgba(255,71,87,0.3)"}}>
              📵 Offline
            </span>
          )}
          {user && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                 style={{background:"rgba(0,212,255,0.08)",border:"1px solid rgba(0,212,255,0.2)"}}>
              <span className="text-sm">{user.avatar||"👤"}</span>
              <span className="text-xs font-semibold text-white">
                {user.nameHi?.split(" ")[0]||user.name?.split(" ")[0]||"User"}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-5 px-4 pt-6">

        {/* ── IDLE / LISTENING ─────────────────────────────────── */}
        {(flow === FLOW.IDLE || flow === FLOW.LISTENING) && (
          <div className="flex flex-col gap-5 slide-up">
            {/* Greeting */}
            <div className="glass rounded-3xl p-4 flex items-center gap-4"
                 style={{border:"1px solid rgba(0,212,255,0.15)"}}>
              <span className="text-4xl">{user?.avatar||"👤"}</span>
              <div>
                <p className="text-white font-bold text-base">
                  {t(lang,"greeting",user?.nameHi?.split(" ")[0]||user?.name?.split(" ")[0]||"दोस्त")}
                </p>
                <p className="text-sm" style={{color:"#6B7FA3"}}>{t(lang,"helpToday")}</p>
              </div>
            </div>

            {/* Mic */}
            <div className="flex flex-col items-center py-6">
              {!isSupported ? (
                <div className="glass rounded-2xl p-5 text-center w-full"
                     style={{border:"1px solid rgba(255,71,87,0.3)"}}>
                  <p className="text-white font-semibold">⚠️ Browser supported नहीं</p>
                  <p className="text-sm mt-1" style={{color:"#6B7FA3"}}>Chrome / Edge use करें</p>
                </div>
              ) : (
                <MicButton isListening={isListening} onClick={handleMicClick} lang={lang}/>
              )}
              {error && <p className="text-sm mt-3" style={{color:"#FF4757"}}>{error}</p>}
            </div>

            {/* Live transcript */}
            {(transcript||interimText) && (
              <div className="glass rounded-2xl p-4" style={{border:"1px solid rgba(0,212,255,0.15)"}}>
                <p className="text-xs mb-1 font-semibold" style={{color:"#6B7FA3"}}>🎙️</p>
                <p className="text-white leading-relaxed">{transcript}</p>
                {interimText && <p className="mt-1" style={{color:"#6B7FA3"}}>{interimText}...</p>}
              </div>
            )}

            {transcript && !isListening && (
              <button onClick={handleProcess} disabled={processing} className="btn-primary w-full py-3.5 disabled:opacity-60">
                {processing ? "🧠 Snapdragon PC पर सोच रहा है..." : `🧠 ${t(lang,"process")}`}
              </button>
            )}

            {/* Example phrases */}
            <div className="glass rounded-2xl p-4" style={{border:"1px solid #1E3060"}}>
              <p className="text-xs font-semibold mb-3" style={{color:"#6B7FA3"}}>
                💡 {t(lang,"trySaying")}
              </p>
              {(EXAMPLE_PHRASES[lang] || EXAMPLE_PHRASES.hi).map(([icon,text])=>(
                <button key={text}
                  onClick={()=>{ clearTranscript(); stopSpeaking(); speak(text,lang); }}
                  className="w-full text-left flex items-center gap-2 py-2 px-3 rounded-xl mb-1 transition-all hover:bg-white/5"
                  style={{color:"#8899BB",fontSize:"13px"}}>
                  <span>{icon}</span><span className="italic">"{text}"</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── CONFIRMING — 3 buttons ────────────────────────────── */}
        {flow === FLOW.CONFIRMING && serviceType && (
          <ConfirmationLoop
            transcript={transcript}
            serviceType={serviceType}
            lang={lang}
            deviceInfo={deviceInfo}
            aiResult={aiResult}
            onInfo={handleInfo}
            onForm={handleForm}
            onComplaint={handleComplaint}
            onRetry={resetFlow}
          />
        )}

        {/* ── INFO ─────────────────────────────────────────────── */}
        {flow === FLOW.INFO && (
          <div className="glass rounded-3xl p-5 flex flex-col gap-4 slide-up"
               style={{border:"1px solid rgba(0,212,255,0.2)"}}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">ℹ️</span>
              <p className="text-white font-bold text-base">
                {t(lang,"schemeInformation")}
              </p>
            </div>
            <p className="text-sm leading-relaxed" style={{color:"#C8D8F0",lineHeight:"1.8"}}>{infoText}</p>
            <button onClick={()=>{ stopSpeaking(); speak(infoText,lang); }}
              className="btn-secondary w-full py-3 flex items-center justify-center gap-2 text-sm">
              🔊 {t(lang,"replay")}
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={resetFlow}
                className="py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95"
                style={{background:"rgba(255,71,87,0.1)",border:"1px solid rgba(255,71,87,0.3)",color:"#FF4757"}}>
                🔄 {t(lang,"retry")}
              </button>
              <button onClick={handleForm}
                className="py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95"
                style={{background:"rgba(0,255,136,0.12)",border:"2px solid #00FF88",color:"#00FF88"}}>
                📋 {t(lang,"formBtn")}
              </button>
            </div>
          </div>
        )}

        {/* ── FORM ─────────────────────────────────────────────── */}
        {flow === FLOW.FORM && serviceType && (
          <AutoFillFormPreview
            user={user} serviceType={serviceType} lang={lang}
            mode="form"
            onDone={()=>handleDone("form")}
            onBack={resetFlow}
          />
        )}

        {/* ── COMPLAINT DETAILS — ask, collect, confirm ─────────── */}
        {flow === FLOW.COMPLAINT_DETAILS && (
          <ComplaintDetails
            lang={lang}
            onConfirm={handleComplaintConfirm}
            onBack={resetFlow}
          />
        )}

        {/* ── COMPLAINT ─────────────────────────────────────────── */}
        {flow === FLOW.COMPLAINT && serviceType && (
          <AutoFillFormPreview
            user={user} serviceType={serviceType} lang={lang}
            mode="complaint"
            complaintOverride={complaintText}
            onDone={()=>handleDone("complaint")}
            onBack={resetFlow}
          />
        )}

        {/* ── DONE ─────────────────────────────────────────────── */}
        {flow === FLOW.DONE && (
          <div className="glass rounded-3xl p-6 flex flex-col items-center gap-4 slide-up"
               style={{border:"1px solid rgba(0,255,136,0.3)"}}>
            <div className="text-6xl">✅</div>
            <p className="text-2xl font-black text-white text-center">
              {doneMode==="complaint"
                ? t(lang,"complaintRegistered")
                : t(lang,"submitted")}
            </p>
            <div className="w-full rounded-2xl p-4 flex items-center justify-between"
                 style={{background:"rgba(0,212,255,0.06)",border:"1px solid rgba(0,212,255,0.2)"}}>
              <span className="text-sm font-semibold" style={{color:"#6B7FA3"}}>Reference No.</span>
              <span className="font-mono font-black text-cyan-400">{refNo}</span>
            </div>
            <DeviceBadge mode={deviceInfo.mode} device={deviceInfo.device} className="w-full justify-center" />
            <div className="w-full rounded-2xl p-3 flex items-center gap-2"
                 style={{background:"rgba(0,255,136,0.06)",border:"1px solid rgba(0,255,136,0.2)"}}>
              <span className="text-lg">📱</span>
              <p className="text-sm" style={{color:"#C8D8F0"}}>
                SMS sent to <span className="font-bold text-white">+91 {user?.phone}</span>
              </p>
            </div>
            <button onClick={resetFlow} className="btn-primary w-full py-3.5 mt-1">
              🎙️ {t(lang,"newRequest")}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
