# 🎙️ AWAAZ — Voice OS for Bharat

> **Voice-first government services for 300M illiterate Indians**
> Team Vision Coders

---

## ❗ Problem Statement

India has over **300 million citizens who cannot read or write**, and every government service — ration status, pensions, PM Kisan, hospital access, scholarships — is locked behind apps and forms that assume literacy, typing ability, and a stable internet connection. When these citizens can't navigate a form themselves, they turn to local **middlemen ("dalals")** who charge ₹200–500 per form, draining crores from India's poorest families every year. On top of this, most interfaces are **English or Hindi-only**, shutting out speakers of Bhojpuri, Maithili, and other regional languages, while elderly citizens and women are routinely made to wait in queues for days, with little dignity or support.

## ✅ Our Solution

**AWAAZ is a voice-first "Voice OS"** that lets any citizen simply **speak** — in their own language or dialect — to access 12 essential government services, with **zero reading, typing, or literacy required**. The user speaks a request (e.g. *"mujhe ration nahi mila"*), an on-device AI model detects the intent and the right service instantly, and the app either reads out information, auto-fills the correct government form using the citizen's saved profile, or files a complaint — all confirmed back to them by voice and SMS. Because the AI runs **locally on a laptop via Ollama**, it works **fully offline**, so it isn't blocked by patchy rural internet, and it costs the user **₹0** at every step, cutting out the middleman entirely.

---

## 📸 Screenshots

| Language Selection | Mobile Login (OTP) | Voice Home |
|---|---|---|
| ![Language Selection](.C:\Users\DELL\Downloads\awaaz-voice-os-bharat\1-language-selection.png) | ![Mobile OTP Login](C:\Users\DELL\Downloads\awaaz-voice-os-bharat\2-mobile-otp-login.png) | ![Voice Home](C:\Users\DELL\Downloads\awaaz-voice-os-bharat\3-voice-home.png) |

| Service Detected (PM Kisan) | 12 Services Grid | Status Check |
|---|---|---|
| ![Service Detected](C:\Users\DELL\Downloads\awaaz-voice-os-bharat\4-service-detected.png) | ![Services Grid](C:\Users\DELL\Downloads\awaaz-voice-os-bharat\5-services-grid.png) | ![Status Check](C:\Users\DELL\Downloads\awaaz-voice-os-bharat\6-status-check.png) |

| Auto-Filled Profile |
|---|
| ![Profile Page](C:\Users\DELL\Downloads\awaaz-voice-os-bharat\7-profile-page.png) |
and many more.
---

## 🚦 START HERE — Zero to Running (read this first)

Total time: ~15 minutes.

```bash
# 1. Get the code onto your laptop (pick ONE):
git clone <your-github-repo-url>        # recommended — push from your own laptop before the event
# OR unzip the file you brought on a USB drive

cd awaaz-voice-os-bharat

# 2. Install everything (backend + frontend)
npm run install:all

# 3. Install Ollama — this is what makes the AI run locally, offline, free
#    Download from https://ollama.com/download
ollama pull llama3.2:3b
ollama serve
#    (leave this running in its own terminal window)

# 4. In a NEW terminal window, from the project folder, start both servers:
npm run dev
```

**5. Open the app:** on your laptop, go to `http://localhost:5173` in the browser.

**6. Check it's using local AI (not just mock mode):** speak or type something in the app. A small badge should appear saying **"⚡ On-device AI"**. If instead you see **"🧪 Demo mode"**, it means Ollama isn't running — go back to step 3 and make sure `ollama serve` is still active in its terminal.

**7. Use your own phone as the mobile device:**
- Find your laptop's network address: open Command Prompt and type `ipconfig`, look for "IPv4 Address" (looks like `192.168.1.42`)
- Edit the file `frontend/.env`, set: `VITE_API_URL=http://192.168.1.42:5000/api` (use the real IP you found)
- Restart `npm run dev`
- On your phone, connect to the **same WiFi** as your laptop, open a browser, go to `http://192.168.1.42:5173`

