/* ── Bhashini (Govt. of India NLP) integration ───────────────
   Provides live translation + text-to-speech for Indian
   languages via the public ULCA pipeline API.

   SETUP (optional — app works fine without this configured):
   1. Register at https://bhashini.gov.in and get a User ID +
      ULCA API key (Profile → My Profile → "View ULCA API Key").
   2. Add to frontend/.env:
        VITE_BHASHINI_USER_ID=your-user-id
        VITE_BHASHINI_API_KEY=your-ulca-api-key
   3. Restart the dev server.

   Until these are set, every function below resolves to `null`
   immediately and every caller in this app (translate(), speak())
   already falls back to the existing static text / browser voice —
   nothing breaks if Bhashini is not configured.                 */

const PIPELINE_CONFIG_URL =
  "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline";
// Bhashini's standard published "NMT Translation + TTS" pipeline id
const PIPELINE_ID = "64392f96daac500b55c543cd";

const USER_ID  = import.meta.env.VITE_BHASHINI_USER_ID  || "";
const API_KEY  = import.meta.env.VITE_BHASHINI_API_KEY || "";

export const isBhashiniConfigured = () => Boolean(USER_ID && API_KEY);

// Bhashini language codes match our app's codes almost 1:1 (ISO 639-1 /
// the relevant 639-3 codes for the 8th-schedule languages).
const BHASHINI_LANG = {
  hi:"hi", en:"en", bn:"bn", te:"te", mr:"mr", ta:"ta", gu:"gu",
  kn:"kn", ml:"ml", pa:"pa", ur:"ur", or:"or", as:"as", sa:"sa",
  ne:"ne", kok:"gom", mai:"mai", bho:"hi", brx:"brx", doi:"doi",
  ks:"ks", mni:"mni", sat:"sat", sd:"sd",
};

let _pipelineCache = null; // { translationServiceId, ttsServiceId, endpoint, inferenceApiKey }

async function _getPipelineConfig() {
  if (_pipelineCache) return _pipelineCache;
  if (!isBhashiniConfigured()) return null;

  const res = await fetch(PIPELINE_CONFIG_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      userID: USER_ID,
      ulcaApiKey: API_KEY,
    },
    body: JSON.stringify({
      pipelineTasks: [
        { taskType: "translation" },
        { taskType: "tts" },
      ],
      pipelineRequestConfig: { pipelineId: PIPELINE_ID },
    }),
  });
  if (!res.ok) throw new Error("Bhashini pipeline config failed");
  const data = await res.json();

  const translationTask = data.pipelineResponseConfig?.find(t => t.taskType === "translation");
  const ttsTask         = data.pipelineResponseConfig?.find(t => t.taskType === "tts");

  _pipelineCache = {
    endpoint:           data.pipelineInferenceAPIEndPoint?.callbackUrl,
    inferenceApiKey:    data.pipelineInferenceAPIEndPoint?.inferenceApiKey?.value,
    translationServiceId: translationTask?.config?.[0]?.serviceId,
    ttsServiceId:          ttsTask?.config?.[0]?.serviceId,
  };
  return _pipelineCache;
}

/* Translate `text` from `sourceLang` to `targetLang` (our internal
   language codes). Returns the translated string, or null if
   Bhashini isn't configured or the call fails for any reason. */
export async function bhashiniTranslate(text, sourceLang, targetLang) {
  if (!text?.trim()) return null;
  const src = BHASHINI_LANG[sourceLang] || sourceLang;
  const tgt = BHASHINI_LANG[targetLang] || targetLang;
  if (src === tgt) return text;

  try {
    const cfg = await _getPipelineConfig();
    if (!cfg?.endpoint) return null;

    const res = await fetch(cfg.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: cfg.inferenceApiKey,
      },
      body: JSON.stringify({
        pipelineTasks: [{
          taskType: "translation",
          config: {
            language: { sourceLanguage: src, targetLanguage: tgt },
            serviceId: cfg.translationServiceId,
          },
        }],
        inputData: { input: [{ source: text }] },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.pipelineResponse?.[0]?.output?.[0]?.target || null;
  } catch {
    return null;
  }
}

/* Text-to-speech via Bhashini. Returns a base64 WAV/MP3 string
   (suitable for `new Audio("data:audio/wav;base64," + result)`),
   or null if unavailable/failed. */
export async function bhashiniTTS(text, lang) {
  if (!text?.trim()) return null;
  const code = BHASHINI_LANG[lang] || lang;

  try {
    const cfg = await _getPipelineConfig();
    if (!cfg?.endpoint || !cfg.ttsServiceId) return null;

    const res = await fetch(cfg.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: cfg.inferenceApiKey,
      },
      body: JSON.stringify({
        pipelineTasks: [{
          taskType: "tts",
          config: {
            language: { sourceLanguage: code },
            serviceId: cfg.ttsServiceId,
            gender: "female",
            samplingRate: 22050,
          },
        }],
        inputData: { input: [{ source: text }] },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.pipelineResponse?.[0]?.audio?.[0]?.audioContent || null;
  } catch {
    return null;
  }
}
