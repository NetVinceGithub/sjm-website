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
import multer from "multer";
import { Op } from 'sequelize';

dotenv.config();

// Load allowed types from environment variable (optional)
const allowedTypesEnv = process.env.ALLOWED_FILE_TYPES;
const defaultAllowedTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
];

const allowedTypes = allowedTypesEnv
  ? allowedTypesEnv.split(",")
  : defaultAllowedTypes;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure 'uploads/' directory exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExt = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + fileExt);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 10MB per file
    files: 10, // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypesLower = allowedTypes.map((type) => type.toLowerCase()); // Convert to lowercase once

    if (allowedTypesLower.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      console.log(`Rejected file type: ${file.mimetype}`);
      cb(
        new Error(
          `File type ${
            file.mimetype
          } not allowed. Allowed types are: ${allowedTypes.join(", ")}`
        ),
        false
      );
    }
  },
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

    // Process headers to lowercase and remove spaces
    const rawHeaders = rows[0];
    const processedHeaders = rawHeaders.map((header) =>
      header.toLowerCase().replace(/\s+/g, "")
    );

    // Create field mapping from processed headers to model field names
    // Add ALL possible variations of your important fields
    // Create field mapping from processed headers to model field names
    const fieldMapping = {
      // Employee Code variations
      'ecode': 'ecode',
      'employeecode': 'ecode',
      'employeeid': 'ecode',
      'empcode': 'ecode',
      'code': 'ecode',
      'id': 'ecode',
      
      // Daily Rate variations
      'dailyrate': 'dailyRate',
      'daily_rate': 'dailyRate',
      'rate': 'dailyRate',
      'dailypay': 'dailyRate',
      'daily': 'dailyRate',
      
      // Salary Package variations
      'salarypackage': 'salaryPackage',
      'salary_package': 'salaryPackage',
      'package': 'salaryPackage',
      'monthlysalary': 'salaryPackage',
      'monthly_salary': 'salaryPackage',
      'salary': 'salaryPackage',
      'monthlysalarypackage': 'salaryPackage',
      'monthly_salary_package': 'salaryPackage',
      'salaryamount': 'salaryPackage',
      'salary_amount': 'salaryPackage',
      'basicsalary': 'salaryPackage',
      'basic_salary': 'salaryPackage',
      'monthlyrate': 'salaryPackage',
      'monthly_rate': 'salaryPackage',
      
      // Name variations
      'name': 'name',
      'employeename': 'name',
      'fullname': 'name',
      'employee_name': 'name',
      'firstname': 'firstname',
      'first_name': 'firstname',
      'lastname': 'lastname',
      'last_name': 'lastname',
      'middlename': 'middlename',
      'middle_name': 'middlename',
      
      // Contact Number variations - FIXED
      'contactno.': 'contactno',           // Keep as contactno
      'contact_no': 'contactno',          // Map contact_no to contactno
      'contactnumber': 'contactno',       // Map contactnumber to contactno
      'contact_number': 'contactno',      // Map contact_number to contactno
      'phone': 'contactno',               // Map phone to contactno
      'phonenumber': 'contactno',         // Map phonenumber to contactno
      'phone_number': 'contactno',        // Map phone_number to contactno
      'mobile': 'contactno',              // Map mobile to contactno
      'mobilenumber': 'contactno',        // Map mobilenumber to contactno
      'mobile_number': 'contactno',       // Map mobile_number to contactno
      
      // Email variations
      'emailaddress': 'emailaddress',
      'email_address': 'emailaddress',
      'email': 'emailaddress',
      
      // Emergency Contact variations
      'emergencycontact': 'emergencyContact',
      'emergency_contact': 'emergencyContact',
      'emergencycontactnumber': 'emergencyContactNumber',
      'emergency_contact_number': 'emergencyContactNumber',
    // Using the exact database field name: emergencycontactAddress
      'emergencycontactaddress': 'emergencycontactAddress',      // Main mapping
      'emergency_contact_address': 'emergencycontactAddress',    // Alternative format
      'emergencycontactlocation': 'emergencycontactAddress',     // Alternative name
      'emergency_contact_location': 'emergencycontactAddress',   // Alternative name
      'emergencyaddress': 'emergencycontactAddress',             // Shorter version
      'emergency_address': 'emergencycontactAddress',  
      
      // Other fields...
      'healthcard': 'healthCard',
      'health_card': 'healthCard',
      'profileimage': 'profileImage',
      'profile_image': 'profileImage',
      'attendedtrainingandseminar': 'attendedtrainingandseminar',
      'dateofseparation': 'dateofseparation',
      'date_of_separation': 'dateofseparation',
      'dateofhire': 'dateofhire',
      'date_of_hire': 'dateofhire',
      'positiontitle': 'positiontitle',
      'position_title': 'positiontitle',
      'position': 'positiontitle',
      'civilstatus': 'civilstatus',
      'civil_status': 'civilstatus',
      'birthdate': 'birthdate',
      'birth_date': 'birthdate',
      'permanentaddress': 'permanentaddress',
      'permanent_address': 'permanentaddress',
      'currentaddress': 'currentaddress',
      'current_address': 'currentaddress',
      'governmentidnumber': 'governmentidnumber',
      'government_id_number': 'governmentidnumber',
      'employmentstatus': 'employmentstatus',
      'employment_status': 'employmentstatus',
      'employmentrank': 'employmentrank',
      'employment_rank': 'employmentrank',
      'tenuritytoclient(inmonths)': 'tenuritytoclient(inmonths)',
      'team(a/b)': 'team(a/b)',
      'area/section': 'area/section',
      'pag-ibig': 'pag-ibig',
      'esignature': 'esignature',
      'e_signature': 'esignature',
    };

    console.log("🔍 Emergency contact address mapping:", 
    processedHeaders.includes('emergencycontactaddress') ? 'FOUND' : 'NOT FOUND');
    console.log("🔍 Contact number mapping:", 
    processedHeaders.includes('contactno.') ? 'FOUND' : 'NOT FOUND');

    // Enhanced debug logging
    console.log("🔍 Raw headers from sheet:", rawHeaders);
    console.log("🔍 Processed headers:", processedHeaders);
    
    // Check which headers map to salary/rate fields
    const salaryRelatedHeaders = processedHeaders.filter(header => 
      header.includes('salary') || header.includes('package') || header.includes('monthly') || header.includes('daily') || header.includes('rate')
    );
    console.log("🔍 Salary/Rate related headers:", salaryRelatedHeaders);
    
    salaryRelatedHeaders.forEach(header => {
      const mappedField = fieldMapping[header] || header;
      console.log(`   "${header}" → "${mappedField}"`);
    });
    
    // Debug: Show a sample row to see what data we're getting
    if (rows.length > 1) {
      console.log("🔍 Sample data row:", rows[1]);
      console.log("🔍 Header-to-data mapping for first row:");
      processedHeaders.forEach((header, index) => {
        if (salaryRelatedHeaders.includes(header)) {
          const mappedField = fieldMapping[header] || header;
          console.log(`   ${header} → ${mappedField}: "${rows[1][index] || 'undefined'}" (type: ${typeof rows[1][index]})`);
        }
      });
    }

    const validEmployees = rows.slice(1).map((row, rowIndex) => {
      const employeeObj = {};
      processedHeaders.forEach((processedHeader, colIndex) => {
        // Use mapping if available, otherwise use processed header as-is
        const modelFieldName = fieldMapping[processedHeader] || processedHeader;
        const cellValue = row[colIndex]?.trim() || "";
        employeeObj[modelFieldName] = cellValue;
        
        // Debug for first row only
        if (rowIndex === 0 && (processedHeader.includes('ecode') || processedHeader.includes('salary') || processedHeader.includes('daily') || processedHeader.includes('package'))) {
          console.log(`🔍 Field mapping: "${processedHeader}" → "${modelFieldName}" = "${cellValue}"`);
        }
      });
      return employeeObj;
    });

    // Helper to clean email (return null if empty or invalid)
    const cleanEmail = (email) => {
      if (!email || typeof email !== "string") return null;
      const trimmed = email.trim();
      return trimmed === "" ? null : trimmed;
    };

    // Helper to clean string fields (handle empty strings and trim)
    const cleanString = (value) => {
      if (!value || typeof value !== "string") return null;
      const trimmed = value.trim();
      return trimmed === "" ? null : trimmed;
    };

    // Enhanced helper to clean integer fields with better debugging
    const cleanInt = (value, fieldName = '') => {
      if (value === "" || value === null || value === undefined) {
        return null;
      }
      
      // Convert to string and remove any non-numeric characters except decimal point and negative sign
      const stringValue = String(value).trim();
      const cleanedValue = stringValue.replace(/[^0-9.-]/g, '');
      
      if (fieldName === 'dailyRate' || fieldName === 'salaryPackage') {
        console.log(`   cleanInt for ${fieldName}: "${value}" → "${cleanedValue}"`);
      }
      
      // Use parseFloat first to handle decimal inputs, then convert to int
      const floatVal = parseFloat(cleanedValue);
      if (isNaN(floatVal)) {
        return null;
      }
      
      // Convert to integer (this will truncate decimals)
      const intVal = Math.floor(Math.abs(floatVal)); // Use Math.floor and abs to ensure positive integer
      
      if (fieldName === 'dailyRate' || fieldName === 'salaryPackage') {
        console.log(`   → final result: ${intVal}`);
      }
      
      return intVal;
    };

    // Helper to clean decimal fields (for rates, amounts, etc.)
    const cleanDecimal = (value) => {
      if (value === "" || value === null || value === undefined) return null;
      
      // Convert to string and remove any non-numeric characters except decimal point and negative sign
      const stringValue = String(value).trim();
      const cleanedValue = stringValue.replace(/[^0-9.-]/g, '');
      
      const floatVal = parseFloat(cleanedValue);
      return isNaN(floatVal) ? null : floatVal;
    };

    // Updated field arrays using model field names (camelCase)
    const integerFields = [
      "hc",
      "age",
      "dailyRate",      // Keep as integer field
      "salaryPackage",  // Keep as integer field - the issue might be elsewhere
    ];

    // List string fields that need cleaning (contact info, names, etc.)
    const stringFields = [
      "ecode",
      "name",
      "lastname",
      "firstname",
      "middlename",
      "project",
      "positiontitle",
      "department",
      "area/section",
      "employmentrank",
      "dateofhire",
      "tenuritytoclient(inmonths)",
      "employmentstatus",
      "team(a/b)",
      "civilstatus",
      "gender",
      "birthdate",
      "address",
      "permanentaddress",
      "contactno",
      "emailaddress",
      "governmentidnumber",
      "emergencyContact",
      "emergencyContactNumber",
      "emergencycontactAddress",  // ✅ Matches database field exactly
      "healthCard",
      "prp",
      "safety",
      "sss",
      "tin",
      "philhealth",
      "pag-ibig",
      "profileImage",
      "esignature",
      "status",
      "attendedtrainingandseminar",
      "dateofseparation",
      "medical",
    ];

    // List decimal fields that might be in your sheet
    const decimalFields = [
      "overtimepay",
      "holidaypay",
      "nightdifferential",
      "allowance",
      "taxdeduction",
      "ssscontribution",
      "pagibigcontribution",
      "philhealthcontribution",
    ];

    // Fetch existing employees from DB
    const existingEmployees = await Employee.findAll();
    const existingEmployeeIds = existingEmployees.map((e) => e.id);
    const sheetEmployeeIds = [];

    for (const employee of validEmployees) {
      // Enhanced debug: Log the employee data before cleaning
      console.log(`\n🔍 Processing employee: ${employee.ecode || 'Unknown'}`);
      console.log(`🔍 RAW DATA - dailyRate: "${employee.dailyRate}" (${typeof employee.dailyRate}), salaryPackage: "${employee.salaryPackage}" (${typeof employee.salaryPackage})`);

      // Clean email
      employee.emailaddress = cleanEmail(employee.emailaddress);

      // Clean string fields (including contact info)
      stringFields.forEach((field) => {
        if (employee.hasOwnProperty(field)) {
          employee[field] = cleanString(employee[field]);
        }
      });

      // Clean integer fields with enhanced debugging
      integerFields.forEach((field) => {
        if (employee.hasOwnProperty(field)) {
          const originalValue = employee[field];
          employee[field] = cleanInt(employee[field], field);
          
          // Enhanced debug logging for critical fields
          if (field === 'dailyRate' || field === 'salaryPackage') {
            console.log(`🔍 CLEANED DATA - ${field}: "${originalValue}" → ${employee[field]} (${typeof employee[field]})`);
          }
        }
      });

      // Clean decimal fields
      decimalFields.forEach((field) => {
        if (employee.hasOwnProperty(field)) {
          employee[field] = cleanDecimal(employee[field]);
        }
      });

      // **FIXED**: Handle required fields that cannot be null
      // Provide fallbacks for required fields based on your model constraints
      
      // Handle 'ecode' field FIRST - this is the most critical identifier
      if (!employee.ecode || employee.ecode === null || employee.ecode === '') {
        console.error(`❌ Employee record missing ecode - skipping record with name: ${employee.name || 'Unknown'}`);
        console.error(`   Full employee object:`, JSON.stringify(employee, null, 2));
        continue; // Skip records without employee codes entirely
      }
      
      // Handle 'name' field - required and cannot be null
      if (!employee.name || employee.name === null) {
        // Try to construct name from firstname + lastname, or use ecode as fallback
        const firstName = employee.firstname || '';
        const lastName = employee.lastname || '';
        
        if (firstName && lastName) {
          employee.name = `${firstName} ${lastName}`.trim();
        } else if (firstName) {
          employee.name = firstName;
        } else if (lastName) {
          employee.name = lastName;
        } else {
          // Last resort: use employee code
          employee.name = employee.ecode;
        }
      }

      // Handle 'firstname' field - required and cannot be null
      if (!employee.firstname || employee.firstname === null) {
        // Try to extract from name field, or use ecode as fallback
        if (employee.name && employee.name !== employee.ecode) {
          // Try to get first word from name as firstname
          employee.firstname = employee.name.split(' ')[0];
        } else {
          // Use ecode or default value
          employee.firstname = employee.ecode;
        }
      }

      // Optional: Also handle lastname if you want consistency
      if (!employee.lastname || employee.lastname === null) {
        if (employee.name && employee.name.includes(' ')) {
          // Try to get everything after first word as lastname
          const nameParts = employee.name.split(' ');
          employee.lastname = nameParts.slice(1).join(' ');
        } else {
          employee.lastname = "N/A"; // This field allows null, so we can use default
        }
      }

      // Final debug: Log the employee data after all cleaning
      console.log(`🔍 FINAL DATA for ${employee.ecode}:`);
      console.log(`  - name: "${employee.name}" (type: ${typeof employee.name})`);
      console.log(`  - firstname: "${employee.firstname}" (type: ${typeof employee.firstname})`);
      console.log(`  - dailyRate: ${employee.dailyRate} (type: ${typeof employee.dailyRate})`);
      console.log(`  - salaryPackage: ${employee.salaryPackage} (type: ${typeof employee.salaryPackage})`);

      // Check for null/undefined required fields
      const requiredFields = ['ecode', 'name', 'firstname'];
      const missingFields = requiredFields.filter(field => 
        employee[field] === null || employee[field] === undefined || employee[field] === ''
      );

      if (missingFields.length > 0) {
        console.error(`❌ Missing required fields for ${employee.ecode}:`, missingFields);
        console.error(`   Full employee object:`, JSON.stringify(employee, null, 2));
        // Skip this problematic record
        continue;
      }

      // Log warnings for records with missing critical data
      if (employee.name === employee.ecode || employee.firstname === employee.ecode) {
        console.warn(`⚠️  Employee ${employee.ecode} has missing name data - using ecode as fallback`);
      }

      // Enhanced salary validation
      if (!employee.dailyRate || employee.dailyRate <= 0) {
        console.warn(`⚠️  Employee ${employee.ecode} has invalid dailyRate: ${employee.dailyRate} - using default 520`);
        employee.dailyRate = 520;
      }

      if (!employee.salaryPackage || employee.salaryPackage <= 0) {
        console.warn(`⚠️  Employee ${employee.ecode} has invalid salaryPackage: ${employee.salaryPackage} - using default 16224`);
        employee.salaryPackage = 16224;
      }

      // **ENHANCED**: Use updateOnDuplicate to ensure ALL fields are updated
      const [savedEmployeeRecord, created] = await Employee.upsert(employee, {
        updateOnDuplicate: Object.keys(employee), // Update all fields that exist in the sheet data
        returning: true
      });

      if (!savedEmployeeRecord) {
        console.error("Failed to find employee after upsert:", employee.ecode);
        continue; // Skip this record
      }

      sheetEmployeeIds.push(savedEmployeeRecord.id);

      const action = created ? 'Created' : 'Updated';
      console.log(
        `✅ Employee ${action}: ${savedEmployeeRecord.name || "Unknown Employee"} (${savedEmployeeRecord.ecode})`
      );
      console.log(`   💰 Daily Rate: ${savedEmployeeRecord.dailyRate}, Salary Package: ${savedEmployeeRecord.salaryPackage}`);
      
      // Log contact info changes specifically
      if (!created && (employee.contactno || employee.emergencyContact)) {
        console.log(`   📞 Contact Info - Number: ${employee.contactno || 'N/A'}, Emergency: ${employee.emergencyContact || 'N/A'}`);
      }

      // **ENHANCED**: Payroll info sync with better field mapping and updates
      const existingPayroll = await PayrollInformation.findOne({
        where: { employee_id: savedEmployeeRecord.id },
      });

      // Fixed payroll computation functions
      function hourlyRateComputation() {
        const dailyRate = savedEmployeeRecord.dailyRate || 520;
        const hourlyRate = dailyRate / 8;
        return hourlyRate;
      }

      function otRateRegular() {
        const otRateForRegular = hourlyRateComputation() * 1.25; // 125% of hourly rate
        return otRateForRegular;
      }

      function specialHolidayRate() {
        const dailyRate = savedEmployeeRecord.dailyRate || 520;
        const specialHolidayRateComputation = dailyRate * 1.30; // 130% of daily rate
        return specialHolidayRateComputation;
      }

      function otRateForSpecialHoliday() {
        const specialHoliday = hourlyRateComputation() * 1.30 * 1.30; // 130% of hourly rate * 130%
        return specialHoliday;
      }

      function otRateRegularHoliday() {
        const computation = hourlyRateComputation() * 2 * 1.30; // 200% of hourly rate * 130%
        return computation;
      }

      function ndRate() {
        const computation = hourlyRateComputation() * 0.10; // 10% of hourly rate
        return computation;
      }

      function tardinessComputation() {
        const dailyRate = savedEmployeeRecord.dailyRate || 520;
        const computation = (dailyRate / 8) / 60; // Per minute rate
        return computation;
      }

      function allowanceComputation() {
        const dailyRate = savedEmployeeRecord.dailyRate || 520;
        const salaryPackage = savedEmployeeRecord.salaryPackage || 16224;
        const computation = (salaryPackage - (dailyRate * 26)) / 26;
        return computation;
      }

      function phicComputation() {
        const dailyRate = savedEmployeeRecord.dailyRate || 520;
        const computation = (((dailyRate * 26) * 0.05) / 2) / 2; // 5% of monthly salary divided by 4
        return computation;
      }

      function hdmfComputation() {
        const computation = (400 / 2) / 2; // Fixed HDMF computation
        return computation;
      }

      // Updated payroll data using the computation functions
      const payrollData = {
        employee_id: savedEmployeeRecord.id,
        ecode: savedEmployeeRecord.ecode,
        name: savedEmployeeRecord.name,
        positiontitle: savedEmployeeRecord.positiontitle || "N/A",
        area_section: savedEmployeeRecord.department || "N/A",
        email: savedEmployeeRecord.emailaddress || "N/A",
        
        // Use computed values with proper fallbacks
        daily_rate: savedEmployeeRecord.dailyRate || 520,
        hourly_rate: hourlyRateComputation(),
        ot_hourly_rate: otRateRegular(),
        ot_rate_sp_holiday: otRateForSpecialHoliday(),
        ot_rate_reg_holiday: otRateRegularHoliday(),
        special_hol_rate: specialHolidayRate(),
        regular_hol_ot_rate: otRateRegularHoliday(),
        overtime_pay: otRateRegular(),
        holiday_pay: specialHolidayRate(),
        night_differential: ndRate(),
        allowance: allowanceComputation(),
        tardiness: tardinessComputation(),
        tax_deduction: employee.taxdeduction || 0,
        sss_contribution: 250,
        pagibig_contribution: hdmfComputation(),
        philhealth_contribution: phicComputation(),
        loan: employee.loan || 0,
      };

      if (!existingPayroll) {
        await PayrollInformation.create(payrollData);
        console.log(`✅ PayrollInformation Created for ${savedEmployeeRecord.ecode}`);
      } else {
        // **ENHANCED**: Update ALL fields in payroll, not just basic info
        await existingPayroll.update(payrollData);
        console.log(`🔄 PayrollInformation Updated for ${savedEmployeeRecord.ecode}`);
      }
    }

    // **ENHANCED**: More detailed logging for removals
    const employeesToRemove = existingEmployees.filter(
      (e) => !sheetEmployeeIds.includes(e.id)
    );
    
    if (employeesToRemove.length > 0) {
      console.log(`🗑 Removing ${employeesToRemove.length} employees not found in sheet:`);
      for (const emp of employeesToRemove) {
        await PayrollInformation.destroy({ where: { employee_id: emp.id } });
        await Employee.destroy({ where: { id: emp.id } });
        console.log(`   └── Removed: ${emp.name || emp.ecode || emp.id}`);
      }
    }

    console.log(
      `🎉 Sync completed! Processed ${validEmployees.length} employees from sheet.`
    );
    console.log(
      `   📊 ${sheetEmployeeIds.length} employees synced, ${employeesToRemove.length} removed.`
    );

  } catch (error) {
    console.error("❌ Error fetching employees:", error);
    // **ENHANCED**: More detailed error logging
    if (error.response) {
      console.error("   └── Response error:", error.response.status, error.response.statusText);
    } else if (error.request) {
      console.error("   └── Request error:", error.message);
    } else {
      console.error("   └── Error details:", error.message);
    }
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
        .json({ success: false, message: "Payroll Data not found" }); // Changed to success: false
    }
    res.status(200).json({ success: true, payrollInformation });
  } catch (error) {
    console.error('Error fetching payroll information:', error); // Added logging
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

    res.status(200).json({
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
    // Fetch payroll info using employee_id
    const payrollInfo = await PayrollInformation.findOne({
      where: { employee_id: payroll_info_id },
    });

    if (!payrollInfo) {
      console.error(`Payroll information not found for employee_id: ${payroll_info_id}`);
      return res.status(404).json({
        success: false,
        message: `Payroll information not found for employee_id: ${payroll_info_id}`,
      });
    }

    const employee_name = `${payrollInfo.name}`;
    console.log("Employee name:", employee_name);

    // Fetch user
    const user = await User.findOne({ where: { name: requested_by } });

    if (!user) {
      console.error(`User not found: ${requested_by}`);
      return res.status(404).json({
        success: false,
        message: `User not found: ${requested_by}`,
      });
    }

    // Create payroll change request
    const result = await PayrollChangeRequest.create({
      payroll_info_id, // This might now be better named employee_id, if possible
      changes,
      reasons: reason,
      requested_by,
      employee_name,
      employee_email: user.email,
    });

    console.log("Change request saved:", result);

    // Get all approvers
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
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Change Request</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px;">
            <img src="https://stjohnmajore.com/images/HEADER.png" alt="Header" style="width: 100%; height: auto;" />
            <p style="color: #333; font-size: 16px;">Hello ${approver.name},</p>
            <p style="color: #333; font-size: 15px;">A new payroll change request by ${requested_by} is awaiting your review.</p>
            <p style="color: #333; font-size: 15px;"><strong>Employee:</strong> ${employee_name}</p>
            <p style="color: #333; font-size: 15px;"><strong>Reason:</strong> ${
              reason || "No reason provided"
            }</p>
            <p style="color: #333; font-size: 15px;"><strong>Changes:</strong></p>
            <ul>
              ${Object.entries(changes)
                .map(
                  ([key, value]) =>
                    `<li><strong>${key.replace(/_/g, " ")}:</strong> ${value}</li>`
                )
                .join("")}
            </ul>
            <p style="color: #333; font-size: 15px;">Please login to <a href="https://payroll.stjohnmajore.com/">https://payroll.stjohnmajore.com/</a> to review and take appropriate action.</p>
            <p style="color: #333; font-size: 15px;">Best regards,<br />SJM Payroll System</p>
            <div style="font-size: 12px; color: #777; margin-top: 20px; text-align: center;">
              <strong>This is an automated email—please do not reply.</strong><br />
              Keep this message for your records.
            </div>
            <img src="https://stjohnmajore.com/images/FOOTER.png" alt="Footer" style="width: 100%; height: auto; margin-top: 20px;" />
          </div>
        </body>
        </html>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Notification sent to ${approver.email}`);
        successfulEmails.push(approver.email);
      } catch (emailError) {
        console.error(`Failed to send email to ${approver.email}:`, emailError);
      }
    }

    res.status(200).json({
      success: true,
      message: "Payroll change request submitted successfully.",
      notified_approvers: successfulEmails,
    });
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


export const rejectPayrollChange = async (req, res) => {
  const { id } = req.params;
  const { reviewed_by, rejection_reason } = req.body;
  console.log("in rehectPayrollChange function", reviewed_by);

  try {
    console.log(`💡 Rejecting payroll change request ${id}`);
    console.log("Request body:", req.body);

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

    // Simulated employee details from the changeRequest
    const employeeName = changeRequest.employee_name || "Unknown Employee";
    const employeeEmail = changeRequest.employee_email || "noemail@domain.com";

    const subject = "Payroll Change Request Rejected";
    const message = `Dear ${employeeName},<br><br>Your payroll change request has been reviewed and <strong>rejected</strong>.<br><br><em>The request has been rejected.</em>`;
    const sentBy = changeRequest.requested_by || "Admin";
    const sentAt = new Date();
    const attachments = []; // Add attachments if needed

    // Update the change request status
    await changeRequest.update({
      status: "Rejected",
      reviewed_by: sentBy,
      reviewed_at: sentAt,
      rejection_reason: rejection_reason || "No reason provided",
    });

    console.log(`✅ Payroll change request ${id} rejected`);

    // Email content setup
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: employeeEmail,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px;">
            <img src="https://stjohnmajore.com/images/HEADER.png" alt="Header" style="width: 100%; height: auto;" />
            <p style="color: #333; font-size: 16px;">Dear ${sentBy},</p>
            <p style="color: #333; font-size: 15px;">Your payroll change request for ${employeeName} has been reviewed and <strong style="color:red;">rejected</strong>.</p>
            <p style="color: #555; font-size: 14px;">The request has been rejected.</p>
            <p style="margin-top: 20px; color: #333;">Best regards,<br><strong>${sentBy}</strong></p>
            <img src="https://stjohnmajore.com/images/FOOTER.png" alt="Footer" style="width: 100%; height: auto; margin-top: 20px;" />
            <div style="font-size: 12px; color: #777; margin-top: 20px; text-align: center;">
              <strong>This is an automated email—please do not reply.</strong><br />
              Keep this message for your records.
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Dear ${sentBy},

        Your payroll change request has been reviewed and rejected.

        The request has been rejected.

        Best regards,
        ${sentBy}

        Sent at: ${new Date(sentAt).toLocaleString()}
      `,
      attachments: attachments.map((file) => ({
        filename: file.filename,
        content: file.content,
        contentType: file.contentType,
      })),
    };

    console.log("📧 Sending rejection email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", employeeEmail);
    console.log("✅ Email Name:", sentBy);
    console.log("✅ Email Content name:", employeeName);

    res
      .status(200)
      .json({ success: true, message: "Change request rejected successfully" });
  } catch (error) {
    console.error("❌ Error rejecting payroll change:", error);
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

    console.log("Request body:", req.body);
    console.log("Files received:", req.files ? req.files.length : 0);

    // Validate required fields
    if (
      !employeeId ||
      !employeeName ||
      !employeeCode ||
      !employeeEmail ||
      !subject ||
      !message ||
      !sentAt ||
      !sentBy
    ) {
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
      attachments = req.files.map((file) => ({
        filename: file.originalname,
        content: file.buffer,
        contentType: file.mimetype,
        size: file.size,
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
    const oversizedFiles = attachments.filter(
      (file) => file.size > maxFileSize
    );
    if (oversizedFiles.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Files exceed 10MB limit: ${oversizedFiles
          .map((f) => f.filename)
          .join(", ")}`,
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

${
  attachments.length > 0
    ? `
Attachments (${attachments.length}):
${attachments
  .map((file) => `• ${file.filename} (${(file.size / 1024).toFixed(1)} KB)`)
  .join("\n")}
`
    : ""
}

Best regards,
${sentBy}

Sent at: ${new Date(sentAt).toLocaleString()}
      `,
      // Multiple attachments support
      attachments:
        attachments.length > 0
          ? attachments.map((file) => ({
              filename: file.filename,
              content: file.content,
              contentType: file.contentType,
            }))
          : [],
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
        attachments: attachments.map((file) => ({
          filename: file.filename,
          size: file.size,
          contentType: file.contentType,
        })),
      },
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message, // Include the error message
    });
  }
};

export const bulkMessaging = async (req, res) => {
  try {
    const { subject, message, employeeIds, attachmentCount } = req.body;
    const files = req.files; // This will be an array when using upload.array()

    // Debug logging
    console.log("Received request:", {
      subject,
      message,
      employeeIds: employeeIds,
      attachmentCount,
      filesReceived: files
        ? Array.isArray(files)
          ? files.length
          : Object.keys(files).length
        : 0,
      fileDetails: files
        ? Array.isArray(files)
          ? files.map((file) => ({
              originalName: file.originalname,
              size: file.size,
              mimetype: file.mimetype,
            }))
          : Object.keys(files).map((key) => ({
              fieldName: key,
              originalName: files[key][0]?.originalname,
              size: files[key][0]?.size,
            }))
        : [],
    });

    // Validate required fields
    if (!subject || !message || !employeeIds) {
      return res.status(400).json({
        success: false,
        message: "Subject, message, and employee selection are required",
      });
    }

    // Parse employee IDs
    let parsedEmployeeIds;
    try {
      parsedEmployeeIds = JSON.parse(employeeIds);
      console.log("Parsed employee IDs:", parsedEmployeeIds);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee IDs format",
      });
    }

    // Process attachments (works with both upload.fields() and upload.array())
    let attachments = [];
    if (files) {
      try {
        // Check if files is an array (from upload.array()) or object (from upload.fields())
        if (Array.isArray(files)) {
          // Handle upload.array() format
          attachments = files.map((file) => ({
            filename: file.originalname,
            content: file.buffer,
            size: file.size,
            mimetype: file.mimetype,
          }));
        } else {
          // Handle upload.fields() format
          Object.keys(files).forEach((fieldName) => {
            if (fieldName.startsWith("attachment_")) {
              const fileArray = files[fieldName];
              if (fileArray && fileArray.length > 0) {
                const file = fileArray[0]; // Each field should have one file
                attachments.push({
                  filename: file.originalname,
                  content: file.buffer,
                  size: file.size,
                  mimetype: file.mimetype,
                });
              }
            }
          });
        }

        console.log(
          "Processed attachments:",
          attachments.map((att) => ({
            filename: att.filename,
            size: att.size,
            mimetype: att.mimetype,
          }))
        );

        // Validate total attachment size (500MB limit)
        const totalSize = attachments.reduce((sum, att) => sum + att.size, 0);
        const maxTotalSize = 500 * 1024 * 1024; // 500MB

        if (totalSize > maxTotalSize) {
          return res.status(400).json({
            success: false,
            message: `Total attachment size (${(
              totalSize /
              1024 /
              1024
            ).toFixed(2)}MB) exceeds the 500MB limit`,
          });
        }
      } catch (error) {
        console.error("Error processing attachments:", error);
        return res.status(400).json({
          success: false,
          message: "Error processing file attachments",
        });
      }
    }

    // Fetch selected employees - adjust this based on your actual Employee model
    let employees;
    try {
      // Since your employee data has 'id' field, query by id
      // Replace this with your actual Employee model query method
      if (typeof Employee.findByIds === "function") {
        employees = await Employee.findByIds(parsedEmployeeIds);
      } else if (typeof Employee.findAll === "function") {
        // For Sequelize or similar ORMs
        employees = await Employee.findAll({
          where: { id: parsedEmployeeIds },
        });
      } else if (typeof Employee.find === "function") {
        // For MongoDB/Mongoose
        employees = await Employee.find({
          id: { $in: parsedEmployeeIds },
        });
      } else {
        // Fallback: direct database query (adjust based on your setup)
        const placeholders = parsedEmployeeIds.map(() => "?").join(",");
        const query = `
                    SELECT id, name, emailaddress, ecode, department 
                    FROM employees 
                    WHERE id IN (${placeholders})
                `;

        // Adjust this based on your database connection method
        if (Employee.db && typeof Employee.db.execute === "function") {
          const [rows] = await Employee.db.execute(query, parsedEmployeeIds);
          employees = rows;
        } else {
          throw new Error(
            "Unable to query employees - please check Employee model methods"
          );
        }
      }

      console.log("Fetched employees:", employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch employee data",
        error: error.message,
      });
    }

    if (!employees || employees.length === 0) {
      console.log("No employees found for IDs:", parsedEmployeeIds);
      return res.status(404).json({
        success: false,
        message: "No employees found with the provided IDs",
      });
    }

    // Log employee emails for debugging
    console.log(
      "Employee emails:",
      employees.map((emp) => ({
        id: emp.id,
        name: emp.name,
        email: emp.emailaddress, // Note: using emailaddress field
      }))
    );

    // Prepare base email options
    const baseMailOptions = {
      from: process.env.EMAIL_USER,
      subject: subject,
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
                <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
                        ${subject}
                    </h2>
                    <div style="margin: 20px 0; line-height: 1.6; color: #555;">
                        ${message.replace(/\n/g, "<br>")}
                    </div>
                    ${
                      attachments.length > 0
                        ? `
                        <div style="margin: 20px 0; padding: 15px; background-color: #e8f4fd; border-radius: 5px; border-left: 4px solid #2196F3;">
                            <h3 style="margin: 0 0 10px 0; color: #1976D2; font-size: 14px;">
                                📎 Attachments (${attachments.length} file${
                            attachments.length > 1 ? "s" : ""
                          })
                            </h3>
                            <ul style="margin: 0; padding-left: 20px; color: #555; font-size: 13px;">
                                ${attachments
                                  .map(
                                    (att) => `
                                    <li>${att.filename} (${(
                                      att.size / 1024
                                    ).toFixed(1)} KB)</li>
                                `
                                  )
                                  .join("")}
                            </ul>
                        </div>
                    `
                        : ""
                    }
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
    };

    // Add attachments if present
    if (attachments.length > 0) {
      baseMailOptions.attachments = attachments.map((att) => ({
        filename: att.filename,
        content: att.content,
        contentType: att.mimetype,
      }));
    }

    // Send emails to all selected employees
    const emailPromises = employees.map(async (employee, index) => {
      // Validate email address exists
      if (!employee.emailaddress || employee.emailaddress.trim() === "") {
        console.warn(
          `Employee ${employee.name} (ID: ${employee.id}) has no email address`
        );
        throw new Error(`No email address for employee ${employee.name}`);
      }

      console.log(
        `📧 Attempting to send email to: ${employee.name} (${employee.emailaddress}) with ${attachments.length} attachment(s)`
      );

      // Create personalized email options
      const personalizedMailOptions = {
        ...baseMailOptions,
        to: employee.emailaddress,
        html: baseMailOptions.html.replace(
          "This message was sent from the Employee Management System.",
          `This message was sent from the Employee Management System.<br>
                     Recipient: ${employee.name} (ID: ${
            employee.ecode || employee.id
          })`
        ),
      };

      try {
        const result = await transporter.sendMail(personalizedMailOptions);
        console.log(`✅ Email sent successfully to ${employee.emailaddress}:`, {
          messageId: result.messageId,
          response: result.response,
          accepted: result.accepted,
          rejected: result.rejected,
        });
        return result;
      } catch (error) {
        console.error(`❌ Failed to send email to ${employee.emailaddress}:`, {
          error: error.message,
          code: error.code,
          command: error.command,
          response: error.response,
        });
        throw error;
      }
    });

    // Execute all email sends with delay to avoid rate limiting
    console.log(`📫 Starting to send ${employees.length} emails...`);
    const results = [];

    for (let i = 0; i < employees.length; i++) {
      try {
        const result = await emailPromises[i];
        results.push({ status: "fulfilled", value: result });
        console.log(`✅ Email ${i + 1}/${employees.length} sent successfully`);

        // Add small delay to avoid rate limiting
        if (i < employees.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
        }
      } catch (error) {
        results.push({ status: "rejected", reason: error });
        console.log(`❌ Email ${i + 1}/${employees.length} failed`);
      }
    }

    // Count successful sends
    const successfulSends = results.filter(
      (result) => result.status === "fulfilled"
    ).length;
    const failedSends = results.filter(
      (result) => result.status === "rejected"
    ).length;

    // Log results
    console.log(
      `Email results: ${successfulSends} successful, ${failedSends} failed`
    );
    if (attachments.length > 0) {
      console.log(
        `Total attachment size sent: ${(
          attachments.reduce((sum, att) => sum + att.size, 0) /
          1024 /
          1024
        ).toFixed(2)}MB`
      );
    }

    // Log failed sends for debugging
    if (failedSends > 0) {
      console.error(
        "Failed email sends:",
        results
          .filter((result) => result.status === "rejected")
          .map((result, index) => ({
            employee: employees[index]?.name,
            email: employees[index]?.emailaddress,
            error: result.reason?.message || result.reason,
          }))
      );
    }

    // Prepare detailed response
    const response = {
      success: true,
      message: `Bulk message sent successfully`,
      sentCount: successfulSends,
      failedCount: failedSends,
      totalEmployees: employees.length,
      attachmentInfo: {
        count: attachments.length,
        totalSize: attachments.reduce((sum, att) => sum + att.size, 0),
        files: attachments.map((att) => ({
          filename: att.filename,
          size: att.size,
        })),
      },
    };

    // Add failure details if there were any failures
    if (failedSends > 0) {
      response.failures = results
        .map((result, index) => ({
          employee: employees[index],
          error: result.status === "rejected" ? result.reason?.message : null,
        }))
        .filter((item) => item.error);
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in bulk messaging:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send bulk message",
      error: error.message,
    });
  }
};


