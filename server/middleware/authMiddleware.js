import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const verifyUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Check if Authorization header exists
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        error: "Authorization header is missing" 
      });
    }

    // Check if header is in correct format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ 
        success: false, 
        error: "Invalid Authorization header format. Use 'Bearer <token>'" 
      });
    }

    const token = parts[1];

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_KEY);
    } catch (jwtError) {
      // Handle different JWT errors
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          error: "Token has expired" 
        });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false, 
          error: "Invalid token" 
        });
      }
      throw jwtError; // Re-throw other unexpected errors
    }

    // Find user
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });

    // Check if user exists
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: "User associated with token not found" 
      });
    }

    // Check user status (optional - add if you have user status in your model)
    // if (user.status !== 'active') {
    //   return res.status(403).json({ 
    //     success: false, 
    //     error: "User account is not active" 
    //   });
    // }

    // Attach user to request
    req.user = user.toJSON(); // Convert to plain object
    req.token = token;

    // Logging (optional, can be removed in production)
    console.log("Authentication successful:");
    console.log("User ID:", user.id);
    console.log("User Email:", user.email);
    console.log("Token Expiration:", new Date(decoded.exp * 1000).toLocaleString());

    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Internal server authentication error" 
    });
  }
};

export default verifyUser;