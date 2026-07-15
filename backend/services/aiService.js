const axios = require("axios");
const { extractIntentOnEdge, isOllamaAvailable } = require("./localAiService");

/* ── Bhashini mock normaliser ───────────────────────────────────
   Production: POST https://dhruva-api.bhashini.gov.in/services/inference/pipeline
   Needs API key from https://bhashini.gov.in/ulca/home               */
const bhashiniNormalise = async (text, sourceLang = "hi") => {
  console.log(`[Bhashini] Normalising in lang=${sourceLang}`);
  return { normalised: text, detectedLanguage: sourceLang, confidence: 0.92 };
};

const SERVICE_KEYWORDS = {
  ration:      ["ration","राशन","अनाज","चावल","गेहूं","PDS","कोटा"],
  hospital:    ["hospital","अस्पताल","डॉक्टर","दवाई","OPD","ambulance","एम्बुलेंस","बीमार"],
  pension:     ["pension","पेंशन","बुढ़ापा","वृद्धावस्था","widow","विधवा"],
  emergency:   ["emergency","आपातकाल","112","help","मदद","खतरा","fire","आग"],
  documents:   ["aadhaar","आधार","certificate","प्रमाण पत्र","जन्म","जाति"],
  pm_kisan:    ["kisan","किसान","PM Kisan","फसल","खेत","agriculture"],
  scholarship: ["scholarship","छात्रवृत्ति","पढ़ाई","school","college","fees"],
  bijli:       ["bijli","बिजली","electricity","light","meter","bill"],
  jal_jeevan:  ["water","पानी","jal","जल","tap","नल"],
  mnrega:      ["MNREGA","मनरेगा","job card","जॉब कार्ड","काम","मजदूरी"],
  anganwadi:   ["anganwadi","आंगनवाड़ी","baby","बच्चा","nutrition","पोषण"],
  pm_awaas:    ["ghar","घर","house","PM Awaas","awas","आवास","makaan","मकान"],
};

const detectServiceKeyword = (text) => {
  const lower = text.toLowerCase();
  for (const [svc, kws] of Object.entries(SERVICE_KEYWORDS))
    if (kws.some((k) => lower.includes(k.toLowerCase()))) return svc;
  return "unknown";
};

const extractIntentWithGroq = async (transcript, lang = "hi") => {
  const key = process.env.GROQ_API_KEY;
  if (!key || key === "your_groq_api_key_here") {
    console.log("[Groq] Mock mode — keyword fallback");
    const serviceType = detectServiceKeyword(transcript);
    const replies = {
      ration:"आपकी राशन समस्या दर्ज कर ली गई है।",
      hospital:"आपकी स्वास्थ्य सेवा का अनुरोध दर्ज हो गया।",
      pension:"आपका पेंशन आवेदन शुरू हो गया है।",
      emergency:"आपातकालीन सेवा से संपर्क किया जा रहा है।",
      documents:"आपका दस्तावेज़ अनुरोध दर्ज हो गया।",
      pm_kisan:"PM Kisan जानकारी जाँची जा रही है।",
      scholarship:"आपका छात्रवृत्ति आवेदन दर्ज हो गया।",
      bijli:"आपकी बिजली शिकायत दर्ज कर ली गई है।",
      jal_jeevan:"जल जीवन मिशन अनुरोध दर्ज हो गया।",
      mnrega:"आपका MNREGA जॉब कार्ड अनुरोध दर्ज हो गया।",
      anganwadi:"आंगनवाड़ी सेवा अनुरोध दर्ज हो गया।",
      pm_awaas:"PM आवास योजना आवेदन शुरू हो गया।",
      unknown:"आपकी बात समझ आई। हम मदद करेंगे।",
    };
    return {
      serviceType,
      intent: `User needs help with ${serviceType}`,
      extractedData: { rawText: transcript, urgency: "medium" },
      voiceReply: replies[serviceType] || replies.unknown,
      mode: "mock",
    };
  }

  try {
    const prompt = `You are AWAAZ — an AI helping illiterate Indian citizens access government services.
Citizen spoke in ${lang} (may be dialect/broken/mixed):
"${transcript}"

Return ONLY valid JSON:
{
  "serviceType": "one of: ration|hospital|pension|emergency|documents|pm_kisan|scholarship|bijli|jal_jeevan|mnrega|anganwadi|pm_awaas|unknown",
  "intent": "brief English description",
  "extractedData": { "issue": "main issue", "urgency": "high|medium|low", "location": "if mentioned", "name": "if mentioned" },
  "voiceReply": "Short warm reply in ${lang} — simple words, confirm what you understood and next steps"
}`;

    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      { model: process.env.GROQ_MODEL || "llama3-70b-8192", max_tokens: 600, temperature: 0.3,
        messages: [{ role: "user", content: prompt }] },
      { headers: { "Content-Type":"application/json", "Authorization": `Bearer ${key}` } }
    );
    const parsed = JSON.parse(res.data.choices[0].message.content.replace(/```json|```/g,"").trim());
    return { ...parsed, mode: "cloud-ai100" };
  } catch (err) {
    console.error("[Groq] Error:", err.message);
    return {
      serviceType: detectServiceKeyword(transcript),
      intent: "Service request",
      extractedData: { rawText: transcript },
      voiceReply: "आपकी बात सुन ली गई है। हम जल्द मदद करेंगे।",
      mode: "fallback",
    };
  }
};

