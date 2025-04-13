import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";

const Holidays = sequelize.define("holidays", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("Regular", "Special"),
    allowNull: false,
    defaultValue: "Regular"
  }
}, {
  timestamps: false,
});

export default Holidays;
