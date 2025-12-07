const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Settlement = sequelize.define(
  "Settlement",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    groupId: { type: DataTypes.INTEGER, allowNull: true },
    fromUserId: { type: DataTypes.INTEGER, allowNull: false },
    toUserId: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    createdBy: { type: DataTypes.INTEGER, allowNull: false },
    note: { type: DataTypes.STRING, allowNull: true },
  },
  { tableName: "settlements", timestamps: true }
);

module.exports = Settlement;
