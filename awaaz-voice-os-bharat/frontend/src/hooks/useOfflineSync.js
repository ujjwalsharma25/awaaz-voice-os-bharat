import { useEffect, useState } from "react";
import { syncOfflineQueue, getOfflineQueueCount } from "../services/api";
import toast from "react-hot-toast";

export const useOfflineSync = () => {
  const [isOnline, setIsOnline]       = useState(navigator.onLine);
  const [queueCount, setQueueCount]   = useState(getOfflineQueueCount());
  const [syncing, setSyncing]         = useState(false);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      const count = getOfflineQueueCount();
      if (count > 0) {
        setSyncing(true);
        toast.loading(`Syncing ${count} offline request(s)...`, { id: "sync" });
        try {
          const synced = await syncOfflineQueue();
          toast.success(`✅ ${synced} request(s) synced!`, { id: "sync" });
        } catch {
          toast.error("Sync failed. Will retry.", { id: "sync" });
        } finally {
          setSyncing(false);
          setQueueCount(getOfflineQueueCount());
        }
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast("📵 Offline — requests will be saved locally", { icon: "💾", id: "offline" });
    };

    window.addEventListener("online",  handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online",  handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, queueCount, syncing };
};
