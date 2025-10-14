import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";

const AttendanceHistory = sequelize.define('AttendanceHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ecode: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  onDuty: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'onDuty'
  },
  offDuty: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'offDuty'
  },
  workHours: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'half-day'),
    allowNull: false,
    defaultValue: 'absent'
  },
  shift: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'Unknown'
  },
  attendanceValue: {
    type: DataTypes.DECIMAL(3, 2), // Supports 0, 0.5, 1.0
    allowNull: false,
    defaultValue: 0,
  },
  isLate: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  lateMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  isHoliday: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  isRestDay: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  
  // Enhanced Payroll Breakdown Fields
  regularHours: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  overtimeHours: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  nightDifferentialHours: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  holidayHours: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  holidayOvertimeHours: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  restDayHours: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  restDayOvertimeHours: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  
  // Undertime Tracking Fields
  undertimeHours: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  undertimeMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  expectedHours: {
    type: DataTypes.DECIMAL(4, 2), // Max 99.99 hours
    allowNull: false,
    defaultValue: 8,
  },
  
  // Legacy field for backward compatibility
  ea_txndte: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  }
}, {
  tableName: 'attendancehistory',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['ecode']
    },
    {
      fields: ['date']
    },
    {
      fields: ['status']
    },
    {
      fields: ['shift']
    },
    {
      fields: ['ecode', 'date']
    },
    {
      fields: ['created_at'] // For historical tracking
    }
  ]
});

export default AttendanceHistory;