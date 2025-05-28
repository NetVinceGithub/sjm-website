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
import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
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
});

// Verify SMTP connection once
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Connection Failed:", error);
  } else {
    console.log("✅ SMTP Server Ready!");
  }
});

// Function to generate payslip image
const generatePayslipImage = async (payslip) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  await page.setViewport({
    width: 900,
    height: 1146,
    deviceScaleFactor: 1
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
        }
        .payslip-container {
          width: 900px;
          height: 1146px;
          background-color: white;
          margin: 0 auto;
        }                     
        .header {
          background-color: #0093DD;
          width: 180px;
          height: 60px;
          border: 2px solid #0093DD;
          border-bottom-left-radius: 20px;
          border-bottom-right-radius: 20px;
          margin-left: 35px;
          position: relative;
        }
        .header h1 {
          color: white;
          font-weight: bold;
          font-size: 12px;
          text-align: center;
          margin: 8px 0;
          padding-top: 5px;
        }
        .logo {
          position: absolute;
          top: -45px;
          right: -200px;
          width: 100px;
          height: auto;
        }
        .payslip-no {
          font-weight: bold;
          margin: 15px 0 5px 0;
          font-size: 9px;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          font-size: 6px;
        }
        th, td {
          border: 1.5px solid #AA396F;
          text-align: center;
          padding: 2px;
        }
        .earnings-section {
          text-align: left;
          padding-left: 3px;
        }
        .govt-contributions {
          font-weight: bold;
          font-size: 5px;
          background-color: #AA396F;
          color: white;
          border-radius: 5px;
          padding: 1px;
        }
        .footer {
          min-height: 50px;
          background-color: #bbe394;
          padding: 5px;
          margin-top: 5px;
          font-size: 6px;
        }
        .footer-content {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }
        .footer-section {
          flex: 1;
        }
      </style>
    </head>
    <body>
      <div class="payslip-container">
        <div class="header">
          <h1>e-PAYROLL SLIP</h1>
          <img src="https://drive.google.com/uc?export=view&id=1hthE-VT5Sk4Xp3tYW5l1_UEv0bCOkfmd" alt="Company Logo" class="logo" />  
        </div>

        <h2 class="payslip-no">Payslip No.:</h2>
        
        <table>
          <thead>
            <tr>
              <th>ECODE</th>
              <th>EMPLOYEE NAME</th>
              <th>PROJECT SITE</th>
              <th>RATE</th>
            </tr>
          </thead>
          <tbody>
            <tr style="height: 25px;">
              <td>${payslip.ecode || "N/A"}</td>
              <td>${payslip.name || "N/A"}</td>
              <td>${payslip.project || "N/A"}</td>
              <td>${payslip.dailyrate || "0.00"}</td>
            </tr>
            <tr>
              <th colspan="2">POSITION</th>
              <th colspan="2">CUT-OFF DATE</th>
            </tr>
            <tr>
              <td colspan="2" style="height: 25px;">${payslip.position || "N/A"}</td>
              <td colspan="2" style="height: 25px;">${payslip.cutoff_date || "N/A"}</td>
            </tr>
            <tr>
              <th>EARNINGS</th>
              <th>FIGURES</th>
              <th>DEDUCTIONS</th>
              <th>FIGURES</th>
            </tr>
            <tr>
              <td class="earnings-section">Basic Pay</td>
              <td>${payslip.basic_pay ? Number(payslip.basic_pay).toLocaleString() : "0.00"}</td>
              <td class="govt-contributions">GOVERNMENT CONTRIBUTIONS</td>
              <td></td>
            </tr>
            <tr>
              <td class="earnings-section">No. of Days</td>
              <td>${parseInt(payslip.no_of_days, 10) || "0"}</td>
              <td class="earnings-section">SSS</td>
              <td>${payslip.sss ? Number(payslip.sss).toLocaleString() : "0.00"}</td>
            </tr>
            <tr>
              <td class="earnings-section">Overtime Pay</td>
              <td>${payslip.overtime_pay ? Number(payslip.overtime_pay).toLocaleString() : "0.00"}</td>
              <td class="earnings-section">PHIC</td>
              <td>${payslip.phic ? Number(payslip.phic).toLocaleString() : "0.00"}</td>
            </tr>
            <tr>
              <td class="earnings-section">Overtime Hours</td>
              <td>${payslip.total_overtime}</td>
              <td class="earnings-section">HDMF</td>
              <td>${payslip.hdmf ? Number(payslip.hdmf).toLocaleString() : "0.00"}</td>
            </tr>
            <tr>
              <td class="earnings-section">Holiday Pay</td>
              <td>${payslip.holiday_pay ? Number(payslip.holiday_pay).toLocaleString() : "0.00"}</td>
              <td class="earnings-section">Cash Advance/Loan</td>
              <td>${payslip.loan ? Number(payslip.loan).toLocaleString() : "0.00"}</td>
            </tr>
            <tr>
              <td class="earnings-section">Night Differential</td>
              <td>${payslip.night_differential ? Number(payslip.night_differential).toLocaleString() : "0.00"}</td>
              <td class="earnings-section">Tardiness</td>
              <td>${payslip.total_tardiness ? Number(payslip.total_tardiness).toLocaleString() : "0.00"}</td>
            </tr>
            <tr>
              <td class="earnings-section">Allowance</td>
              <td>${payslip.allowance ? Number(payslip.allowance).toLocaleString() : "0.00"}</td>
              <td class="earnings-section">Other Deductions</td>
              <td>${payslip.other_deductions ? Number(payslip.other_deductions).toLocaleString() : "0.00"}</td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td class="earnings-section">Total Deductions</td>
              <td>${payslip.total_deductions ? Number(payslip.total_deductions).toLocaleString() : "0.00"}</td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td class="earnings-section">Adjustments</td>
              <td>${payslip.adjustment ? Number(payslip.adjustment).toLocaleString() : "0.00"}</td>
            </tr>
            <tr>
              <th colspan="2">NET PAY</th>
              <th colspan="2">AMOUNT</th>
            </tr>
            <tr>
              <td colspan="2" class="earnings-section">NETPAY: ₱${payslip.net_pay ? Number(payslip.net_pay).toLocaleString() : "0.00"}</td>
              <td colspan="2">₱${payslip.total_deductions ? Number(payslip.total_deductions).toLocaleString() : "0.00"}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="footer">
          <div class="footer-content">
            <div class="footer-section">
              <p><strong>Company:</strong> St. John Majore Services Company Inc.</p>
              <p><strong>Email:</strong> sjmajore@gmail.com</p>
              <p><strong>Web:</strong> N/A</p>
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

  // Take screenshot with high quality
  // Or use this version instead:
  const payslipElement = await page.$('.payslip-container');
  const boundingBox = await payslipElement.boundingBox();
  const screenshot = await page.screenshot({
    type: 'jpeg',
    quality: 100,
    clip: boundingBox,
    omitBackground: false
  });

  await browser.close();
  return screenshot;
};

