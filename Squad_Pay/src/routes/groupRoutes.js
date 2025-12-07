const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");

router.post("/", groupController.createGroup);
router.get("/", groupController.getMyGroups);
router.get("/:groupId/members", groupController.getGroupMembers);
router.post("/:groupId/members", groupController.addMember);
router.delete("/:groupId/members/:userId", groupController.removeMember);

module.exports = router;
