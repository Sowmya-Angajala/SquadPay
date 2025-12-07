const settlementService = require("../services/settlementService");

async function createSettlement(req, res, next) {
  try {
    const settlement = await settlementService.createSettlement(req.user.id, req.body);
    res.status(201).json(settlement);
  } catch (err) {
    next(err);
  }
}

async function getGroupSettlements(req, res, next) {
  try {
    const groupId = parseInt(req.params.groupId);
    const settlements = await settlementService.getGroupSettlements(
      req.user.id,
      groupId
    );
    res.json(settlements);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createSettlement,
  getGroupSettlements,
};
