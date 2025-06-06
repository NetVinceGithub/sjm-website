import { DataTypes } from "sequelize"
import db from "../db/db.js"; // Ensure this points to your MySQL connection
import Employee from "./Employee.js"

const Payslip = db.define("Payslip", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  ecode: DataTypes.STRING,
  email: DataTypes.STRING,
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "employee_id"
  },
  name: DataTypes.STRING,
  project: DataTypes.STRING,
  department: DataTypes.STRING,
  position: DataTypes.STRING,
  cutoffDate: DataTypes.STRING,
  batchId: {                            // 👈 NEW FIELD
    type: DataTypes.STRING,
    allowNull: false
  },
  dailyrate: DataTypes.DECIMAL(10, 2),
  basicPay: DataTypes.DECIMAL(10, 2),
  noOfDays: DataTypes.INTEGER,
  holidayDays: DataTypes.INTEGER,
  regularDays: DataTypes.INTEGER,
  overtimePay: DataTypes.DECIMAL(10, 2),
  totalOvertime: DataTypes.DECIMAL(10, 2),
  totalRegularHours: DataTypes.INTEGER, 
  totalHolidayHours: DataTypes.INTEGER,
  holidayPay: DataTypes.DECIMAL(10, 2),
  nightDifferential: DataTypes.DECIMAL(10, 2),
  allowance: DataTypes.DECIMAL(10, 2),
  sss: DataTypes.DECIMAL(10, 2),
  phic: DataTypes.DECIMAL(10, 2),
  hdmf: DataTypes.DECIMAL(10, 2),
  loan: DataTypes.DECIMAL(10, 2),
  totalTardiness: DataTypes.DECIMAL(10, 2),
  totalHours: DataTypes.DECIMAL(10, 2),
  otherDeductions: DataTypes.DECIMAL(10, 2),
  totalEarnings: DataTypes.DECIMAL(10, 2),
  totalDeductions: DataTypes.DECIMAL(10, 2),
  adjustment: DataTypes.DECIMAL(10, 2),
  gross_pay: DataTypes.DECIMAL(10, 2),
  netPay: DataTypes.DECIMAL(10, 2),
  requestedBy: DataTypes.STRING(25),
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM("draft", "pending", "released"),
    defaultValue: "draft"
  }
}, {
  tableName: "payslips",
  underscored: true,
  timestamps: false
});


export default Payslip;

  
