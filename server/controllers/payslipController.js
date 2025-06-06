import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Payslip from "../models/Payslip.js";
import Employee from "../models/Employee.js";
import PayslipHistory from "../models/PayslipHistory.js";
import { Op } from "sequelize"; // Ensure you have Sequelize operators
import Attendance from "../models/Attendance.js";
import PayrollInformation from "../models/PayrollInformation.js";
import axios from "axios";
import AttendanceSummary from "../models/AttendanceSummary.js";
import { QueryTypes } from "sequelize";
import sequelize from "../db/db.js";
import PayrollReleaseRequest from "../models/PayrollReleaseRequest.js"; // Ensure correct path
import Holidays from "../models/Holidays.js"
import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer'; // ✅ correct
import { fileURLToPath } from 'url';
import User from "../models/User.js";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Email Transporter once
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


// Verify SMTP connection once
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Connection Failed:", error);
  } else {
    console.log("✅ SMTP Server Ready!");
  }
});

// Function to generate payslip PDF - Modified for 4" x 5"
const generatePayslipPDF = async (payslip) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 4" x 5" dimensions
  // Convert to pixels at 96 DPI: 4" = 384px, 5" = 480px
  await page.setViewport({
    width: 384,   // 4 inches in pixels at 96 DPI
    height: 480,  // 5 inches in pixels at 96 DPI
    deviceScaleFactor: 2
  });

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: 4in 5in;
      margin: 3mm; /* Reduced margin for more space */
    }
    
    * {
      box-sizing: border-box;
    }
    
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      font-size: 5px; /* Slightly smaller base font size */
      line-height: 1.1;
      width: 100%;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .payslip-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background-color: white;
    }                     
    
    .header {
      background-color: #0093DD;
      width: 100%;
      height: 18mm; /* Slightly smaller header */
      border: 1px solid #0093DD;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
      margin-bottom: 2mm;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .header h1 {
      color: white;
      font-weight: bold;
      font-size: 7px; /* Slightly smaller header text */
      text-align: center;
      margin: 0;
    }
    
    .logo {
      position: absolute;
      top: 2mm;
      right: 2mm;
      width: 14mm;
      height: auto;
      max-height: 14mm;
    }
    
    .payslip-no {
      font-weight: bold;
      margin: 1mm 0;
      font-size: 5px;
      flex-shrink: 0;
    }
    
    .content-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    table {
      border-collapse: collapse;
      width: 100%;
      font-size: 3.5px; /* Smaller font for table content */
      margin-bottom: 1mm;
      flex-shrink: 0;
    }
    
    th, td {
      border: 1px solid #AA396F;
      text-align: center;
      padding: 0.3mm; /* Reduced padding */
      vertical-align: middle;
      height: 2.5mm; /* Smaller row height */
    }
    
    .earnings-section {
      text-align: left;
      padding-left: 0.5mm;
    }
    
    .govt-contributions {
      font-weight: bold;
      font-size: 2.5px; /* Very small font for govt contributions */
      background-color: #AA396F;
      color: white;
      border-radius: 2px;
      padding: 0.3mm;
    }
    
    .employee-info-table {
      margin-bottom: 1mm;
    }
    
    .employee-info-table th {
      font-size: 3.5px;
      background-color: #f0f0f0;
    }
    
    .employee-info-table td {
      font-size: 3.5px;
    }
    
    .earnings-table {
      flex: 1;
      min-height: 0;
    }
    
    .earnings-table th {
      background-color: #e8f4fd;
      font-weight: bold;
    }
    
    .net-pay-row {
      background-color: #e8f5e8;
      font-weight: bold;
      font-size: 4px;
    }
    
    .footer {
      background-color: #bbe394;
      padding: 1mm;
      font-size: 2.5px; /* Very small footer text */
      line-height: 1.1;
      margin-top: auto;
      flex-shrink: 0;
      min-height: 10mm; /* Smaller footer */
    }
    
    .footer-content {
      display: flex;
      justify-content: space-between;
      gap: 1mm;
      height: 100%;
    }
    
    .footer-section {
      flex: 1;
    }
    
    .footer p {
      margin: 0.3mm 0;
    }
    
    /* Responsive adjustments for very small content */
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="payslip-container">
    <div class="header">
      <h1>e-PAYROLL SLIP</h1>
      <!-- Temporarily commented out to avoid loading issues -->
      <!-- <img src="https://drive.google.com/uc?export=view&id=1hthE-VT5Sk4Xp3tYW5l1_UEv0bCOkfmd" alt="Company Logo" class="logo" /> -->
    </div>

    <h2 class="payslip-no">Payslip No.: ${payslip.ecode || "N/A"}-${new Date().getTime()}</h2>
    
    <div class="content-area">
      <!-- Employee Information Table -->
      <table class="employee-info-table">
        <thead>
          <tr>
            <th>ECODE</th>
            <th>EMPLOYEE NAME</th>
            <th>PROJECT SITE</th>
            <th>RATE</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${payslip.ecode || "N/A"}</td>
            <td>${payslip.name || "N/A"}</td>
            <td>${payslip.project || "N/A"}</td>
            <td>₱${payslip.dailyrate || "0.00"}</td>
          </tr>
          <tr>
            <th colspan="2">POSITION</th>
            <th colspan="2">CUT-OFF DATE</th>
          </tr>
          <tr>
            <td colspan="2">${payslip.position || "N/A"}</td>
            <td colspan="2">${payslip.cutoff_date || "N/A"}</td>
          </tr>
        </tbody>
      </table>

      <!-- Earnings and Deductions Table -->
      <table class="earnings-table">
        <thead>
          <tr>
            <th>EARNINGS</th>
            <th>FIGURES</th>
            <th>DEDUCTIONS</th>
            <th>FIGURES</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="earnings-section">Basic Pay</td>
            <td>₱${payslip.basic_pay ? Number(payslip.basic_pay).toLocaleString() : "0.00"}</td>
            <td class="govt-contributions">GOVT CONTRIBUTIONS</td>
            <td></td>
          </tr>
          <tr>
            <td class="earnings-section">No. of Days</td>
            <td>${parseInt(payslip.no_of_days, 10) || "0"}</td>
            <td class="earnings-section">SSS</td>
            <td>₱${payslip.sss ? Number(payslip.sss).toLocaleString() : "0.00"}</td>
          </tr>
          <tr>
            <td class="earnings-section">Overtime Pay</td>
            <td>₱${payslip.overtime_pay ? Number(payslip.overtime_pay).toLocaleString() : "0.00"}</td>
            <td class="earnings-section">PHIC</td>
            <td>₱${payslip.phic ? Number(payslip.phic).toLocaleString() : "0.00"}</td>
          </tr>
          <tr>
            <td class="earnings-section">Overtime Hours</td>
            <td>${payslip.total_overtime || "0"}</td>
            <td class="earnings-section">HDMF</td>
            <td>₱${payslip.hdmf ? Number(payslip.hdmf).toLocaleString() : "0.00"}</td>
          </tr>
          <tr>
            <td class="earnings-section">Holiday Pay</td>
            <td>₱${payslip.holiday_pay ? Number(payslip.holiday_pay).toLocaleString() : "0.00"}</td>
            <td class="earnings-section">Cash Advance/Loan</td>
            <td>₱${payslip.loan ? Number(payslip.loan).toLocaleString() : "0.00"}</td>
          </tr>
          <tr>
            <td class="earnings-section">Night Differential</td>
            <td>₱${payslip.night_differential ? Number(payslip.night_differential).toLocaleString() : "0.00"}</td>
            <td class="earnings-section">Tardiness</td>
            <td>₱${payslip.total_tardiness ? Number(payslip.total_tardiness).toLocaleString() : "0.00"}</td>
          </tr>
          <tr>
            <td class="earnings-section">Allowance</td>
            <td>₱${payslip.allowance ? Number(payslip.allowance).toLocaleString() : "0.00"}</td>
            <td class="earnings-section">Other Deductions</td>
            <td>₱${payslip.other_deductions ? Number(payslip.other_deductions).toLocaleString() : "0.00"}</td>
          </tr>
          <tr>
            <td class="earnings-section">Total Earnings</td>
            <td>₱${payslip.total_earnings ? Number(payslip.total_earnings).toLocaleString() : "0.00"}</td>
            <td class="earnings-section">Total Deductions</td>
            <td>₱${payslip.total_deductions ? Number(payslip.total_deductions).toLocaleString() : "0.00"}</td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td class="earnings-section">Adjustments</td>
            <td>₱${payslip.adjustment ? Number(payslip.adjustment).toLocaleString() : "0.00"}</td>
          </tr>
          <tr class="net-pay-row">
            <th colspan="2">NET PAY</th>
            <th colspan="2">₱${payslip.net_pay ? Number(payslip.net_pay).toLocaleString() : "0.00"}</th>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <p><strong>Company:</strong> St. John Majore Services Company Inc.</p>
          <p><strong>Email:</strong> sjmajore@gmail.com</p>
        </div>
        <div class="footer-section">
          <p><strong>Address:</strong></p>
          <p>8 Patron Central Plaza De Villa St., Poblacion<br />San Juan, Batangas</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  // Generate PDF with custom 4" x 5" size
  const pdf = await page.pdf({
    width: '4in',
    height: '5in',
    printBackground: true,
    margin: {
      top: '3mm',
      right: '3mm',
      bottom: '3mm',
      left: '3mm'
    },
    preferCSSPageSize: true
  });

  await browser.close();
  return pdf;
};

