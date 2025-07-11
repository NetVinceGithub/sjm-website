import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";

// First, define the PayrollInformation model
const PayrollInformation = sequelize.define(
  "PayrollInformation",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
      type: DataTypes.ENUM("Team Leader", "Regular"),
      defaultValue: "Regular",
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
      defaultValue: 6.5,
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
      defaultValue: 0,
    },
    pagibig_contribution: {
      type: DataTypes.FLOAT,
      defaultValue: 200,
    },
    philhealth_contribution: {
      type: DataTypes.FLOAT,
      defaultValue: 338,
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
  },
  { timestamps: false }
);

const Employee = sequelize.define(
  "Employee",
  {
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
    project: {
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
    employmentrank: {
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
    permanentaddress: {
      type: DataTypes.STRING,
      defaultValue: "N/A",
    },
    currentaddress: {
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
    emergencyContact: {
      type: DataTypes.STRING,
      defaultValue: "N/A",
    },
    emergencycontactAddress: {
      type: DataTypes.STRING,
      defaultValue: "N/A",
    },
    emergencyContactNumber: {
      type: DataTypes.STRING,
      defaultValue: "N/A",
    },
    dailyRate: {
      type: DataTypes.INTEGER,
      defaultValue: 520,
    },
    salaryPackage: {
      type: DataTypes.INTEGER,
      defaultValue: 16224,
    },
    healthCard: {
      type: DataTypes.STRING,
      defaultValue: "N/A",
    },
    prp: {
      type: DataTypes.STRING,
      defaultValue: "N/A",
    },
    safety: {
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
    "pag-ibig": {
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
    status: {
      type: DataTypes.STRING,
      defaultValue: "Active",
    },
    attendedtrainingandseminar: {
      type: DataTypes.STRING,
      defaultValue: "N/A",
    },

    dateofseparation: {
      type: DataTypes.STRING,
      defaultValue: "N/A",
    },
    medical: {
      type: DataTypes.STRING,
    },
  },
  { timestamps: false }
);

Employee.afterCreate(async (employee) => {
  await PayrollInformation.create({
    employee_id: employee.id,
    ecode: employee.ecode,
    name: employee.name,
    positiontitle: employee.positiontitle || "N/A",
    area_section: employee.department || "N/A",
    designation: "Regular",
  });
});

// Define the relationship
Employee.hasOne(PayrollInformation, {
  foreignKey: "employee_id",
  as: "payrollInfo",
});
PayrollInformation.belongsTo(Employee, {
  foreignKey: "employee_id",
});

export { Employee, PayrollInformation };
export default Employee;
