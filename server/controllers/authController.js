import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, error: 'Your account has been blocked.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Wrong password' });
    }

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
    console.error('Login Error:', error);
    res.status(500).json({ success: false, error: error.message });
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

    // Configure email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'SJM Payroll: Password Reset Code',
      text: `Your password reset code is: ${resetCode}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'Reset code sent to your email.' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
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
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: 'Password successfully reset' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};



export { login, verify, forgotPassword, resetPassword, verifyCode };
