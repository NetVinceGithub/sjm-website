import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";


const PayrollReleaseRequest = sequelize.define("PayrollReleaseRequest", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  requestedBy: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "approved", "rejected"),
    allowNull: false,
    defaultValue: "pending",
  },
  requestedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,  // Ensure timestamps exist (createdAt, updatedAt)
  tableName: "PayrollReleaseRequests", // Explicitly define table name
  freezeTableName: true, // Prevent Sequelize from auto-pluralizing
});

export default PayrollReleaseRequest;
