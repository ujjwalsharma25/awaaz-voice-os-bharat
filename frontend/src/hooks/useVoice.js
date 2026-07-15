import { useState, useRef, useCallback, useEffect } from "react";
import { LANG_BCP47 } from "../utils/tts";

export const useVoice = (language = "hi") => {
  const [isListening,  setIsListening]  = useState(false);
  const [transcript,   setTranscript]   = useState("");
  const [interimText,  setInterimText]  = useState("");
  const [error,        setError]        = useState(null);
  const [isSupported,  setIsSupported]  = useState(true);
  const recognitionRef = useRef(null);
  const langRef        = useRef(language);

  useEffect(() => { langRef.current = language; }, [language]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setIsSupported(false); return; }

    const r            = new SR();
    r.continuous       = false;
    r.interimResults   = true;
    r.maxAlternatives  = 1;

    r.onstart  = () => { setIsListening(true); setError(null); };
    r.onend    = () => { setIsListening(false); setInterimText(""); };
    r.onerror  = (e) => {
      setIsListening(false);
      setError(e.error === "not-allowed"
        ? "Microphone permission denied."
        : `Error: ${e.error}`);
    };
    r.onresult = (e) => {
      let interim = "", final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const txt = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += txt;
        else interim += txt;
      }
      setInterimText(interim);
      if (final) setTranscript(prev => (prev + " " + final).trim());
    };

    recognitionRef.current = r;
    return () => { try { r.abort(); } catch {} };
  }, []);

  const startListening = useCallback(() => {
    const r = recognitionRef.current;
    if (!r) return;
    // Always set latest language before starting
    r.lang = LANG_BCP47[langRef.current] || "hi-IN";
    setTranscript("");
    setInterimText("");
    setError(null);
    try { r.start(); } catch (e) { console.warn("Recognition:", e.message); }
  }, []);

  const stopListening = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch {}
  }, []);

  return {
    isListening, transcript, interimText, error, isSupported,
    startListening, stopListening,
    clearTranscript: () => setTranscript(""),
  };
};
