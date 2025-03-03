import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";
import PayrollInformation from "./PayrollInformation.js";

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
    type: DataTypes.STRING(255), // Explicitly set the length
    allowNull: false,
    unique: "unique_ecode",
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
  area_section: {
    type: DataTypes.STRING,
    defaultValue: "N/A",
  },
  dateofhire: {
    type: DataTypes.STRING,
    defaultValue: "N/A",
  },
  tenurity_to_client: {
    type: DataTypes.STRING,
    defaultValue: "N/A",
  },
  employmentstatus: {
    type: DataTypes.STRING,
    defaultValue: "N/A",
  },
  team_ab: {
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
    allowNull: true,
    validate: {
      isEmail: true,
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
    defaultValue: "N/A",
  },
  contact_number: {
    type: DataTypes.STRING,
    defaultValue: "N/A",
  },
  contact_address: {
    type: DataTypes.STRING,
    defaultValue: "N/A",
  },
  profileImage: {
    type: DataTypes.STRING,
    defaultValue: "N/A",
  },
  esignature: {
    type: DataTypes.STRING,
    defaultValue: "N/A",
  },
}, { timestamps: false });

// ✅ Ensure Proper Association with PayrollInformation
Employee.hasOne(PayrollInformation, { foreignKey: "ecode", onDelete: "CASCADE", onUpdate: "CASCADE" });
PayrollInformation.belongsTo(Employee, { foreignKey: "ecode" });

// ✅ Fix `afterCreate` Hook (Only Creates Payroll Entry Now)
Employee.afterCreate(async (employee) => {
  console.log(`🔥 Employee.afterCreate Hook Triggered for ${employee.ecode}`);

  try {
    const payroll = await PayrollInformation.create({
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

    console.log(`✅ Payroll Created for ${payroll.ecode}`);
  } catch (error) {
    console.error(`❌ Error creating Payroll: ${error.message}`);
  }
});

export default Employee;
