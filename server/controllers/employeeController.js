import axios from "axios";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import cron from "node-cron";
import Employee from "../models/Employee.js"; // Sequelize model

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

    // Save to MySQL Database
    for (const employee of validEmployees) {
      await Employee.upsert(employee); // Upsert to avoid duplicates
      console.log(`✅ Saved: ${employee.name || "Unknown Employee"}`);
    }

    console.log("🎉 All employees have been imported successfully!");

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
