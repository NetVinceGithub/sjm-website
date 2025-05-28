import { DataTypes } from 'sequelize';
import sequelize from '../db/db.js';
import LoginHistory from './LoginHistory.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: "unique_email", // This prevents Sequelize from creating multiple indexes
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'approver', 'hr'),
    allowNull: false
  },
  profileImage: {
    type: DataTypes.STRING
  },
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  resetCode: {
    type: DataTypes.STRING, // or INTEGER
    allowNull: true,
  },
  isBlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  
  
}, {
  tableName: 'users',
  timestamps: true  // Automatically manages createdAt and updatedAt
});




export default User;
