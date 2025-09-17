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
      defaultValue: 0.00,
    },
    basicPay: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    noOfDays: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },

    // Holiday fields
    holidayDays: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    regularDays: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    specialHolidayDays: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    regularHolidayDays: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    specialNonWorkingHolidayDays: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },

    // Overtime fields
    overtimePay: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    totalOvertime: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    regularOvertime: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    holidayOvertime: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },

    // Hours
    totalRegularHours: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    totalHolidayHours: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    specialHolidayHours: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    regularHolidayHours: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },

    // Holiday pay
    holidayPay: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    specialHolidayPay: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    regularHolidayPay: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    specialHolidayOTPay: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    regularHolidayOTPay: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },

    // Night shift
    nightDifferential: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    nightShiftHours: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },

    // Allowances
    allowance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },

    // Government contributions
    sss: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    sssEmployerShare: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    sssEC: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    sssTotalContribution: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    phic: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    hdmf: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },

    // Loans
    loan: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    sssLoan: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    pagibigLoan: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },

    // Deductions
    totalTardiness: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    totalHours: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    otherDeductions: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    taxDeduction: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },

    // Totals
    totalEarnings: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    totalDeductions: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    adjustment: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    gross_pay: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    netPay: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },

    // Extra fields for employee information
    shiftHours: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 4.50,
    },
    employmentRank: {
      type: DataTypes.STRING,
      defaultValue: "N/A",
    },
    isRankAndFile: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    // System fields
    requestedBy: {
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
        fields: ['ecode']
      },
      {
        fields: ['batchId']
      },
      {
        fields: ['cutoffDate']
      },
      {
        fields: ['status']
      }
    ]
  }
);

// Define associations if needed
Payslip.belongsTo(Employee, {
  foreignKey: 'employeeId',
  as: 'employee'
});

export default Payslip;