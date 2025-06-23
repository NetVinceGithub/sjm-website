import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";
import moment from "moment";

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ecode: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  onDuty: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'onDuty'
  },
  offDuty: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'offDuty'
  },
  status: {
    type: DataTypes.ENUM('present', 'absent'),
    allowNull: false,
    defaultValue: 'absent'
  }
}, {
  tableName: 'attendance',
  timestamps: true,
  // Remove the unique index to allow duplicates
  indexes: [
    // You can add non-unique indexes for performance if needed
    {
      fields: ['ecode']
    },
    {
      fields: ['date']
    },
    {
      fields: ['status']
    }
  ]
});

export default Attendance;