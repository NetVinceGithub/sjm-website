import { DataTypes } from 'sequelize';
import sequelize from '../db/db.js';
const Jobs = sequelize.define('Jobs', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'jobs',
  timestamps: true  // Automatically manages createdAt and updatedAt
});

export default Jobs;
