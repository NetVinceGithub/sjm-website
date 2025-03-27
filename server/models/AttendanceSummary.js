import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";


const AttendanceSummary = sequelize.define("AttendanceSummary", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  ecode: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  totalTardiness: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
  },
  totalHours: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.0,
  },
  totalOvertime: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.0,
  },
  daysPresent: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0, // New column to track attendance days
  },
}, {
  tableName: "attendancesummary", // Matches your MySQL table name
  timestamps: false, // Disables `createdAt` and `updatedAt`
});

export default AttendanceSummary;