export const bulkRequestPayrollChange = async (req, res) => {
  const { employee_ids, field, value, reason, requested_by } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get("User-Agent");

  console.log("Received bulk change data:", req.body);

  try {
    // Validate required fields
    const validationError = validateBulkRequestData(req.body);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    // Find the requesting user
    const user = await User.findOne({ where: { name: requested_by } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Requesting user not found"
      });
    }

    // Find all payroll information records for the selected employees
    const payrollInfos = await PayrollInformation.findAll({
      where: {
        employee_id: {
          [Op.in]: employee_ids
        }
      }
    });

    if (payrollInfos.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No payroll information found for selected employees"
      });
    }

    // Check if all requested employees were found (optional logging)
    const foundEmployeeIds = payrollInfos.map(info => info.employee_id);
    const missingEmployeeIds = employee_ids.filter(id => !foundEmployeeIds.includes(id));
    
    if (missingEmployeeIds.length > 0) {
      console.warn(`Payroll info not found for employee IDs: ${missingEmployeeIds.join(', ')}`);
    }

    // Process bulk change requests
    const { successfulRequests, failedRequests } = await processBulkChangeRequests(
      payrollInfos,
      field,
      value,
      reason,
      requested_by,
      user.email
    );

    // Send email notifications to approvers if there are successful requests
    let successfulEmails = [];
    if (successfulRequests.length > 0) {
      successfulEmails = await sendApproverNotifications(
        successfulRequests,
        field,
        value,
        reason,
        requested_by
      );
    }

    // Prepare and send response
    const response = buildSuccessResponse(
      employee_ids,
      successfulRequests,
      failedRequests,
      field,
      value,
      successfulEmails
    );

    res.status(200).json(response);

  } catch (error) {
    console.error("Error processing bulk payroll change request:", error);
    
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function to validate request data
const validateBulkRequestData = (data) => {
  const { employee_ids, field, value, requested_by } = data;

  if (!employee_ids || !Array.isArray(employee_ids) || employee_ids.length === 0) {
    return "Please select at least one employee";
  }

  if (!field || value === undefined || value === null || !requested_by) {
    return "Missing required fields: field, value, and requested_by are required";
  }

  // Additional validation for specific fields if needed
  if (field === 'daily_rate' && (isNaN(value) || parseFloat(value) < 0)) {
    return "Daily rate must be a valid positive number";
  }

  return null;
};

// Helper function to process bulk change requests with transaction support
// Helper function to process bulk change requests with transaction support
// Helper function to process bulk change requests with transaction support
const processBulkChangeRequests = async (payrollInfos, field, value, reason, requestedBy, userEmail) => {
  const changes = { [field]: value };
  const transaction = await sequelize.transaction();
  
  try {
    // Store affected employee IDs for tracking
    const affectedEmployeeIds = payrollInfos.map(payrollInfo => payrollInfo.employee_id);
    
    // Generate unique batch ID for grouping related requests
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Prepare all requests data
    const requestsData = payrollInfos.map(payrollInfo => ({
      payroll_info_id: payrollInfo.id,
      changes: changes,
      reasons: reason || `Bulk update: ${field} to ${value}`,
      requested_by: requestedBy,
      employee_name: payrollInfo.name,
      employee_email: userEmail,
      batch_affected_employee_ids: affectedEmployeeIds, // Store all affected IDs in each record
      batch_id: batchId // Group related requests
    }));

    // Create all requests in a single transaction
    const createdRequests = await PayrollChangeRequest.bulkCreate(requestsData, {
      transaction,
      returning: true // Returns the created records
    });

    // Commit the transaction
    await transaction.commit();

    // Format successful response
    const successfulRequests = createdRequests.map((request, index) => ({
      employee_id: payrollInfos[index].employee_id,
      employee_name: payrollInfos[index].name,
      request_id: request.id,
      payroll_info_id: request.payroll_info_id
    }));

    return { 
      successfulRequests, 
      failedRequests: [], // No partial failures with transaction approach
      affectedEmployeeIds, // Return the list of affected employee IDs
      batchId // Return batch ID for reference
    };

  } catch (error) {
    // Rollback the transaction on any error
    await transaction.rollback();
    
    console.error('Failed to create bulk change requests:', error);
    
    // All requests failed due to transaction rollback
    const failedRequests = payrollInfos.map(payrollInfo => ({
      employee_id: payrollInfo.employee_id,
      employee_name: payrollInfo.name,
      error: error.message
    }));

    return { 
      successfulRequests: [], 
      failedRequests,
      affectedEmployeeIds: [] // Empty since transaction failed
    };
  }
};
// Helper function to send notifications to approvers
const sendApproverNotifications = async (successfulRequests, field, value, reason, requestedBy) => {
  try {
    const approvers = await User.findAll({
      where: { role: "approver", isBlocked: false },
    });

    if (approvers.length === 0) {
      console.warn("No active approvers found for notification");
      return [];
    }

    const successfulEmails = [];
    
    // Send emails concurrently but handle individual failures
    const emailPromises = approvers.map(async (approver) => {
      try {
        await sendBulkChangeNotificationEmail(approver, successfulRequests, field, value, reason, requestedBy);
        console.log(`Bulk notification sent to ${approver.email}`);
        successfulEmails.push(approver.email);
      } catch (emailError) {
        console.error(`Failed to send bulk email to ${approver.email}:`, emailError);
        // Don't throw here - continue with other emails
      }
    });

    await Promise.allSettled(emailPromises); // Use allSettled to handle partial failures
    return successfulEmails;

  } catch (error) {
    console.error("Error sending approver notifications:", error);
    return [];
  }
};

// Helper function to send individual notification email
const sendBulkChangeNotificationEmail = async (approver, successfulRequests, field, value, reason, requestedBy) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: approver.email,
    subject: `Bulk Payroll Change Request Submitted - ${successfulRequests.length} Employee${successfulRequests.length > 1 ? 's' : ''}`,
    html: generateEmailTemplate(approver, successfulRequests, field, value, reason, requestedBy)
  };

  await transporter.sendMail(mailOptions);
};

