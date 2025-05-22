import { DataTypes } from 'sequelize';
import sequelize from '../db/db.js';
import User from './User.js';

const LoginHistory = sequelize.define('LoginHistory', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  loginTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'login_histories',
  timestamps: false,
});



export default LoginHistory;
