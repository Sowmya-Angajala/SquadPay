const express = require("express");
const router = express.Router();
const settlementController = require("../controllers/settlementController");

router.post("/", settlementController.createSettlement);
router.get("/group/:groupId", settlementController.getGroupSettlements);

module.exports = router;
