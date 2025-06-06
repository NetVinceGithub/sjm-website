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
      connectTimeout: 60000,
      acquireTimeout: 60000,
      timeout: 60000,
      // Add SSL if your hosting requires it
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
    retry: {
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /ESOCKETTIMEDOUT/,
        /EHOSTUNREACH/,
        /EPIPE/,
        /EAI_AGAIN/,
        /ER_ACCESS_DENIED_ERROR/
      ],
      max: 3
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  }
);

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL Database Connected");
  } catch (error) {
    console.error("❌ Database Connection Failed:", error);
    
    // More detailed error logging for debugging
    if (error.original) {
      console.error("Original error:", error.original.message);
      console.error("Error code:", error.original.code);
      console.error("SQL State:", error.original.sqlState);
    }
    
    // Don't exit in production, let the app continue running
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

export { sequelize, connectToDatabase };
export default sequelize;