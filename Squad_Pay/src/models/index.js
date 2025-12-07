const sequelize = require("../config/db");
const User = require("./User");
const Group = require("./Group");
const GroupMember = require("./GroupMember");
const Expense = require("./Expense");
const ExpenseParticipant = require("./ExpenseParticipant");
const Settlement = require("./Settlement");

// Associations

User.hasMany(Group, { foreignKey: "createdBy" });
Group.belongsTo(User, { as: "creator", foreignKey: "createdBy" });

Group.belongsToMany(User, { through: GroupMember, foreignKey: "groupId" });
User.belongsToMany(Group, { through: GroupMember, foreignKey: "userId" });

GroupMember.belongsTo(Group, { foreignKey: "groupId" });
GroupMember.belongsTo(User, { foreignKey: "userId" });

Expense.belongsTo(User, { as: "creator", foreignKey: "createdBy" });
Expense.belongsTo(User, { as: "payer", foreignKey: "paidBy" });
Expense.belongsTo(Group, { foreignKey: "groupId" });

Expense.hasMany(ExpenseParticipant, { foreignKey: "expenseId" });
ExpenseParticipant.belongsTo(Expense, { foreignKey: "expenseId" });
ExpenseParticipant.belongsTo(User, { foreignKey: "userId" });

Settlement.belongsTo(User, { as: "fromUser", foreignKey: "fromUserId" });
Settlement.belongsTo(User, { as: "toUser", foreignKey: "toUserId" });
Settlement.belongsTo(Group, { foreignKey: "groupId" });
Settlement.belongsTo(User, { as: "creator", foreignKey: "createdBy" });

module.exports = {
  sequelize,
  User,
  Group,
  GroupMember,
  Expense,
  ExpenseParticipant,
  Settlement,
};
