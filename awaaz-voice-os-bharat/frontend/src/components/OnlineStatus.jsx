import React from "react";
import { useOfflineSync } from "../hooks/useOfflineSync";
import { t } from "../utils/tts";

export default function OnlineStatus({ lang = "hi" }) {
  const { isOnline, queueCount, syncing } = useOfflineSync();
  if (isOnline && queueCount === 0) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 text-center text-xs py-2 font-semibold"
         style={{
           background: isOnline ? "rgba(0,255,136,0.1)" : "rgba(255,71,87,0.1)",
           color:      isOnline ? "#00FF88" : "#FF4757",
           borderBottom:`1px solid ${isOnline ? "rgba(0,255,136,0.25)" : "rgba(255,71,87,0.25)"}`,
           backdropFilter:"blur(8px)",
         }}>
      {syncing ? t(lang, "syncing")
        : isOnline && queueCount > 0 ? `✅ ${queueCount} pending sync`
        : t(lang, "noInternet")}
    </div>
  );
}
