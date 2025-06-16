import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";

const Clients = sequelize.define("Clients", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
 name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // <- this prevents duplicate names
    field: 'name'
    },
  tinNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'tin_number'
  },
  contactNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'contact_number'
  },
  emailAddress: {
    type: DataTypes.STRING,
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
    type: DataTypes.STRING, // change from STRING to DATE
    allowNull: true,
    field: 'joined_date'
    },
    project: {
    type: DataTypes.STRING, // change from STRING to DATE
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
  updatedAt: 'updated_at'
});

export default Clients;