/* ── Arduino UNO Q — IoT sensing device ─────────────────────────────────
   The UNO Q sits in the field (e.g. a village water point, a ration
   shop, or a panic button at an anganwadi centre) and pushes a small
   JSON event to the Snapdragon PC over WiFi whenever a sensor trips.
   No AI runs on the Arduino itself — it only senses + reports, keeping
   with "sensing on IoT, inference on AI PC, interaction on mobile".

   Example payload the UNO Q sends (see /hardware/arduino_uno_q/*.ino):
   {
     "sensorType": "water_flow" | "panic_button" | "power_meter",
     "value": 0,
     "deviceId": "AWZ-UNOQ-01",
     "gps": { "lat": 28.61, "lng": 77.20 }
   }
   ------------------------------------------------------------------- */

const SENSOR_TO_SERVICE = {
  water_flow:    { serviceType: "jal_jeevan", issue: "No water flow detected at tap point", urgency: "high" },
  panic_button:  { serviceType: "emergency",  issue: "Panic button pressed at anganwadi/field device", urgency: "high" },
  power_meter:   { serviceType: "bijli",      issue: "Power outage detected by smart meter", urgency: "medium" },
  ration_scale:  { serviceType: "ration",     issue: "Ration shop scale reports stock shortage", urgency: "medium" },
};

const buildRequestFromSensorEvent = (event) => {
  const mapping = SENSOR_TO_SERVICE[event.sensorType] || {
    serviceType: "unknown", issue: `Unrecognised sensor event: ${event.sensorType}`, urgency: "low",
  };

  return {
    phone: event.deviceId || "unknown-device",
    voiceTranscript: `[IoT event] ${event.sensorType} = ${event.value}`,
    detectedLanguage: "hi",
    serviceType: mapping.serviceType,
    intent: mapping.issue,
    extractedData: { rawValue: event.value, urgency: mapping.urgency, sensorType: event.sensorType },
    formData: { gpsLat: event.gps?.lat || "", gpsLng: event.gps?.lng || "", deviceId: event.deviceId },
    status: "pending",
    sourceDevice: "arduino_uno_q",
    aiComputeMode: "edge-local", // no LLM needed — rule-based mapping is edge-native
    voiceReply: `${mapping.issue}. स्वचालित रूप से दर्ज कर लिया गया है।`,
  };
};

module.exports = { buildRequestFromSensorEvent };
