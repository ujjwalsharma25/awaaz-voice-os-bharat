const express = require("express");
const router  = express.Router();
const { sendSMS } = require("../services/smsService");

// POST /api/sms/send
router.post("/send", async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) return res.status(400).json({ error: "phone and message required" });
    const result = await sendSMS(`+91${phone}`, message);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
