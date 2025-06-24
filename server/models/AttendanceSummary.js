// Updated AttendanceSummary Model with fractional days support
import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";

const AttendanceSummary = sequelize.define(
  "AttendanceSummary",
  {
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
    // Changed to DECIMAL to support fractional days (0.5, 1.0, etc.)
    presentDays: {
      type: DataTypes.DECIMAL(10, 2), // Supports up to 99999999.99 with 2 decimal places
      allowNull: false,
      defaultValue: 0,
    },
    totalDays: {
      type: DataTypes.DECIMAL(10, 2), // Also support fractional total days
      allowNull: false,
      defaultValue: 0,
    },
    absentDays: {
      type: DataTypes.DECIMAL(10, 2), // Support fractional absent days
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
    // Updated shift-specific day counts to support fractional days
    dayShiftDays: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    eveningShiftDays: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    nightShiftDays: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    regularHoursDays: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    attendanceRate: {
      type: DataTypes.DECIMAL(5, 2), // Up to 999.99%
      allowNull: false,
      defaultValue: 0.0,
    },
  },

  {
    tableName: "attendancesummary",
    timestamps: true, // Enable timestamps for tracking when records are created/updated
    indexes: [
      {
        unique: true,
        fields: ["ecode"],
      },
    ],
  }
);

export default AttendanceSummary;