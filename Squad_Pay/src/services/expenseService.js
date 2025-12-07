const {
  Expense,
  ExpenseParticipant,
  GroupMember,
  User,
} = require("../models");
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

async function createExpense(currentUserId, body) {
  requireFields(body, ["description", "amount", "splitType", "paidBy", "participants"]);

  const { description, amount, groupId, splitType, paidBy, participants } = body;

  await validateGroupAccess(currentUserId, groupId);

  if (!Array.isArray(participants) || participants.length === 0) {
    const err = new Error("Participants array is required");
    err.status = 400;
    throw err;
  }

  // Ensure all participants are valid users (simple check)
  const userIds = participants.map((p) => p.userId);
  const users = await User.findAll({ where: { id: userIds } });
  if (users.length !== userIds.length) {
    const err = new Error("Some participants are invalid users");
    err.status = 400;
    throw err;
  }

  // If group, ensure all participants are in group
  if (groupId) {
    const members = await GroupMember.findAll({ where: { groupId } });
    const memberIds = new Set(members.map((m) => m.userId));
    for (const u of userIds) {
      if (!memberIds.has(u)) {
        const err = new Error("All participants must be members of the group");
        err.status = 400;
        throw err;
      }
    }
  }

  const totalAmount = parseFloat(amount);

  let computedParticipants = [];

  if (splitType === "EQUAL") {
    const perHead = parseFloat((totalAmount / participants.length).toFixed(2));
    computedParticipants = participants.map((p) => ({
      userId: p.userId,
      shareAmount: perHead,
    }));
  } else if (splitType === "EXACT") {
    const sum = participants.reduce((acc, p) => acc + parseFloat(p.shareAmount), 0);
    if (Math.abs(sum - totalAmount) > 0.01) {
      const err = new Error("Sum of EXACT shares must equal total amount");
      err.status = 400;
      throw err;
    }
    computedParticipants = participants.map((p) => ({
      userId: p.userId,
      shareAmount: parseFloat(p.shareAmount),
    }));
  } else if (splitType === "PERCENT") {
    const sum = participants.reduce((acc, p) => acc + parseFloat(p.percent), 0);
    if (Math.abs(sum - 100) > 0.01) {
      const err = new Error("Sum of PERCENT must be 100");
      err.status = 400;
      throw err;
    }
    computedParticipants = participants.map((p) => ({
      userId: p.userId,
      shareAmount: parseFloat(((p.percent / 100) * totalAmount).toFixed(2)),
    }));
  } else {
    const err = new Error("Invalid splitType");
    err.status = 400;
    throw err;
  }

  const expense = await Expense.create({
    description,
    amount: totalAmount,
    groupId: groupId || null,
    createdBy: currentUserId,
    paidBy,
    splitType,
  });

  for (const p of computedParticipants) {
    await ExpenseParticipant.create({
      expenseId: expense.id,
      userId: p.userId,
      shareAmount: p.shareAmount,
    });
  }

  return expense;
}

async function getGroupExpenses(currentUserId, groupId) {
  await validateGroupAccess(currentUserId, groupId);

  const expenses = await Expense.findAll({
    where: { groupId },
    include: [
      { model: ExpenseParticipant },
      { model: User, as: "payer", attributes: ["id", "name"] },
    ],
  });

  return expenses;
}

async function updateExpense(currentUserId, expenseId, body) {
  const expense = await Expense.findByPk(expenseId, {
    include: [{ model: ExpenseParticipant }],
  });

  if (!expense) {
    const err = new Error("Expense not found");
    err.status = 404;
    throw err;
  }

  if (expense.createdBy !== currentUserId && expense.paidBy !== currentUserId) {
    const err = new Error("Only creator or payer can update this expense");
    err.status = 403;
    throw err;
  }

  // For simplicity, allow updating description and amount only here
  if (body.description) expense.description = body.description;
  if (body.amount) expense.amount = parseFloat(body.amount);

  await expense.save();

  return expense;
}

async function deleteExpense(currentUserId, expenseId) {
  const expense = await Expense.findByPk(expenseId);

  if (!expense) {
    const err = new Error("Expense not found");
    err.status = 404;
    throw err;
  }

  if (expense.createdBy !== currentUserId && expense.paidBy !== currentUserId) {
    const err = new Error("Only creator or payer can delete this expense");
    err.status = 403;
    throw err;
  }

  await ExpenseParticipant.destroy({ where: { expenseId } });
  await expense.destroy();
}

module.exports = {
  createExpense,
  getGroupExpenses,
  updateExpense,
  deleteExpense,
};
