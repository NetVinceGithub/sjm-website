import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: false,
  }
);

export default sequelize;

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL Database Connected");
  } catch (error) {
    console.error("❌ Database Connection Failed:", error);
    process.exit(1); // Exit process if DB connection fails
  }
};

// Ensure database exists
sequelize
  .query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME};`)
  .then(() => {
    console.log("✅ Database checked/created successfully.");
  })
  .catch((err) => console.error("❌ Error creating database:", err));

export { sequelize, connectToDatabase };
