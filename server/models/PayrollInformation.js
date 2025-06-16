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
    defaultValue: "N/A",
  },
  area_section: {
    type: DataTypes.STRING,
    defaultValue: "N/A",
  },
  designation: {
    type: DataTypes.ENUM('Team Leader', 'Regular'),
    defaultValue: 'Team Leader',
  },
  daily_rate: {
    type: DataTypes.FLOAT,
    defaultValue: 500,
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

PayrollInformation.belongsTo(Employee, {
  foreignKey: "employee_id",
  onDelete: "CASCADE",
});

export default PayrollInformation;
