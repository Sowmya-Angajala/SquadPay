const { Settlement, GroupMember } = require("../models");
const { requireFields } = require("../utils/validation");

async function validateGroupAccess(userId, groupId) {
  if (!groupId) return;
  const membership = await GroupMember.findOne({ where: { groupId, userId } });
  if (!membership) {
    const err = new Error("You are not a member of this group");
    err.status = 403;
    throw err;
  }
}

async function createSettlement(currentUserId, body) {
  requireFields(body, ["fromUserId", "toUserId", "amount"]);

  const { fromUserId, toUserId, amount, groupId, note } = body;

  await validateGroupAccess(currentUserId, groupId);

  const settlement = await Settlement.create({
    groupId: groupId || null,
    fromUserId,
    toUserId,
    amount: parseFloat(amount),
    createdBy: currentUserId,
    note: note || null,
  });

  return settlement;
}

async function getGroupSettlements(currentUserId, groupId) {
  await validateGroupAccess(currentUserId, groupId);

  const settlements = await Settlement.findAll({
    where: { groupId },
  });

  return settlements;
}

module.exports = {
  createSettlement,
  getGroupSettlements,
};