**That's it — nothing else needs to be installed or configured.** MongoDB, Twilio, and cloud AI are all optional and the app works fully without them (see below if you want them).

---

## 🧩 Architecture

AWAAZ splits its intelligence across a simple two-part setup:

| Component | Role | What runs there |
|---|---|---|
| 📱 **Mobile device** | Voice capture + citizen interaction | Web Speech API mic input, TTS voice replies in the citizen's own language. Sends only the raw transcript onward — no heavy compute here. |
| 💻 **Laptop (Dell)** | On-device AI brain (edge) | Local LLM via **Ollama**, running locally on the laptop. Does intent detection, form auto-fill, and voice-reply generation — **fully offline**, no internet needed. This is the primary path for every request. |
| ☁️ **Cloud fallback** | Escalation tier only, **OFF by default** | Only called if you explicitly turn it on (`ENABLE_CLOUD_FALLBACK=true`) — e.g. laptop unreachable or its confidence is low. Out of the box, zero external API calls of any kind are made — 100% free/local. |

```
Citizen speaks (mobile)
        │  transcript only
        ▼
Laptop (Dell) ── local Ollama model ──▶ intent + form + voice reply
        │  low confidence / laptop offline only
        ▼
Cloud fallback (opt-in)
```

Every processed request stores **which device captured it** (`sourceDevice`) and **which tier computed the intent** (`aiComputeMode`) — see `backend/models/ServiceRequest.js` — so this is verifiable in the demo, not just claimed in a slide.

> 💰 **Zero-cost by default.** `ENABLE_CLOUD_FALLBACK=false` out of the box — the app never calls any external/paid API unless you turn it on yourself. Ollama (edge AI), MongoDB Atlas free tier, and Twilio SMS are all optional and default to free/mock modes. See "API Keys Setup" below for what each toggle actually does.

---

## 📁 Project Structure

```
awaaz-voice-os-bharat/
├── backend/                  # Node.js + Express API
│   ├── controllers/
│   │   ├── voiceController.js    # Main voice processing logic
│   │   └── requestController.js  # Request tracking & follow-ups
│   ├── models/
│   │   ├── User.js               # MongoDB user schema
│   │   └── ServiceRequest.js     # Request schema — tracks sourceDevice + aiComputeMode
│   ├── routes/
│   │   ├── voice.js              # POST /api/voice/process & /submit  (mobile → laptop)
│   │   ├── services.js           # GET /api/services
│   │   ├── requests.js           # GET /api/requests
│   │   └── sms.js                # POST /api/sms/send
│   ├── services/
│   │   ├── aiService.js          # Edge-first orchestrator: local Ollama → cloud fallback → mock
│   │   ├── localAiService.js     # Calls Ollama on the laptop (on-device)
│   │   ├── govtGateway.js        # Mock UMANG/DigiLocker gateway
│   │   ├── smsService.js         # Twilio SMS/WhatsApp
│   │   └── db.js                 # MongoDB connection
│   ├── .env                      # Environment variables (edit this)
│   └── server.js                 # Express entry point
│
├── frontend/                 # React PWA
│   ├── src/
│   │   ├── components/
│   │   │   ├── MicButton.jsx           # Animated mic with pulse rings
│   │   │   ├── LanguageSelector.jsx    # Legacy/unused — language picking now lives in LoginPage.jsx
│   │   │   ├── ServiceCard.jsx         # Service tile card
│   │   │   ├── ResultCard.jsx          # AI result + form preview
│   │   │   ├── ConfirmationLoop.jsx    # "What do you want?" Info/Form/Complaint screen
│   │   │   ├── ComplaintDetails.jsx    # Ask → speak/type → confirm complaint before form opens
│   │   │   ├── AutoFillFormPreview.jsx # Auto-filled form/complaint review + submit
│   │   │   ├── FloatingChatbot.jsx     # Floating voice chat assistant
│   │   │   ├── Navbar.jsx              # Bottom navigation
│   │   │   ├── OnlineStatus.jsx        # Offline/sync banner
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── EmptyState.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx        # Language select (22 languages) + phone/OTP login
│   │   │   ├── HomePage.jsx         # Main voice interface
│   │   │   ├── ServicesPage.jsx     # 12 services grid
│   │   │   ├── StatusPage.jsx       # Check request status (with popup + voice readout)
│   │   │   └── ProfilePage.jsx      # User profile for auto-fill
│   │   ├── hooks/
│   │   │   ├── useVoice.js          # Web Speech API hook (speech recognition)
│   │   │   ├── useOfflineSync.js    # IndexedDB/localStorage sync
│   │   │   └── useProfile.js        # User profile hook
│   │   ├── services/
│   │   │   └── api.js               # All axios API calls + offline queue
│   │   └── utils/
│   │       ├── tts.js                # Speech queue, translation dictionary (22 languages), voice matching
│   │       ├── bhashini.js           # Optional Bhashini cloud-voice fallback (Govt of India NLP)
│   │       ├── mockData.js           # Demo users for OTP login flow
│   │       ├── helpers.js            # Format utils (date, labels, colors)
│   │       └── constants.js          # Languages, services lists
│   ├── .env
│   └── vite.config.js
│
├── package.json              # Root scripts (run both together)
├── LICENSE                    # MIT
└── README.md
```

