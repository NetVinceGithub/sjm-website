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
    type: DataTypes.TEXT, // Changed to TEXT to allow longer descriptions
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  requirements: {
    type: DataTypes.JSON, // Stores array of requirements as JSON
    allowNull: false,
    defaultValue: [] // Ensures it has a default empty array
  },
  responsibilities: {
    type: DataTypes.JSON, // Stores array of responsibilities as JSON
    allowNull: false,
    defaultValue: []
  },
  applicationLink: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'jobs',
  timestamps: true // Automatically manages createdAt and updatedAt fields
});

export default Jobs;
