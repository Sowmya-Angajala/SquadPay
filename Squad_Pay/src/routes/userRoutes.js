const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/me", userController.getMe);
router.get("/me/balances", userController.getMyBalances);
router.get("/simplify", userController.getSimplifiedDebts); // ?groupId= optional

module.exports = router;
