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
    payrollType: DataTypes.STRING, 
    batchId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Rates & base pay
    dailyrate: DataTypes.DECIMAL(10, 2),
    basicPay: DataTypes.DECIMAL(10, 2),
    noOfDays: DataTypes.DECIMAL(10, 2),

    // Holiday fields
    holidayDays: DataTypes.DECIMAL(10, 2),
    regularDays: DataTypes.DECIMAL(10, 2),
    specialHolidayDays: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
    regularHolidayDays: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
    specialNonWorkingHolidayDays: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },

    // Overtime fields
    overtimePay: DataTypes.DECIMAL(10, 2),
    totalOvertime: DataTypes.DECIMAL(10, 2),
    regularOvertime: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
    holidayOvertime: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },

    // Hours
    totalRegularHours: DataTypes.DECIMAL(10, 2),
    totalHolidayHours: DataTypes.DECIMAL(10, 2),
    specialHolidayHours: DataTypes.DECIMAL(10, 2),
    regularHolidayHours: DataTypes.DECIMAL(10, 2),

    // Holiday pay
    holidayPay: DataTypes.DECIMAL(10, 2),
    specialHolidayPay: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
    regularHolidayPay: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
    specialHolidayOTPay: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
    regularHolidayOTPay: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },

    // Night shift
    nightDifferential: DataTypes.DECIMAL(10, 2),
    nightShiftHours: DataTypes.DECIMAL(10, 2),

    // Allowances
    allowance: DataTypes.DECIMAL(10, 2),

    // Government contributions
    sss: DataTypes.DECIMAL(10, 2),
    sssEmployerShare: DataTypes.DECIMAL(10, 2),
    sssEC: DataTypes.DECIMAL(10, 2),
    sssTotalContribution: DataTypes.DECIMAL(10, 2),
    phic: DataTypes.DECIMAL(10, 2),
    hdmf: DataTypes.DECIMAL(10, 2),

    // Loans
    loan: DataTypes.DECIMAL(10, 2), // backward compatibility
    sssLoan: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
    pagibigLoan: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },

    // Deductions
    totalTardiness: DataTypes.DECIMAL(10, 2),
    totalHours: DataTypes.DECIMAL(10, 2),
    otherDeductions: DataTypes.DECIMAL(10, 2),
    taxDeduction: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },

    // Totals
    totalEarnings: DataTypes.DECIMAL(10, 2),
    totalDeductions: DataTypes.DECIMAL(10, 2),
    adjustment: DataTypes.DECIMAL(10, 2),
    gross_pay: DataTypes.DECIMAL(10, 2),
    netPay: DataTypes.DECIMAL(10, 2),

    // Extra fields
    shiftHours: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
    employmentRank: { type: DataTypes.STRING, defaultValue: "N/A" },
    isRankAndFile: { type: DataTypes.BOOLEAN, defaultValue: true },

    // System fields
    requestedBy: DataTypes.STRING(25),
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    status: {
      type: DataTypes.ENUM("approved", "pending", "released", "draft"),
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
