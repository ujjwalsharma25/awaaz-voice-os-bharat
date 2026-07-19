import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LoginPage    from "./pages/LoginPage";
import HomePage     from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import StatusPage   from "./pages/StatusPage";
import ProfilePage  from "./pages/ProfilePage";
import Navbar       from "./components/Navbar";
import OnlineStatus from "./components/OnlineStatus";

export default function App() {
  const [user,   setUser]   = useState(null);
  const [lang,   setLang]   = useState("hi");
  const [booted, setBooted] = useState(false);

  /* Restore session */
  useEffect(() => {
    try {
      const stored     = JSON.parse(localStorage.getItem("awaaz_user") || "null");
      const storedLang = localStorage.getItem("awaaz_lang") || "hi";
      if (stored?.phone) { setUser(stored); setLang(storedLang); }
    } catch {}
    setBooted(true);
  }, []);

  const handleLogin = (loggedUser, selectedLang) => {
    setUser(loggedUser);
    setLang(selectedLang);
  };

  const handleLogout = () => {
    setUser(null);
    setLang("hi");
    localStorage.clear();
  };

  /* Boot splash */
  if (!booted) return (
    <div className="bg-premium min-h-dvh flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="text-5xl">🎙️</span>
        <p className="gradient-text font-black text-3xl tracking-widest">AWAAZ</p>
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mt-2" />
      </div>
    </div>
  );

  /* Login gate */
  if (!user) return (
    <>
      <LoginPage onLogin={handleLogin} />
      <Toaster position="top-center"
        toastOptions={{ style:{ background:"#0F1A35", color:"#fff", border:"1px solid #1E3060" } }} />
    </>
  );

  return (
    <div className="bg-premium min-h-dvh">
      <OnlineStatus lang={lang} />
      <Routes>
        <Route path="/"         element={<HomePage     user={user} lang={lang} />} />
        <Route path="/services" element={<ServicesPage lang={lang} />} />
        <Route path="/status"   element={<StatusPage   user={user} lang={lang} />} />
        <Route path="/profile"  element={<ProfilePage  user={user} lang={lang} onLogout={handleLogout} />} />
        <Route path="*"         element={<Navigate to="/" />} />
      </Routes>
      <Navbar lang={lang} />
      <Toaster position="top-center"
        toastOptions={{ style:{ background:"#0F1A35", color:"#fff", border:"1px solid #1E3060" } }} />
    </div>
  );
}