export const sendPayslips = async (req, res) => {
  try {
    const { payslips } = req.body;
    console.log("📨 Received request to send payslips:", payslips?.length || 0, "payslips");

    if (!payslips || payslips.length === 0) {
      return res.status(400).json({ success: false, message: "No payslips provided." });
    }

    let successfulEmails = [];
    let failedEmails = [];
    let payslipIdsToDelete = [];

    for (let payslip of payslips) {
      if (!payslip.email) {
        failedEmails.push({ name: payslip.name, reason: "No email provided" });
        continue;
      }

      try {
        const pdfBuffer = await generatePayslipPDF(payslip);


        let mailOptions = {
          from: process.env.EMAIL_USER,
          to: payslip.email,
          subject: `PAYSLIP FOR ${payslip.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #0093DD; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">St. John Majore Services Company Inc.</h1>
                <p style="margin: 5px 0 0 0; font-size: 16px;">Electronic Payslip</p>
              </div>
              
              <div style="padding: 30px; border: 1px solid #ddd; background-color: #fff;">
                <h2 style="color: #333; margin-top: 0;">Dear ${payslip.name},</h2>
                
                <p style="font-size: 16px; line-height: 1.6;">
                  Please find your payslip attached to this email as a PDF document.
                </p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #0093DD;">Payslip Summary</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; width: 40%;">Payroll Period:</td>
                      <td style="padding: 8px 0;">${payslip.cutoff_date || "N/A"}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Employee Code:</td>
                      <td style="padding: 8px 0; border-top: 1px solid #ddd;">${payslip.ecode || "N/A"}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Position:</td>
                      <td style="padding: 8px 0; border-top: 1px solid #ddd;">${payslip.position || "N/A"}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Project Site:</td>
                      <td style="padding: 8px 0; border-top: 1px solid #ddd;">${payslip.project || "N/A"}</td>
                    </tr>
                    <tr style="background-color: #e8f5e8;">
                      <td style="padding: 12px 8px; font-weight: bold; font-size: 18px; border-top: 2px solid #0093DD;">Net Pay:</td>
                      <td style="padding: 12px 8px; font-weight: bold; font-size: 18px; color: #28a745; border-top: 2px solid #0093DD;">₱${payslip.net_pay ? Number(payslip.net_pay).toLocaleString() : "0.00"}</td>
                    </tr>
                  </table>
                </div>
                
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107;">
                  <p style="margin: 0; font-size: 14px;">
                    <strong>📎 Attachment:</strong> Your detailed payslip is attached as a PDF file. 
                    Please download and save it for your records.
                  </p>
                </div>
                
                <p style="margin-top: 25px; font-size: 14px; color: #666;">
                  If you have any questions regarding your payslip, please contact the HR department.
                </p>
              </div>
              
              <div style="background-color: #bbe394; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
                <p style="margin: 0; font-size: 14px;">
                  <strong>Contact:</strong> sjmajore@gmail.com<br>
                  8 Patron Central Plaza De Villa St., Poblacion, San Juan, Batangas
                </p>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background-color: #f8d7da; border-radius: 6px; border-left: 4px solid #dc3545;">
                <p style="margin: 0; font-size: 13px; color: #721c24;">
                  <strong>Important:</strong> This is an automated email. Please do not reply to this message. 
                  Keep this payslip for your records and tax purposes.
                </p>
              </div>
            </div>
          `,
          attachments: [
            {
              filename: `${payslip.name}_Payslip_${payslip.cutoff_date || 'Current'}.pdf`,
              content: pdfBuffer, // The PDF buffer returned from generatePayslipPDF()
              contentType: 'application/pdf'
            }
          ]
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Payslip sent to ${payslip.email}`);
        successfulEmails.push(payslip.email);

        // Save to PayslipHistory
        await PayslipHistory.create({
          ecode: payslip.ecode,
          email: payslip.email,
          employeeId: payslip.employeeId,
          name: payslip.name,
          project: payslip.project || "N/A",
          position: payslip.position || "N/A",
          department: payslip.department,
          cutoffDate: payslip.cutoffDate,
          allowance: +payslip.allowance || 0,
          dailyrate: +payslip.dailyrate || 0,
          basicPay: +payslip.basicPay || 0,
          overtimePay: +payslip.overtimePay || 0,
          holidayPay: +payslip.holidayPay || 0,
          noOfDays: +payslip.noOfDays || 0,
          totalOvertime: +payslip.totalOvertime || 0,
          nightDifferential: +payslip.nightDifferential || 0,
          sss: +payslip.sss || 0,
          phic: +payslip.phic || 0,
          hdmf: +payslip.hdmf || 0,
          loan: +payslip.loan || 0,
          totalTardiness: +payslip.totalTardiness || 0,
          totalHours: +payslip.totalHours || 0,
          otherDeductions: +payslip.otherDeductions || 0,
          totalEarnings: +payslip.totalEarnings || 0,
          adjustment: +payslip.adjustment || 0,
          gross_pay: +payslip.gross_pay || 0,
          totalDeductions: +payslip.totalDeductions || 0,
          netPay: +payslip.netPay || 0,
          batchId: payslip.batchId,
        });

        payslipIdsToDelete.push(payslip.id);
      } catch (err) {
        console.error(`❌ Failed for ${payslip.email}:`, err.message);
        failedEmails.push({ name: payslip.name, email: payslip.email, error: err.message });
      }
    }

    if (payslipIdsToDelete.length > 0) {
      await Payslip.destroy({ where: { id: payslipIdsToDelete } });
      console.log(`🗑 Deleted ${payslipIdsToDelete.length} sent payslips.`);
    }

    // Optional attendance cleanup
    if (req.body.clearAttendance === true) {
      await AttendanceSummary.destroy({ where: {} });
      await Attendance.destroy({ where: {} });
      console.log("🧹 Cleared attendance data.");
    }

    res.status(200).json({
      success: true,
      message: "Payslips processed successfully.",
      summary: {
        sent: successfulEmails.length,
        failed: failedEmails.length,
        total: payslips.length,
        failedDetails: failedEmails,
      },
    });
  } catch (error) {
    console.error("❌ Server error while sending payslips:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sending payslips.",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};


// 🔹 Add Payslip
export const addPayslip = async (req, res) => {
  try {
    const {
      ecode,
      email,
      employeeId,
      name,
      project,
      position,
      dailyRate,
      basicPay,
      overtimePay,
      holidaySalary,
      allowance,
      sss,
      phic,
      hdmf,
      totalEarnings,
      totalDeductions,
      netPay,
    } = req.body;

    if (!employeeId || !name || !position || !dailyRate || !basicPay) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const newPayslip = new Payslip({
      ecode,
      email,
      employeeId,
      name,
      project,
      position,
      dailyRate,
      basicPay,
      overtimePay,
      holidaySalary,
      allowance,
      sss,
      phic,
      hdmf,
      totalEarnings,
      totalDeductions,
      netPay,
    });

    await newPayslip.save();
    res.status(201).json({
      success: true,
      message: "Payslip created successfully",
      payslip: newPayslip,
    });
  } catch (error) {
    console.error("Error adding payslip:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPayslips = async (req, res) => {
  try {
    const { batchId } = req.query;
    const whereClause = batchId ? { batchId } : {};

    const payslips = await Payslip.findAll({ where: whereClause });
    res.status(200).json(payslips);
  } catch (error) {
    console.error("Error getting payslips:", error);
    res.status(500).json({ success: false, message: "Error getting payslips" });
  }
};



// 🔹 Fetch Payslip History
export const getPayslipsHistory = async (req, res) => {
  try {
    const payslips = await PayslipHistory.findAll();
    res.status(200).json({ success: true, payslips });
  } catch (error) {
    console.error("Error fetching payslips:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🔹 Fetch Payslip History by Employee Code

export const getPayslipByEmployeeId = async (req, res) => {
  let { employeeId } = req.params;

  // Extract numeric part (Remove 'M' prefix)
  const numericEmployeeId = parseInt(employeeId.replace(/\D/g, ""), 10);
  console.log("🔍 Searching for payslip with numericEmployeeId:", numericEmployeeId);

  try {
    const payslip = await PayslipHistory.findAll({
      where: { employeeId: numericEmployeeId }, // Now matching the integer ID
    });

    if (!payslip || payslip.length === 0) {
      console.log("❌ No payslip found for Employee ID:", numericEmployeeId);
      return res.status(404).json({ success: false, message: "Payslip not found" });
    }

    res.status(200).json({ success: true, payslip });
  } catch (error) {
    console.error("🔥 Database error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


export const generatePayroll = async (req, res) => {
  const { cutoffDate, selectedEmployees = [], maxOvertime = 0 } = req.body;

  console.log("🔍 Incoming request:", { cutoffDate, selectedEmployees, maxOvertime });

  try {
    // 👇 Generate unique batch ID
    const now = new Date();
    const batchId = `SJM-PayrollBatch-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now.getTime()}`;
    console.log(`🔗 Generated batchId: ${batchId}`);

    let employees, attendanceRecords, payrollInformations, holidays;

    try {
      employees = await Employee.findAll({
        where: { status: { [Op.ne]: "Inactive" } }
      });
      console.log(`✅ Found ${employees.length} active employees`);
    } catch (error) {
      console.error("❌ Error fetching employees:", error);
      employees = await Employee.findAll();
      employees = employees.filter(emp => emp.status !== "Inactive");
    }

    try {
      attendanceRecords = await Attendance.findAll();
      console.log(`✅ Found ${attendanceRecords.length} attendance records`);
    } catch (error) {
      console.error("❌ Error fetching attendance records:", error);
      attendanceRecords = [];
    }

    try {
      payrollInformations = await PayrollInformation.findAll();
      console.log(`✅ Found ${payrollInformations.length} payroll information records`);
    } catch (error) {
      console.error("❌ Error fetching payroll information:", error);
      payrollInformations = [];
    }

    try {
      holidays = await Holidays.findAll();
      console.log(`✅ Found ${holidays.length} holidays`);
    } catch (error) {
      console.error("❌ Error fetching holidays:", error);
      holidays = [];
    }

    if (!employees || employees.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No active employees found!"
      });
    }

    const generatedPayslips = [];
    const errors = [];

    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];

      try {
        console.log(`📝 Processing ${i + 1}/${employees.length}: ${employee.name} (${employee.ecode})`);

        const employeeAttendance = attendanceRecords.filter(
          record => record.ecode === employee.ecode
        );

        if (!employeeAttendance || employeeAttendance.length === 0) {
          console.log(`⏭️ Skipping ${employee.name} (${employee.ecode}) - No attendance data found`);
          continue;
        }

        const employeePayrollInfo = payrollInformations.find(
          info => info.ecode === employee.ecode
        ) || {};

        let attendanceMetrics;
        try {
          attendanceMetrics = calculateAttendanceMetrics(employeeAttendance, holidays);
        } catch (error) {
          attendanceMetrics = getDefaultAttendanceMetrics();
        }

        const rates = {
          hourlyRate: Number(employeePayrollInfo.hourly_rate) || 0,
          overtimeRate: Number(employeePayrollInfo.overtime_pay) || 0,
          dailyRate: Number(employeePayrollInfo.daily_rate) || 0,
          allowance: Number(employeePayrollInfo.allowance) || 0,
          nightDifferential: Number(employeePayrollInfo.night_differential) || 0
        };

        const deductions = {
          sss: Number(employeePayrollInfo.sss_contribution) || 0,
          phic: Number(employeePayrollInfo.philhealth_contribution) || 0,
          hdmf: Number(employeePayrollInfo.pagibig_contribution) || 0,
          loan: Number(employeePayrollInfo.loan) || 0,
          otherDeductions: Number(employeePayrollInfo.otherDeductions) || 0,
          tardiness: (attendanceMetrics.totalTardiness || 0) * 1.08
        };

        const adjustment = Number(employeePayrollInfo.adjustment) || 0;

        const totalOvertime = selectedEmployees.includes(employee.ecode)
          ? Math.min(attendanceMetrics.totalOvertime || 0, Number(maxOvertime))
          : 0;

        const basicPay = (attendanceMetrics.totalRegularHours || 0) * rates.hourlyRate;
        const overtimePay = totalOvertime * rates.overtimeRate;
        const holidayPay = (attendanceMetrics.totalHolidayHours || 0) * (rates.hourlyRate * 2);

        const grossPay = basicPay + overtimePay + holidayPay + rates.allowance + rates.nightDifferential;
        const totalEarnings = grossPay + adjustment;
        const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + (Number(val) || 0), 0);
        const netPay = totalEarnings - totalDeductions;

        const payslipData = {
          ecode: employee.ecode,
          email: employee.emailaddress || '',
          employeeId: employee.id,
          name: employee.name,
          project: employee["area/section"] || employee.area || employee.section || "N/A",
          position: employee.positiontitle || employee.position || "N/A",
          department: employee.department || "N/A",
          cutoffDate,
          dailyrate: rates.dailyRate.toFixed(2),
          basicPay: basicPay.toFixed(2),
          noOfDays: attendanceMetrics.daysPresent || 0,
          holidayDays: attendanceMetrics.holidayDays || 0,
          regularDays: attendanceMetrics.regularDays || 0,
          overtimePay: overtimePay.toFixed(2),
          totalOvertime: totalOvertime,
          totalRegularHours: (attendanceMetrics.totalRegularHours || 0).toFixed(2),
          totalHolidayHours: (attendanceMetrics.totalHolidayHours || 0).toFixed(2),
          holidayPay: holidayPay.toFixed(2),
          nightDifferential: rates.nightDifferential.toFixed(2),
          allowance: rates.allowance.toFixed(2),
          sss: deductions.sss.toFixed(2),
          phic: deductions.phic.toFixed(2),
          hdmf: deductions.hdmf.toFixed(2),
          loan: deductions.loan.toFixed(2),
          totalTardiness: deductions.tardiness.toFixed(2),
          totalHours: (attendanceMetrics.totalHours || 0).toFixed(2),
          otherDeductions: deductions.otherDeductions.toFixed(2),
          totalEarnings: totalEarnings.toFixed(2),
          totalDeductions: totalDeductions.toFixed(2),
          adjustment: adjustment.toFixed(2),
          gross_pay: grossPay.toFixed(2),
          netPay: netPay.toFixed(2),
          status: "pending",
          batchId // 👈 New field for batch approval
        };

        const newPayslip = await Payslip.create(payslipData);
        generatedPayslips.push(newPayslip);

      } catch (employeeError) {
        errors.push({
          employee: employee.name,
          ecode: employee.ecode,
          error: employeeError.message
        });
      }
    }

    const approvers = await User.findAll({ where: { role: 'approver', isBlocked: false } });
    const successfulEmails = [];

    for (const approver of approvers) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: approver.email,
        subject: `Payroll Generated: ${cutoffDate} (Batch: ${batchId})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h3>Hello ${approver.name},</h3>
            <p>Payroll has been successfully generated for the cutoff date <strong>${cutoffDate}</strong>.</p>
            <p>Batch ID: <strong>${batchId}</strong></p>
            <p>Please review the payslips in the payroll system.</p>
            <br />
            <p>Best regards,<br />SJM Payroll System</p>
          </div>
        `
      };

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      transporter.verify((error, success) => {
        if (error) {
          console.error("❌ SMTP Connection Failed:", error);
        } else {
          console.log("✅ SMTP Server Ready!");
        }
      });

      if (!cutoffDate) {
        return res.status(400).json({
          success: false,
          message: "cutoffDate is required"
        });
      }

      try {
        await transporter.sendMail(mailOptions);
        successfulEmails.push(approver.email);
      } catch (emailError) {
        console.error(`❌ Failed to send email to ${approver.email}:`, emailError);
      }
    }

    res.status(201).json({
      success: true,
      message: `Payroll generated for ${generatedPayslips.length} employees!`,
      batchId,
      payslips: generatedPayslips,
      notified: successfulEmails,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error("❌ Payroll Generation Critical Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during payroll generation.",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


// Helper function to calculate attendance metrics from raw attendance data
function calculateAttendanceMetrics(attendanceRecords, holidays = []) {
  try {
    const holidayDates = new Set(holidays.map(h => h.date));

    let totalRegularHours = 0;
    let totalHolidayHours = 0;
    let totalOvertime = 0;
    let totalTardiness = 0;
    let daysPresent = 0;
    let holidayDays = 0;
    let regularDays = 0;

    attendanceRecords.forEach(record => {
      if (record.status === 'present' && !record.isAbsent) {
        daysPresent++;

        // Convert time strings to hours
        const workHours = timeStringToHours(record.workTime);
        const overtimeHours = timeStringToHours(record.overtime);
        const lateHours = timeStringToHours(record.lateTime);

        totalOvertime += overtimeHours;
        totalTardiness += lateHours;

        // Check if it's a holiday
        if (holidayDates.has(record.date)) {
          totalHolidayHours += workHours;
          holidayDays++;
        } else {
          totalRegularHours += workHours;
          regularDays++;
        }
      }
    });

    return {
      totalRegularHours,
      totalHolidayHours,
      totalHours: totalRegularHours + totalHolidayHours,
      totalOvertime,
      totalTardiness,
      daysPresent,
      holidayDays,
      regularDays
    };
  } catch (error) {
    console.error("Error in calculateAttendanceMetrics:", error);
    return getDefaultAttendanceMetrics();
  }
}

// Helper function to get default attendance metrics
function getDefaultAttendanceMetrics() {
  return {
    totalRegularHours: 0,
    totalHolidayHours: 0,
    totalHours: 0,
    totalOvertime: 0,
    totalTardiness: 0,
    daysPresent: 0,
    holidayDays: 0,
    regularDays: 0
  };
}

// Helper function to convert time string (HH:MM:SS) to decimal hours
function timeStringToHours(timeString) {
  try {
    if (!timeString || timeString === '00:00:00') return 0;

    const [hours, minutes, seconds] = timeString.split(':').map(Number);

    // Validate the parsed values
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
      console.warn(`Invalid time string: ${timeString}`);
      return 0;
    }

    return hours + (minutes / 60) + (seconds / 3600);
  } catch (error) {
    console.error(`Error parsing time string "${timeString}":`, error);
    return 0;
  }
}


export const getAvailableBatches = async (req, res) => {
  try {
    const batches = await Payslip.findAll({
      attributes: ['batchId'],
      group: ['batchId'],
      order: [['batchId', 'DESC']],
      raw: true,
    });

    const batchDetails = await Promise.all(
      batches.map(async ({ batchId }) => {
        const payslips = await Payslip.findAll({
          where: { batchId },
          attributes: ['id', 'employeeId', 'name', 'cutoffDate', 'status', 'netPay'],
          order: [['name', 'ASC']],
          raw: true,
        });

        const statuses = payslips.map(p => p.status);
        const uniqueStatuses = [...new Set(statuses)];

        const cutoffDates = payslips.map(p => p.cutoffDate);
        const cutoffRange = cutoffDates.length
          ? `${cutoffDates[0]} - ${cutoffDates[cutoffDates.length - 1]}`
          : null;

        return {
          batchId,
          totalPayslips: payslips.length,
          uniqueStatuses,
          cutoffRange,
          payslips, // Include this if you need full list per batch
        };
      })
    );

    res.status(200).json(batchDetails);
  } catch (error) {
    console.error("Error fetching available batches:", error);
    res.status(500).json({ success: false, message: "Failed to fetch batch details" });
  }
};



export const requestPayrollRelease = async (req, res) => {
  try {
    const { requestedBy } = req.body;

    const request = await PayrollReleaseRequest.create({
      requestedBy,
      status: "pending",
    });

    res.status(201).json({ message: "Payroll release requested", request });
  } catch (error) {
    console.error("Error requesting payroll release:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const releasePayroll = async (req, res) => {
  try {
    const [results, metadata] = await sequelize.query(
      "UPDATE payslips SET status = 'released' WHERE status = 'pending';",
      {
        type: QueryTypes.UPDATE,
      }
    );

    console.log("Update metadata:", metadata); // 👈 LOG THIS
    const payslips = await sequelize.query(
      "SELECT * FROM payslips WHERE status = 'released';",
      {
        type: QueryTypes.SELECT,
      }
    );

    console.log("Payslips after release:", payslips);

    return res.json({ success: true, message: "Payroll released", data: payslips });
  } catch (error) {
    console.error("Error releasing payroll:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};




export const pendingRequests = async (req, res) => {
  try {
    const requests = await PayrollReleaseRequest.findAll({
      where: { status: "pending" },
    });

    res.json(requests);
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePayrollRequest = async (req, res) => {
  try {
    const { requestId, status } = req.body;

    const request = await PayrollReleaseRequest.findByPk(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = status;
    await request.save();

    res.json({ message: `Payroll request ${status}`, request });
  } catch (error) {
    console.error("Error updating payroll request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPayslipById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch payslip from the database
    const payslip = await Payslip.findOne({ where: { employee_id: id } });

    if (!payslip) {
      console.log(`Payslip not found for employee_id: ${id}`);
      return res.status(404).json({ message: "Payslip not found" });
    }
    res.status(200).json(payslip);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteAllPayslips = async (req, res) => {
  try {
    await Payslip.destroy({ where: {}, truncate: true }); // Deletes all rows
    res.status(200).json({ message: "All payslips deleted successfully." });
  } catch (error) {
    console.error("Error deleting all payslips:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


export const releasePayrollByProject = async (req, res) => {
  const { project } = req.body;

  if (!project) {
    return res.status(400).json({ success: false, message: "Project is required." });
  }

  try {
    const [results, metadata] = await sequelize.query(
      "UPDATE payslips SET status = 'released' WHERE status = 'pending' AND project = :project",
      {
        replacements: { project },
        type: QueryTypes.UPDATE
      }
    );

    if (metadata > 0) {
      const payslips = await sequelize.query(
        "SELECT * FROM payslips WHERE status = 'released' AND project = :project",
        {
          replacements: { project },
          type: QueryTypes.SELECT
        }
      );

      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/payslip/send-payslip`, { payslips });
        return res.json({
          success: true,
          message: `Payroll for '${project}' successfully released and payslips sent.`,
        });
      } catch (emailError) {
        console.error("Error sending emails:", emailError);
        return res.json({
          success: true,
          message: `Payroll released for '${project}', but failed to send emails.`,
        });
      }
    } else {
      return res.json({ success: false, message: "No pending payslips found for this project." });
    }
  } catch (error) {
    console.error("Error releasing project-specific payroll:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};