import jwt from 'jsonwebtoken';
import User from '../models/User.js';  // Ensure it's the Sequelize model
import bcrypt from 'bcrypt';

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Find user by email using Sequelize
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // ✅ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Wrong password' });
    }

    // ✅ Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: '10d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: { id: user.id, name: user.name, role: user.role },
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const verify = (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
};

// Export functions
export { login, verify };
