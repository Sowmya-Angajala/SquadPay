const expenseService = require("../services/expenseService");

async function createExpense(req, res, next) {
  try {
    const expense = await expenseService.createExpense(req.user.id, req.body);
    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
}

async function getGroupExpenses(req, res, next) {
  try {
    const groupId = parseInt(req.params.groupId);
    const expenses = await expenseService.getGroupExpenses(req.user.id, groupId);
    res.json(expenses);
  } catch (err) {
    next(err);
  }
}

async function updateExpense(req, res, next) {
  try {
    const expenseId = parseInt(req.params.expenseId);
    const expense = await expenseService.updateExpense(req.user.id, expenseId, req.body);
    res.json(expense);
  } catch (err) {
    next(err);
  }
}

async function deleteExpense(req, res, next) {
  try {
    const expenseId = parseInt(req.params.expenseId);
    await expenseService.deleteExpense(req.user.id, expenseId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createExpense,
  getGroupExpenses,
  updateExpense,
  deleteExpense,
};
