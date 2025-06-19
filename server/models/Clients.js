import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";

const Clients = sequelize.define("Clients", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    // Remove the unique constraint from here to avoid duplicate index creation
    field: 'name'
  },
  tinNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'tin_number'
  },
  contactNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'contact_number'
  },
  emailAddress: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true
    },
    field: 'email_address'
  },
  businessAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'business_address'
  },
  joinedDate: {
    type: DataTypes.DATEONLY, // Better for date fields
    allowNull: true,
    field: 'joined_date'
  },
  project: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'project'
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    defaultValue: 'Active',
    field: 'status'
  },
  deployedEmployees: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'deployed_employees'
  }
}, {
  tableName: 'clients',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  // Define indexes here to have better control
  indexes: [
    {
      unique: true,
      fields: ['name'],
      name: 'idx_clients_name_unique'
    }
    // Add other indexes only if needed for performance
  ]
});

export default Clients;