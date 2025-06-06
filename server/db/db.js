import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || "mysql",
    dialectOptions: {
      connectTimeout: 30000,
      // Add SSL if required
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  }
);

const connectToDatabase = async () => {
  try {
    console.log(`Attempting to connect to: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`User: ${process.env.DB_USER}`);
    
    await sequelize.authenticate();
    console.log("✅ MySQL Database Connected");
  } catch (error) {
    console.error("❌ Database Connection Failed:", error.message);
    console.error("Error code:", error.original?.code);
    
    // Don't exit in production - let app continue without DB
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

export { sequelize, connectToDatabase };
export default sequelize;