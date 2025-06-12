import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";

const AttendanceSummary = sequelize.define("AttendanceSummary", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  ecode: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  daysPresent: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: "attendancesummary",
  timestamps: false,
});


export default AttendanceSummary;
