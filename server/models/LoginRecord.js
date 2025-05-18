// models/LoginRecord.js
import { DataTypes } from 'sequelize';
import sequelize from '../db/db.js';

const LoginRecord = sequelize.define('LoginRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('Admin', 'User', 'Guest'),
    allowNull: false
  },
  loginTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  device: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'login_records',
  timestamps: false
});

export default LoginRecord;