export const sendPayslips = async (req, res) => {
  try {
    const { payslips } = req.body;
    console.log("📨 Received request to send payslips:", payslips);

    if (!payslips || payslips.length === 0) {
      console.log("⚠️ No payslips received.");
      return res
        .status(400)
        .json({ success: false, message: "No payslips provided." });
    }

    let successfulEmails = [];
    let failedEmails = [];
    let payslipIdsToDelete = [];

    for (let payslip of payslips) {
      if (!payslip.email) {
        console.warn(
          `⚠️ Skipping payslip for ${payslip.name} (No email provided)`
        );
        failedEmails.push({ name: payslip.name, reason: "No email provided" });
        continue;
      }

      try {
        console.log(`🖼️ Generating payslip image for ${payslip.name}...`);

        // Generate payslip image
        const payslipImage = await generatePayslipImage(payslip);

        // Create temporary file path
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        const imagePath = path.join(tempDir, `payslip_${payslip.ecode}_${Date.now()}.jpg`);
        fs.writeFileSync(imagePath, payslipImage);

        // Generate unique Content-ID for the embedded image
        const contentId = `payslip_${payslip.ecode}_${Date.now()}`;

        let mailOptions = {
          from: process.env.EMAIL_USER,
          to: payslip.email,
          subject: `Payslip for ${payslip.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #0093DD; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 20px;">St. John Majore Services Company Inc.</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px; font-style: italic;">Electronic Payslip</p>
              </div>
              
              <div style="background-color: #f8f9fa; padding: 20px; border: 1px solid #dee2e6;">
                <h2 style="color: #0093DD; margin-top: 0;">Dear ${payslip.name},</h2>
                <p>Please find your payslip below:</p>
                <p><strong>Payroll Period:</strong> ${payslip.cutoff_date || "N/A"}</p>
                <p><strong>Employee Code:</strong> ${payslip.ecode || "N/A"}</p>
                <p><strong>Net Pay:</strong> ₱${payslip.net_pay ? Number(payslip.net_pay).toLocaleString() : "0.00"}</p>
                
                <!-- Embedded Payslip Image -->
                <div style="text-align: center; margin: 20px 0; padding: 10px; background-color: white; border: 2px solid #0093DD; border-radius: 8px;">
                <img src="cid:${contentId}" alt="Payslip" style="width: 288px; height: 367px; border-radius: 4px;" />
                </div>
              </div>
              
              <div style="background-color: #bbe394; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                <p style="margin: 0; font-size: 12px; color: #666;">
                  <strong>Contact Information:</strong><br>
                  Email: sjmajore@gmail.com<br>
                  Address: 8 Patron Central Plaza De Villa St., Poblacion, San Juan, Batangas
                </p>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px;">
                <p style="margin: 0; font-size: 12px; color: #856404;">
                  <strong>Note:</strong> This is an automated email. Please do not reply to this message. 
                  If you have any questions regarding your payslip, please contact the HR department.
                </p>
              </div>
            </div>
          `,
          attachments: [
            {
              filename: `payslip_${payslip.ecode}_${payslip.cutoff_date || 'latest'}.jpg`,
              path: imagePath,
              contentType: 'image/jpeg',
              cid: contentId // This makes the image inline/embedded
            }
          ]
        };

        await transporter.sendMail(mailOptions);
        console.log(`📩 Payslip sent to ${payslip.email}`);
        successfulEmails.push(payslip.email);

        // Clean up temporary file
        fs.unlinkSync(imagePath);

        // Save to payslip history
        await PayslipHistory.create({
          ecode: payslip.ecode,
          email: payslip.email,
          employeeId: payslip.id,
          name: payslip.name,
          project: payslip.project || "N/A",
          position: payslip.position || "N/A",
          department: payslip.department,
          cutoffDate: payslip.cutoff_date,
          allowance: parseFloat(payslip.allowance) || 0,
          dailyrate: parseFloat(payslip.dailyrate) || 0,
          basicPay: parseFloat(payslip.basic_pay) || 0,
          overtimePay: parseFloat(payslip.overtime_pay) || 0,
          holidayPay: parseFloat(payslip.holiday_pay) || 0,
          noOfDays: parseFloat(payslip.no_of_days) || 0,
          totalOvertime: parseFloat(payslip.total_overtime) || 0,
          nightDifferential: parseFloat(payslip.night_differential) || 0,
          sss: parseFloat(payslip.sss) || 0,
          phic: parseFloat(payslip.phic) || 0,
          hdmf: parseFloat(payslip.hdmf) || 0,
          loan: parseFloat(payslip.loan) || 0,
          totalTardiness: parseFloat(payslip.total_tardiness) || 0,
          totalHours: parseFloat(payslip.total_hours || 0).toFixed(2),
          otherDeductions: parseFloat(payslip.other_deductions) || 0,
          totalEarnings: parseFloat(payslip.total_earnings) || 0,
          adjustment: parseFloat(payslip.adjustment) || 0,
          gross_pay: parseFloat(payslip.gross_pay) || 0,
          totalDeductions: parseFloat(payslip.total_deductions || 0).toFixed(2),
          netPay: parseFloat(payslip.net_pay || 0).toFixed(2),
        });

        payslipIdsToDelete.push(payslip.id);
      } catch (error) {
        console.error(`❌ Email failed to ${payslip.email}:`, error);
        failedEmails.push({ email: payslip.email, error: error.message });

        // Clean up temporary file if it exists
        const imagePath = path.join(__dirname, '../temp', `payslip_${payslip.ecode}_${Date.now()}.jpg`);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }

    // Bulk delete sent payslips
    if (payslipIdsToDelete.length > 0) {
      await Payslip.destroy({ where: { id: payslipIdsToDelete } });
      console.log(`🗑 Deleted ${payslipIdsToDelete.length} sent payslips.`);
    }

    // Delete all records from AttendanceSummary and Attendance tables
    try {
      await AttendanceSummary.destroy({ where: {} });
      await Attendance.destroy({ where: {} });
      console.log("🗑 Cleared AttendanceSummary and Attendance tables.");
    } catch (error) {
      console.error("❌ Error while clearing attendance data:", error);
    }

    res.status(200).json({
      success: true,
      message: "Payslips processed and attendance records cleared.",
      summary: {
        sent: successfulEmails.length,
        failed: failedEmails.length,
        failedDetails: failedEmails,
      },
    });
  } catch (error) {
    console.error("❌ Server error while sending payslips:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sending payslips.",
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
    const payslips = await Payslip.findAll(); // ✅ This is correct for MySQL (Sequelize)
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
  console.log("🔍 Incoming request body:", req.body);
  const { cutoffDate, selectedEmployees = [], maxOvertime = 0 } = req.body; // ✅ Include maxOvertime

  if (!cutoffDate) {
    return res.status(400).json({ success: false, message: "cutoffDate is required" });
  }

  try {
    console.log("🚀 Starting Payroll Generation for cutoffDate:", cutoffDate);

    const employees = await Employee.findAll();
    const attendanceSummaries = await AttendanceSummary.findAll();
    const payrollInformations = await PayrollInformation.findAll();

    if (!employees || employees.length === 0) {
      return res.status(400).json({ success: false, message: "No employees found!" });
    }

    let generatedPayslips = [];

    for (const employee of employees) {
      if (employee.status === "Inactive") {
        console.log(`⏭️ Skipping inactive employee: ${employee.name} (${employee.ecode})`);
        continue;
      }

      const employeeAttendance =
        attendanceSummaries.find((summary) => summary.ecode === employee.ecode) || {};
      const employeePayrollInfo =
        payrollInformations.find((info) => info.ecode === employee.ecode) || {};

      const no_of_days = employeeAttendance.daysPresent || 0;
      const holidayDays = employeeAttendance.holidayCount || 0;
      const regularDays = employeeAttendance.regularDays || 0; // or employeeAttendance.regularDays if available
      const totalHours = Number(employeeAttendance ?.totalHours) || 0;
      const holidayHours = Number(employeeAttendance ?.holiday) || 0;
      const hourlyRate = employeePayrollInfo.hourly_rate || 0;
      const overtimeRate = employeePayrollInfo.overtime_pay || 0;
      const dailyRate = employeePayrollInfo.daily_rate || 0;
      const allowance = employeePayrollInfo.allowance || 0;
      const sss = employeePayrollInfo.sss_contribution || 0;
      const phic = employeePayrollInfo.philhealth_contribution || 0;
      const hdmf = employeePayrollInfo.pagibig_contribution || 0;
      const tardiness = (Number(employeeAttendance ?.totalTardiness) || 0) * 1.08;
      const nightDifferential = employeePayrollInfo.night_differential || 0;
      const loan = employeePayrollInfo.loan || 0;
      const otherDeductions = employeePayrollInfo.otherDeductions || 0;
      const adjustment = employeePayrollInfo.adjustment || 0;

      const totalOvertime = selectedEmployees.includes(employee.ecode)
        ? Math.min(Number(employeeAttendance ?.totalOvertime) || 0, Number(maxOvertime))
        : 0;

      const totalRegularHours = employeeAttendance.totalRegularHours;
      const totalHolidayHours = employeeAttendance.totalHolidayHours;

      console.log(
        `Processing Payroll for: ${employee.name} (${employee.ecode}) | Overtime: ${totalOvertime} hours`
      );

      const basicPay = totalHours * hourlyRate;
      const overtimePay = totalOvertime * overtimeRate;
      const holidayPay = totalHolidayHours * (hourlyRate * 2);
      const grossPay = basicPay + overtimePay + holidayPay + allowance;
      const totalEarnings = grossPay + adjustment;
      const totalDeductions = tardiness + sss + phic + hdmf + loan + otherDeductions;
      const netPay = totalEarnings - totalDeductions;

      const payslipData = {
        ecode: employee.ecode,
        email: employee.emailaddress,
        employeeId: employee.id,
        name: employee.name,
        project: employee["area/section"] || "N/A",
        position: employee.positiontitle || "N/A",
        department: employee.department,
        cutoffDate,
        dailyrate: dailyRate.toFixed(2),
        basicPay: basicPay.toFixed(2),
        noOfDays: no_of_days,
        holidayDays: holidayDays,
        regularDays: regularDays,
        overtimePay: overtimePay.toFixed(2),
        totalOvertime: totalOvertime,
        totalRegularHours: totalRegularHours,
        totalHolidayHours: totalHolidayHours,
        holidayPay: holidayPay.toFixed(2),
        nightDifferential: nightDifferential.toFixed(2),
        allowance: allowance.toFixed(2),
        sss: sss.toFixed(2),
        phic: phic.toFixed(2),
        hdmf: hdmf.toFixed(2),
        loan: loan.toFixed(2),
        totalTardiness: tardiness.toFixed(2),
        totalHours: totalHours.toFixed(2),
        otherDeductions: otherDeductions.toFixed(2),
        totalEarnings: totalEarnings.toFixed(2),
        totalDeductions: totalDeductions.toFixed(2),
        adjustment: adjustment.toFixed(2),
        gross_pay: grossPay.toFixed(2),
        netPay: netPay.toFixed(2),
        status: "pending",
      };

      console.log("✅ Payslip Data:", payslipData);

      // Save the payslip
      try {
        const newPayslip = await Payslip.create(payslipData);
        generatedPayslips.push(newPayslip);
      } catch (dbError) {
        console.error("❌ Error Saving Payslip to Database:", dbError);
      }
    }

    res.status(201).json({
      success: true,
      message: "Payroll generated!",
      payslips: generatedPayslips,
    });
  } catch (error) {
    console.error("❌ Payroll Generation Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during payroll generation.",
    });
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