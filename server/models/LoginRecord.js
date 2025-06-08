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
  },
  // New fields for user activity tracking
  action: {
    type: DataTypes.ENUM(
      'login', 
      'logout', 
      'payroll_change_request', 
      'payroll_change_approval', 
      'payroll_change_rejection',
      'payroll_data_view',
      'payroll_data_edit',
      'profile_update',
      'password_change',
      'failed_login_attempt',
      'session_timeout'
    ),
    allowNull: false,
    defaultValue: 'login'
  },
  actionDetails: {
    type: DataTypes.JSON, // Store additional details about the action
    allowNull: true,
    comment: 'JSON object containing action-specific details'
  },
  targetResource: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Resource that was affected (e.g., employee ID, payroll ID)'
  },
  success: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether the action was successful'
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Error message if action failed'
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Browser/client information'
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Session identifier for tracking user sessions'
  }
}, {
  tableName: 'login_records',
  timestamps: true, // Enable createdAt and updatedAt
  indexes: [
    {
      fields: ['userName', 'action']
    },
    {
      fields: ['loginTime']
    },
    {
      fields: ['email', 'action']
    },
    {
      fields: ['success']
    }
  ]
});

// Static method to log user activities
LoginRecord.logActivity = async function(activityData) {
  try {
    const {
      userName,
      email,
      role,
      action,
      actionDetails = null,
      targetResource = null,
      success = true,
      errorMessage = null,
      ipAddress = null,
      device = null,
      userAgent = null,
      sessionId = null
    } = activityData;

    return await this.create({
      userName,
      email,
      role,
      action,
      actionDetails,
      targetResource,
      success,
      errorMessage,
      ipAddress,
      device,
      userAgent,
      sessionId,
      loginTime: new Date()
    });
  } catch (error) {
    console.error('Error logging user activity:', error);
    throw error;
  }
};

// Static method to get user activity history
LoginRecord.getUserActivityHistory = async function(filters = {}) {
  const whereClause = {};
  
  if (filters.userName) whereClause.userName = filters.userName;
  if (filters.email) whereClause.email = filters.email;
  if (filters.action) whereClause.action = filters.action;
  if (filters.success !== undefined) whereClause.success = filters.success;
  if (filters.startDate && filters.endDate) {
    whereClause.loginTime = {
      [sequelize.Sequelize.Op.between]: [filters.startDate, filters.endDate]
    };
  }

  return await this.findAll({
    where: whereClause,
    order: [['loginTime', 'DESC']],
    limit: filters.limit || 100
  });
};

// Static method to get activity statistics
LoginRecord.getActivityStats = async function(timeframe = '7d') {
  const now = new Date();
  let startDate;
  
  switch(timeframe) {
    case '1d':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  const stats = await this.findAll({
    attributes: [
      'action',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('COUNT', sequelize.literal('CASE WHEN success = true THEN 1 END')), 'successCount'],
      [sequelize.fn('COUNT', sequelize.literal('CASE WHEN success = false THEN 1 END')), 'failureCount']
    ],
    where: {
      loginTime: {
        [sequelize.Sequelize.Op.gte]: startDate
      }
    },
    group: ['action'],
    raw: true
  });

  return stats;
};

export default LoginRecord;