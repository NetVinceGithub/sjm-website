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
    }
  ]
});

export default Attendance;