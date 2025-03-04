
import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";
import Employee from "./Employee.js"; // Ensure Employee is imported

const PayrollInformation = sequelize.define("PayrollInformation", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Employee,
      key: "id",
    },
    onDelete: "CASCADE",
  },
  ecode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  positiontitle: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  area_section: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  daily_rate: {
    type: DataTypes.FLOAT,
    defaultValue: 500,
  },
  hourly_rate: {
    type: DataTypes.FLOAT,
    defaultValue: 65,
  },
  ot_hourly_rate: {
    type: DataTypes.FLOAT,
    defaultValue: 81.25,
  },
  ot_rate_sp_holiday: {
    type: DataTypes.FLOAT,
    defaultValue: 109.85,
  },
  ot_rate_reg_holiday: {
    type: DataTypes.FLOAT,
    defaultValue: 109.85,
  },
  special_hol_rate: {
    type: DataTypes.FLOAT,
    defaultValue: 156,
  },
  regular_hol_ot_rate: {
    type: DataTypes.FLOAT,
    defaultValue: 156,
  }, 
  overtime_pay: {
    type: DataTypes.FLOAT,
    defaultValue: 100,
  },
  holiday_pay: {
    type: DataTypes.FLOAT,
    defaultValue: 200,
  },
  night_differential: {
    type: DataTypes.FLOAT,
    defaultValue: 6.50,
  },
  allowance: {
    type: DataTypes.FLOAT,
    defaultValue: 104,
  },
  tardiness: {
    type: DataTypes.FLOAT,
    defaultValue: 1.08,
  },
  tax_deduction: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  sss_contribution: {
    type: DataTypes.FLOAT,
    defaultValue: 100,
  },
  pagibig_contribution: {
    type: DataTypes.FLOAT,
    defaultValue: 50,
  },
  philhealth_contribution: {
    type: DataTypes.FLOAT,
    defaultValue: 75,
  },
  loan: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  otherDeductions: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  adjustment: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
}, { timestamps: false });

// **Recreate Foreign Key**
PayrollInformation.belongsTo(Employee, {
  foreignKey: "employee_id",
  onDelete: "CASCADE",
});

export default PayrollInformation;
