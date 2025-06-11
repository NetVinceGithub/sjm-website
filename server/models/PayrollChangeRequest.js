import {DataTypes} from 'sequelize';
import sequelize from '../db/db.js';

// models/PayrollChangeRequest.js
const PayrollChangeRequest = sequelize.define("PayrollChangeRequest", {
  payroll_info_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  changes: {
    type: DataTypes.JSON,
    allowNull: false
  },
  requested_by: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reasons: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM("Pending", "Approved", "Rejected"),
    defaultValue: "Pending"
  },
  employee_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  employee_email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  // New column for batch operations
  batch_affected_employee_ids: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of employee IDs affected by this batch change request'
  },
  // Optional: Add batch identifier for grouping related requests
  batch_id: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Unique identifier for grouping batch requests together'
  }
});

export default PayrollChangeRequest;