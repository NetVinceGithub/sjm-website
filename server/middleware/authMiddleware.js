import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const verifyUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, error: "Token not provided" });
    }



    const decoded = jwt.verify(token, process.env.JWT_KEY);

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    req.user = user;

    console.log("Incoming token:", token);
    console.log("Decoded:", decoded);
    console.log("User found:", user);


    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

export default verifyUser;
