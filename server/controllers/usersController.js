import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const addUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Validate role before inserting
    if (!['admin', 'approver', 'hr'].includes(role)) {
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

export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    console.log(users);
    res.status(200).json({ success: true, message: "Users found", users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Users not found" });
  }
};

export const blockUser = async (req, res) => {
  const {userId} = req.body;
  try {

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({success: false, message: "No user found"});
    } 
    user.isBlocked = true;

    await user.save();

    res.json({success: true, message: "user is blocked"});

  } catch (error) {
    res.status(500).json({success: false, message: error});
  }
}

export const unblockUser = async (req, res) => {
  const {userId} = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({success: false, message: "No user found"});
    }
    user.isBlocked = false;
    await user.save();

    res.json({success: true, message: "user is unblocked"})

  } catch (error) {
    res.status(500).json({success:false, message: "Error unblocking employee"});
  }
}

export const editUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.name = name;
    user.email = email;
    user.role = role;

    await user.save();

    res.json({ success: true, user });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const authenticateUser = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user, // This comes from your middleware
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve current user",
    });
  }
};
