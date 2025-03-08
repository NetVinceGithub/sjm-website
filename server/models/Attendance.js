import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";
import moment from "moment"; // Import moment.js for date formatting

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
    type: DataTypes.DATEONLY,
    allowNull: false,
    set(value) {
      this.setDataValue("ea_txndte", moment(value, ["DD-MMM-YY", "YYYY-MM-DD"]).format("YYYY-MM-DD"));
    },
  },
  ea_day: {
    type: DataTypes.VIRTUAL,
    get() {
      return moment(this.getDataValue("ea_txndte")).format("DD");
    },
  },
  ea_month: {
    type: DataTypes.VIRTUAL,
    get() {
      return moment(this.getDataValue("ea_txndte")).format("MM");
    },
  },
  ea_year: {
    type: DataTypes.VIRTUAL,
    get() {
      return moment(this.getDataValue("ea_txndte")).format("YYYY");
    },
  },
  schedin: DataTypes.STRING(10),
  schedout: DataTypes.STRING(10),
  timein: DataTypes.STRING(10),
  timeout2: DataTypes.STRING(10),
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
  tableName: "attendances",
  timestamps: false,
  freezeTableName: true,
});

export default Attendance;

