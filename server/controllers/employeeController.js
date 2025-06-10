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

dotenv.config();

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
        `✅ Employee Saved/Updated: ${
          savedEmployeeRecord.name || "Unknown Employee"
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

    console.log(req.body);

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

    // Configure email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: employeeEmail,
      subject: `${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9;">

          <!-- Header Image -->
          <div style="width: 600px; height: 200px; overflow: hidden;">
            <img src="https://stjohnmajore.com/images/HEADER.png" alt="Header Image" style="width: 600px; height: 200px; display: block;" />
          </div>

          <!-- Content Section -->
          <div style="padding: 20px;">
            <h2 style="color: #333;">Message Notification</h2>
            
            <div style="background-color: #fff; padding: 20px; border-left: 4px solid #007bff; margin: 20px 0;">
              <p style="line-height: 1.6;">${message}</p>

              <p> Best regards, <br />${sentBy}</p>
            </div>
          </div>


          <!-- Footer Image -->
          <div style="width: 600px; height: 200px; overflow: hidden;">
<<<<<<< HEAD
            <img src="https://stjohnmajore.com/images/FOOTER.png" alt="Footer Image" style="width: 600px; height: 200px; display: block;" />
=======
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlgAAADICAYAAAA0n5+2AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAE32lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDI1LTA2LTEwPC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkV4dElkPjVjYTc1MDE1LWE4ZDYtNGJlZi1iOGNkLTZmMzJlNTRmODA4NDwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz5Zb3VyIHBhcmFncmFwaCB0ZXh0IC0gRk9PVEVSPC9yZGY6bGk+CiAgIDwvcmRmOkFsdD4KICA8L2RjOnRpdGxlPgogPC9yZGY6RGVzY3JpcHRpb24+CgogPHJkZjpE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" alt="Footer Image" style="width: 600px; height: 200px; display: block;" />

>>>>>>> d48202fb8e6c2544a6b7a893822697bab16403e7
          </div>
        </div>

      `,
      // Plain text version for email clients that don't support HTML
      text: `
        Message for ${employeeName} (${employeeCode})
        
        Employee Details:
        Name: ${employeeName}
        Employee Code: ${employeeCode}
        Email: ${employeeEmail}
        
        Message:
        ${message}
        
        Sent by: ${sentBy}
        Sent at: ${new Date(sentAt).toLocaleString()}
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);

    // Return success response
    res.status(200).json({
      success: true,
      message: "Email sent successfully",
      data: {
        messageId: info.messageId,
        recipient: employeeEmail,
        sentAt: new Date().toISOString(),
      },
    });
  } catch (error) {

    console.error('Error sending email:', error);


    // Handle nodemailer specific errors
    if (error.code === "EAUTH") {
      return res.status(500).json({
        success: false,
        message:
          "Email authentication failed. Please check your email credentials.",
      });
    }


    if (error.code === 'ENOTFOUND') {

      return res.status(500).json({
        success: false,
        message:
          "Email server not found. Please check your SMTP configuration.",
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
