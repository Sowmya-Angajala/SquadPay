// const { User, Group, GroupMember, Expense, ExpenseParticipant, Settlement } =
//   require("../models");
// const { Op } = require("sequelize");

// async function getMe(userId) {
//   return User.findByPk(userId, { attributes: ["id", "name", "email", "firebaseUid"] });
// }

// async function computeNetBalances(filter = {}) {
//   const { groupId } = filter;

//   const expenseWhere = {};
//   const settlementWhere = {};

//   if (groupId) {
//     expenseWhere.groupId = groupId;
//     settlementWhere.groupId = groupId;
//   }

//   const net = {};

//   const expenses = await Expense.findAll({
//     where: expenseWhere,
//     include: [{ model: ExpenseParticipant }],
//   });

//   for (const exp of expenses) {
//     const payerId = exp.paidBy;
//     for (const part of exp.ExpenseParticipants) {
//       const uId = part.userId;
//       const share = parseFloat(part.shareAmount);

//       if (uId === payerId) continue;

//       // participant owes payer
//       net[uId] = (net[uId] || 0) - share; // owes
//       net[payerId] = (net[payerId] || 0) + share; // is owed
//     }
//   }

//   const settlements = await Settlement.findAll({ where: settlementWhere });

//   for (const s of settlements) {
//     const amount = parseFloat(s.amount);
//     // fromUser paid toUser -> fromUser owes less, toUser is owed less
//     net[s.fromUserId] = (net[s.fromUserId] || 0) + amount;
//     net[s.toUserId] = (net[s.toUserId] || 0) - amount;
//   }

//   return net;
// }

// // async function getUserBalances(userId) {
// //   const netGlobal = await computeNetBalances({});

// //   const youOwe = [];
// //   const owesYou = [];

// //   for (const [otherId, balance] of Object.entries(netGlobal)) {
// //     const id = parseInt(otherId);
// //     if (id === userId) continue;
// //   }

// //   // Compute pairwise owed/owes for the current user
// //   // For simplicity, recompute using all expenses and settlements and track pairwise

// //   // Pairwise balances: from -> to = amount (from owes to)
// //   const pairwise = {};

// //   const expenses = await Expense.findAll({
// //     include: [{ model: ExpenseParticipant }],
// //   });

// //   function key(a, b) {
// //     return `${a}-${b}`;
// //   }

// //   for (const exp of expenses) {
// //     const payerId = exp.paidBy;
// //     for (const part of exp.ExpenseParticipants) {
// //       const uId = part.userId;
// //       const share = parseFloat(part.shareAmount);
// //       if (uId === payerId) continue;

// //       // uId owes payerId
// //       const k = key(uId, payerId);
// //       pairwise[k] = (pairwise[k] || 0) + share;
// //     }
// //   }

// //   const settlements = await Settlement.findAll();
// //   for (const s of settlements) {
// //     const from = s.fromUserId;
// //     const to = s.toUserId;
// //     const amount = parseFloat(s.amount);

// //     const k = key(from, to);
// //     pairwise[k] = (pairwise[k] || 0) - amount; // reduce debt

// //     if (pairwise[k] < 0.01) delete pairwise[k];
// //   }

// //   const userYouOwe = [];
// //   const userOwesYou = [];

// //   for (const [k, amount] of Object.entries(pairwise)) {
// //     const [fromStr, toStr] = k.split("-");
// //     const from = parseInt(fromStr);
// //     const to = parseInt(toStr);

// //     if (from === userId) {
// //       userYouOwe.push({ toUserId: to, amount: parseFloat(amount.toFixed(2)) });
// //     } else if (to === userId) {
// //       userOwesYou.push({ fromUserId: from, amount: parseFloat(amount.toFixed(2)) });
// //     }
// //   }

// //   return {
// //     youOwe: userYouOwe,
// //     owesYou: userOwesYou,
// //   };
// // }


// async function getUserBalances(userId) {
//   // Get all expense splits where user is a participant
//   const splits = await ExpenseParticipant.findAll({
//     include: [{ model: Expense }]
//   });

//   const youOwe = {};     // what current user owes to others
//   const owesYou = {};    // what others owe to current user

//   for (const part of splits) {
//     const share = parseFloat(part.shareAmount);
//     const payerId = part.Expense.paidBy;

//     if (payerId === part.userId) continue; // payer never owes themselves

