import { DataTypes } from "sequelize";
import sequelize from "../db/db.js"; // Ensure correct path to your database config

const Holidays = sequelize.define("holidays", { // Table name will be 'holidays'
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
}, {
  timestamps: false, // Optional: Remove `createdAt` and `updatedAt` columns
});

export default Holidays;
