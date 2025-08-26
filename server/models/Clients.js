import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";

const Clients = sequelize.define("Clients", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  clientCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: "client_code", // unique MCL00001 style
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  tinNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: "tin_number",
  },
  contactNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: "contact_number",
  },
  contactPerson: {
    type: DataTypes.STRING(30),
    allowNull: true,
    field: "contact_person",
  },
  emailAddress: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true,
    },
    field: "email_address",
  },
  businessAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: "business_address",
  },
  joinedDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: "joined_date",
  },
  expiryDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: "expiry_date",
  },
  billingFrequency: {
    type: DataTypes.ENUM("monthly", "semi-monthly"),
    allowNull: true,
    field: "billing_frequency",
  },
  project: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("Active", "Inactive"),
    defaultValue: "Active",
  },
  deployedEmployees: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: "deployed_employees",
  },
  createdAt: {
  type: DataTypes.DATE,
  field: "created_at",
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: "updated_at",
  },

}, {
  tableName: "clients",
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ["client_code"], // ensure uniqueness on client_code instead of name
      name: "idx_clients_client_code_unique",
    },
  ],
});

export default Clients;
