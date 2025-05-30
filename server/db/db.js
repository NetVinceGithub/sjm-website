import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD, // ✅ this should match your .env
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || "mysql",
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

// Remove this block or replace with a proper CREATE DATABASE command only if needed
// Sequelize expects the database to already exist
// You can't run CREATE DATABASE IF NOT EXISTS in most shared hosting environments
/*
sequelize
  .query(CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\;`)
  .then(() => {
    console.log("✅ Database checked/created successfully.");
  })
  .catch((err) => console.error("❌ Error creating database:", err));
*/


export { sequelize, connectToDatabase };