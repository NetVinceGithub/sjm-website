import { DataTypes } from "sequelize";
import sequelize from "../db/db.js"; // Ensure this points to your MySQL connection

const PayslipHistory = sequelize.define("PayslipHistory", {
  ecode: { type: DataTypes.STRING, allowNull: false },
  employeeId: { type: DataTypes.INTEGER, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  position: { type: DataTypes.STRING, defaultValue: "N/A" },
  project: { type: DataTypes.STRING, defaultValue: "N/A" },
  cutoffDate: { type: DataTypes.STRING, defaultValue: "N/A" },
  allowance: { type: DataTypes.FLOAT, defaultValue: 0 },
  basicPay: { type: DataTypes.FLOAT, defaultValue: 0 },
  overtimePay: { type: DataTypes.FLOAT, defaultValue: 0 },
  holidayPay: { type: DataTypes.FLOAT, defaultValue: 0 },
  totalDeductions: { type: DataTypes.FLOAT, defaultValue: 0 },
  netPay: { type: DataTypes.FLOAT, defaultValue: 0 },
});


export default PayslipHistory;
