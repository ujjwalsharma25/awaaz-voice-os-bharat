// Format service type to readable Hindi label
export const serviceLabel = (type) => ({
  ration:      "राशन",
  hospital:    "अस्पताल",
  pension:     "पेंशन",
  emergency:   "आपातकाल",
  documents:   "दस्तावेज़",
  pm_kisan:    "PM किसान",
  scholarship: "छात्रवृत्ति",
  bijli:       "बिजली",
  jal_jeevan:  "जल जीवन",
  mnrega:      "मनरेगा",
  anganwadi:   "आंगनवाड़ी",
  pm_awaas:    "PM आवास",
  unknown:     "अज्ञात",
}[type] || type);

// Format status to Hindi
export const statusLabel = (status) => ({
  pending:    "लंबित",
  submitted:  "जमा हुआ",
  processing: "प्रक्रिया में",
  resolved:   "हल हुआ",
  rejected:   "अस्वीकृत",
}[status] || status);

// Status badge colors
export const statusColor = (status) => ({
  pending:    { bg: "#FFD54F20", text: "#FFD54F" },
  submitted:  { bg: "#00BFFF20", text: "#00BFFF" },
  processing: { bg: "#9C6FFF20", text: "#9C6FFF" },
  resolved:   { bg: "#00E67620", text: "#00E676" },
  rejected:   { bg: "#FF444420", text: "#FF4444" },
}[status] || { bg: "#8899BB20", text: "#8899BB" });

// Get GPS coords
export const getGPS = () =>
  new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      ()    => resolve(null),
      { timeout: 4000 }
    );
  });

// Format date in Hindi locale
export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("hi-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

// Validate 10-digit phone
export const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(phone);

// Validate 12-digit Aadhaar
export const isValidAadhaar = (aadhaar) => /^\d{12}$/.test(aadhaar.replace(/\s/g, ""));