// Helper function to generate email HTML template
const generateEmailTemplate = (approver, successfulRequests, field, value, reason, requestedBy) => {
  const employeeListHtml = successfulRequests
    .map(req => `<p style="margin: 5px 0; font-size: 14px;">• ${req.employee_name}</p>`)
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Bulk Change Request</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f9f9f9;">
      <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px;">
        <img src="https://stjohnmajore.com/images/HEADER.png" alt="Header" style="width: 100%; height: auto;" />
        
        <p style="color: #333; font-size: 16px;">Hello ${approver.name},</p>
        <p style="color: #333; font-size: 15px;">
          A bulk payroll change request by <strong>${requestedBy}</strong> is awaiting your review.
        </p>
        
        <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p style="color: #333; font-size: 15px; margin: 5px 0;">
            <strong>Field Changed:</strong> ${field.replace(/_/g, " ").toUpperCase()}
          </p>
          <p style="color: #333; font-size: 15px; margin: 5px 0;">
            <strong>New Value:</strong> ${value}
          </p>
          <p style="color: #333; font-size: 15px; margin: 5px 0;">
            <strong>Number of Employees:</strong> ${successfulRequests.length}
          </p>
          <p style="color: #333; font-size: 15px; margin: 5px 0;">
            <strong>Reason:</strong> ${reason || "No reason provided"}
          </p>
        </div>
        
        <p style="color: #333; font-size: 15px;"><strong>Affected Employees:</strong></p>
        <div style="max-height: 200px; overflow-y: auto; background-color: #f8f9fa; padding: 10px; border-radius: 5px;">
          ${employeeListHtml}
        </div>
        
        <p style="color: #333; font-size: 15px; margin-top: 20px;">
          Please login to <a href="https://payroll.stjohnmajore.com/" style="color: #007bff;">
            https://payroll.stjohnmajore.com/
          </a> to review and take appropriate action.
        </p>
        
        <p style="color: #333; font-size: 15px;">
          Best regards,<br />SJM Payroll System
        </p>
        
        <img src="https://stjohnmajore.com/images/FOOTER.png" alt="Footer" 
             style="width: 100%; height: auto; margin-top: 20px;" />
        
        <div style="font-size: 12px; color: #777; margin-top: 20px; text-align: center;">
          <strong>This is an automated email—please do not reply.</strong><br />
          Keep this message for your records.
        </div>
      </div>
    </body>
    </html>
  `;
};

// Helper function to build success response
const buildSuccessResponse = (employeeIds, successfulRequests, failedRequests, field, value, successfulEmails) => {
  const response = {
    success: true,
    message: `Bulk request processed: ${successfulRequests.length} successful, ${failedRequests.length} failed`,
    summary: {
      total_requested: employeeIds.length,
      successful: successfulRequests.length,
      failed: failedRequests.length,
      field: field,
      value: value,
    },
    successful_requests: successfulRequests,
    failed_requests: failedRequests,
  };

  // Add notification info if emails were sent
  if (successfulRequests.length > 0 && successfulEmails.length > 0) {
    response.notifications_sent = successfulEmails;
  }

  return response;
};  

export const approvePayrollChange = async (req, res) => {
  console.log("Inayos approvePayrollChange");
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const approvedBy = req.body.approved_by || req.user?.name || 'System';

    console.log(`💡 Approving payroll change request ${id}`);

    // Find the change request
    const changeRequest = await PayrollChangeRequest.findOne({
      where: { id, status: 'Pending' },
      transaction,
    });

    if (!changeRequest) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'No pending change request found' });
    }

    console.log('Found change request:', changeRequest.toJSON());

    // Check if this is a batch request
    const isBatchRequest = changeRequest.batch_affected_employee_ids && 
                          Array.isArray(changeRequest.batch_affected_employee_ids) && 
                          changeRequest.batch_affected_employee_ids.length > 0;

    if (isBatchRequest) {
      console.log(`🔄 Processing as BATCH request for ${changeRequest.batch_affected_employee_ids.length} employees`);
      return await processBatchRequest(changeRequest, approvedBy, transaction, res);
    } else {
      console.log(`🔄 Processing as SINGLE request for employee ${changeRequest.payroll_info_id}`);
      return await processSingleRequest(changeRequest, approvedBy, transaction, res);
    }

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error approving change request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve change request.',
      error: error.message,
    });
  }
};

// Helper function for batch processing
const processBatchRequest = async (changeRequest, approvedBy, transaction, res) => {
  const changes = changeRequest.changes;
  const employeeIds = changeRequest.batch_affected_employee_ids;

  // Fetch payroll records for all employeeIds
  const payrollRecords = await PayrollInformation.findAll({
    where: { employee_id: employeeIds },
    transaction,
  });

  if (payrollRecords.length === 0) {
    await transaction.rollback();
    return res.status(404).json({ success: false, message: 'No payroll records found for employees' });
  }

  const foundEmployeeIds = payrollRecords.map(r => r.employee_id);
  const missingEmployeeIds = employeeIds.filter(id => !foundEmployeeIds.includes(id));
  
  if (missingEmployeeIds.length > 0) {
    console.log(`⚠️  Warning: Some employees not found in payroll records:`, missingEmployeeIds);
  }
  
  console.log(`📊 Found ${payrollRecords.length} payroll records for employees:`, foundEmployeeIds);

  // Process changes
  const fieldsToUpdate = processChanges(changes);
  
  if (Object.keys(fieldsToUpdate).length === 0) {
    await transaction.rollback();
    return res.status(400).json({ 
      success: false, 
      message: 'No valid fields to update found in request' 
    });
  }

  console.log(`🔧 Fields to update for all employees:`, fieldsToUpdate);

  // Apply changes to all employees
  let updatedCount = 0;
  const updateResults = [];
  
  for (const record of payrollRecords) {
    try {
      console.log(`🔄 Updating employee ${record.employee_id} (${record.name || 'Unknown'})`);
      
      const [updateCount] = await PayrollInformation.update(fieldsToUpdate, {
        where: { employee_id: record.employee_id },
        transaction,
      });
      
      if (updateCount > 0) {
        updatedCount++;
        updateResults.push({
          employee_id: record.employee_id,
          name: record.name || 'Unknown',
          status: 'success'
        });
        console.log(`✅ Successfully updated employee ${record.employee_id}`);
      } else {
        updateResults.push({
          employee_id: record.employee_id,
          name: record.name || 'Unknown',
          status: 'no_change'
        });
        console.log(`⚠️  No update applied for employee ${record.employee_id}`);
      }
    } catch (updateError) {
      console.error(`❌ Error updating employee ${record.employee_id}:`, updateError.message);
      throw updateError;
    }
  }

  // Mark ALL requests in the batch as approved
  const batchUpdateResult = await PayrollChangeRequest.update({
    status: 'Approved',
    approved_by: approvedBy,
    approved_at: new Date(),
  }, {
    where: { 
      batch_id: changeRequest.batch_id,
      status: 'Pending'
    },
    transaction,
  });

  console.log(`✅ Marked ${batchUpdateResult[0]} batch requests as approved`);

  await transaction.commit();

  return res.json({
    success: true,
    message: `Successfully applied batch changes to ${updatedCount} out of ${payrollRecords.length} payroll records.`,
    data: {
      requestId: changeRequest.id,
      batchId: changeRequest.batch_id,
      totalEmployeesInBatch: employeeIds.length,
      employeesFound: foundEmployeeIds.length,
      employeesUpdated: updatedCount,
      missingEmployees: missingEmployeeIds,
      appliedChanges: fieldsToUpdate,
      updateResults
    }
  });
};

// Helper function for single processing
const processSingleRequest = async (changeRequest, approvedBy, transaction, res) => {
  try {
    // Parse the changes JSON string properly
    let parsedChanges;
    try {
      // If changes is already an object, use it directly
      if (typeof changeRequest.changes === 'object' && changeRequest.changes !== null) {
        parsedChanges = changeRequest.changes;
      } else {
        // If it's a string, parse it
        parsedChanges = JSON.parse(changeRequest.changes);
      }
    } catch (parseError) {
      console.error('❌ Error parsing changes JSON:', parseError);
      console.log('Raw changes value:', changeRequest.changes);
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid changes format in request',
        error: parseError.message,
      });
    }

    console.log('🔧 Parsed changes for employee:', parsedChanges);

    // Find the payroll info record
    const payrollInfo = await PayrollInformation.findByPk(changeRequest.payroll_info_id, {
      transaction,
    });

    if (!payrollInfo) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Payroll information not found',
      });
    }

    // Store original values for audit
    const originalValues = {};
    Object.keys(parsedChanges).forEach(field => {
      originalValues[field] = payrollInfo[field];
    });

    // Apply changes to payroll info
    await payrollInfo.update(parsedChanges, { transaction });

    // Update the change request status
    await changeRequest.update({
      status: 'Approved',
      approved_by: approvedBy,
      approved_at: new Date(),
      original_values: JSON.stringify(originalValues),
    }, { transaction });

    // Log the successful update
    console.log(`✅ Successfully updated payroll info for employee ${changeRequest.payroll_info_id}`);
    console.log('Applied changes:', parsedChanges);

    await transaction.commit();

    return res.json({
      success: true,
      message: 'Payroll change approved successfully',
      changes_applied: parsedChanges,
      employee_id: changeRequest.payroll_info_id,
    });

  } catch (error) {
    console.error('❌ Error in processSingleRequest:', error);
    await transaction.rollback();
    throw error;
  }
};

// Helper function to process changes WITHOUT calculating dependent rates
const processChanges = (changes) => {
  const numericFields = [
    'daily_rate', 'hourly_rate', 'ot_hourly_rate', 'ot_rate_sp_holiday',
    'ot_rate_reg_holiday', 'special_hol_rate', 'regular_hol_ot_rate',
    'overtime_pay', 'holiday_pay', 'night_differential', 'allowance',
    'tardiness', 'tax_deduction', 'sss_contribution', 'pagibig_contribution',
    'philhealth_contribution', 'loan', 'otherDeductions', 'adjustment'
  ];

  // Convert to numbers
  const converted = { ...changes };
  for (const field of numericFields) {
    if (converted[field] !== undefined && converted[field] !== null && converted[field] !== '') {
      const val = parseFloat(converted[field]);
      converted[field] = isNaN(val) ? 0 : val;
    }
  }

  // Filter out undefined/null values
  const fieldsToUpdate = {};
  Object.keys(converted).forEach(key => {
    if (converted[key] !== undefined && converted[key] !== null && converted[key] !== '') {
      fieldsToUpdate[key] = converted[key];
    }
  });

  return fieldsToUpdate;
};

export const rejectBatchChange = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { rejection_reason } = req.body;
    const rejectedBy = req.body.rejected_by || req.user?.name || 'System';
    
    // Only update the request status - don't apply changes to payroll
    const result = await PayrollChangeRequest.update(
      { 
        status: 'Rejected',
        rejected_by: rejectedBy,
        rejected_at: new Date(),
        rejection_reason: rejection_reason || 'Batch rejection'
      },
      {
        where: {
          batch_id: batchId,
          status: 'Pending'
        }
      }
    );

    if (result[0] === 0) {
      return res.status(404).json({
        success: false,
        message: 'No pending requests found for this batch'
      });
    }

    res.json({
      success: true,
      message: `Successfully rejected ${result[0]} change requests in batch`,
      data: { batchId, rejectedCount: result[0] }
    });

  } catch (error) {
    console.error('Error rejecting batch change:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject batch change requests',
      error: error.message
    });
  }
};

// Helper function to validate batch changes before approval
export const validateBatchChanges = async (batchId) => {
  try {
    const batchRequests = await PayrollChangeRequest.findAll({
      where: {
        batch_id: batchId,
        status: 'Pending'
      }
    });

    if (batchRequests.length === 0) {
      return { valid: false, message: 'No pending requests found' };
    }

    // Check if all payroll records still exist
    const payrollIds = batchRequests.map(req => req.payroll_info_id);
    const existingPayrolls = await PayrollInfo.findAll({
      where: {
        id: payrollIds
      },
      attributes: ['id']
    });

    if (existingPayrolls.length !== payrollIds.length) {
      return { 
        valid: false, 
        message: 'Some payroll records no longer exist' 
      };
    }

    return { 
      valid: true, 
      requestCount: batchRequests.length,
      changes: batchRequests[0].changes
    };

  } catch (error) {
    return { 
      valid: false, 
      message: `Validation error: ${error.message}` 
    };
  }
};

// Get batch details
export const getBatchDetails = async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const requests = await PayrollChangeRequest.findAll({
      where: { batch_id: batchId },
      order: [['createdAt', 'ASC']]
    });

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    const firstRequest = requests[0];
    const batchSummary = {
      batchId: batchId,
      totalRequests: requests.length,
      affectedEmployeeIds: firstRequest.batch_affected_employee_ids,
      changes: firstRequest.changes,
      reason: firstRequest.reasons,
      requestedBy: firstRequest.requested_by,
      createdAt: firstRequest.createdAt,
      status: firstRequest.status,
      employeeDetails: requests.map(req => ({
        id: req.id,
        employee_name: req.employee_name,
        employee_email: req.employee_email,
        payroll_info_id: req.payroll_info_id
      }))
    };

    res.json({
      success: true,
      data: batchSummary
    });

  } catch (error) {
    console.error('Error fetching batch details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batch details',
      error: error.message
    });
  }
};