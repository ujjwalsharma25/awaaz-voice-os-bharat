export const LANGUAGES = [
  { code: "hi",  label: "हिंदी",    bcp47: "hi-IN"  },
  { code: "bho", label: "भोजपुरी", bcp47: "hi-IN"  }, // Bhojpuri maps to hi-IN in Web Speech
  { code: "mai", label: "मैथिली",  bcp47: "hi-IN"  }, // Maithili maps to hi-IN in Web Speech
  { code: "bn",  label: "বাংলা",   bcp47: "bn-IN"  },
  { code: "te",  label: "తెలుగు", bcp47: "te-IN"  },
  { code: "mr",  label: "मराठी",   bcp47: "mr-IN"  },
  { code: "ta",  label: "தமிழ்",   bcp47: "ta-IN"  },
  { code: "gu",  label: "ગુજરાતી", bcp47: "gu-IN"  },
  { code: "kn",  label: "ಕನ್ನಡ",  bcp47: "kn-IN"  },
  { code: "pa",  label: "ਪੰਜਾਬੀ", bcp47: "pa-IN"  },
  { code: "ml",  label: "മലയാളം", bcp47: "ml-IN"  },
  { code: "ur",  label: "اردو",    bcp47: "ur-IN"  },
  { code: "en",  label: "English", bcp47: "en-IN"  },
];

export const SERVICES = [
  { id: "ration",      nameHi: "राशन",         icon: "🍚", color: "#4488FF" },
  { id: "hospital",    nameHi: "अस्पताल",      icon: "🏥", color: "#4488FF" },
  { id: "pension",     nameHi: "पेंशन",         icon: "💰", color: "#4488FF" },
  { id: "emergency",   nameHi: "आपातकाल",      icon: "🚨", color: "#FF4444" },
  { id: "documents",   nameHi: "दस्तावेज़",     icon: "📄", color: "#FFFFFF" },
  { id: "pm_kisan",    nameHi: "PM किसान",      icon: "🌾", color: "#00E676" },
  { id: "scholarship", nameHi: "छात्रवृत्ति",   icon: "🏫", color: "#4488FF" },
  { id: "bijli",       nameHi: "बिजली",         icon: "⚡", color: "#FFD54F" },
  { id: "jal_jeevan",  nameHi: "जल जीवन",       icon: "💧", color: "#26C6DA" },
  { id: "mnrega",      nameHi: "मनरेगा",         icon: "🏗️", color: "#FFFFFF" },
  { id: "anganwadi",   nameHi: "आंगनवाड़ी",     icon: "👶", color: "#9C6FFF" },
  { id: "pm_awaas",    nameHi: "PM आवास",        icon: "🏠", color: "#00E676" },
];

// ── Official Government Links (Mode 1: Open Official Link) ───────
export const OFFICIAL_LINKS = {
  ration:      "https://nfsa.gov.in/",
  hospital:    "https://pmjay.gov.in/",
  pension:     "https://nsap.nic.in/",
  emergency:   "https://www.112.gov.in/",
  documents:   "https://uidai.gov.in/",
  pm_kisan:    "https://pmkisan.gov.in/",
  scholarship: "https://scholarships.gov.in/",
  bijli:       "https://saubhagya.gov.in/",
  jal_jeevan:  "https://jaljeevanmission.gov.in/",
  mnrega:      "https://nrega.nic.in/",
  anganwadi:   "https://wcd.nic.in/icds",
  pm_awaas:    "https://pmaymis.gov.in/",
};

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
