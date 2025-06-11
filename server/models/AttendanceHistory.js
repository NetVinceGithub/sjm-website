import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";
import moment from "moment";

const AttendanceHistory = sequelize.define(
  "AttendanceHistory",
  {
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
      allowNull: true,
    },
    dutyStart: {
      type: DataTypes.TIME,
      allowNull: true,
      field: "duty_start",
    },
    dutyEnd: {
      type: DataTypes.TIME,
      allowNull: true,
      field: "duty_end",
    },
    punchIn: {
      type: DataTypes.TIME,
      allowNull: true,
      field: "punch_in",
    },
    punchOut: {
      type: DataTypes.TIME,
      allowNull: true,
      field: "punch_out",
    },
    workTime: {
      type: DataTypes.TIME,
      allowNull: true,
      field: "work_time",
    },
    lateTime: {
      type: DataTypes.TIME,
      allowNull: true,
      field: "late_time",
    },
    overtime: {
      type: DataTypes.TIME,
      allowNull: true,
      field: "overtime",
    },
    absentTime: {
      type: DataTypes.TIME,
      allowNull: true,
      field: "absent_time",
    },
    isAbsent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_absent",
    },
    status: {
      type: DataTypes.ENUM("present", "absent", "late", "holiday"),
      defaultValue: "present",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "attendancehistory",
    timestamps: true,
    // Remove the unique index to allow duplicates
   indexes: [
    { fields: ['ecode'] },
    { fields: ['date'] }
  ],
  }
);

export default AttendanceHistory;
