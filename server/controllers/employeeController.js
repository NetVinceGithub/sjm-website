import axios from "axios";
import dotenv from "dotenv";
import cron from "node-cron";
import Employee from "../models/Employee.js"; // Employee Sequelize model
import PayrollInformation from "../models/PayrollInformation.js"; // Payroll Sequelize model
import PayrollChangeRequest from "../models/PayrollChangeRequest.js";

import sequelize from "../db/db.js";
import { QueryTypes } from "sequelize";

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

    const headers = rows[0].map(header => header.toLowerCase().replace(/\s+/g, ""));
    const validEmployees = rows.slice(1).map(row => {
      const employeeObj = {};
      headers.forEach((header, colIndex) => {
        employeeObj[header] = row[colIndex] || "";
      });
      return employeeObj;
    });

    // Get all current employee ids from your database
    const existingEmployees = await Employee.findAll();
    const existingEmployeeIds = existingEmployees.map(e => e.id);

    // Track the IDs of employees in the sheet
    const sheetEmployeeIds = [];

    for (const employee of validEmployees) {
      // Upsert employee (insert or update)
      // Remove duplicate upsert call here
      await Employee.upsert(employee);
    
      // Then fetch employee by unique field
      const savedEmployeeRecord = await Employee.findOne({ where: { ecode: employee.ecode } });
      if (!savedEmployeeRecord) {
        console.error("Failed to find employee after upsert:", employee.ecode);
        continue; // skip this employee to avoid crash
      }
    
      sheetEmployeeIds.push(savedEmployeeRecord.id);
    
      console.log(`✅ Employee Saved/Updated: ${savedEmployeeRecord.name || "Unknown Employee"}`);
    
      // Check payroll info
      const existingPayroll = await PayrollInformation.findOne({
        where: { employee_id: savedEmployeeRecord.id }
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
      
        console.log(`✅ PayrollInformation Created for ${savedEmployeeRecord.ecode}`);
      } else {
        // Only update employee-identifying fields without resetting payroll numbers
        await existingPayroll.update({
          ecode: savedEmployeeRecord.ecode,
          name: savedEmployeeRecord.name,
          positiontitle: savedEmployeeRecord.positiontitle || "N/A",
          area_section: savedEmployeeRecord.department || "N/A",
          email: savedEmployeeRecord.emailaddress || "N/A",
        });
      
        console.log(`🔄 PayrollInformation Updated for ${savedEmployeeRecord.ecode}`);
      }
      
    }
    

    // OPTIONAL: Remove employees not in the sheet anymore
    const employeesToRemove = existingEmployees.filter(e => !sheetEmployeeIds.includes(e.id));
    for (const emp of employeesToRemove) {
      await PayrollInformation.destroy({ where: { employee_id: emp.id } });
      await Employee.destroy({ where: { id: emp.id } });
      console.log(`🗑 Employee and Payroll removed: ${emp.name || emp.id}`);
    }

    console.log("🎉 All employees & payroll data have been imported and synced successfully!");

  } catch (error) {
    console.error("❌ Error fetching employees:", error);
  }
};


