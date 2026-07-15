import React, { useState, useEffect, useRef, useCallback } from "react";
import { speak, speakOTP, stopSpeaking, t, LANG_BCP47 } from "../utils/tts";
import { generateOTP, getMockUser } from "../utils/mockData";

const LANGUAGES = [
  { code:"hi",  flag:"🇮🇳", label:"हिंदी",      sub:"Hindi"     },
  { code:"bho", flag:"🇮🇳", label:"भोजपुरी",   sub:"Bhojpuri"  },
  { code:"bn",  flag:"🇮🇳", label:"বাংলা",     sub:"Bengali"   },
  { code:"te",  flag:"🇮🇳", label:"తెలుగు",   sub:"Telugu"    },
  { code:"mr",  flag:"🇮🇳", label:"मराठी",     sub:"Marathi"   },
  { code:"ta",  flag:"🇮🇳", label:"தமிழ்",     sub:"Tamil"     },
  { code:"gu",  flag:"🇮🇳", label:"ગુજરાતી",   sub:"Gujarati"  },
  { code:"en",  flag:"🇬🇧", label:"English",   sub:"English"   },
  // ── Remaining scheduled Indian languages (8th Schedule) ──────
  { code:"as",  flag:"🇮🇳", label:"অসমীয়া",   sub:"Assamese"  },
  { code:"brx", flag:"🇮🇳", label:"बड़ो",       sub:"Bodo"      },
  { code:"doi", flag:"🇮🇳", label:"डोगरी",     sub:"Dogri"     },
  { code:"kn",  flag:"🇮🇳", label:"ಕನ್ನಡ",    sub:"Kannada"   },
  { code:"ks",  flag:"🇮🇳", label:"कॉशुर",     sub:"Kashmiri"  },
  { code:"kok", flag:"🇮🇳", label:"कोंकणी",    sub:"Konkani"   },
  { code:"mai", flag:"🇮🇳", label:"मैथिली",    sub:"Maithili"  },
  { code:"ml",  flag:"🇮🇳", label:"മലയാളം",   sub:"Malayalam" },
  { code:"mni", flag:"🇮🇳", label:"मणिपुरी",   sub:"Manipuri"  },
  { code:"ne",  flag:"🇮🇳", label:"नेपाली",     sub:"Nepali"    },
  { code:"or",  flag:"🇮🇳", label:"ଓଡ଼ିଆ",     sub:"Odia"      },
  { code:"pa",  flag:"🇮🇳", label:"ਪੰਜਾਬੀ",   sub:"Punjabi"   },
  { code:"sa",  flag:"🇮🇳", label:"संस्कृतम्",  sub:"Sanskrit"  },
  { code:"sat", flag:"🇮🇳", label:"संताली",    sub:"Santali"   },
  { code:"sd",  flag:"🇮🇳", label:"सिन्धी",    sub:"Sindhi"    },
  { code:"ur",  flag:"🇮🇳", label:"اردو",      sub:"Urdu"      },
];

const STEPS = { LANG:"lang", PHONE:"phone", OTP:"otp", WELCOME:"welcome" };

