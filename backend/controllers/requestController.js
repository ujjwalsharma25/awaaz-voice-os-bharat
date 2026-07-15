const ServiceRequest = require("../models/ServiceRequest");
const { checkStatus } = require("../services/govtGateway");
const { sendFollowUp } = require("../services/smsService");

// GET /api/requests?phone=xxx&status=pending
exports.getAllRequests = async (req, res) => {
  try {
    const filter = {};
    if (req.query.phone)  filter.phone  = req.query.phone;
    if (req.query.status) filter.status = req.query.status;
    const requests = await ServiceRequest.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: requests.length, requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/requests/status/:refNo
exports.getStatus = async (req, res) => {
  try {
    const r = await ServiceRequest.findOne({ referenceNumber: req.params.refNo });
    if (!r) {
      const mock = await checkStatus(req.params.refNo);
      return res.json({ success: true, ...mock });
    }
    res.json({
      success: true,
      referenceNumber: r.referenceNumber,
      status: r.status,
      serviceType: r.serviceType,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/requests/followup  (cron job call this every 7 days)
exports.sendFollowUps = async (req, res) => {
  try {
    const pending = await ServiceRequest.find({
      status: { $in: ["pending", "submitted", "processing"] },
      $or: [
        { lastFollowUpSent: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        { lastFollowUpSent: { $exists: false } },
      ],
    }).limit(20);

    let sent = 0;
    for (const r of pending) {
      if (r.phone && r.phone !== "unknown") {
        await sendFollowUp(r.phone, r.referenceNumber, r.status, r.serviceType);
        r.lastFollowUpSent = new Date();
        r.followUpCount += 1;
        await r.save();
        sent++;
      }
    }
    res.json({ success: true, followUpsSent: sent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
