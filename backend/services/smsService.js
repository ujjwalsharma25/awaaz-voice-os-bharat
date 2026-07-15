/* Twilio SMS / WhatsApp follow-up service
   Production: npm install twilio  → uncomment real code below  */
const sendSMS = async (to, message) => {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_PHONE_NUMBER;

  if (!sid || sid === "your_twilio_sid") {
    console.log(`[SMS Mock] To: ${to}\nMessage: ${message}`);
    return { success: true, mode: "mock", sid: "MOCK_SID_" + Date.now() };
  }
  /* ---- REAL Twilio (uncomment when credentials added) ----
  const twilio = require("twilio")(sid, token);
  const msg = await twilio.messages.create({ body: message, from, to });
  return { success: true, mode: "twilio", sid: msg.sid };
  --------------------------------------------------------- */
};

const sendFollowUp = async (phone, referenceNumber, status, serviceType) => {
  const msg =
    `AWAAZ सेवा अपडेट\nRef: ${referenceNumber}\n` +
    `सेवा: ${serviceType.toUpperCase()}\nस्थिति: ${status.toUpperCase()}\n` +
    `जानकारी के लिए 1800-XXX-XXXX पर कॉल करें। - AWAAZ टीम`;
  return sendSMS(`+91${phone}`, msg);
};

module.exports = { sendSMS, sendFollowUp };