---

## 🗣️ Voice & Language System

- **22 official Indian languages** (8th Schedule) + Bhojpuri + English are selectable on the login screen.
- **18 of these have complete, hand-written UI translations** (text + voice) covering every screen: Hindi, English, Bengali, Telugu, Marathi, Tamil, Gujarati, Bhojpuri, Assamese, Kannada, Malayalam, Punjabi, Odia, Urdu, Maithili, Konkani, Nepali, Sanskrit.
- The remaining 6 (Bodo, Dogri, Kashmiri, Manipuri, Santali, Sindhi) are extremely low-resource languages — the app safely falls back to Hindi text/voice for these until verified native translations or Bhashini are added.
- **Voice output (`utils/tts.js`)** picks an actual installed device voice matching the selected language wherever possible (not just a language tag — many browsers ignore the tag without an explicitly matched voice). If no local voice exists for that language, it can optionally fall back to **Bhashini** cloud TTS (see below) before finally falling back to the browser's default voice.
- **Voice input (speech recognition)** also dynamically uses the selected language's code, so what you speak is recognised in that language too.
- All spoken messages go through a single sequential queue — only one plays at a time, in order, so nothing overlaps or cuts off mid-sentence.

---

## ⚡ Quick Start

### Step 1 — Clone / Download

```bash
# If using git
git clone <your-repo-url>
cd awaaz-voice-os-bharat
```

### Step 2 — Install Dependencies

```bash
# Install everything at once
npm run install:all

# OR individually
cd backend  && npm install
cd ../frontend && npm install
```

### Step 3 — Set Up the Edge AI (Laptop)

This is the core of the story — install Ollama **on your laptop** so intent detection runs locally, fully offline:

```bash
# On your laptop
# 1. Install Ollama: https://ollama.com/download
ollama pull llama3.2:3b
ollama serve            # usually starts automatically after install
```

> Without Ollama running, AWAAZ automatically escalates every request to the cloud fallback (or mock mode) — nothing breaks, but you lose the on-device/edge story for the demo.

### Step 4 — Configure Environment

**Backend** — edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/awaaz

# Edge AI — runs locally on this laptop
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
EDGE_CONFIDENCE_THRESHOLD=0.55

# Cloud escalation only
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama3-70b-8192

TWILIO_ACCOUNT_SID=your_sid        # optional
TWILIO_AUTH_TOKEN=your_token       # optional
TWILIO_PHONE_NUMBER=+1234567890    # optional
FRONTEND_URL=http://localhost:5173
```

**Frontend** — edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api

# Optional — only needed for guaranteed cloud voice on languages with
# no local browser/device voice installed. See "Bhashini" below.
VITE_BHASHINI_USER_ID=
VITE_BHASHINI_API_KEY=
```