export default function LoginPage({ onLogin }) {
  const [step,      setStep]      = useState(STEPS.LANG);
  const [lang,      setLang]      = useState("hi");
  const [phone,     setPhone]     = useState("");
  const [otp,       setOtp]       = useState("");
  const [sentOTP,   setSentOTP]   = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [user,      setUser]      = useState(null);
  const [speaking,  setSpeaking]  = useState(false);
  const [otpReady,  setOtpReady]  = useState(false);
  const [micActive, setMicActive] = useState(false);

  const phoneRef      = useRef(null);
  const recognRef     = useRef(null);
  const hasGreetedRef = useRef(false);

  /* ── Greet on mount — GUARANTEED to fire ────────────────── */
  useEffect(() => {
    if (hasGreetedRef.current) return;
    hasGreetedRef.current = true;
    const timer = setTimeout(() => {
      speak(t("hi", "welcome"), "hi");
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  /* ── Voice input for phone number ──────────────────────── */
  const startPhoneMic = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    stopSpeaking();
    const r      = new SR();
    r.lang       = LANG_BCP47[lang] || "hi-IN";
    r.continuous = false;
    r.onstart    = () => setMicActive(true);
    r.onend      = () => setMicActive(false);
    r.onerror    = () => setMicActive(false);
    r.onresult   = (e) => {
      const spoken = e.results[0][0].transcript.replace(/\D/g, "").slice(0, 10);
      setPhone(spoken);
    };
    recognRef.current = r;
    try { r.start(); } catch {}
  }, [lang]);

  const stopPhoneMic = useCallback(() => {
    try { recognRef.current?.stop(); } catch {}
    setMicActive(false);
  }, []);

  /* ── Language select ─────────────────────────────────────── */
  const handleLangSelect = async (code) => {
    setLang(code);
    stopSpeaking();
    const langName = LANGUAGES.find(l => l.code === code)?.label || code;
    await speak(t(code, "langSelected", langName), code);
    setStep(STEPS.PHONE);
    setTimeout(() => phoneRef.current?.focus(), 300);
  };

  /* ── Send OTP ──────────────────────────────────────────────── */
  const handleSendOTP = async () => {
    if (phone.length !== 10) { setError(t(lang,"enter10Digit")); return; }
    setError("");
    setLoading(true);
    const code = generateOTP();
    setSentOTP(code);
    setUser(getMockUser(phone));
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);
    setStep(STEPS.OTP);
    setSpeaking(true);
    await speak(t(lang, "otpInstruct"), lang);
    await speakOTP(code, lang);
    await speak(t(lang, "otpReplay"), lang);
    setSpeaking(false);
    setOtpReady(true);
  };

  /* ── Verify OTP ────────────────────────────────────────────── */
  const handleVerifyOTP = async () => {
    if (otp !== sentOTP) {
      setError(t(lang, "wrongOTP"));
      speak(t(lang, "wrongOTP"), lang);
      return;
    }
    setLoading(true);
    const u = getMockUser(phone);
    await speak(t(lang, "welcomeUser", u.nameHi || u.name), lang);
    setStep(STEPS.WELCOME);
    setLoading(false);
    setTimeout(() => {
      localStorage.setItem("awaaz_user",  JSON.stringify({ ...u, preferredLanguage: lang }));
      localStorage.setItem("awaaz_lang",  lang);
      localStorage.setItem("awaaz_phone", phone);
      onLogin(u, lang);
    }, 2000);
  };

  const handleReplayOTP = async () => {
    setSpeaking(true);
    await speakOTP(sentOTP, lang);
    setSpeaking(false);
  };

  return (
    <div className="bg-premium min-h-dvh flex flex-col items-center justify-between px-5 py-8 relative overflow-hidden">
      {/* Glow orbs */}
      <div className="absolute top-[-80px] left-[-60px] w-64 h-64 rounded-full opacity-10 pointer-events-none"
           style={{background:"radial-gradient(circle, #00D4FF, transparent)"}} />
      <div className="absolute bottom-[-60px] right-[-40px] w-56 h-56 rounded-full opacity-8 pointer-events-none"
           style={{background:"radial-gradient(circle, #A855F7, transparent)"}} />

      {/* Logo */}
      <div className="flex flex-col items-center gap-2 mt-4 slide-up">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl glow-cyan"
             style={{background:"linear-gradient(135deg,#00D4FF22,#A855F722)", border:"1px solid #00D4FF44"}}>
          🎙️
        </div>
        <h1 className="text-3xl font-black tracking-widest gradient-text">AWAAZ</h1>
        <p className="text-xs tracking-widest" style={{color:"#6B7FA3"}}>VOICE OS FOR BHARAT</p>
      </div>

      {/* ── STEP: Language ──────────────────────────────────── */}
      {step === STEPS.LANG && (
        <div className="w-full max-w-sm slide-up flex flex-col gap-4">
          <p className="text-center text-white font-semibold text-lg">अपनी भाषा चुनें</p>
          <p className="text-center text-xs mb-1" style={{color:"#6B7FA3"}}>Choose Your Language</p>
          <div className="grid grid-cols-3 gap-2.5 overflow-y-auto pr-1" style={{maxHeight:"52vh"}}>
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => handleLangSelect(l.code)}
                className="glass-light flex flex-col items-center justify-center gap-1 px-2 py-3.5 rounded-2xl text-center transition-all active:scale-95 hover:border-cyan-400/40"
                style={{border:"1px solid #1E3060"}}>
                <span className="text-xl">{l.flag}</span>
                <p className="text-white font-bold text-sm leading-tight">{l.label}</p>
                <p className="text-[10px] leading-tight" style={{color:"#6B7FA3"}}>{l.sub}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP: Phone ─────────────────────────────────────── */}
      {step === STEPS.PHONE && (
        <div className="w-full max-w-sm slide-up flex flex-col gap-5">
          <div className="text-center">
            <p className="text-white font-bold text-xl mb-1">{t(lang, "enterPhone")}</p>
            <p className="text-sm" style={{color:"#6B7FA3"}}>Mobile Number</p>
          </div>

          {/* Phone input row */}
          <div className="glass rounded-2xl p-1 flex items-center gap-2"
               style={{border:`2px solid ${phone.length===10?"#00D4FF":"#1E3060"}`}}>
            <span className="pl-3 text-lg font-bold" style={{color:"#6B7FA3"}}>+91</span>
            <div className="w-px h-8" style={{background:"#1E3060"}}/>
            <input ref={phoneRef} type="tel" inputMode="numeric"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g,"").slice(0,10))}
              placeholder="XXXXXXXXXX"
              className="flex-1 bg-transparent py-4 text-xl font-bold text-white outline-none tracking-widest"
            />
            {/* Mic button for voice phone input */}
            <button
              onMouseDown={startPhoneMic} onMouseUp={stopPhoneMic}
              onTouchStart={startPhoneMic} onTouchEnd={stopPhoneMic}
              className="mr-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: micActive ? "rgba(255,71,87,0.2)" : "rgba(0,212,255,0.1)",
                border: `1px solid ${micActive ? "#FF4757" : "rgba(0,212,255,0.3)"}`,
              }}>
              <span className="text-lg">{micActive ? "⏹️" : "🎙️"}</span>
            </button>
          </div>

          {micActive && (
            <p className="text-center text-xs animate-pulse" style={{color:"#00D4FF"}}>
              🎙️ {t(lang, "listening")}
            </p>
          )}

          {error && <p className="text-center text-sm" style={{color:"#FF4757"}}>{error}</p>}

          <button onClick={handleSendOTP} disabled={loading || phone.length !== 10}
            className="btn-primary w-full py-4 text-base disabled:opacity-40">
            {loading ? "..." : `${t(lang, "sendOTP")} 🔊`}
          </button>

          <button onClick={() => { setStep(STEPS.LANG); speak(t("hi","welcome"),"hi"); }}
            className="text-center text-sm" style={{color:"#6B7FA3"}}>
            ← {t(lang,"changeLanguage")}
          </button>
        </div>
      )}

      {/* ── STEP: OTP ───────────────────────────────────────── */}
      {step === STEPS.OTP && (
        <div className="w-full max-w-sm slide-up flex flex-col gap-5">
          <div className="text-center">
            <p className="text-white font-bold text-xl mb-1">{t(lang,"securityCode")}</p>
            <p className="text-sm" style={{color:"#6B7FA3"}}>{t(lang, "otpInstruct")}</p>
          </div>

          {/* OTP digits */}
          <div className="flex justify-center gap-3">
            {sentOTP.split("").map((d, i) => (
              <div key={i} className={`otp-digit ${otpReady ? "active" : ""}`}>
                {otpReady ? d : "?"}
              </div>
            ))}
          </div>

          <button onClick={handleReplayOTP} disabled={speaking}
            className="btn-secondary w-full py-3.5 flex items-center justify-center gap-2 text-sm">
            {speaking
              ? <><span className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"/>
                  {t(lang,"speakingLabel")}</>
              : <><span className="text-lg">🔊</span> {t(lang, "otpReplay")}</>}
          </button>

          <div>
            <p className="text-xs mb-2 text-center" style={{color:"#6B7FA3"}}>{t(lang, "otpEnter")}</p>
            <input type="tel" inputMode="numeric" maxLength={4}
              value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,"").slice(0,4))}
              placeholder="_ _ _ _"
              className="w-full text-center text-3xl font-black tracking-[0.5em] py-4 rounded-2xl outline-none text-cyan-400"
              style={{background:"#0F1A35", border:`2px solid ${otp.length===4?"#00D4FF":"#1E3060"}`}}
            />
          </div>

          {error && <p className="text-center text-sm" style={{color:"#FF4757"}}>{error}</p>}

          <button onClick={handleVerifyOTP} disabled={loading || otp.length !== 4}
            className="btn-primary w-full py-4 text-base disabled:opacity-40">
            {loading ? "..." : t(lang, "login")}
          </button>
        </div>
      )}

      {/* ── STEP: Welcome ────────────────────────────────────── */}
      {step === STEPS.WELCOME && user && (
        <div className="w-full max-w-sm slide-up flex flex-col items-center gap-5">
          <div className="text-6xl">{user.avatar || "👤"}</div>
          <div className="text-center">
            <p className="text-3xl font-black text-white">{user.nameHi || user.name}</p>
            <p className="text-sm mt-1" style={{color:"#6B7FA3"}}>{user.villageHi}, {user.stateHi}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"/>
            <p style={{color:"#6B7FA3"}}>{t(lang, "appOpening")}</p>
          </div>
        </div>
      )}

      <p className="text-xs text-center" style={{color:"#6B7FA3"}}>
        🇮🇳 Built for India. Built for Bharat.
      </p>
    </div>
  );
}
