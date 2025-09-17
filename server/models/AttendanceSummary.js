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
    
    // Basic attendance tracking with fractional support
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
    halfDays: {
      type: DataTypes.DECIMAL(10, 2), // NEW: Track half days separately
      allowNull: false,
      defaultValue: 0,
    },
    
    // Tardiness tracking
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
    
    // NEW: Undertime tracking
    totalUndertimeMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    
    // Shift-specific day counts with fractional support
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
    
    // Work hours summary
    totalWorkHours: {
      type: DataTypes.DECIMAL(12, 2), // Allow for larger totals
      allowNull: false,
      defaultValue: 0,
    },
    
    // Enhanced payroll breakdown - comprehensive tracking
    totalRegularHours: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    totalOvertimeHours: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    totalNightDifferentialHours: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    totalHolidayHours: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    totalHolidayOvertimeHours: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    totalRestDayHours: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    totalRestDayOvertimeHours: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    
    // Legacy/calculated fields
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
    createdAt: "created_at", // 👈 map Sequelize -> DB
    updatedAt: "updated_at", // 👈 map Sequelize -> DB

    indexes: [
      {
        unique: true,
        fields: ["ecode"],
      },
      {
        fields: ["attendanceRate"],
      },
      {
        fields: ["totalDays"],
      },
      {
        fields: ["presentDays"],
      }
    ],
  }
);

export default AttendanceSummary;