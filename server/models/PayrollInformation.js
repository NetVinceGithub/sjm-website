import { DataTypes } from "sequelize";
import sequelize from "../db/db.js"; 

const PayrollInformation = sequelize.define("PayrollInformation", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Employees", key: "id" }, 
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  ecode: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  positiontitle: { type: DataTypes.STRING, defaultValue: "N/A" },
  area_section: { type: DataTypes.STRING, defaultValue: "N/A" }, 
  email: { type: DataTypes.STRING, defaultValue: "N/A" }, 
  daily_rate: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0.0 },
  overtime_pay: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0.0 },
  holiday_pay: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0.0 },
  night_differential: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0.0 },
  allowance: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0.0 },
  tardiness: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0.0 },
  tax_deduction: { type: DataTypes.FLOAT, defaultValue: 0.0 },
  sss_contribution: { type: DataTypes.FLOAT, defaultValue: 0.0 },
  pagibig_contribution: { type: DataTypes.FLOAT, defaultValue: 0.0 },
  philhealth_contribution: { type: DataTypes.FLOAT, defaultValue: 0.0 },
  loan: { type: DataTypes.FLOAT, defaultValue: 0.0 },
}, { timestamps: false });

export default PayrollInformation;