### Step 5 — Run Both Together

```bash
# From root /awaaz-voice-os-bharat folder
npm run dev
```

Or run separately:
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

### Step 6 — Open in Browser

```
Frontend → http://localhost:5173
Backend  → http://localhost:5000/api/health
```

---

## 🔑 API Keys Setup — everything below is OPTIONAL

The app is fully functional with **none** of these configured — Ollama is the only thing that actually gives you the "edge AI" story, and it's free/local, not a hosted API.

### Ollama (Edge AI — recommended, free & local, not a hosted API)
1. Install → https://ollama.com/download
2. `ollama pull llama3.2:3b`
3. `ollama serve`

> **Without Ollama:** App uses keyword-based mock mode — still fully functional for demo, just no on-device LLM reasoning.

### Groq API Key (cloud escalation — OFF by default, disabled unless you opt in)
1. Set `ENABLE_CLOUD_FALLBACK=true` in `backend/.env` (default is `false`)
2. Go to → https://console.groq.com → Create account → API Keys → Create Key
3. Paste in `backend/.env` as `GROQ_API_KEY`

> Groq's developer tier is free (no card required) at the time of writing. If you don't want to depend on **any** third-party API — free or paid — just leave `ENABLE_CLOUD_FALLBACK=false`. The app will never call it, and will fall back to on-device/mock mode instead.

### MongoDB Atlas (Database)
1. Go to → https://mongodb.com/atlas
2. Create free cluster → Connect → Drivers
3. Copy connection string → paste in `MONGODB_URI`

> **Without MongoDB:** App works in mock mode, no data persisted.

### Twilio SMS (Follow-up alerts)
1. Go to → https://twilio.com → Free trial
2. Get Account SID + Auth Token + Phone Number
3. Add in `.env`

> **Without Twilio:** SMS prints to console in mock mode.

### Bhashini API (Cloud Voice + Regional Dialects) — optional
Bhashini is the Government of India's free NLP/speech platform. Two separate places in the app can use it:

1. **Frontend cloud voice** (`frontend/src/utils/bhashini.js`) — real, working integration. When a selected language has no matching voice installed on the user's device/browser, the app can ask Bhashini to generate the audio instead of falling back to the wrong-sounding default voice.
   - Register → https://bhashini.gov.in/ulca/home → Profile → "View ULCA API Key"
   - Add `VITE_BHASHINI_USER_ID` and `VITE_BHASHINI_API_KEY` to `frontend/.env`
   - **Without this:** app instantly skips Bhashini (zero delay) and uses the browser's own voice — nothing breaks.

2. **Backend dialect normalisation** (`backend/services/aiService.js` → `bhashiniNormalise()`) — currently a **mock** that returns the transcript unchanged. To make this real, replace it with an actual Bhashini ASR/translation call using the same credentials above.

---

## 🏗️ Tech Stack

| Layer            | Technology                                                                 |
|------------------|-----------------------------------------------------------------------------|
| Mobile (capture) | React PWA + Web Speech API + IndexedDB offline queue                       |
| Laptop (edge AI) | **Ollama + Llama-3.2-3B running locally on a Dell laptop** — primary intent engine, fully offline |
| Cloud fallback   | Cloud escalation tier, **OFF by default** — opt-in only via `ENABLE_CLOUD_FALLBACK=true` (Groq free tier stands in for this in this build) |
| Voice            | Browser SpeechSynthesis (voice-matched per language) + optional Bhashini cloud TTS fallback |
| Languages        | 22 Indian languages (8th Schedule) + Bhojpuri + English                    |
| Backend          | Node.js + Express — orchestrates edge/cloud                                |
| Database         | MongoDB Atlas (Mongoose) — records `sourceDevice` + `aiComputeMode` per request |
| SMS              | Twilio WhatsApp/SMS                                                        |
| Deployment       | Runs on local network for the demo; Vercel (frontend) + Railway (backend) for a public build |

