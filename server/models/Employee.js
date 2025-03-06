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
  sss: {
    type: DataTypes.STRING,
    defaultValue: "N/A",
  },
  tin: {
    type: DataTypes.STRING,
    defaultValue: "N/A",
  },
  philhealth: {
    type: DataTypes.STRING,
    defaultValue: "N/A",
  },
  pagibig: {
    type: DataTypes.STRING,
    defaultValue: "N/A",
  },
  contact_name: {
    type: DataTypes.STRING,
    defaultValue: "No name available",
  },
  contact_number: {
    type: DataTypes.STRING,
    defaultValue: "No contact available",
  },
  contact_address: {
    type: DataTypes.STRING,
    defaultValue: "No address avaible",
  },
  profileImage: {
    type: DataTypes.STRING,
    defaultValue: "N/A",
  },
  esignature: {
    type: DataTypes.STRING,
    defaultValue: "N/A",
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "active",
  },
}, { timestamps: false });

// 🔥 Hook: Automatically create PayrollInformation when an Employee is created
Employee.afterCreate(async (employee) => {
  console.log(`🔥 Hook Triggered for Employee: ${employee.ecode}`);

  await PayrollInformation.create({
    employee_id: employee.id, // ✅ Ensure employee_id is correctly assigned
    ecode: employee.ecode,
    name: employee.name,
    positiontitle: employee.positiontitle || "N/A",
    area_section: employee.department || "N/A",
    daily_rate: 500,
    hourly_rate: 65,
    ot_hourly_rate: 81.25,
    ot_rate_sp_holiday: 109.85,
    ot_rate_reg_holiday: 109.85,
    special_hol_rate: 156,
    regular_hol_ot_rate: 156,
    overtime_pay: 100,
    holiday_pay: 200,
    night_differential: 6.50,
    allowance: 104,
    tardiness: 1.08,
    tax_deduction: 0,
    sss_contribution: 0,
    pagibig_contribution: 200,
    philhealth_contribution: 338,
    loan: 0,
    otherDeductions: 0,
    adjustment: 0,
  });

  console.log(`✅ Payroll Information Created for ${employee.ecode}`);
});










export default Employee;
