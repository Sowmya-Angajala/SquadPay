const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Expense = sequelize.define(
  "Expense",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    description: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    groupId: { type: DataTypes.INTEGER, allowNull: true },
    createdBy: { type: DataTypes.INTEGER, allowNull: false },
    paidBy: { type: DataTypes.INTEGER, allowNull: false },
    splitType: {
      type: DataTypes.ENUM("EQUAL", "EXACT", "PERCENT"),
      allowNull: false,
    },
  },
  { tableName: "expenses", timestamps: true }
);

module.exports = Expense;
