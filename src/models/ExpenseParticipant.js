const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ExpenseParticipant = sequelize.define(
  "ExpenseParticipant",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    expenseId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    shareAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  },
  { tableName: "expense_participants", timestamps: true }
);

module.exports = ExpenseParticipant;
