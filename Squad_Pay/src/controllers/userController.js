// const userService = require("../services/userService");
// const { simplifyDebts } = require("../utils/debtSimplification");

// async function getMe(req, res, next) {
//   try {
//     const user = await userService.getMe(req.user.id);
//     res.json(user);
//   } catch (err) {
//     next(err);
//   }
// }

// async function getMyBalances(req, res, next) {
//   try {
//     const balances = await userService.getUserBalances(req.user.id);
//     res.json(balances);
//   } catch (err) {
//     next(err);
//   }
// }

// async function getSimplifiedDebts(req, res, next) {
//   try {
//     const { groupId } = req.query;

//     const net = await userService.computeNetBalances({
//       groupId: groupId ? parseInt(groupId) : undefined,
//     });

//     const simplified = simplifyDebts(net);

//     res.json({
//       netBalances: net,
//       simplifiedPayments: simplified,
//     });
//   } catch (err) {
//     next(err);
//   }
// }

// module.exports = {
//   getMe,
//   getMyBalances,
//   getSimplifiedDebts,
// };


const userService = require("../services/userService");
const { simplifyDebts } = require("../utils/debtSimplification");

async function getMe(req, res, next) {
  try {
    const user = await userService.getMe(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

// GET /api/users/me/balances
// optional: ?groupId=1
async function getMyBalances(req, res, next) {
  try {
    const groupId = req.query.groupId ? parseInt(req.query.groupId) : undefined;

    const balances = await userService.getUserBalances(req.user.id, {
      groupId,
    });

    res.json(balances);
  } catch (err) {
    next(err);
  }
}

// GET /api/users/simplify          (global)
// GET /api/users/simplify?groupId=1 (group-level)
async function getSimplifiedDebts(req, res, next) {
  try {
    const groupId = req.query.groupId ? parseInt(req.query.groupId) : undefined;

    const net = await userService.computeNetBalances({
      groupId,
    });

    const simplified = simplifyDebts(net);

    res.json({
      scope: groupId ? "group" : "global",
      groupId: groupId || null,
      netBalances: net,
      simplifiedPayments: simplified,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMe,
  getMyBalances,
  getSimplifiedDebts,
};

