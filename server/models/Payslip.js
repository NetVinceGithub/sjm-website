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
    ecode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "employee_id",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    project: {
      type: DataTypes.STRING,
      defaultValue: "N/A",
    },
    department: {
      type: DataTypes.STRING,
      defaultValue: "N/A",
    },
    position: {
      type: DataTypes.STRING,
      defaultValue: "N/A",
    },
    schedule: {
      type: DataTypes.STRING,
      defaultValue: "N/A",
    },
    cutoffDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payrollType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    batchId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Rates & base pay
    dailyrate: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    basicPay: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    noOfDays: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },

    // Holiday fields
    holidayDays: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    regularDays: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    specialHolidayDays: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    regularHolidayDays: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    specialNonWorkingHolidayDays: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },

    // Overtime fields
    overtimePay: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    totalOvertime: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    regularOvertime: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    holidayOvertime: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },

    // Hours
    totalRegularHours: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    totalHolidayHours: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    specialHolidayHours: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    regularHolidayHours: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },

    // Holiday pay
    holidayPay: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
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
    nightDifferential: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    nightShiftHours: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },

    nightDifferentialOT: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
      field: "night_differential_ot",
    },

    nightShiftOTHours: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
      field: "night_shift_ot_hours",
    },

    // Allowances
    allowance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },

    // Government contributions
    sss: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    sssEmployerShare: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    sssEC: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    sssTotalContribution: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    phic: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    hdmf: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },

    // Loans
    loan: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    sssLoan: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    pagibigLoan: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },

    // Deductions
    totalTardiness: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    totalHours: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    otherDeductions: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    taxDeduction: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    underTime: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    cashAdvance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },

    // Totals
    totalEarnings: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    totalDeductions: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    adjustment: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    gross_pay: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    netPay: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },

    // Extra fields for employee information
    shiftHours: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 4.5,
    },
    employmentRank: {
      type: DataTypes.STRING,
      defaultValue: "N/A",
    },
    isRankAndFile: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    cutoffPeriod: {
      type: DataTypes.STRING,
      defaultValue: "N/A",
    },

    // System fields
    requestedBy: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    requestedByName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM("approved", "pending", "released", "draft"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "payslips",
    underscored: true,
    timestamps: false,
    // Add indexes for better performance
    indexes: [
      {
        fields: ["ecode"],
      },
      {
        fields: ["batchId"],
      },
      {
        fields: ["cutoffDate"],
      },
      {
        fields: ["status"],
      },
    ],
  }
);

// Define associations if needed
Payslip.belongsTo(Employee, {
  foreignKey: "employeeId",
  as: "employee",
});

export default Payslip;
