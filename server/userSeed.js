import { sequelize, connectToDatabase } from './db/db.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

export const userRegister = async () => {
  await connectToDatabase();

  try {
    const hashPassword = await bcrypt.hash("vince", 10);

    // Avoid duplicates
    const [adminUser, created] = await User.findOrCreate({
      where: { email: "vjmalicsi08@gmail.com" },
      defaults: {
        name: "Vince",
        password: hashPassword,
        role: "approver",
      }
    });

    if (created) {
      console.log("✅ Approver user created:", adminUser.toJSON());
    } else {
      console.log("⚠️ Approver user already exists.");
    }

  } catch (error) {
    console.error("❌ Error inserting approver user:", error);
  } finally {
    // await sequelize.close();
  }
};

userRegister();
