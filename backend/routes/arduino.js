const express = require("express");
const router  = express.Router();
const ServiceRequest = require("../models/ServiceRequest");
const { buildRequestFromSensorEvent } = require("../services/arduinoService");
const { sendFollowUp } = require("../services/smsService");

// POST /api/arduino/event — Arduino UNO Q pushes a sensor reading here
router.post("/event", async (req, res) => {
  try {
    const { sensorType, value, deviceId, gps, phone } = req.body;
    if (!sensorType) return res.status(400).json({ error: "sensorType is required" });

    const payload = buildRequestFromSensorEvent({ sensorType, value, deviceId, gps });

    let saved = null;
    try {
      saved = await ServiceRequest.create({ ...payload, phone: phone || payload.phone });
    } catch (dbErr) {
      console.warn("[Arduino] Mock mode — not saved:", dbErr.message);
    }

    if (phone) {
      await sendFollowUp(phone, saved?.referenceNumber || "PENDING", "auto-detected", payload.serviceType).catch(() => {});
    }

    console.log(`[Arduino UNO Q] ${deviceId || "unknown-device"} → ${sensorType}=${value} → ${payload.serviceType}`);

    res.json({
      success: true,
      requestId: saved?._id || "mock-" + Date.now(),
      referenceNumber: saved?.referenceNumber || "AWZ" + Date.now().toString().slice(-8),
      serviceType: payload.serviceType,
      voiceReply: payload.voiceReply,
      sourceDevice: "arduino_uno_q",
    });
  } catch (err) {
    console.error("[arduino/event]", err);
    res.status(500).json({ error: "Failed to process sensor event", detail: err.message });
  }
});

module.exports = router;
