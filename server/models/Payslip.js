import { DataTypes } from "sequelize";
import db from "../db/db.js"; // Ensure this points to your MySQL connection
import Employee from "./Employee.js";

const Payslip = db.define(
  "Payslip",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ecode: DataTypes.STRING,
    email: DataTypes.STRING,
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "employee_id",
    },
    name: DataTypes.STRING,
    project: DataTypes.STRING,
    department: DataTypes.STRING,
    position: DataTypes.STRING,
    schedule: DataTypes.STRING,
    cutoffDate: DataTypes.STRING,
    batchId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dailyrate: DataTypes.DECIMAL(10, 2),
    basicPay: DataTypes.DECIMAL(10, 2),
    noOfDays: DataTypes.INTEGER,
    holidayDays: DataTypes.INTEGER,
    regularDays: DataTypes.INTEGER,

    // Holiday-specific fields
    specialHolidayDays: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    regularHolidayDays: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    specialNonWorkingHolidayDays: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    // Overtime fields
    overtimePay: DataTypes.DECIMAL(10, 2),
    totalOvertime: DataTypes.DECIMAL(10, 2),
    totalRegularHours: DataTypes.INTEGER,
    totalHolidayHours: DataTypes.INTEGER,
    specialHolidayHours: DataTypes.DECIMAL(10, 2),
    regularHolidayHours: DataTypes.DECIMAL(10, 2),

    // Holiday pay fields
    holidayPay: DataTypes.DECIMAL(10, 2),
    specialHolidayPay: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    regularHolidayPay: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    specialHolidayOTPay: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    regularHolidayOTPay: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },

    // Night shift
    nightDifferential: DataTypes.DECIMAL(10, 2),
    nightShiftHours: DataTypes.DECIMAL(10, 2),

    // Allowances
    allowance: DataTypes.DECIMAL(10, 2),

    // Government contributions
    sss: DataTypes.DECIMAL(10, 2),
    phic: DataTypes.DECIMAL(10, 2),
    hdmf: DataTypes.DECIMAL(10, 2),

    // Loans
    loan: DataTypes.DECIMAL(10, 2), // Keep existing loan field for backward compatibility
    sssLoan: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    pagibigLoan: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },

    // Other deductions
    totalTardiness: DataTypes.DECIMAL(10, 2),
    totalHours: DataTypes.DECIMAL(10, 2),
    otherDeductions: DataTypes.DECIMAL(10, 2),
    taxDeduction: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },

    // Totals
    totalEarnings: DataTypes.DECIMAL(10, 2),
    totalDeductions: DataTypes.DECIMAL(10, 2),
    adjustment: DataTypes.DECIMAL(10, 2),
    gross_pay: DataTypes.DECIMAL(10, 2),
    netPay: DataTypes.DECIMAL(10, 2),

    // System fields
    requestedBy: DataTypes.STRING(25),
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM("draft", "pending", "released"),
      defaultValue: "draft",
    },
  },
  {
    tableName: "payslips",
    underscored: true,
    timestamps: false,
  }
);

export default Payslip;
