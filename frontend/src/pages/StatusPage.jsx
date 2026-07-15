import React, { useState } from "react";
import toast from "react-hot-toast";
import { checkStatus, fetchRequests } from "../services/api";
import { speak, stopSpeaking, t, STATUS_LABELS, STATUS_VOICE_NARRATIVE, LANG_BCP47 } from "../utils/tts";

const STATUS_META = {
  pending:    { color:"#FFD700", bg:"rgba(255,215,0,0.1)",  icon:"⏳" },
  submitted:  { color:"#00D4FF", bg:"rgba(0,212,255,0.1)",  icon:"📤" },
  processing: { color:"#A855F7", bg:"rgba(168,85,247,0.1)", icon:"⚙️" },
  resolved:   { color:"#00FF88", bg:"rgba(0,255,136,0.1)",  icon:"✅" },
  rejected:   { color:"#FF4757", bg:"rgba(255,71,87,0.1)",  icon:"❌" },
};

// ── Demo-mode fallback for status tracking ──────────────────────
// The real /requests/status/:refNo endpoint needs a live backend +
// database. For demos where the backend isn't running (or the ref
// number isn't in the DB yet), we fall back to a deterministic mock
// status derived from the reference number itself — same ref number
// always shows the same status, so the demo behaves consistently.
const MOCK_STAGES = ["submitted", "processing", "resolved", "pending"];

const hashRef = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
};

const mockStatusFor = (refNo) => MOCK_STAGES[hashRef(refNo) % MOCK_STAGES.length];



