const axios = require("axios");

/* ── Edge AI — runs ON the Snapdragon Copilot+ PC ──────────────────────
   This is the primary intent engine for AWAAZ. It talks to a local
   Ollama server (http://localhost:11434) instead of a cloud API, so
   the model runs on-device using the Snapdragon X NPU via Qualcomm's
   QNN backend. No internet connection is required for this step.

   Setup on the Snapdragon PC:
     1. Install Ollama (ARM64 / Snapdragon build): https://ollama.com/download
     2. ollama pull llama3.2:3b   (small model, runs well on-device)
     3. ollama serve             (usually auto-started)
   ------------------------------------------------------------------- */

const OLLAMA_URL   = process.env.OLLAMA_URL   || "http://localhost:11434";
const OLLAMA_MODEL  = process.env.OLLAMA_MODEL  || "llama3.2:3b";
const OLLAMA_TIMEOUT = Number(process.env.OLLAMA_TIMEOUT_MS || 6000);

const SERVICE_TYPES = [
  "ration","hospital","pension","emergency","documents","pm_kisan",
  "scholarship","bijli","jal_jeevan","mnrega","anganwadi","pm_awaas","unknown",
];

const buildPrompt = (transcript, lang) => `You are AWAAZ, an on-device AI helping illiterate Indian citizens access government services. Reply with ONLY valid JSON, no extra text.

Citizen spoke in language code "${lang}":
"${transcript}"

JSON shape:
{
  "serviceType": "one of: ${SERVICE_TYPES.join("|")}",
  "intent": "brief English description",
  "extractedData": { "issue": "main issue", "urgency": "high|medium|low", "location": "if mentioned", "name": "if mentioned" },
  "voiceReply": "short warm reply in language ${lang}, confirming what you understood",
  "confidence": 0.0
}`;

// Quick health check so the backend can decide edge vs cloud fallback
const isOllamaAvailable = async () => {
  try {
    await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 1500 });
    return true;
  } catch {
    return false;
  }
};

const extractIntentOnEdge = async (transcript, lang = "hi") => {
  const res = await axios.post(
    `${OLLAMA_URL}/api/generate`,
    {
      model: OLLAMA_MODEL,
      prompt: buildPrompt(transcript, lang),
      stream: false,
      format: "json",
      options: { temperature: 0.3 },
    },
    { timeout: OLLAMA_TIMEOUT }
  );

  const raw = res.data?.response || "{}";
  const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

  return {
    serviceType: parsed.serviceType || "unknown",
    intent: parsed.intent || "Service request",
    extractedData: parsed.extractedData || { rawText: transcript },
    voiceReply: parsed.voiceReply || "आपकी बात दर्ज कर ली गई है।",
    confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.75,
    mode: "edge-local", // <-- ran on the Snapdragon PC, fully offline
    device: "snapdragon-copilot-pc",
  };
};

module.exports = { extractIntentOnEdge, isOllamaAvailable, OLLAMA_MODEL };
