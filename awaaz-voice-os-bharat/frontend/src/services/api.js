import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
});

// ── Offline queue (IndexedDB / localStorage fallback) ────────────
const QUEUE_KEY = "awaaz_offline_queue";

export const saveToOfflineQueue = (payload) => {
  try {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
    queue.push({ ...payload, queuedAt: new Date().toISOString() });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    console.log("[Offline] Saved to queue:", queue.length, "items");
  } catch (e) {
    console.warn("[Offline] Could not save to queue:", e);
  }
};

export const syncOfflineQueue = async () => {
  try {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
    if (!queue.length) return 0;
    let synced = 0;
    const remaining = [];
    for (const item of queue) {
      try {
        await API.post("/voice/process", item);
        synced++;
      } catch {
        remaining.push(item);
      }
    }
    localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
    return synced;
  } catch (e) {
    return 0;
  }
};

export const getOfflineQueueCount = () => {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]").length;
  } catch { return 0; }
};

// ── API calls ────────────────────────────────────────────────────
export const processVoice = async (transcript, language, phone, gps) => {
  const payload = { transcript, language, phone, gps };
  if (!navigator.onLine) {
    saveToOfflineQueue(payload);
    return {
      success: true,
      offline: true,
      voiceReply: "अभी इंटरनेट नहीं है। आपकी बात सुरक्षित रख ली गई है। नेटवर्क आने पर भेज दी जाएगी।",
      serviceType: "unknown",
      referenceNumber: "OFFLINE-" + Date.now(),
    };
  }
  const { data } = await API.post("/voice/process", payload);
  return data;
};

export const submitRequest = async (requestId, formData, serviceType, phone) => {
  const { data } = await API.post("/voice/submit", { requestId, formData, serviceType, phone });
  return data;
};

export const fetchServices  = async () => (await API.get("/services")).data;
export const checkStatus    = async (refNo) => (await API.get(`/requests/status/${refNo}`)).data;
export const fetchRequests  = async (phone) => (await API.get(`/requests?phone=${phone}`)).data;
export const sendFollowUps  = async () => (await API.post("/requests/followup")).data;
