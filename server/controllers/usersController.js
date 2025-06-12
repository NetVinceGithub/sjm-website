import User from "../models/User.js";
import bcrypt from "bcryptjs";
import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,  // <-- add this line
  },
});


transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Connection Failed:", error);
  } else {
    console.log("✅ SMTP Server Ready!");
  }
});

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
      let successfulEmails = [];


     let mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: `Access for ${name}`,
          html: ` 
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Access</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px;">
            <img src="https://stjohnmajore.com/images/HEADER.png" alt="Header" style="width: 100%; height: auto;" />
            
             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div>
                      You are given access to sjm-payroll system as ${role}, you can access the system in 
                      <a href="https://payroll.stjohnmajore.com/">https://payroll.stjohnmajore.com/</a>
                    </div>
                  </div>

            <p style="color: #333; font-size: 15px;">Please login to <a href="https://payroll.stjohnmajore.com/">https://payroll.stjohnmajore.com/</a> to review and take appropriate action.</p>
            
            <p style="color: #333; font-size: 15px;">Best regards,<br />SJM Payroll System</p>
            <div style="font-size: 12px; color: #777; margin-top: 20px; text-align: center;">
              <strong>This is an automated email—please do not reply.</strong><br />
              Keep this message for your records.
            </div>
            <img src="https://stjohnmajore.com/images/FOOTER.png" alt="Footer" style="width: 100%; height: auto; margin-top: 20px;" />
            `
                




                

        };

        await transporter.sendMail(mailOptions);
        console.log(`Notification sent to ${email}`);
        successfulEmails.push(email);

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
