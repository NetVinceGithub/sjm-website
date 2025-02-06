import axios from "axios";
import dotenv from "dotenv";
import Employee from "../models/Employee.js";
import cron from "node-cron";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const SHEET_URL = "https://sheets.googleapis.com/v4/spreadsheets/1zy38CYQmMYxQOSjw_0O0kvrNZmVmK72xfUUisf18l8I/values/Sheet1?key=AIzaSyBYADFdllhMAiSh6T5hQTiNWdy1eGEkIhA";

const fetchAndSaveEmployees = async () => {
  try {
    const response = await axios.get(SHEET_URL);
    const rows = response.data.values;

    if (!rows || rows.length < 2) {
      console.log("No employee data found");
      return;
    }

    const headers = rows[0].map(header => header.toLowerCase().replace(/\s+/g, ""));

    const validEmployees = rows.slice(1).map(row => {
      const employeeObj = {};
      headers.forEach((header, colIndex) => {
        employeeObj[header] = row[colIndex] || "";
      });

      // Ensure employeeId is valid
      if (!employeeObj.employeeid || employeeObj.employeeid.trim() === "" || employeeObj.employeeid === "null") {
        employeeObj.employeeid = `EMP-${uuidv4()}`;
      }

      return employeeObj;
    });

    for (const employee of validEmployees) {
      // Ensure `ecode` does not break the query if it's not in the schema
      const query = employee.ecode ? { ecode: employee.ecode } : { employeeId: employee.employeeid };

      let existingEmployee = await Employee.findOne(query);

      if (existingEmployee) {
        employee.employeeid = existingEmployee.employeeId;
      }

      await Employee.findOneAndUpdate(
        query,
        { $set: employee },
        { upsert: true, new: true, strict: false } // ✅ Allow new fields temporarily
      );
    }

    console.log(`Processed ${validEmployees.length} employees`);
  } catch (error) {
    console.error("Error importing employees:", error);
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

// Get all employees from the database
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json({ success: true, employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
