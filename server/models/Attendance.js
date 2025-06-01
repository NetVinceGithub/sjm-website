import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";
import moment from "moment"; // Import moment.js for date formatting


const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  employeeName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'employee_name'
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'employee_id',
    references: {
      model: 'employees', // Assuming you have an employees table
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  dutyStart: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'duty_start'
  },
  dutyEnd: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'duty_end'
  },

  punchIn: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'punch_in'
  },
  punchOut: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'punch_out'
  },
  workTime: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'work_time'
  },
  lateTime: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'late_time'
  },
  overtime: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'overtime'
  },
  absentTime: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'absent_time'
  },
  isAbsent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_absent'
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late', 'holiday'),
    defaultValue: 'present'
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'attendance',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['employee_name', 'date'] // Prevent duplicate entries for same employee on same date
    },
    {
      fields: ['date']
    },
    {
      fields: ['employee_id']
    }
  ]
});

export default Attendance;
