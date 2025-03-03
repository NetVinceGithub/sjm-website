import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";

const Attendance = sequelize.define("Attendance", {
  empname: { type: DataTypes.STRING, allowNull: false },
  ea_txndte: { type: DataTypes.STRING, allowNull: false },
  schedin: { type: DataTypes.STRING, allowNull: true },
  schedout: { type: DataTypes.STRING, allowNull: true },
  timein: { type: DataTypes.STRING, allowNull: true },
  timeout2: { type: DataTypes.STRING, allowNull: true },
  totalHours: { type: DataTypes.FLOAT, allowNull: true },
  isLate: { type: DataTypes.STRING, allowNull: true },
  tardiness: { type: DataTypes.INTEGER, allowNull: true },
}, { timestamps: false });

export default Attendance;


