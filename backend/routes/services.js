const express = require("express");
const router  = express.Router();

const SERVICES = [
  { id: "ration",      name: "Ration",      nameHi: "राशन",          icon: "🍚", desc: "Complaint & status",   color: "#4488FF" },
  { id: "hospital",    name: "Hospital",    nameHi: "अस्पताल",       icon: "🏥", desc: "OPD & ambulance",      color: "#4488FF" },
  { id: "pension",     name: "Pension",     nameHi: "पेंशन",          icon: "💰", desc: "Apply & check",        color: "#4488FF" },
  { id: "emergency",   name: "Emergency",   nameHi: "आपातकाल",       icon: "🚨", desc: "112 auto-dial",        color: "#FF4444" },
  { id: "documents",   name: "Documents",   nameHi: "दस्तावेज़",      icon: "📄", desc: "Aadhaar / certs",      color: "#FFFFFF" },
  { id: "pm_kisan",    name: "PM Kisan",    nameHi: "PM किसान",       icon: "🌾", desc: "Status & payment",     color: "#00E676" },
  { id: "scholarship", name: "Scholarship", nameHi: "छात्रवृत्ति",    icon: "🏫", desc: "PM scheme apply",      color: "#4488FF" },
  { id: "bijli",       name: "Bijli",       nameHi: "बिजली",          icon: "⚡", desc: "Bill & complaint",     color: "#FFD54F" },
  { id: "jal_jeevan",  name: "Jal Jeevan",  nameHi: "जल जीवन",        icon: "💧", desc: "Water supply",         color: "#26C6DA" },
  { id: "mnrega",      name: "MNREGA",      nameHi: "मनरेगा",          icon: "🏗️", desc: "Job card apply",       color: "#FFFFFF" },
  { id: "anganwadi",   name: "Anganwadi",   nameHi: "आंगनवाड़ी",      icon: "👶", desc: "Child nutrition",      color: "#9C6FFF" },
  { id: "pm_awaas",    name: "PM Awaas",    nameHi: "PM आवास",         icon: "🏠", desc: "Housing scheme",       color: "#00E676" },
];

// GET /api/services
router.get("/", (req, res) => res.json({ success: true, services: SERVICES }));

// GET /api/services/:id
router.get("/:id", (req, res) => {
  const svc = SERVICES.find((s) => s.id === req.params.id);
  if (!svc) return res.status(404).json({ error: "Service not found" });
  res.json({ success: true, service: svc });
});

module.exports = router;
