import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";

const Employee = sequelize.define("Employee", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  hc: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  ecode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: "unique_ecode", // Prevents Sequelize from creating multiple indexes
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "N/A",
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "N/A",
  },
  firstname: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "N/A",
  },
  middlename: {
    type: DataTypes.STRING,
    defaultValue: "N/A",
  },
  positiontitle: {
    type: DataTypes.STRING,
    defaultValue: "N/A",
  },
  department: {
    type: DataTypes.STRING,
    defaultValue: "N/A",
  },
  "area/section": {
    type: DataTypes.STRING,
    defaultValue: "N/A",
  },
  dateofhire: {
    type: DataTypes.STRING,
    defaultValue: "N/A",
  },
  "tenuritytoclient(inmonths)": {
    type: DataTypes.STRING,
    defaultValue: "N/A",
  },
  employmentstatus: {
    type: DataTypes.STRING,
    defaultValue: "N/A",
  },
  "team(a/b)": {
    type: DataTypes.STRING,
    defaultValue: "N/A",
  },
  civilstatus: {
    type: DataTypes.STRING,
    defaultValue: "N/A",
  },
  gender: {
    type: DataTypes.STRING,
    defaultValue: "N/A",
  },
  birthdate: {
    type: DataTypes.STRING,
    defaultValue: "N/A",
  },
  age: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  address: {
    type: DataTypes.STRING,
    defaultValue: "N/A",
  },
  contactno: {
    type: DataTypes.STRING,
    defaultValue: "N/A",
  },
  emailaddress: {
    type: DataTypes.STRING,
    allowNull: true, // Allows null values
    validate: {
      isEmail: true, // Only validates if an email is provided
    },
  },  
  governmentidnumber: {
    type: DataTypes.STRING,
    defaultValue: "N/A",
  },
}, { timestamps: false });

// 🔥 Hook: Automatically create PayrollInformation when an Employee is created
Employee.afterCreate(async (employee) => {
  console.log(`🔥 Hook Triggered for Employee: ${employee.ecode}`);

  await PayrollInformation.create({
    employee_id: employee.id,
    ecode: employee.ecode,
    name: employee.name,
    positiontitle: employee.positiontitle || "N/A",
    area_section: employee.department || "N/A",
    daily_rate: 500,
    overtime_pay: 100,
    holiday_pay: 200,
    night_differential: 150,
    allowance: 50,
    tardiness: 0,
    tax_deduction: 50,
    sss_contribution: 100,
    pagibig_contribution: 50,
    philhealth_contribution: 75,
  });

  console.log(`✅ Payroll Information Created for ${employee.ecode}`);
});









export default Employee;
