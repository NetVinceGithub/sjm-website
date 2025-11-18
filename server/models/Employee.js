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
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    positiontitle: {
      type: DataTypes.STRING(100),
      defaultValue: "N/A",
    },
    area_section: {
      type: DataTypes.STRING(100),
      defaultValue: "N/A",
    },
    designation: {
      type: DataTypes.ENUM("Team Leader", "Regular"),
      defaultValue: "Regular",
    },
    daily_rate: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 500,
    },
    hourly_rate: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 65,
    },
    allowance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 104,
    },
    sss_loan: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    pagibig_loan: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    adjustment: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    underTime: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    cashAdvance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    employment_rank: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    salary_package: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 16224,
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
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    
    // Name fields (consolidated)
    complete_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    middle_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    suffix: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    
    position_title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    project: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    area_section: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    employment_rank: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    date_of_hire: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    employment_classification: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    
    // Personal information (consolidated)
    civil_status: {
      type: DataTypes.ENUM('single', 'married', 'divorced', 'widowed', 'separated'),
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: false,
    },
    birthdate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    
    // Addresses (consolidated)
    current_address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    permanent_address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    
    // Contact information (consolidated)
    contact_no: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    email_address: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
      },
      unique: true,
    },
    
    // Government IDs (consolidated)
    government_id_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    government_id_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    
    // Emergency contact (consolidated)
    emergency_contact_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    emergency_contact_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    emergency_contact_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    emergency_contact_birthplace: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    emergency_contact_relationship: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    emergency_contact_religion: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    
    // Salary information (consolidated)
    daily_rate: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 520,
    },
    salary_package: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 16224,
    },
    
    // Training and certification dates (consolidated)
    medical_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    health_card_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    gmp_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    prp_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    housekeeping_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    safety_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    crr_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    haccp_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    
    // Government numbers (consolidated)
    sss: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    phil_health: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    pag_ibig: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    tin: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    
    // Update the schedule field in your Employee model
    schedule: {
      type: DataTypes.JSON,  // Changed from TEXT to JSON
      allowNull: true,
      defaultValue: null,
    },
    // Separation
    date_of_separation: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    
    // Other fields
    profile_image: {
      type: DataTypes.TEXT, // For storing image paths or base64
      allowNull: true,
    },
    esignature: {
      type: DataTypes.TEXT, // For storing signature paths or base64
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Active', 'Inactive', 'Blocked'),
      defaultValue: 'Active',
    },
    attended_training: {
      type: DataTypes.TEXT, // For storing training information
      allowNull: true,
    },
  },
  { 
    timestamps: true, // Enable createdAt and updatedAt
    indexes: [
      {
        unique: true,
        fields: ['ecode']
      },
      {
        unique: true,
        fields: ['email_address']
      },
      {
        fields: ['status']
      },
      {
        fields: ['department']
      }
    ]
  }
);

Employee.afterCreate(async (employee) => {
  try {
    await PayrollInformation.create({
      employee_id: employee.id,
      ecode: employee.ecode,
      name: employee.complete_name || employee.name,
      positiontitle: employee.position_title || "N/A",
      area_section: employee.area_section || employee.department || "N/A",
      designation: employee.designation,
      daily_rate: employee.daily_rate || 520,
      employment_rank: employee.employment_rank,
      salary_package: employee.salary_package,
      
      // Only include fields that exist in the model
      sss_loan: 0,
      pagibig_loan: 0,
      adjustment: 0,
      underTime: 0,
      cashAdvance: 0,
    });
  } catch (error) {
    console.error('Error creating payroll information:', error);
  }
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