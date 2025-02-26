import axios from "axios";
import dotenv from "dotenv";
import cron from "node-cron";
import Employee from "../models/Employee.js"; // Employee Sequelize model
import PayrollInformation from "../models/PayrollInformation.js"; // Payroll Sequelize model

dotenv.config();

const SHEET_URL = process.env.GOOGLE_SHEET_URL; // Store API Key securely in .env

const fetchAndSaveEmployees = async () => {
  try {
    const response = await axios.get(SHEET_URL);
    console.log("✅ Raw Google Sheets Data:", response.data);

    const rows = response.data.values;
    if (!rows || rows.length < 2) {
      console.log("⚠ No employee data found");
      return;
    }

    const headers = rows[0].map(header => header.toLowerCase().replace(/\s+/g, ""));
    console.log("✅ Headers:", headers);

    const validEmployees = rows.slice(1).map(row => {
      const employeeObj = {};
      headers.forEach((header, colIndex) => {
        employeeObj[header] = row[colIndex] || "";
      });
      return employeeObj;
    });

    console.log(`🔄 Processing ${validEmployees.length} employees...`);

    // Save employees & create payroll information
    for (const employee of validEmployees) {
      const [savedEmployee, created] = await Employee.upsert(employee, { returning: true });
      console.log(`✅ Employee Saved: ${savedEmployee.name || "Unknown Employee"}`);

      // Check if payroll information already exists for this employee
      const existingPayroll = await PayrollInformation.findOne({
        where: { employee_id: savedEmployee.id }
      });

      if (!existingPayroll) {
        await PayrollInformation.create({
          employee_id: savedEmployee.id,
          ecode: savedEmployee.ecode,
          name: savedEmployee.name,
          positiontitle: savedEmployee.positiontitle || "N/A",
          area_section: savedEmployee.department || "N/A",
          email: savedEmployee.emailaddress || "N/A",
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

        console.log(`✅ PayrollInformation Created for ${savedEmployee.ecode}`);
      } else {
        console.log(`⚠ PayrollInformation already exists for ${savedEmployee.ecode}`);
      }
    }

    console.log("🎉 All employees & payroll data have been imported successfully!");

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