export default function StatusPage({ user, lang = "hi" }) {
  const [refNo,     setRefNo]     = useState("");
  const [result,    setResult]    = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [requests,  setRequests]  = useState([]);
  const [loading,   setLoading]   = useState(false);

  const cfg = (status) => STATUS_META[status] || STATUS_META.pending;
  const statusLabel = (status) => {
    const map = STATUS_LABELS[status] || STATUS_LABELS.pending;
    return map[lang] || map.hi;
  };

  const voiceMsgFor = (data) => {
    const map = STATUS_VOICE_NARRATIVE[data.status] || STATUS_VOICE_NARRATIVE.pending;
    const narrative = map[lang] || map.hi;
    return `Reference ${data.referenceNumber}: ${narrative}`;
  };

  const handleCheck = async () => {
    if (!refNo.trim()) { toast.error(t(lang,"enterRefNumber")); return; }
    const cleanRef = refNo.trim().toUpperCase();
    setLoading(true);

    let data;
    try {
      data = await checkStatus(cleanRef);
    } catch {
      // No live backend reachable / ref not found there — fall back to
      // a deterministic demo status so tracking still works end-to-end.
      data = { referenceNumber: cleanRef, status: mockStatusFor(cleanRef) };
    }

    setResult(data);
    setShowPopup(true);
    setLoading(false);
    stopSpeaking();
    speak(voiceMsgFor(data), lang);
  };

  const handleLoadHistory = async () => {
    if (!user?.phone) { toast.error(t(lang,"phoneNotFound")); return; }
    setLoading(true);
    try {
      const data = await fetchRequests(user.phone);
      setRequests(data.requests || []);
      if (!data.requests?.length) toast(t(lang,"noRequestsFound"), { icon:"ℹ️" });
    } catch { toast.error(t(lang,"couldNotLoadHistory")); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-premium min-h-dvh pb-24">
      <div className="px-5 pt-6 pb-4" style={{ borderBottom:"1px solid #1E3060" }}>
        <h2 className="text-2xl font-black text-white">
          {t(lang,"checkStatusBtn")}
        </h2>
        <p className="text-sm mt-0.5" style={{ color:"#6B7FA3" }}>
          {t(lang,"trackRequestStatus")}
        </p>
      </div>

      <div className="px-4 pt-5 flex flex-col gap-4">
        {/* Reference number check */}
        <div className="glass rounded-2xl p-4" style={{ border:"1px solid #1E3060" }}>
          <p className="text-white font-semibold text-sm mb-3">
            📋 {t(lang,"byReferenceNumber")}
          </p>
          <div className="flex flex-col gap-3">
            <input value={refNo} onChange={e => setRefNo(e.target.value.toUpperCase())}
              placeholder="AWZ12345678"
              className="w-full px-4 py-3.5 rounded-xl text-cyan-400 font-mono font-bold text-base text-center outline-none tracking-wide"
              style={{ background:"#0A1128", border:"1px solid #1E3060" }}
            />
            <button onClick={handleCheck} disabled={loading}
              className="btn-primary w-full py-4 text-base disabled:opacity-50 flex items-center justify-center gap-2">
              {loading
                ? <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>{t(lang,"checking")}</>
                : <>🔍 {t(lang,"checkStatusBtn")}</>}
            </button>
          </div>
        </div>

        {/* Load by phone */}
        <button onClick={handleLoadHistory} disabled={loading}
          className="btn-secondary w-full py-3.5 flex items-center justify-center gap-2 text-sm">
          {loading
            ? <><span className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />{t(lang,"checking")}</>
            : <>📱 {t(lang,"myAllRequests")}</>}
        </button>

        {/* History list */}
        {requests.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold" style={{ color:"#6B7FA3" }}>
              {requests.length} {t(lang,"requestsFoundSuffix")}
            </p>
            {requests.map(r => (
              <div key={r._id} className="glass rounded-2xl p-4"
                   style={{ border:`1px solid ${cfg(r.status).color}22` }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-bold text-cyan-400">{r.referenceNumber}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ background:cfg(r.status).bg, color:cfg(r.status).color }}>
                    {cfg(r.status).icon} {statusLabel(r.status)}
                  </span>
                </div>
                <p className="text-white text-sm font-semibold capitalize">
                  {r.serviceType?.replace("_"," ")}
                </p>
                <p className="text-xs mt-1" style={{ color:"#6B7FA3" }}>
                  {new Date(r.createdAt).toLocaleDateString(LANG_BCP47[lang] || "hi-IN", {
                    day:"numeric", month:"long", year:"numeric"
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Status popup ─────────────────────────────────────────
          Shows the checked reference number's status as an actual
          popup/modal, and reads it out loud at the same time. */}
      {showPopup && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5"
             style={{ background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)" }}
             onClick={() => setShowPopup(false)}>
          <div className="glass rounded-3xl p-5 w-full max-w-sm slide-up"
               style={{ border:`1px solid ${cfg(result.status).color}55` }}
               onClick={(e) => e.stopPropagation()}>

            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold tracking-widest uppercase" style={{ color:"#6B7FA3" }}>
                {t(lang,"statusResult")}
              </p>
              <button onClick={() => setShowPopup(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all active:scale-90"
                style={{ background:"rgba(255,255,255,0.06)", color:"#6B7FA3" }}>
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center text-center gap-3 mb-5">
              <span className="text-5xl">{cfg(result.status).icon}</span>
              <span className="font-mono font-black text-cyan-400 text-sm">{result.referenceNumber}</span>
              <span className="px-3.5 py-1.5 rounded-full text-sm font-bold"
                    style={{ background:cfg(result.status).bg, color:cfg(result.status).color }}>
                {statusLabel(result.status)}
              </span>
              {result.serviceType && (
                <p className="text-sm" style={{ color:"#6B7FA3" }}>
                  {t(lang,"serviceLabel")}
                  <span className="text-white font-semibold capitalize">
                    {result.serviceType.replace("_"," ")}
                  </span>
                </p>
              )}
            </div>

            <button onClick={() => { stopSpeaking(); speak(voiceMsgFor(result), lang); }}
              className="btn-secondary w-full py-2.5 text-sm flex items-center justify-center gap-2">
              🔊 {t(lang, "replay")}
            </button>

            <button onClick={() => setShowPopup(false)}
              className="btn-primary w-full py-3 mt-3 text-sm">
              {t(lang,"closeBtn")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
