// Fixed AttendanceSummary Model
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
    unique: true, // Ensure one record per employee
  },
  // Changed from daysPresent to presentDays to match frontend
  presentDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  totalDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  absentDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  lateDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  totalLateMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  // Added shift-specific day counts to match frontend
  dayShiftDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  eveningShiftDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  nightShiftDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  regularHoursDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  attendanceRate: {
    type: DataTypes.DECIMAL(5, 2), // Up to 999.99%
    allowNull: false,
    defaultValue: 0.00,
  },
}, {
  tableName: "attendancesummary",
  timestamps: true, // Enable timestamps for tracking when records are created/updated
  indexes: [
    {
      unique: true,
      fields: ['ecode']
    }
  ]
});

export default AttendanceSummary;