import { sequelize, connectToDatabase } from './db/db.js';
import User from './models/User.js';
import bcrypt from 'bcrypt';

const userRegister = async () => {
  await connectToDatabase(); // Ensure the database is connected

  try {
    const hashPassword = await bcrypt.hash("admin", 10);

    // Create admin user
    const newUser = await User.create({
      name: "Admin",
      email: "admin@gmail.com",
      password: hashPassword,
      role: "admin",
    });

    console.log("✅ Admin user created successfully:", newUser.toJSON());
  } catch (error) {
    console.error("❌ Error inserting admin user:", error);
  } finally {
    await sequelize.close(); // Close DB connection after seeding
  }
};

userRegister();