/* ── Multi-device orchestration ────────────────────────────────────────
   Priority order (edge-first, matches hackathon "majority local" rule):
     1. Snapdragon Copilot+ PC — local Ollama model (fully offline, NPU, FREE)
     2. Cloud escalation       — OPTIONAL, OFF by default. Only runs if you
        explicitly set ENABLE_CLOUD_FALLBACK=true *and* provide a
        GROQ_API_KEY. Groq's developer tier is free (no card required)
        at the time of writing, but if you don't want ANY third-party
        API involved — paid or free — leave this switch off and the
        app will use edge + rule-based mock only, always.
     3. Keyword mock           — last-resort, zero dependencies
   The response always carries `mode` + `device` so the frontend can show
   the user (and judges) exactly where the intelligence ran.            */
const EDGE_CONFIDENCE_THRESHOLD = Number(process.env.EDGE_CONFIDENCE_THRESHOLD || 0.55);
const CLOUD_FALLBACK_ENABLED = process.env.ENABLE_CLOUD_FALLBACK === "true";

// Don't trust the model's self-reported confidence alone (LLMs are poorly
// calibrated on this). Cross-check it against a few concrete signals so
// edge-vs-cloud routing is deterministic and demoable, not a coin flip.
const scoreConfidence = (result) => {
  if (!result) return 0;
  let score = typeof result.confidence === "number" ? result.confidence : 0.5;
  if (!result.serviceType || result.serviceType === "unknown") score -= 0.25;
  if (!result.extractedData?.issue) score -= 0.1;
  if (!result.voiceReply || result.voiceReply.length < 5) score -= 0.15;
  return Math.max(0, Math.min(1, score));
};

const extractIntent = async (transcript, lang = "hi") => {
  // 1) Try the edge model on the Snapdragon PC first — always, for free
  const edgeUp = await isOllamaAvailable();
  if (edgeUp) {
    try {
      const edgeResult = await extractIntentOnEdge(transcript, lang);
      const confidence = scoreConfidence(edgeResult);
      if (confidence >= EDGE_CONFIDENCE_THRESHOLD || !CLOUD_FALLBACK_ENABLED) {
        // Either confident enough, OR cloud fallback is deliberately
        // disabled — in both cases we stay fully on-device.
        return { ...edgeResult, confidence };
      }
      console.log(`[Orchestrator] Edge confidence ${confidence} < threshold — escalating to cloud`);
    } catch (err) {
      console.warn("[Orchestrator] Edge model errored:", err.message);
      if (!CLOUD_FALLBACK_ENABLED) {
        return { serviceType: detectServiceKeyword(transcript), intent: "Service request",
          extractedData: { rawText: transcript }, voiceReply: "आपकी बात दर्ज कर ली गई है।",
          mode: "mock", device: "none" };
      }
    }
  } else {
    console.log("[Orchestrator] Ollama not reachable on this PC — using cloud/mock path");
  }

  if (!CLOUD_FALLBACK_ENABLED) {
    // Pure free path: edge unavailable/unsure and cloud is switched off
    // by choice -> rule-based mock, zero external calls of any kind.
    const serviceType = detectServiceKeyword(transcript);
    return { serviceType, intent: `User needs help with ${serviceType}`,
      extractedData: { rawText: transcript, urgency: "medium" },
      voiceReply: "आपकी बात दर्ज कर ली गई है। हम मदद करेंगे।", mode: "mock", device: "none" };
  }

  // 2) Escalate to cloud (Qualcomm AI Cloud 100 tier — Groq free tier stands in for it here)
  const cloudResult = await extractIntentWithGroq(transcript, lang);
  return { ...cloudResult, device: cloudResult.mode === "mock" ? "none" : "cloud-ai100" };
};

const buildFormData = (serviceType, user = {}, extractedData = {}) => ({
  name: user.name || "", phone: user.phone || "", aadhaar: user.aadhaar || "",
  village: user.village || "", district: user.district || "",
  state: user.state || "", pincode: user.pincode || "",
  gpsLat: user.gps?.lat || "", gpsLng: user.gps?.lng || "",
  submittedAt: new Date().toISOString(),
  ...(({
    ration:      { complaintType:"ration_not_received", rationCardNo:"" },
    hospital:    { serviceNeeded:"OPD", emergencyType:"general" },
    pension:     { pensionType:"old_age", bankAccount:"" },
    mnrega:      { workType:"road_construction", daysRequested:100 },
    pm_kisan:    { landArea:"", cropType:"" },
    bijli:       { meterNumber:"", complaintType:"no_supply" },
    jal_jeevan:  { connectionType:"new", complaintType:"no_water" },
    scholarship: { class:"", institutionName:"" },
    pm_awaas:    { familySize:"", annualIncome:"" },
    anganwadi:   { childName:"", childAge:"" },
    documents:   { documentType:"birth_certificate" },
    emergency:   { emergencyType:"medical", description: extractedData.issue||"" },
  })[serviceType] || {}),
});

module.exports = { extractIntent, extractIntentWithGroq, bhashiniNormalise, buildFormData };
