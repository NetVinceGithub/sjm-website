import axios from "axios";
import dotenv from "dotenv";
import cron from "node-cron";
import Employee from "../models/Employee.js"; // Employee Sequelize model
import PayrollInformation from "../models/PayrollInformation.js"; // Payroll Sequelize model
import PayrollChangeRequest from "../models/PayrollChangeRequest.js";

import sequelize from "../db/db.js";
import { QueryTypes } from "sequelize";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import LoginRecord from "../models/LoginRecord.js";
import multer from 'multer';

dotenv.config();

// Load allowed types from environment variable (optional)
const allowedTypesEnv = process.env.ALLOWED_FILE_TYPES;
const defaultAllowedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv'
];

const allowedTypes = allowedTypesEnv ? allowedTypesEnv.split(',') : defaultAllowedTypes;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure 'uploads/' directory exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExt = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExt);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 10MB per file
    files: 10 // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypesLower = allowedTypes.map(type => type.toLowerCase()); // Convert to lowercase once

    if (allowedTypesLower.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      console.log(`Rejected file type: ${file.mimetype}`);
      cb(new Error(`File type ${file.mimetype} not allowed. Allowed types are: ${allowedTypes.join(', ')}`), false);
    }
  }
});


const SHEET_URL = process.env.GOOGLE_SHEET_URL; // Store API Key securely in .env

const fetchAndSaveEmployees = async () => {
  try {
    const response = await axios.get(SHEET_URL);
    const rows = response.data.values;
    if (!rows || rows.length < 2) {
      console.log("⚠ No employee data found");
      return;
    }

    const headers = rows[0].map((header) =>
      header.toLowerCase().replace(/\s+/g, "")
    );
    const validEmployees = rows.slice(1).map((row) => {
      const employeeObj = {};
      headers.forEach((header, colIndex) => {
        employeeObj[header] = row[colIndex]?.trim() || "";
      });
      return employeeObj;
    });

    // Get all current employee ids from your database
    const existingEmployees = await Employee.findAll();
    const existingEmployeeIds = existingEmployees.map((e) => e.id);

    // Track the IDs of employees in the sheet
    const sheetEmployeeIds = [];

    for (const employee of validEmployees) {
      // Upsert employee (insert or update)
      // Remove duplicate upsert call here
      await Employee.upsert(employee);

      // Then fetch employee by unique field
      const savedEmployeeRecord = await Employee.findOne({
        where: { ecode: employee.ecode },
      });
      if (!savedEmployeeRecord) {
        console.error("Failed to find employee after upsert:", employee.ecode);
        continue; // skip this employee to avoid crash
      }

      sheetEmployeeIds.push(savedEmployeeRecord.id);

      console.log(
        `✅ Employee Saved/Updated: ${savedEmployeeRecord.name || "Unknown Employee"
        }`
      );

      // Check payroll info
      const existingPayroll = await PayrollInformation.findOne({
        where: { employee_id: savedEmployeeRecord.id },
      });

      if (!existingPayroll) {
        // Create payroll info if missing, including default payroll values
        await PayrollInformation.create({
          employee_id: savedEmployeeRecord.id,
          ecode: savedEmployeeRecord.ecode,
          name: savedEmployeeRecord.name,
          positiontitle: savedEmployeeRecord.positiontitle || "N/A",
          area_section: savedEmployeeRecord.department || "N/A",
          email: savedEmployeeRecord.emailaddress || "N/A",
          daily_rate: 520,
          overtime_pay: 81.25,
          holiday_pay: 520,
          night_differential: 150,
          allowance: 1040,
          tardiness: 0,
          tax_deduction: 0,
          sss_contribution: 0,
          pagibig_contribution: 200,
          philhealth_contribution: 338,
          loan: 0,
        });

        console.log(
          `✅ PayrollInformation Created for ${savedEmployeeRecord.ecode}`
        );
      } else {
        // Only update employee-identifying fields without resetting payroll numbers
        await existingPayroll.update({
          ecode: savedEmployeeRecord.ecode,
          name: savedEmployeeRecord.name,
          positiontitle: savedEmployeeRecord.positiontitle || "N/A",
          area_section: savedEmployeeRecord.department || "N/A",
          email: savedEmployeeRecord.emailaddress || "N/A",
        });

        console.log(
          `🔄 PayrollInformation Updated for ${savedEmployeeRecord.ecode}`
        );
      }
    }

    // OPTIONAL: Remove employees not in the sheet anymore
    const employeesToRemove = existingEmployees.filter(
      (e) => !sheetEmployeeIds.includes(e.id)
    );
    for (const emp of employeesToRemove) {
      await PayrollInformation.destroy({ where: { employee_id: emp.id } });
      await Employee.destroy({ where: { id: emp.id } });
      console.log(`🗑 Employee and Payroll removed: ${emp.name || emp.id}`);
    }

    console.log(
      "🎉 All employees & payroll data have been imported and synced successfully!"
    );
  } catch (error) {
    console.error("❌ Error fetching employees:", error);
  }
};

