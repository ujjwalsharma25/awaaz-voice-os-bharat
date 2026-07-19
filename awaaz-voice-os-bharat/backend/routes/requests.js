const express = require("express");
const router  = express.Router();
const { getAllRequests, getStatus, sendFollowUps } = require("../controllers/requestController");

router.get("/",                 getAllRequests);
router.get("/status/:refNo",    getStatus);
router.post("/followup",        sendFollowUps);

module.exports = router;
