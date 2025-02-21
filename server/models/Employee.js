import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";

const Employee = sequelize.define("Employee", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  hc: {
    type: DataTypes.INTEGER,
  },
  ecode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  positiontitle: {
    type: DataTypes.STRING,
  },
  department: {
    type: DataTypes.STRING,
  },
  area: {
    type: DataTypes.STRING,
  },
  emailaddress: {
    type: DataTypes.STRING,
  },
  dailyrate: {
    type: DataTypes.FLOAT,
    defaultValue: 0, // Ensure null values default to 0
  }
  ,
  regholidaypay: {
    type: DataTypes.FLOAT,
  },

  regularduty: {
    type: DataTypes.FLOAT,
    defaultValue: 0, // Ensure null values default to 0
  },
  regularholiday: {
    type: DataTypes.FLOAT,
    defaultValue: 0, // Ensure null values default to 0
  },
  tardiness: {
    type: DataTypes.FLOAT,
    defaultValue: 0, // Ensure null values default to 0
  },
  allowance: {
    type:DataTypes.FLOAT,
  },
  sss: {
    type:DataTypes.FLOAT,
  },
  phic: {
    type:DataTypes.FLOAT,
  }, 
  hdmf: {
    type:DataTypes.FLOAT,
  }

}, { timestamps: false });

export default Employee;
