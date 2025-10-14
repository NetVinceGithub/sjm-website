import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import LoginHistory from '../models/LoginHistory.js';

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔍 Find user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, error: 'Your account has been blocked.' });
    }

    // 🔑 Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Wrong password' });
    }

    // 🎫 Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email, name: user.name },
      process.env.JWT_KEY,
      { expiresIn: '10d' }
    );

    // 🧾 Record Login History (No association needed)
    try {
      const ipAddress =
        req.headers['x-forwarded-for']?.split(',')[0].trim() ||
        req.headers['x-real-ip'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip ||
        'Unknown';

      const userAgent = req.headers['user-agent'] || 'Unknown';

      await LoginHistory.create({
        userId: user.id,
        loginTime: new Date(),
        ipAddress,
        userAgent,
      });

      console.log(`✓ Login history recorded for user: ${user.email}`);
    } catch (historyError) {
      console.error('⚠ Failed to record login history:', historyError.message);
    }

    // ✅ Final Response
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};


const verify = (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
};

// Step 1: Send reset code via email
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ success: false, error: 'User not found' });
    }

    // Generate a 6-digit numeric code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetCode = resetCode;
    await user.save();

    // Configure email with SSL/TLS options - SOLUTION 1: Proper SSL configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // SSL/TLS configuration options
      secure: true, // Use SSL
      tls: {
        // Don't fail on invalid certs (for development only)
        rejectUnauthorized: false,
        // Minimum TLS version
        minVersion: 'TLSv1.2'
      }
    });

    // Alternative configuration if the above doesn't work - SOLUTION 2
    // const transporter = nodemailer.createTransporter({
    //   host: 'smtp.gmail.com',
    //   port: 587,
    //   secure: false, // Use STARTTLS
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASS,
    //   },
    //   tls: {
    //     rejectUnauthorized: false
    //   }
    // });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'SJM Payroll: Password Reset Code',
      html: `

      <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Reset Code</title>
        </head>

        <body style="font-family: Arial, sans-serif; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px;">
            <img src="https://stjohnmajore.com/images/HEADER.png" alt="Header" style="width: 100%; height: auto;" />


     
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You have requested to reset your password for SJM Payroll.</p>
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin: 0; color: #333;">Your reset code is:</h3>
            <h1 style="font-size: 36px; color: #007bff; margin: 10px 0; letter-spacing: 5px;">${resetCode}</h1>
          </div>
          <p>This code will expire in 15 minutes for security reasons.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
        </div>
        <p style="color: #333; font-size: 15px;">Best regards,<br />SJM Payroll System</p>

        <div style="font-size: 12px; color: #777; margin-top: 20px; text-align: center;">
          <strong>This is an automated email—please do not reply.</strong><br />
          Keep this message for your records.
        </div>
        <img src="https://stjohnmajore.com/images/FOOTER.png" alt="Footer" style="width: 100%; height: auto; margin-top: 20px;" />
      </div>
            <div style="font-size: 12px; color: #777; margin-top: 20px; text-align: center;">
              <strong>This is an automated email—please do not reply.</strong><br />
              Keep this message for your records.
            </div>
            <img src="https://stjohnmajore.com/images/FOOTER.png" alt="Footer" style="width: 100%; height: auto; margin-top: 20px;" />
      `
      
      ,
      text: `Your password reset code is: ${resetCode}. This code will expire in 15 minutes.`
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'Reset code sent to your email.' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    
    // More detailed error logging
    if (error.code === 'ESOCKET') {
      console.error('SSL/TLS Connection Error - Check your email configuration');
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send reset email. Please try again later.' 
    });
  }
};

// Step 2: Verify code (optional, if you're doing it in frontend)
const verifyCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ where: { email, resetCode: code } });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid code' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Verify Code Error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  
  try {
    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      return res.status(400).json({ success: false, error: 'User not found' });
    }

    // Clear the reset code after successful password reset
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetCode = null; // Clear the reset code
    await user.save();

    res.json({ success: true, message: 'Password successfully reset' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export { login, verify, forgotPassword, resetPassword, verifyCode };