import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";


const Attendance = sequelize.define("Attendance", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  ecode: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  ea_txndte: {
    type: DataTypes.DATEONLY, // Stores date without time
    allowNull: false,
  },
  schedin: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  schedout: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  timein: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  timeout2: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  tardiness: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  total_hours: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.0,
  },
  overtime: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.0,
  },
}, {
  tableName: "attendance", // Matches your MySQL table name
  timestamps: false, // Disables `createdAt` and `updatedAt`
});

export default Attendance;
