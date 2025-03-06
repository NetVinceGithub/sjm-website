import { DataTypes } from "sequelize";
import sequelize from "../db/db.js"; // Ensure correct database import

const Connect = sequelize.define("Connect", {
  firstname: { type: DataTypes.STRING, allowNull: false },
  surname: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  services: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false }
}, {
  timestamps: true
});

export default Connect;
