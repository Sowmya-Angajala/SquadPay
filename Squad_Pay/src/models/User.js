const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    firebaseUid: { type: DataTypes.STRING, unique: true, allowNull: false },
    name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    fcmToken: { type: DataTypes.STRING, allowNull: true },
  },
  { tableName: "users", timestamps: true }
);

module.exports = User;