// API Endpoint
export const importEmployeesFromGoogleSheet = async (req, res) => {
  try {
    await fetchAndSaveEmployees();
    res.status(201).json({ success: true, message: "Employees imported successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error syncing employees" });
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
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    res.status(200).json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getPayrollInformations = async (req, res) => {
  try {
    const payrollInformations = await PayrollInformation.findAll();
    res.status(200).json({ success: true, payrollInformations});
  } catch (error) {
    res.status(500).json({success: false, message: error.message}) }
}

export const getPayrollInformationsById = async (req, res) => {
  const { id } = req.params;
  try{
    const payrollInformation = await PayrollInformation.findByPk(id);
    if (!payrollInformation) {
      return res.status(404).json({success: true, message: "Payroll Data not found"});
    }
    res.status(200).json({success: true, payrollInformation});
  }catch (error) {
    res.status(500).json({success:false, message:error.message});
  }
}

export const updatePayrollInformation = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const payrollInfo = await PayrollInformation.findByPk(id);

    if (!payrollInfo) {
      return res.status(404).json({ success: false, message: "Payroll data not found" });
    }

    await payrollInfo.update(updatedData);

    res.status(200).json({ success: true, message: "Payroll information updated successfully", payrollInfo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const requestPayrollChange = async (req, res) => {
  const { payroll_info_id, changes, reason, requested_by } = req.body;

  console.log("Received data:", req.body);

  try {
    if (!payroll_info_id || !changes || !requested_by) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const result = await PayrollChangeRequest.create({
      payroll_info_id,
      changes,
      reasons: reason,
      requested_by
    });

    res.status(200).json({ success: true, message: "Request submitted" });
  } catch (error) {
    console.error("Error saving payroll change request:", error);
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
      return res.status(404).json({ success: false, message: "Employee not found" });
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
      "SELECT * FROM employees", // ✅ Remove WHERE condition
      { type: QueryTypes.SELECT }
    );

    console.log("Query executed successfully:", employees);
    res.status(200).json(employees);
  } catch (error) {
    console.error("Database Query Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
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
    console.log('Request body:', req.body); // Add this for debugging
    console.log('Request params:', req.params); // Add this for debugging

    // Find the change request
    const changeRequest = await PayrollChangeRequest.findByPk(id);
    if (!changeRequest) {
      console.log(`❌ Change request ${id} not found`);
      return res.status(404).json({ success: false, message: "Change request not found" });
    }

    console.log('Found change request:', changeRequest.toJSON()); // Add this for debugging

    // Check if already processed
    if (changeRequest.status !== 'Pending') {
      console.log(`❌ Change request ${id} already processed with status: ${changeRequest.status}`);
      return res.status(400).json({ success: false, message: "Change request already processed" });
    }

    // Update the actual payroll information with the requested changes
    const payrollInfo = await PayrollInformation.findByPk(changeRequest.payroll_info_id);
    if (!payrollInfo) {
      console.log(`❌ Payroll information not found for ID: ${changeRequest.payroll_info_id}`);
      return res.status(404).json({ success: false, message: "Payroll information not found" });
    }

    console.log('Current payroll info:', payrollInfo.toJSON()); // Add this for debugging
    console.log('Changes to apply:', changeRequest.changes); // Add this for debugging

    // Apply the changes
    await payrollInfo.update(changeRequest.changes);

    // Update the change request status
    await changeRequest.update({
      status: 'Approved',
      reviewed_by: reviewed_by || 'Admin',
      reviewed_at: new Date()
    });

    console.log(`✅ Payroll change request ${id} approved and applied`);
    res.status(200).json({ success: true, message: "Change request approved successfully" });

  } catch (error) {
    console.error("❌ Error approving payroll change:", error);
    console.error("❌ Error stack:", error.stack); // Add full stack trace
    res.status(500).json({ success: false, message: error.message, error: error.stack });
  }
};

export const rejectPayrollChange = async (req, res) => {
  const { id } = req.params;
  const { reviewed_by, rejection_reason } = req.body;

  try {
    console.log(`💡 Rejecting payroll change request ${id}`);
    console.log('Request body:', req.body); // Add this for debugging

    // Find the change request
    const changeRequest = await PayrollChangeRequest.findByPk(id);
    if (!changeRequest) {
      console.log(`❌ Change request ${id} not found`);
      return res.status(404).json({ success: false, message: "Change request not found" });
    }

    // Check if already processed
    if (changeRequest.status !== 'Pending') {
      console.log(`❌ Change request ${id} already processed with status: ${changeRequest.status}`);
      return res.status(400).json({ success: false, message: "Change request already processed" });
    }

    // Update the change request status
    await changeRequest.update({
      status: 'Rejected',
      reviewed_by: reviewed_by || 'Admin',
      reviewed_at: new Date(),
      rejection_reason: rejection_reason || 'No reason provided'
    });

    console.log(`✅ Payroll change request ${id} rejected`);
    res.status(200).json({ success: true, message: "Change request rejected successfully" });

  } catch (error) {
    console.error("❌ Error rejecting payroll change:", error);
    console.error("❌ Error stack:", error.stack); // Add full stack trace
    res.status(500).json({ success: false, message: error.message, error: error.stack });
  }
};

export const bulkApprovePayrollChanges = async (req, res) => {
  const { reviewed_by } = req.body;

  try {
    console.log("💡 Bulk approving all pending payroll change requests");

    // Get all pending requests
    const pendingRequests = await PayrollChangeRequest.findAll({
      where: { status: 'Pending' }
    });

    if (pendingRequests.length === 0) {
      return res.status(200).json({ success: true, message: "No pending requests to approve" });
    }

    // Process each request
    for (const request of pendingRequests) {
      // Update the actual payroll information
      const payrollInfo = await PayrollInformation.findByPk(request.payroll_info_id);
      if (payrollInfo) {
        await payrollInfo.update(request.changes);
      }

      // Update the request status
      await request.update({
        status: 'Approved',
        reviewed_by: reviewed_by || 'Admin',
        reviewed_at: new Date()
      });
    }

    console.log(`✅ Bulk approved ${pendingRequests.length} payroll change requests`);
    res.status(200).json({ 
      success: true, 
      message: `Successfully approved ${pendingRequests.length} change requests` 
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
      where: { status: 'Pending' }
    });

    if (pendingRequests.length === 0) {
      return res.status(200).json({ success: true, message: "No pending requests to reject" });
    }

    // Update all pending requests to rejected
    await PayrollChangeRequest.update(
      {
        status: 'Rejected',
        reviewed_by: reviewed_by || 'Admin',
        reviewed_at: new Date(),
        rejection_reason: rejection_reason || 'Bulk rejection'
      },
      {
        where: { status: 'Pending' }
      }
    );

    console.log(`✅ Bulk rejected ${pendingRequests.length} payroll change requests`);
    res.status(200).json({ 
      success: true, 
      message: `Successfully rejected ${pendingRequests.length} change requests` 
    });

  } catch (error) {
    console.error("❌ Error bulk rejecting payroll changes:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};