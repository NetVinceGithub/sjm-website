import { sequelize, connectToDatabase } from './db/db.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

const userRegister = async () => {
  await connectToDatabase();

  try {
    const hashPassword = await bcrypt.hash("admin", 10);

    // Avoid duplicates
    const [adminUser, created] = await User.findOrCreate({
      where: { email: "admin@gmail.com" },
      defaults: {
        name: "Admin",
        password: hashPassword,
        role: "admin",
      }
    });

    if (created) {
      console.log("✅ Admin user created:", adminUser.toJSON());
    } else {
      console.log("⚠️ Admin user already exists.");
    }

  } catch (error) {
    console.error("❌ Error inserting admin user:", error);
  } finally {
    await sequelize.close();
  }
};

userRegister();
