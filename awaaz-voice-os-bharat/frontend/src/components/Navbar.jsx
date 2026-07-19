import React from "react";
import { NavLink } from "react-router-dom";
import { t } from "../utils/tts";

export default function Navbar({ lang = "hi" }) {
  const NAV = [
    { path:"/",         icon:"🎙️", key:"navSpeak"    },
    { path:"/services", icon:"📋", key:"navServices" },
    { path:"/status",   icon:"📊", key:"navStatus"   },
    { path:"/profile",  icon:"👤", key:"navProfile"  },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-2 pb-2 pt-1"
         style={{ background:"rgba(6,13,31,0.97)", borderTop:"1px solid #1E3060",
                  backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)" }}>
      <div className="flex items-center justify-around max-w-sm mx-auto">
        {NAV.map(item => (
          <NavLink key={item.path} to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl
              transition-all duration-200 min-w-[60px]
              ${isActive ? "opacity-100" : "opacity-45 hover:opacity-70"}
            `}
            style={({ isActive }) => isActive ? {
              background:"rgba(0,212,255,0.1)",
              border:"1px solid rgba(0,212,255,0.2)"
            } : {}}>
            {({ isActive }) => (
              <>
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-semibold"
                      style={{ color: isActive ? "#00D4FF" : "#6B7FA3" }}>
                  {t(lang, item.key)}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
