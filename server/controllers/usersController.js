import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const addUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Validate role before inserting
    if (!['admin', 'employee'].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role value. Allowed values: 'admin' or 'employee'" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword, role });

    res.status(201).json({ success: true, message: "User added successfully", user: newUser });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};