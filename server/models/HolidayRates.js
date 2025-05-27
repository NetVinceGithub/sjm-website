import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";  // same path as your Holidays model

const HolidayRates = sequelize.define("holiday_rates", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  regular: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 1,
  },
  special: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 1,
  },
  specialNonWorking: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  timestamps: false,
});

export default HolidayRates;
