const ServiceRequest = require("../models/ServiceRequest");
const User = require("../models/User");
const { extractIntent, bhashiniNormalise, buildFormData } = require("../services/aiService");
const { submitToGovt } = require("../services/govtGateway");
const { sendFollowUp } = require("../services/smsService");

// POST /api/voice/process
exports.processVoice = async (req, res) => {
  try {
    const { transcript, language = "hi", phone, gps } = req.body;
    if (!transcript) return res.status(400).json({ error: "Transcript is required" });

    // Step 1: Bhashini dialect normalisation
    const { normalised, detectedLanguage } = await bhashiniNormalise(transcript, language);

    // Step 2: Find or create user
    let user = null;
    if (phone) {
      user = await User.findOne({ phone }).catch(() => null);
      if (!user) {
        user = await User.create({
          name: "Unknown", phone,
          gps: gps || {},
          preferredLanguage: detectedLanguage,
        }).catch(() => null);
      }
      if (user && gps) {
        user.gps = gps;
        await user.save().catch(() => {});
      }
    }

    // Step 3: Multi-device AI intent detection — Snapdragon PC (edge) first,
    // Qualcomm AI Cloud 100 escalation only if needed (see aiService.extractIntent)
    const { serviceType, intent, extractedData, voiceReply, mode, device } =
      await extractIntent(normalised, detectedLanguage);

    // Step 4: Auto-fill form data
    const formData = buildFormData(serviceType, user || {}, extractedData);

    // Step 5: Save to MongoDB
    let saved = null;
    try {
      saved = await ServiceRequest.create({
        userId: user?._id,
        phone: phone || "unknown",
        voiceTranscript: transcript,
        detectedLanguage,
        serviceType,
        intent,
        extractedData,
        formData,
        status: "pending",
        sourceDevice: "mobile",
        aiComputeMode: mode,
      });
    } catch (dbErr) {
      console.warn("[DB] Mock mode — not saved:", dbErr.message);
    }

    res.json({
      success: true,
      requestId: saved?._id || "mock-" + Date.now(),
      referenceNumber: saved?.referenceNumber || "AWZ" + Date.now().toString().slice(-8),
      serviceType,
      intent,
      detectedLanguage,
      voiceReply: voiceReply || "आपकी बात दर्ज हो गई है।",
      formData,
      aiMode: mode,       // "edge-local" | "cloud" | "fallback" | "mock"
      aiDevice: device,   // "snapdragon-copilot-pc" | "cloud-ai100" | "none"
    });
  } catch (err) {
    console.error("[processVoice]", err);
    res.status(500).json({ error: "Voice processing failed", detail: err.message });
  }
};

// POST /api/voice/submit
exports.submitRequest = async (req, res) => {
  try {
    const { requestId, formData, serviceType, phone } = req.body;

    // Mock Govt Gateway submission
    const govtRes = await submitToGovt(serviceType, formData);

    // Update DB record
    if (requestId && !requestId.startsWith("mock")) {
      await ServiceRequest.findByIdAndUpdate(requestId, {
        status: "submitted",
        govtApiResponse: govtRes,
        referenceNumber: govtRes.referenceNumber,
      }).catch(() => {});
    }

    // SMS confirmation
    if (phone) {
      await sendFollowUp(phone, govtRes.referenceNumber, "submitted", serviceType);
    }

    res.json({
      success: true,
      referenceNumber: govtRes.referenceNumber,
      message: govtRes.message,
      estimatedDays: govtRes.estimatedResolutionDays,
      voiceReply: `आपका आवेदन जमा हो गया। Reference number: ${govtRes.referenceNumber}। ${govtRes.estimatedResolutionDays} दिन में जवाब आएगा।`,
    });
  } catch (err) {
    console.error("[submitRequest]", err);
    res.status(500).json({ error: "Submission failed", detail: err.message });
  }
};