//     // Case 1: CURRENT USER owes someone else
//     if (part.userId === userId) {
//       youOwe[payerId] = (youOwe[payerId] || 0) + share;
//     }

//     // Case 2: Someone else owes CURRENT USER
//     if (payerId === userId) {
//       owesYou[part.userId] = (owesYou[part.userId] || 0) + share;
//     }
//   }

//   // Convert objects into arrays
//   const finalYouOwe = Object.entries(youOwe).map(([toUserId, amount]) => ({
//     toUserId: parseInt(toUserId),
//     amount: parseFloat(amount.toFixed(2))
//   }));

//   const finalOwesYou = Object.entries(owesYou).map(([fromUserId, amount]) => ({
//     fromUserId: parseInt(fromUserId),
//     amount: parseFloat(amount.toFixed(2))
//   }));

//   return {
//     youOwe: finalYouOwe,
//     owesYou: finalOwesYou
//   };
// }


// module.exports = {
//   getMe,
//   getUserBalances,
//   computeNetBalances,
// };



const { User, Expense, ExpenseParticipant, Settlement } = require("../models");

// ---------- BASIC PROFILE ----------

async function getMe(userId) {
  return User.findByPk(userId, {
    attributes: ["id", "name", "email", "firebaseUid"],
  });
}

// ---------- INTERNAL HELPER: BUILD PAIRWISE DEBTS ----------
// pairwise[fromUserId-toUserId] = amount (from owes to)

async function buildPairwiseDebts(filter = {}) {
  const { groupId } = filter;

  const expenseWhere = {};
  const settlementWhere = {};

  if (groupId) {
    expenseWhere.groupId = groupId;
    settlementWhere.groupId = groupId;
  }

  const pairwise = {};

  function key(a, b) {
    return `${a}-${b}`;
  }

  // 1) From expenses: who owes whom how much
  const expenses = await Expense.findAll({
    where: expenseWhere,
    include: [{ model: ExpenseParticipant }],
  });

  for (const exp of expenses) {
    const payerId = exp.paidBy;
    for (const part of exp.ExpenseParticipants) {
      const uId = part.userId;
      const share = parseFloat(part.shareAmount);

      if (uId === payerId) continue; // payer doesn't owe themselves

      // uId owes payerId
      const k = key(uId, payerId);
      pairwise[k] = (pairwise[k] || 0) + share;
    }
  }

  // 2) Apply settlements: payments reduce debts
  const settlements = await Settlement.findAll({ where: settlementWhere });

  for (const s of settlements) {
    const from = s.fromUserId;
    const to = s.toUserId;
    const amount = parseFloat(s.amount);

    const k = key(from, to);
    pairwise[k] = (pairwise[k] || 0) - amount; // reduce the amount owed

    // if debt fully settled (or tiny rounding left), remove it
    if (pairwise[k] <= 0.01) {
      delete pairwise[k];
    }
  }

  return pairwise; // map: "from-to" -> amount
}

// ---------- GLOBAL / GROUP NET BALANCES (for simplification) ----------

async function computeNetBalances(filter = {}) {
  const pairwise = await buildPairwiseDebts(filter);
  const net = {};

  for (const [k, amount] of Object.entries(pairwise)) {
    const [fromStr, toStr] = k.split("-");
    const from = parseInt(fromStr);
    const to = parseInt(toStr);
    const val = parseFloat(amount);

    // from owes "val" to "to"
    net[from] = (net[from] || 0) - val; // negative (owes)
    net[to] = (net[to] || 0) + val;     // positive (is owed)
  }

  return net; // { userId: netAmount }
}

// ---------- PER-USER BALANCES (youOwe / owesYou) ----------

async function getUserBalances(userId, filter = {}) {
  const pairwise = await buildPairwiseDebts(filter);

  const youOwe = [];
  const owesYou = [];

  for (const [k, amount] of Object.entries(pairwise)) {
    const [fromStr, toStr] = k.split("-");
    const from = parseInt(fromStr);
    const to = parseInt(toStr);
    const val = parseFloat(amount.toFixed(2));

    if (from === userId) {
      // current user owes somebody
      youOwe.push({ toUserId: to, amount: val });
    } else if (to === userId) {
      // somebody owes current user
      owesYou.push({ fromUserId: from, amount: val });
    }
  }

  return {
    youOwe,
    owesYou,
  };
}

module.exports = {
  getMe,
  getUserBalances,
  computeNetBalances,
};