// API Endpoint
export const importEmployeesFromGoogleSheet = async (req, res) => {
  try {
    await fetchAndSaveEmployees();
    res
      .status(201)
      .json({ success: true, message: "Employees imported successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error syncing employees" });
  }
};

// Auto Sync Employees (Runs every night at 12 AM)
cron.schedule("0 0 * * *", async () => {
  console.log("⏳ Auto-syncing employees from Google Sheets...");
  await fetchAndSaveEmployees();
});

// Get all employees
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll();
    res.status(200).json({ success: true, employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get employee by ID
export const getEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }
    res.status(200).json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPayrollInformations = async (req, res) => {
  try {
    const payrollInformations = await PayrollInformation.findAll();
    res.status(200).json({ success: true, payrollInformations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPayrollInformationsById = async (req, res) => {
  const { id } = req.params;
  try {
    const payrollInformation = await PayrollInformation.findByPk(id);
    if (!payrollInformation) {
      return res
        .status(404)
        .json({ success: true, message: "Payroll Data not found" });
    }
    res.status(200).json({ success: true, payrollInformation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePayrollInformation = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const payrollInfo = await PayrollInformation.findByPk(id);

    if (!payrollInfo) {
      return res
        .status(404)
        .json({ success: false, message: "Payroll data not found" });
    }

    await payrollInfo.update(updatedData);

    res
      .status(200)
      .json({
        success: true,
        message: "Payroll information updated successfully",
        payrollInfo,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // <-- add this line
  },
});

// Verify  connection once
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Connection Failed:", error);
  } else {
    console.log("✅ SMTP Server Ready!");
  }
});

export const requestPayrollChange = async (req, res) => {
  const { payroll_info_id, changes, reason, requested_by } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get("User-Agent");

  console.log("Received data:", req.body);

  try {
    if (!payroll_info_id || !changes || !requested_by) {
      // Log failed attempt
      await LoginRecord.logActivity({
        userName: requested_by || "Unknown",
        email: req.user?.email || "unknown@example.com",
        role: req.user?.role || "User",
        action: "payroll_change_request",
        success: false,
        errorMessage: "Missing required fields",
        actionDetails: {
          payroll_info_id,
          hasChanges: !!changes,
          hasRequestedBy: !!requested_by,
        },
        ipAddress,
        userAgent,
        sessionId: req.session?.id,
      });

      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const payrollInfo = await PayrollInformation.findByPk(payroll_info_id);

    if (!payrollInfo) {
      // Log failed attempt - payroll not found
      await LoginRecord.logActivity({
        userName: requested_by,
        email: req.user?.email || "unknown@example.com",
        role: req.user?.role || "User",
        action: "payroll_change_request",
        success: false,
        errorMessage: "Payroll information not found",
        targetResource: `payroll_id:${payroll_info_id}`,
        actionDetails: {
          payroll_info_id,
          changes,
        },
        ipAddress,
        userAgent,
        sessionId: req.session?.id,
      });

      return res
        .status(404)
        .json({ success: false, message: "Payroll information not found" });
    }

    const employee_name = `${payrollInfo.name}`;
    console.log(employee_name);

    const result = await PayrollChangeRequest.create({
      payroll_info_id,
      changes,
      reasons: reason,
      requested_by,
      employee_name,
    });

    console.log(result);

    // Log successful payroll change request
    await LoginRecord.logActivity({
      userName: requested_by,
      email: req.user?.email || "unknown@example.com",
      role: req.user?.role || "User",
      action: "payroll_change_request",
      success: true,
      targetResource: `payroll_id:${payroll_info_id}`,
      actionDetails: {
        payroll_info_id,
        employee_name,
        changes,
        reason,
        request_id: result.id,
      },
      ipAddress,
      userAgent,
      sessionId: req.session?.id,
    });

    // Get all users with the role 'approver'
    const approvers = await User.findAll({
      where: { role: "approver", isBlocked: false },
    });

    const successfulEmails = [];

    for (const approver of approvers) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: approver.email,
        subject: `New Payroll Change Request Submitted`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h3>Hello ${approver.name},</h3>
            <p>A new payroll change request by ${requested_by} is awaiting your review.</p>
            <p><strong>Employee:</strong> ${employee_name}</p>
            <p><strong>Reason:</strong> ${reason || "No reason provided"}</p>
            <p><strong>Changes:</strong></p>
            <ul>

              ${Object.entries(changes).map(([key, value]) =>
          `<li><strong>${key.replace(/_/g, ' ')}:</strong> ${value}</li>`
        ).join('')}

            </ul>
            <p>Please login to the payroll system to review and take appropriate action.</p>
            <br />
            <p>Best regards,<br />SJM Payroll System</p>
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Notification sent to ${approver.email}`);
        successfulEmails.push(approver.email);
      } catch (emailError) {
        console.error(`Failed to send email to ${approver.email}:`, emailError);

        // Log email failure
        await LoginRecord.logActivity({
          userName: "System",
          email: "system@company.com",
          role: "Admin",
          action: "payroll_change_request",
          success: false,
          errorMessage: `Failed to send notification to ${approver.email}`,
          actionDetails: {
            type: "email_notification",
            recipient: approver.email,
            payroll_info_id,
            request_id: result.id,
          },
          ipAddress,
          userAgent,
        });
      }
    }

    // Log email notification results
    if (successfulEmails.length > 0) {
      await LoginRecord.logActivity({
        userName: "System",
        email: "system@company.com",
        role: "Admin",
        action: "payroll_change_request",
        success: true,
        actionDetails: {
          type: "email_notifications_sent",
          recipients: successfulEmails,
          payroll_info_id,
          request_id: result.id,
          total_approvers: approvers.length,
          successful_notifications: successfulEmails.length,
        },
        ipAddress,
        userAgent,
      });
    }

    res.status(200).json({
      success: true,
      message: "Request submitted",
      notified: successfulEmails,
      request_id: result.id,
    });
  } catch (error) {
    console.error("Error saving payroll change request:", error);

    // Log the error
    await LoginRecord.logActivity({
      userName: requested_by || "Unknown",
      email: req.user?.email || "unknown@example.com",
      role: req.user?.role || "User",
      action: "payroll_change_request",
      success: false,
      errorMessage: error.message,
      actionDetails: {
        payroll_info_id,
        changes,
        reason,
        error_stack: error.stack,
      },
      ipAddress,
      userAgent,
      sessionId: req.session?.id,
    });

    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const reviewPayrollChange = async (req, res) => {
  console.log("💡 Hit reviewPayrollChange route");

  try {
    const requests = await PayrollChangeRequest.findAll();
    console.log("📊 Found requests:", requests.length); // Add this log
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("🔥 Error fetching payroll change requests:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateIDDetails = async (req, res) => {
  console.log("Received Files:", req.files); // Log all uploaded files
  console.log("Files Object Keys:", Object.keys(req.files)); // See which fields are present

  const { id } = req.params;
  const updatedData = req.body;

  try {
    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    if (req.files) {
      if (req.files.profileImage) {
        updatedData.profileImage = req.files.profileImage[0].filename;
      }
      if (req.files.esignature) {
        updatedData.esignature = req.files.esignature[0].filename;
      } else {
        console.log("🚨 Esignature file is missing in req.files!");
      }
    }

    await employee.update(updatedData);

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    console.error("❌ Error updating employee:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployeeStatus = async (req, res) => {
  try {
    console.log("Fetching all employees...");

    const employees = await sequelize.query(
      "SELECT * FROM Employees", // ✅ Remove WHERE condition
      { type: QueryTypes.SELECT }
    );

    console.log("Query executed successfully:", employees);
    res.status(200).json(employees);
  } catch (error) {
    console.error("Database Query Error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const toggleEmployeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Received request to toggle status for Employee ID: ${id}`);

    const employee = await Employee.findByPk(id);
    if (!employee) {
      console.log("Employee not found");
      return res.status(404).json({ message: "Employee not found" });
    }

    const newStatus = employee.status === "Active" ? "Inactive" : "Active";
    await employee.update({ status: newStatus });

    console.log(`Employee ${id} status changed to ${newStatus}`);
    res.status(200).json({ success: true, newStatus });
  } catch (error) {
    console.error("Error updating employee status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const approvePayrollChange = async (req, res) => {
  const { id } = req.params;
  const { reviewed_by } = req.body;

  try {
    console.log(`💡 Approving payroll change request ${id}`);
    console.log("Request body:", req.body);
    console.log("Request params:", req.params);

    // Find the change request
    const changeRequest = await PayrollChangeRequest.findByPk(id);
    if (!changeRequest) {
      console.log(`❌ Change request ${id} not found`);
      return res
        .status(404)
        .json({ success: false, message: "Change request not found" });
    }

    console.log("Found change request:", changeRequest.toJSON());

    // Check if already processed
    if (changeRequest.status !== "Pending") {
      console.log(
        `❌ Change request ${id} already processed with status: ${changeRequest.status}`
      );
      return res
        .status(400)
        .json({ success: false, message: "Change request already processed" });
    }

    // Update the actual payroll information with the requested changes
    const payrollInfo = await PayrollInformation.findByPk(
      changeRequest.payroll_info_id
    );
    if (!payrollInfo) {
      console.log(
        `❌ Payroll information not found for ID: ${changeRequest.payroll_info_id}`
      );
      return res
        .status(404)
        .json({ success: false, message: "Payroll information not found" });
    }

    console.log("Current payroll info (before):", payrollInfo.toJSON());

    // Parse changes if it's a string (because it might be stored as JSON string)
    let changes = changeRequest.changes;
    if (typeof changes === "string") {
      try {
        changes = JSON.parse(changes);
      } catch (err) {
        console.error("❌ Failed to parse changes JSON:", err);
        return res
          .status(400)
          .json({ success: false, message: "Invalid changes format" });
      }
    }

    console.log("Requested changes:", changes);

    // Define allowed fields to update (only fields that exist in PayrollInformation)
    const allowedFields = [
      "daily_rate",
      "hourly_rate",
      "ot_hourly_rate",
      "ot_rate_sp_holiday",
      "ot_rate_reg_holiday",
      "special_hol_rate",
      "regular_hol_ot_rate",
      "overtime_pay",
      "holiday_pay",
      "night_differential",
      "allowance",
      "tardiness",
      "tax_deduction",
      "sss_contribution",
      "pagibig_contribution",
      "philhealth_contribution",
      "loan",
      "otherDeductions",
      "adjustment",
      "positiontitle",
      "area_section",
      "designation",
      "ecode",
      "name",
    ];

    // Filter changes to update only allowed fields
    const filteredChanges = {};
    for (const key of allowedFields) {
      if (changes.hasOwnProperty(key)) {
        filteredChanges[key] = changes[key];
      }
    }

    // Update payroll info
    await payrollInfo.update(filteredChanges);

    console.log("Payroll info (after):", payrollInfo.toJSON());

    // Update the change request status
    await changeRequest.update({
      status: "Approved",
      reviewed_by: reviewed_by || "Admin",
      reviewed_at: new Date(),
    });

    console.log(`✅ Payroll change request ${id} approved and applied`);
    res
      .status(200)
      .json({ success: true, message: "Change request approved successfully" });
  } catch (error) {
    console.error("❌ Error approving payroll change:", error);
    console.error("❌ Error stack:", error.stack);
    res
      .status(500)
      .json({ success: false, message: error.message, error: error.stack });
  }
};

export const rejectPayrollChange = async (req, res) => {
  const { id } = req.params;
  const { reviewed_by, rejection_reason } = req.body;

  try {
    console.log(`💡 Rejecting payroll change request ${id}`);
    console.log("Request body:", req.body); // Add this for debugging

    // Find the change request
    const changeRequest = await PayrollChangeRequest.findByPk(id);
    if (!changeRequest) {
      console.log(`❌ Change request ${id} not found`);
      return res
        .status(404)
        .json({ success: false, message: "Change request not found" });
    }

    // Check if already processed
    if (changeRequest.status !== "Pending") {
      console.log(
        `❌ Change request ${id} already processed with status: ${changeRequest.status}`
      );
      return res
        .status(400)
        .json({ success: false, message: "Change request already processed" });
    }

    // Update the change request status
    await changeRequest.update({
      status: "Rejected",
      reviewed_by: reviewed_by || "Admin",
      reviewed_at: new Date(),
      rejection_reason: rejection_reason || "No reason provided",
    });

    console.log(`✅ Payroll change request ${id} rejected`);
    res
      .status(200)
      .json({ success: true, message: "Change request rejected successfully" });
  } catch (error) {
    console.error("❌ Error rejecting payroll change:", error);
    console.error("❌ Error stack:", error.stack); // Add full stack trace
    res
      .status(500)
      .json({ success: false, message: error.message, error: error.stack });
  }
};

export const bulkApprovePayrollChanges = async (req, res) => {
  const { reviewed_by } = req.body;

  try {
    console.log("💡 Bulk approving all pending payroll change requests");

    // Get all pending requests
    const pendingRequests = await PayrollChangeRequest.findAll({
      where: { status: "Pending" },
    });

    if (pendingRequests.length === 0) {
      return res
        .status(200)
        .json({ success: true, message: "No pending requests to approve" });
    }

    // Process each request
    for (const request of pendingRequests) {
      // Update the actual payroll information
      const payrollInfo = await PayrollInformation.findByPk(
        request.payroll_info_id
      );
      if (payrollInfo) {
        await payrollInfo.update(request.changes);
      }

      // Update the request status
      await request.update({
        status: "Approved",
        reviewed_by: reviewed_by || "Admin",
        reviewed_at: new Date(),
      });
    }

    console.log(
      `✅ Bulk approved ${pendingRequests.length} payroll change requests`
    );
    res.status(200).json({
      success: true,
      message: `Successfully approved ${pendingRequests.length} change requests`,
    });
  } catch (error) {
    console.error("❌ Error bulk approving payroll changes:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bulkRejectPayrollChanges = async (req, res) => {
  const { reviewed_by, rejection_reason } = req.body;

  try {
    console.log("💡 Bulk rejecting all pending payroll change requests");

    // Get all pending requests
    const pendingRequests = await PayrollChangeRequest.findAll({
      where: { status: "Pending" },
    });

    if (pendingRequests.length === 0) {
      return res
        .status(200)
        .json({ success: true, message: "No pending requests to reject" });
    }

    // Update all pending requests to rejected
    await PayrollChangeRequest.update(
      {
        status: "Rejected",
        reviewed_by: reviewed_by || "Admin",
        reviewed_at: new Date(),
        rejection_reason: rejection_reason || "Bulk rejection",
      },
      {
        where: { status: "Pending" },
      }
    );

    console.log(
      `✅ Bulk rejected ${pendingRequests.length} payroll change requests`
    );
    res.status(200).json({
      success: true,
      message: `Successfully rejected ${pendingRequests.length} change requests`,
    });
  } catch (error) {
    console.error("❌ Error bulk rejecting payroll changes:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Create a transporter object using your email provider's SMTP settings


export const messageEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      employeeName,
      employeeCode,
      employeeEmail,
      subject,
      message,
      sentAt,
      sentBy,
    } = req.body;

    console.log('Request body:', req.body);
    console.log('Files received:', req.files ? req.files.length : 0);

    // Validate required fields
    if (!employeeId || !employeeName || !employeeCode || !employeeEmail || !subject || !message || !sentAt || !sentBy) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(employeeEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Process attachments - handle only FormData files
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        filename: file.originalname,
        content: file.buffer,
        contentType: file.mimetype,
        size: file.size
      }));
      console.log(`Processing ${attachments.length} file attachments`);
    }

    // Validate attachments
    if (attachments.length > 10) {
      return res.status(400).json({
        success: false,
        message: "Maximum 10 attachments allowed",
      });
    }

    // Validate file sizes (max 100MB per file)
    const maxFileSize = 100 * 1024 * 1024; // 100MB
    const oversizedFiles = attachments.filter(file => file.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Files exceed 10MB limit: ${oversizedFiles.map(f => f.filename).join(', ')}`,
      });
    }

    // Configure email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: employeeEmail,
      subject: `${subject}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            /* Reset styles for better email client compatibility */
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              margin: 0;
              padding: 0;
              -webkit-text-size-adjust: 100%;
              -ms-text-size-adjust: 100%;
            }
            
            table {
              border-collapse: collapse;
              mso-table-lspace: 0pt;
              mso-table-rspace: 0pt;
            }
            
            img {
              border: 0;
              height: auto;
              line-height: 100%;
              outline: none;
              text-decoration: none;
              -ms-interpolation-mode: bicubic;
            }
            
            @media only screen and (max-width: 600px) {
              .email-container {
                width: 100% !important;
                max-width: 100% !important;
              }
              .header-footer-image {
                width: 100% !important;
                height: auto !important;
              }
              .content-padding {
                padding: 15px !important;
              }
              .disclaimer-padding {
                padding: 10px 15px !important;
              }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f9f9f9;">
          
          <div class="email-container" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; width: 100%;">

            <!-- Header Image -->
            <div style="width: 100%; overflow: hidden;">
              <img src="https://stjohnmajore.com/images/HEADER.png" 
                  alt="Header Image" 
                  class="header-footer-image"
                  style="width: 100%; max-width: 600px; height: auto; display: block;" />
            </div>

            <!-- Content Section -->
            <div class="content-padding" style="padding: 20px;">
              <div style="background-color: #fff; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <p style="line-height: 1.6; margin-bottom: 15px; color: #333;">${message}</p>
                
                <p style="margin-top: 20px; color: #666;">
                  Best regards,<br />
                  <strong style="color: #333;">${sentBy}</strong>
                </p>
              </div>
            </div>

            <!-- Disclaimer Section -->
            <div class="disclaimer-padding" style="padding: 15px 20px; background-color: #f0f0f0; border-top: 1px solid #ddd;">
              <p style="font-size: 12px; line-height: 1.4; color: #666; text-align: center; margin: 0;">
                <strong>This is an automated email—please do not reply.</strong><br />
                Kindly keep this message for your records and reference purposes.
              </p>
            </div>

            <!-- Footer Image -->
            <div style="width: 100%; overflow: hidden;">
              <img src="https://stjohnmajore.com/images/FOOTER.png" 
                  alt="Footer Image" 
                  class="header-footer-image"
                  style="width: 100%; max-width: 600px; height: auto; display: block;" />
            </div>
          </div>
          
        </body>
        </html>
      `,
      // Plain text version for email clients that don't support HTML
      text: `
Message for ${employeeName} (${employeeCode})

Employee Details:
Name: ${employeeName}
Employee Code: ${employeeCode}
Email: ${employeeEmail}

Subject: ${subject}

Message:
${message}

${attachments.length > 0 ? `
Attachments (${attachments.length}):
${attachments.map(file => `• ${file.filename} (${(file.size / 1024).toFixed(1)} KB)`).join('\n')}
` : ''}

Best regards,
${sentBy}

Sent at: ${new Date(sentAt).toLocaleString()}
      `,
      // Multiple attachments support
      attachments: attachments.length > 0 ? attachments.map(file => ({
        filename: file.filename,
        content: file.content,
        contentType: file.contentType
      })) : []
    };

    console.log("mailOptions:", JSON.stringify(mailOptions, null, 2)); // Log mailOptions

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    console.log(`Email sent with ${attachments.length} attachments`);

    // Return success response
    res.status(200).json({
      success: true,
      message: "Email sent successfully",
      data: {
        messageId: info.messageId,
        recipient: employeeEmail,
        sentAt: new Date().toISOString(),
        attachmentCount: attachments.length,
        attachments: attachments.map(file => ({
          filename: file.filename,
          size: file.size,
          contentType: file.contentType
        }))
      },
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message // Include the error message
    });
  }
};