---

## 🌐 Deploy to Production

### Frontend → Vercel
```bash
cd frontend
npm run build
# Upload dist/ to Vercel OR connect GitHub repo
```
Set env var: `VITE_API_URL=https://your-backend.railway.app/api`

### Backend → Railway
1. Push to GitHub
2. New project on railway.app → Deploy from GitHub
3. Add env variables from `.env`
4. Done ✅

---

## 📱 How It Works — Flow

```
User speaks (any of 22 languages) — on the MOBILE device
        ↓
Web Speech API captures audio (recognised in the selected language)
        ↓
Transcript sent to the LAPTOP
        ↓
Local Ollama model detects intent + service type — OFFLINE
        ↓ (only if laptop unreachable OR confidence < threshold)
Cloud escalation (Groq stands in for this in the demo)
        ↓
User chooses: Get Info / Fill Form / Register Complaint
        ↓
(Complaint only) App asks "what's your complaint?" → user speaks/types →
        reads it back for confirmation → THEN opens the complaint form
        ↓
Form auto-filled with user profile + GPS
        ↓
Mock Govt Gateway submits request
        ↓
Voice reply confirms in user's own language (local voice → Bhashini
        cloud voice if no local voice exists → default voice)
        ↓
Twilio SMS sends reference number
        ↓
7-day follow-up until resolved
```

> Note: dialect normalisation via Bhashini in the backend pipeline (`aiService.js`) is currently a **mock** (returns transcript unchanged) unless you wire real credentials — see "Bhashini API" above. The frontend's Bhashini cloud-voice fallback is a real, working integration once configured.

---

## 🔌 API Reference

| Method | Endpoint                        | Description                        |
|--------|---------------------------------|------------------------------------|
| POST   | `/api/voice/process`            | Process voice transcript with AI   |
| POST   | `/api/voice/submit`             | Submit to govt gateway             |
| GET    | `/api/services`                 | List all 12 services               |
| GET    | `/api/requests?phone=XXXXXXXXXX`| Get user's requests                |
| GET    | `/api/requests/status/:refNo`   | Check status by reference number   |
| POST   | `/api/requests/followup`        | Trigger SMS follow-ups             |
| POST   | `/api/sms/send`                 | Send custom SMS                    |
| GET    | `/api/health`                   | Health check                       |

### POST /api/voice/process — Request Body
```json
{
  "transcript": "मुझे राशन नहीं मिला तीन महीने से",
  "language": "hi",
  "phone": "9876543210",
  "gps": { "lat": 28.6139, "lng": 77.2090 }
}
```

### Response
```json
{
  "success": true,
  "requestId": "6849abc...",
  "referenceNumber": "AWZ12345678",
  "serviceType": "ration",
  "intent": "User has not received ration for 3 months",
  "detectedLanguage": "hi",
  "voiceReply": "आपकी राशन समस्या दर्ज कर ली गई है।",
  "formData": { "name": "...", "phone": "...", ... },
  "aiMode": "groq"
}
```

---

## 👥 Team Vision Coders

|     Name       |    Role       |            Email                    |
|----------------|---------------|-------------------------------------|
| Ujjwal Sharma  | Team Lead     | ujjwal.sharma.cse.2024@miet.ac.in   |
| Aastha Kaushik | Backend Dev   | aastha.kaushik.cse.2024@miet.ac.in  |
| Shubham        | Backend Dev   | shubham.kumar.cseiot.2023@miet.ac.in|
| Nishant        | Frontend Dev  | nishant.kumar.cse.2024@miet.ac.in   |
| Aanya          | UI/UX Design  | aanya.malik.cse.2024@miet.ac.in     |

---

## 📄 License

MIT — see [LICENSE](./LICENSE).

---

*Built for India. Built for Bharat. 🇮🇳*