import React from "react";

const LANGUAGES = [
  { code: "hi",  label: "हिंदी",    english: "Hindi"   },
  { code: "bho", label: "भोजपुरी", english: "Bhojpuri" },
  { code: "mai", label: "मैथिली",  english: "Maithili" },
  { code: "bn",  label: "বাংলা",   english: "Bengali"  },
  { code: "te",  label: "తెలుగు", english: "Telugu"   },
  { code: "mr",  label: "मराठी",   english: "Marathi"  },
  { code: "ta",  label: "தமிழ்",   english: "Tamil"    },
  { code: "gu",  label: "ગુજરાતી", english: "Gujarati" },
  { code: "kn",  label: "ಕನ್ನಡ",  english: "Kannada"  },
  { code: "pa",  label: "ਪੰਜਾਬੀ", english: "Punjabi"  },
  { code: "ml",  label: "മലയാളം", english: "Malayalam" },
  { code: "ur",  label: "اردو",    english: "Urdu"     },
  { code: "en",  label: "English", english: "English"  },
];

export default function LanguageSelector({ selected, onChange }) {
  return (
    <div className="w-full">
      <p className="text-xs mb-2" style={{ color: "#8899BB" }}>भाषा चुनें / Choose Language</p>
      <div className="flex flex-wrap gap-2">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onChange(lang.code)}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
              ${selected === lang.code
                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                : "text-gray-300 hover:bg-white/10"
              }
            `}
            style={selected !== lang.code ? { background: "#1A2240", border: "1px solid #1E2D55" } : {}}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
}
