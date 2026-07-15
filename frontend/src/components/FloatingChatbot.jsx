import React, { useState, useRef, useEffect } from "react";
import { speak, stopSpeaking, t, LANG_BCP47 } from "../utils/tts";
import { processVoice } from "../services/api";

export default function FloatingChatbot({ user, lang = "hi" }) {
  const [open,      setOpen]      = useState(false);
  const [messages,  setMessages]  = useState([]);
  const [listening, setListening] = useState(false);
  const [thinking,  setThinking]  = useState(false);
  const [inputText, setInputText] = useState("");
  const recognRef  = useRef(null);
  const bottomRef  = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      const greeting = t(lang, "greeting", user?.nameHi?.split(" ")[0] || "दोस्त");
      addMsg("bot", `${greeting} ${t(lang, "helpToday")}`);
      speak(`${greeting} ${t(lang, "helpToday")}`, lang);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMsg = (role, text) => {
    setMessages(prev => [...prev, { role, text, ts: Date.now() }]);
  };

  /* ── Voice input ─────────────────────────────────────────── */
  const startMic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    stopSpeaking();
    const r         = new SR();
    r.lang          = LANG_BCP47[lang] || "hi-IN";
    r.continuous    = false;
    r.interimResults = false;
    r.onstart       = () => setListening(true);
    r.onend         = () => setListening(false);
    r.onerror       = () => setListening(false);
    r.onresult      = (e) => {
      const text = e.results[0][0].transcript;
      handleUserInput(text);
    };
    recognRef.current = r;
    try { r.start(); } catch {}
  };

  const stopMic = () => {
    try { recognRef.current?.stop(); } catch {}
    setListening(false);
  };

  /* ── Process input ───────────────────────────────────────── */
  const handleUserInput = async (text) => {
    if (!text.trim()) return;
    addMsg("user", text);
    setInputText("");
    setThinking(true);

    try {
      const res = await processVoice(text, lang, user?.phone, null);
      const reply = res.voiceReply || t(lang, "helpToday");
      addMsg("bot", reply);
      speak(reply, lang);
    } catch {
      const fallback = lang === "en"
        ? "Sorry, I could not understand. Please try again."
        : "माफ़ करें, समझ नहीं आया। दोबारा बोलें।";
      addMsg("bot", fallback);
      speak(fallback, lang);
    } finally {
      setThinking(false);
    }
  };

  const handleTextSend = () => {
    if (inputText.trim()) handleUserInput(inputText.trim());
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: open
            ? "linear-gradient(135deg,#FF4757,#CC0020)"
            : "linear-gradient(135deg,#A855F7,#6D28D9)",
          boxShadow: open
            ? "0 0 24px rgba(255,71,87,0.4)"
            : "0 0 24px rgba(168,85,247,0.5)",
        }}>
        {open ? "✕" : "🤖"}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-40 right-4 z-50 w-80 rounded-3xl overflow-hidden slide-up"
             style={{
               background:"rgba(10,17,40,0.97)",
               border:"1px solid rgba(168,85,247,0.3)",
               boxShadow:"0 0 40px rgba(168,85,247,0.2)",
               backdropFilter:"blur(20px)",
               maxHeight:"420px",
               display:"flex",
               flexDirection:"column",
             }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3"
               style={{borderBottom:"1px solid rgba(168,85,247,0.2)",
                       background:"linear-gradient(135deg,rgba(168,85,247,0.12),rgba(0,212,255,0.08))"}}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
                 style={{background:"rgba(168,85,247,0.2)"}}>
              🤖
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">AWAAZ AI</p>
              <p className="text-xs" style={{color:"#A855F7"}}>
                ● {t(lang,"online")}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2"
               style={{maxHeight:"280px"}}>
            {messages.map((m, i) => (
              <div key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed"
                     style={{
                       background: m.role === "user"
                         ? "linear-gradient(135deg,#00D4FF22,#A855F722)"
                         : "rgba(255,255,255,0.06)",
                       border: `1px solid ${m.role === "user" ? "rgba(0,212,255,0.25)" : "rgba(255,255,255,0.08)"}`,
                       color: "#fff",
                     }}>
                  {m.role === "bot" && (
                    <span className="text-xs mr-1" style={{color:"#A855F7"}}>🤖</span>
                  )}
                  {m.text}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex justify-start">
                <div className="px-4 py-2 rounded-2xl flex items-center gap-2"
                     style={{background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)"}}>
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                         style={{background:"#A855F7", animationDelay:`${i*0.15}s`}}/>
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Input row */}
          <div className="px-3 pb-3 pt-2 flex items-center gap-2"
               style={{borderTop:"1px solid rgba(168,85,247,0.15)"}}>
            <input
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleTextSend()}
              placeholder={t(lang, "chatPlaceholder")}
              className="flex-1 px-3 py-2.5 rounded-xl text-white text-sm outline-none"
              style={{background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)"}}
            />
            {/* Send text button */}
            <button onClick={handleTextSend}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{background:"rgba(0,212,255,0.15)", border:"1px solid rgba(0,212,255,0.3)"}}>
              <span className="text-sm">➤</span>
            </button>
            {/* Mic button */}
            <button
              onMouseDown={startMic} onMouseUp={stopMic}
              onTouchStart={startMic} onTouchEnd={stopMic}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: listening ? "rgba(255,71,87,0.2)" : "rgba(168,85,247,0.15)",
                border: `1px solid ${listening ? "#FF4757" : "rgba(168,85,247,0.3)"}`,
              }}>
              <span className="text-sm">{listening ? "⏹️" : "🎙️"}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
