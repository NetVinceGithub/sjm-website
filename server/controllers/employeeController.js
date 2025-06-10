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
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlgAAADICAYAAAA0n5+2AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAFx2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDI1LTA2LTEwPC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkV4dElkPmUxMjBlNzE2LTRiN2UtNDM0Ny1hOWZjLTU0NGUyNDVjMDU2NTwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6Q29udGFpbnNBaUdlbmVyYXRlZENvbnRlbnQ9J2h0dHBzOi8vY2FudmEuY29tL2V4cG9ydCc+CiAgPENvbnRhaW5zQWlHZW5lcmF0ZWRDb250ZW50OkNvbnRhaW5zQWlHZW5lcmF0ZWRDb250ZW50PlllczwvQ29udGFpbnNBaUdlbmVyYXRlZENvbnRlbnQ6Q29udGFpbnNBaUdlbmVyYXRlZENvbnRlbnQ+CiA8L3JkZjpEZXNjcmlwdGlvbj4K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" alt="Header Image" style="width: 600px; height: 200px; display: block;" />
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
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlgAAADICAYAAAA0n5+2AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAE32lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDI1LTA2LTEwPC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkV4dElkPjVjYTc1MDE1LWE4ZDYtNGJlZi1iOGNkLTZmMzJlNTRmODA4NDwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz5Zb3VyIHBhcmFncmFwaCB0ZXh0IC0gRk9PVEVSPC9yZGY6bGk+CiAgIDwvcmRmOkFsdD4KICA8L2RjOnRpdGxlPgogPC9yZGY6RGVzY3JpcHRpb24+CgogPHJkZjpE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" alt="Footer Image" style="width: 600px; height: 200px; display: block;" />

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
