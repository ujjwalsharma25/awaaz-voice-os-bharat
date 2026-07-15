const mongoose = require("mongoose");
const srSchema = new mongoose.Schema({
  userId:           { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  phone:            { type: String, required: true },
  voiceTranscript:  { type: String, required: true },
  detectedLanguage: { type: String, default: "hi" },
  serviceType: {
    type: String, required: true,
    enum: ["ration","hospital","pension","emergency","documents","pm_kisan",
           "scholarship","bijli","jal_jeevan","mnrega","anganwadi","pm_awaas","unknown"],
  },
  intent:          String,
  extractedData:   mongoose.Schema.Types.Mixed,
  formData:        mongoose.Schema.Types.Mixed,
  status:          { type: String, enum: ["pending","submitted","processing","resolved","rejected"], default: "pending" },
  sourceDevice:    { type: String, enum: ["mobile","arduino_uno_q","web"], default: "mobile" },
  aiComputeMode:   { type: String, enum: ["edge-local","cloud","fallback","mock"], default: "mock" },
  referenceNumber: String,
  govtApiResponse: mongoose.Schema.Types.Mixed,
  lastFollowUpSent:Date,
  followUpCount:   { type: Number, default: 0 },
  resolvedAt:      Date,
}, { timestamps: true });

srSchema.pre("save", function (next) {
  if (!this.referenceNumber)
    this.referenceNumber = "AWZ" + Date.now().toString().slice(-8).toUpperCase();
  next();
});
module.exports = mongoose.model("ServiceRequest", srSchema);
