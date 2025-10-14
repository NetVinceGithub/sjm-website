import { DataTypes } from 'sequelize';
import sequelize from '../db/db.js';

const LoginHistory = sequelize.define('LoginHistory', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  loginTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  ipAddress: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  userAgent: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'login_histories',
  timestamps: false,
  indexes: [
    { fields: ['userId'] },
    { fields: ['loginTime'] },
  ],
});

export default LoginHistory;
