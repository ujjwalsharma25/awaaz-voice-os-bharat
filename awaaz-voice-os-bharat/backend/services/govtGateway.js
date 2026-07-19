/* Mock Government Service Gateway
   Simulates standardized UMANG / DigiLocker open-data API schemas.
   Replace each function body with real API calls when available.   */

const MOCK_DELAY = 800; // simulate network

const submitToGovt = async (serviceType, formData) => {
  await new Promise((r) => setTimeout(r, MOCK_DELAY));
  const refNo = "GOVT" + Date.now().toString().slice(-8);
  console.log(`[GovtGateway Mock] Submitted ${serviceType} → ref: ${refNo}`);
  return {
    success: true, referenceNumber: refNo,
    message: `Your ${serviceType} request has been submitted to the government portal.`,
    estimatedResolutionDays: { ration:3, hospital:1, pension:15, documents:7,
      pm_kisan:10, scholarship:30, bijli:2, jal_jeevan:5,
      mnrega:3, anganwadi:2, pm_awaas:45, emergency:0, unknown:7 }[serviceType] || 7,
    mockMode: true,
  };
};

const checkStatus = async (referenceNumber) => {
  await new Promise((r) => setTimeout(r, 400));
  return { referenceNumber, status: "processing",
    lastUpdated: new Date().toISOString(), mockMode: true };
};

module.exports = { submitToGovt, checkStatus };
