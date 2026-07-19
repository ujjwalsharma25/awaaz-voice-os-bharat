const express = require("express");
const router  = express.Router();
const { processVoice, submitRequest } = require("../controllers/voiceController");

// POST /api/voice/process  — main voice → intent pipeline
router.post("/process", processVoice);

// POST /api/voice/submit   — confirm & submit to govt gateway
router.post("/submit", submitRequest);

module.exports = router;
