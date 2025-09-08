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
import Holidays from "../models/Holidays.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import User from "../models/User.js";
dotenv.config();
import moment from "moment"; // Import moment.js for date manipulation
import { DataTypes } from "sequelize";
import { Sequelize } from "sequelize";
import puppeteer from "puppeteer"; // Make sure puppeteer is installed

import { execSync } from "child_process";
import {
  calculateSSSContribution,
  calculateSSSWithCutoff,
  updatePayrollWithSSS,
} from "../utils/sssCalculator.js";

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
    rejectUnauthorized: false,
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

// Function to generate payslip PDF - Modified for 4" x 5" using Playwright
// Method 1: Read HTML file and replace placeholders
const loadPayslipTemplate = () => {
  const templatePath = path.join(
    __dirname,
    "..",
    "templates",
    "paysliptemplate.html"
  );
  return fs.readFileSync(templatePath, "utf8");
};

const fillTemplate = (template, data) => {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });
};

const generatePayslipPDF = async (payslip) => {
  // In your generatePayslipPDF function, add this before launching:
  console.log("🔍 Checking Puppeteer executable path...");
  try {
    const executablePath = await puppeteer.executablePath();
    console.log("📍 Puppeteer executable path:", executablePath);
  } catch (error) {
    console.log("❌ Error getting executable path:", error.message);
  }

  let browser = null;
  let page = null;

  try {
    const puppeteerConfig = {
      headless: "new",
      executablePath: puppeteer.executablePath(),
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu",
      ],
    };

    console.log("🚀 Launching Puppeteer browser for payslip generation...");
    browser = await puppeteer.launch(puppeteerConfig);

    // Create a new page
    page = await browser.newPage();

    // Set viewport (similar to Playwright's context viewport)
    await page.setViewport({
      width: 396, // ~4.13 inches at 96 DPI
      height: 561, // ~5.83 inches at 96 DPI
      deviceScaleFactor: 3,
    });

    // Load template and fill with data
    const template = loadPayslipTemplate();

    const templateData = {
      payslip_number: `${payslip.ecode || "N/A"}-${new Date().getTime()}`,
      ecode: payslip.ecode || "N/A",
      project: payslip.project || "N/A",
      employee_name: payslip.name || "N/A",
      project_site: payslip.project || "N/A",
      daily_rate: `${
        payslip.dailyrate
          ? Number(payslip.dailyrate).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "0.00"
      }`,
      regular_holiday_pay: `${
        payslip.regular_holiday_pay || payslip.regularHolidayPay
          ? Number(payslip.regular_holiday_pay || payslip.regularHolidayPay).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "0.00"
      }`,
      special_holiday_pay: `${
        payslip.special_holiday_pay || payslip.specialHolidayPay
          ? Number(payslip.special_holiday_pay || payslip.specialHolidayPay).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "0.00"
      }`,
      position: payslip.position || "N/A",
      cutoff_date: payslip.cutoffDate || "N/A",
      basic_pay: `${
        payslip.basicPay
          ? Number(payslip.basicPay).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "0.00"
      }`,
      no_of_days: parseInt(payslip.noOfDays, 10) || "0",
      overtime_pay: `${
        payslip.overtime_pay
          ? Number(payslip.overtime_pay).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "0.00"
      }`,
      total_overtime: payslip.total_overtime || "0",
      holiday_pay: `${
        payslip.holiday_pay
          ? Number(payslip.holiday_pay).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "0.00"
      }`,
      night_differential: `${
        payslip.night_differential
          ? Number(payslip.night_differential).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "0.00"
      }`,
      allowance: `${
        payslip.allowance
          ? Number(payslip.allowance).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "0.00"
      }`,
      sss: `${
        payslip.sss
          ? Number(payslip.sss).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "0.00"
      }`,
      sssLoan: `${
        payslip.sssLoan
          ? Number(payslip.sssLoan).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "0.00"
      }`,
      phic: `${
        payslip.phic
          ? Number(payslip.phic).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "0.00"
      }`,
      hdmf: `${
        payslip.hdmf
          ? Number(payslip.hdmf).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "0.00"
      }`,
      hdmfLoan: `${
        payslip.hdmfLoan
          ? Number(payslip.hdmfLoan).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "0.00"
      }`,
      loan: `${
        payslip.loan
          ? Number(payslip.loan).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "0.00"
      }`,
      total_tardiness: `${
        payslip.total_tardiness
          ? Number(payslip.total_tardiness).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "0.00"
      }`,
      other_deductions: `${
        payslip.other_deductions
          ? Number(payslip.other_deductions).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "0.00"
      }`,
      total_earnings: `${
        payslip.total_earnings
          ? Number(payslip.total_earnings).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "0.00"
      }`,
      total_deductions: `${
        payslip.total_deductions
          ? Number(payslip.total_deductions).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "0.00"
      }`,
      adjustment: `${
        payslip.adjustment
          ? Number(payslip.adjustment).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "0.00"
      }`,
      gross_pay: `${
        payslip.gross_pay || payslip.grossPay
          ? Number(payslip.gross_pay || payslip.grossPay).toLocaleString(
              undefined,
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )
          : "0.00"
      }`,
      net_pay: `${
        payslip.netPay || payslip.net_pay
          ? Number(payslip.netPay || payslip.net_pay).toLocaleString(
              undefined,
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )
          : "0.00"
      }`,
    };

    const htmlContent = fillTemplate(template, templateData);

    console.log("📄 Setting page content and generating PDF...");
    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Wait for DOM content to be loaded (similar to Playwright's domcontentloaded)
    await page.waitForSelector("body", { timeout: 30000 });

    const pdf = await page.pdf({
      format: "A6", // This explicitly sets A6 format
      printBackground: true,
      margin: {
        top: "2mm",
        right: "2mm",
        bottom: "2mm",
        left: "2mm",
      },
      preferCSSPageSize: true,
      timeout: 30000,
    });

    console.log("✅ PDF generated successfully");
    return pdf;
  } catch (error) {
    console.error("❌ Error generating payslip PDF:", error);
    throw new Error(`Failed to generate payslip PDF: ${error.message}`);
  } finally {
    // Always close resources to prevent memory leaks
    try {
      if (page) {
        await page.close();
        console.log("📄 Page closed successfully");
      }
      if (browser) {
        await browser.close();
        console.log("🔒 Browser closed successfully");
      }
    } catch (closeError) {
      console.error("⚠️ Error closing browser resources:", closeError);
    }
  }
};



export const sendPayslips = async (req, res) => {
  console.log("🚀 Starting sendPayslips function...");
  try {
    const { payslips } = req.body;

    console.log(payslips);

    // Access the first payslip object
    const firstPayslip = payslips[0];

    // Check if the first payslip exists
    if (!firstPayslip) {
      console.log("❌ No payslip data found.");
      return res.status(400).json({
        success: false,
        message: "No payslip data provided.",
      });
    }

    console.log(firstPayslip.payrollType); // Access payrollType from the first payslip
    console.log(firstPayslip.payroll_type); // Access payroll_type from the first payslip

    // Change status to "Approved"
    firstPayslip.status = "Approved";
    console.log(`✅ Status updated to "Approved" for payslip:`, firstPayslip);

    // Send immediate response
    res.status(200).json({
      success: true,
      message: "Payslip status updated to 'Approved'. Processing will continue shortly.",
    });

    // Continue processing after 1 minute
    setTimeout(async () => {
      console.log("📅 Continuing with payslip processing...");
      await processPayslips(req, res);
    }, 60000); // 1 minute delay

  } catch (mainError) {
    console.error("💥 CRITICAL ERROR in sendPayslips:");
    console.error("💥 Error message:", mainError.message);
    console.error("💥 Error stack:", mainError.stack);
    console.error("💥 Error details:", mainError);
    return res.status(500).json({
      success: false,
      message: `Critical error: ${mainError.message}`,
      error:
        process.env.NODE_ENV === "development" ? mainError.stack : undefined,
    });
  }
};


















const processPayslips = async (req, res) => {
    const { payslips } = req.body;
    console.log("📨 Received request to send payslips:", payslips?.length || 0, "payslips");
    console.log("📨 Request body structure:", JSON.stringify(req.body, null, 2));

    // Enhanced validation with detailed logging
    if (!payslips) {
      console.log("❌ No payslips field in request body");
      return res.status(400).json({
        success: false,
        message: "No payslips field provided in request body.",
      });
    }

    if (!Array.isArray(payslips)) {
      console.log("❌ Payslips is not an array:", typeof payslips);
      return res
        .status(400)
        .json({ success: false, message: "Payslips must be an array." });
    }

    if (payslips.length === 0) {
      console.log("❌ Empty payslips array");
      return res
        .status(400)
        .json({ success: false, message: "No payslips provided." });
    }

    console.log("✅ Payslips validation passed");


    // Check if required dependencies are available
    console.log("🔍 Checking dependencies...");
    console.log("- transporter exists:", typeof transporter !== "undefined");
    console.log(
      "- generatePayslipPDF exists:",
      typeof generatePayslipPDF !== "undefined"
    );
    console.log(
      "- ControlNumberHistory exists:",
      typeof ControlNumberHistory !== "undefined"
    );
    console.log(
      "- PayslipHistory exists:",
      typeof PayslipHistory !== "undefined"
    );
    console.log("- Payslip exists:", typeof Payslip !== "undefined");
    console.log("- moment exists:", typeof moment !== "undefined");

    let successfulEmails = [];
    let failedEmails = [];
    let payslipIdsToDelete = [];

    // Group payslips by batchId to handle them together
    console.log("📦 Grouping payslips by batchId...");
    const payslipsByBatch = {};
    for (let i = 0; i < payslips.length; i++) {
      const payslip = payslips[i];
      console.log(`📦 Processing payslip ${i + 1}/${payslips.length}:`, {
        id: payslip.id,
        batchId: payslip.batchId,
        name: payslip.name,
        email: payslip.email,
        date: payslip.date,
      });

      if (!payslip.batchId) {
        console.log(`⚠️ Payslip ${i + 1} missing batchId:`, payslip);
        failedEmails.push({
          name: payslip.name || "Unknown",
          reason: "Missing batchId",
        });
        continue;
      }

      if (!payslipsByBatch[payslip.batchId]) {
        payslipsByBatch[payslip.batchId] = [];
      }
      payslipsByBatch[payslip.batchId].push(payslip);
    }

    console.log(
      "📦 Batch grouping complete:",
      Object.keys(payslipsByBatch).map((batchId) => ({
        batchId,
        count: payslipsByBatch[batchId].length,
      }))
    );

    // Process each batch
    for (let batchId in payslipsByBatch) {
      console.log(`\n🔄 Processing batch: ${batchId}`);
      const batchPayslips = payslipsByBatch[batchId];
      console.log(`📋 Payslips in this batch: ${batchPayslips.length}`);

      // Validate first payslip has date
      if (!batchPayslips[0].date) {
        console.log(
          `❌ First payslip in batch ${batchId} missing date:`,
          batchPayslips[0]
        );
        for (let payslip of batchPayslips) {
          failedEmails.push({
            name: payslip.name || "Unknown",
            reason: "Missing date field",
          });
        }
        continue;
      }

      // Get the month-year from the first payslip in the batch
      const payslipMonthYear = moment(batchPayslips[0].date).format("YYYY-MM");
      console.log(`📅 Payslip month-year: ${payslipMonthYear}`);

      let controlNumber;
      let formattedControlNumber;

      // Check if this batchId already has a control number for this month
      console.log(
        `🔍 Checking for existing control number for batch ${batchId} in month ${payslipMonthYear}...`
      );

  

      let formattedBillingSummary;

  

      // Process all payslips in this batch with the same control number
      console.log(
        `📧 Processing ${batchPayslips.length} payslips for email sending...`
      );

      for (let i = 0; i < batchPayslips.length; i++) {
        const payslip = batchPayslips[i];
        console.log(
          `\n📧 Processing payslip ${i + 1}/${
            batchPayslips.length
          } in batch ${batchId}`
        );
        console.log(`👤 Employee: ${payslip.name} (${payslip.email})`);

        // Enhanced email validation
        if (
          !payslip.email ||
          !payslip.email.includes("@") ||
          payslip.email.trim() === ""
        ) {
          console.log(
            `❌ Invalid email for ${payslip.name}: "${payslip.email}"`
          );
          failedEmails.push({
            name: payslip.name,
            reason: "Invalid or missing email address",
          });
          continue;
        }

        // Validate email format more thoroughly
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(payslip.email.trim())) {
          console.log(
            `❌ Email format invalid for ${payslip.name}: "${payslip.email}"`
          );
          failedEmails.push({
            name: payslip.name,
            reason: "Invalid email format",
          });
          continue;
        }

        console.log(`✅ Email validation passed for ${payslip.email}`);

        try {
          console.log(`📋 Generating PDF for ${payslip.name}...`);
          console.log(`📋 Payslip data preview:`, {
            name: payslip.name,
            basicPay: payslip.basicPay,
            email: payslip.email,
            ecode: payslip.ecode,
            netPay: payslip.netPay,
            cutoffDate: payslip.cutoff_date || payslip.cutoffDate,
            project: payslip.project,
            position: payslip.position,
          });

          let pdfBuffer;
          try {
            pdfBuffer = await generatePayslipPDF(payslip);
            console.log(
              `✅ PDF generated successfully for ${payslip.name}, size: ${pdfBuffer.length} bytes`
            );
          } catch (pdfError) {
            console.log(
              `❌ PDF generation failed for ${payslip.name}:`,
              pdfError
            );
            failedEmails.push({
              name: payslip.name,
              reason: `PDF generation failed: ${pdfError.message}`,
            });
            continue;
          }

          // Prepare email options
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: payslip.email.trim(),
            subject: `PAYSLIP FOR ${payslip.name}`,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #0093DD; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; font-size: 24px;">St. John Majore Services Company Inc.</h1>
                  <p style="margin: 5px 0 0 0; font-size: 16px;">Electronic Payslip</p>
                </div>
                
                <div style="padding: 30px; border: 1px solid #ddd; background-color: #fff;">
                  <h2 style="color: #333; margin-top: 0;">Dear ${
                    payslip.name
                  },</h2>
                  
                  <p style="font-size: 16px; line-height: 1.6;">
                    Please find your detailed payslip attached as a PDF file. Please download and save it for your records.
                  </p>
                  
                  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #0093DD;">Payslip Summary</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; font-weight: bold; width: 40%;">Control Number:</td>
                        <td style="padding: 8px 0;">${formattedControlNumber}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Billing Summary:</td>
                        <td style="padding: 8px 0; border-top: 1px solid #ddd;">${formattedBillingSummary}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Payroll Period:</td>
                        <td style="padding: 8px 0; border-top: 1px solid #ddd;">${
                          payslip.cutoff_date || payslip.cutoffDate || "N/A"
                        }</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Employee Code:</td>
                        <td style="padding: 8px 0; border-top: 1px solid #ddd;">${
                          payslip.ecode || "N/A"
                        }</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Position:</td>
                        <td style="padding: 8px 0; border-top: 1px solid #ddd;">${
                          payslip.position || "N/A"
                        }</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-weight: bold; border-top: 1px solid #ddd;">Project Site:</td>
                        <td style="padding: 8px 0; border-top: 1px solid #ddd;">${
                          payslip.project || "N/A"
                        }</td>
                      </tr>
                      <tr style="background-color: #e8f5e8;">
                        <td style="padding: 12px 8px; font-weight: bold; font-size: 18px; border-top: 2px solid #0093DD;">Net Pay:</td>
                        <td style="padding: 12px 8px; font-weight: bold; font-size: 18px; color: #28a745; border-top: 2px solid #0093DD;">${
                          payslip.net_pay || payslip.netPay
                            ? Number(
                                payslip.net_pay || payslip.netPay
                              ).toLocaleString()
                            : "0.00"
                        }</td>
                      </tr>
                    </table>
                  </div>
                  
                  <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107;">
                    <p style="margin: 0; font-size: 14px;">
                      <strong>ⓘ Confidentiality Notice:</strong> This email and any attached documents are intended solely for the individual to whom they are addressed. If you are not the intended recipient, please notify us immediately and delete this message. Any unauthorized review, use, disclosure, or distribution is strictly prohibited.
                    </p>
                  </div>
                  
                  <p style="margin-top: 25px; font-size: 14px; color: #666;">
                    If you have any questions regarding your payslip, please contact the HR department.
                  </p>
                </div>
                
                <div style="background-color: #bbe394; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0; font-size: 14px;">
                    St. John Majore Services Company, Inc.<br>8 Patron Central Plaza, De Villa Street, Poblacion, San Juan, Batangas<br>Email: simajore@gmail.com | Office Hours: Monday–Saturday, 8:00 AM–5:00 PM
                  </p>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background-color: #f8d7da; border-radius: 6px; border-left: 4px solid #dc3545;">
                  <p style="margin: 0; font-size: 13px; color: #721c24;">
                    <strong>Important:</strong> This is an automated email—please do not reply. Kindly keep this payslip for your records and tax purposes.
                  </p>
                </div>
              </div>
            `,
            attachments: [
              {
                filename: `${payslip.name}_Payslip_${
                  payslip.cutoff_date || payslip.cutoffDate || "Current"
                }.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf",
              },
            ],
          };

          console.log(`📧 Email options prepared for ${payslip.email}:`);
          console.log(`   - From: ${mailOptions.from}`);
          console.log(`   - To: ${mailOptions.to}`);
          console.log(`   - Subject: ${mailOptions.subject}`);
          console.log(
            `   - Attachment: ${mailOptions.attachments[0].filename}`
          );
          console.log(`   - PDF Size: ${pdfBuffer.length} bytes`);

          // Check transporter configuration
          if (!transporter) {
            throw new Error("Email transporter is not configured");
          }

          console.log(`📤 Sending email to ${payslip.email}...`);
          const emailResult = await transporter.sendMail(mailOptions);
          console.log(`✅ Email sent successfully to ${payslip.email}`);
          console.log(`📧 Email result:`, {
            messageId: emailResult.messageId,
            accepted: emailResult.accepted,
            rejected: emailResult.rejected,
          });

          successfulEmails.push(payslip.email);

          // Save to PayslipHistory with proper field mapping
          console.log(`💾 Saving payslip history for ${payslip.name}...`);

          try {
            const historyRecord = await PayslipHistory.create({
              ecode: payslip.ecode,
              email: payslip.email,
              employeeId: payslip.employeeId,
              name: payslip.name,
              project: payslip.project || "N/A",
              position: payslip.position || "N/A",
              department: payslip.department,
              cutoffDate: payslip.cutoff_date || payslip.cutoffDate,
              allowance: +(payslip.allowance || 0),
              dailyrate: +(payslip.dailyrate || payslip.daily_rate || 0),
              basicPay: +(payslip.basicPay || payslip.basic_pay || 0),
              overtimePay: +(payslip.overtimePay || payslip.overtime_pay || 0),
              holidayPay: +(payslip.holidayPay || payslip.holiday_pay || 0),
              noOfDays: +(payslip.noOfDays || payslip.no_of_days || 0),
              totalOvertime: +(
                payslip.totalOvertime ||
                payslip.total_overtime ||
                0
              ),
              nightDifferential: +(
                payslip.nightDifferential ||
                payslip.night_differential ||
                0
              ),
              sss: +(payslip.sss || 0),
              sssEmployerShare: +(payslip.sssEmployerShare || 0),
              sssEC: +(payslip.sssEC || 0),
              sssTotalContribution: +(payslip.sssTotalContribution || 0),
              phic: +(payslip.phic || 0),
              hdmf: +(payslip.hdmf || 0),
              loan: +(payslip.loan || 0),
              totalTardiness: +(
                payslip.totalTardiness ||
                payslip.total_tardiness ||
                0
              ),
              totalHours: +(payslip.totalHours || payslip.total_hours || 0),
              otherDeductions: +(
                payslip.otherDeductions ||
                payslip.other_deductions ||
                0
              ),
              totalEarnings: +(
                payslip.totalEarnings ||
                payslip.total_earnings ||
                0
              ),
              adjustment: +(payslip.adjustment || 0),
              gross_pay: +(payslip.gross_pay || 0),
              totalDeductions: +(
                payslip.totalDeductions ||
                payslip.total_deductions ||
                0
              ),
              netPay: +(payslip.net_pay || payslip.netPay || 0),
              controlNumber: formattedControlNumber,
              billingSummary: formattedBillingSummary,
              batchId: payslip.batchId,
            });

            console.log(
              `✅ Payslip history saved with ID: ${historyRecord.id}`
            );
            payslipIdsToDelete.push(payslip.id);
          } catch (historyError) {
            console.log(
              `⚠️ Failed to save payslip history for ${payslip.name}:`,
              historyError
            );
            // Don't fail the email sending, just log the error
          }
        } catch (emailError) {
          console.log(`❌ Failed to send payslip to ${payslip.name}:`);
          console.log(`❌ Error details:`, emailError);
          console.log(`❌ Error stack:`, emailError.stack);

          let errorMessage = emailError.message;
          if (emailError.code) {
            errorMessage = `${emailError.code}: ${errorMessage}`;
          }

          failedEmails.push({ name: payslip.name, reason: errorMessage });
        }
      }
    }

    // Clean up sent payslips
    if (payslipIdsToDelete.length > 0) {
      console.log(`🗑 Deleting ${payslipIdsToDelete.length} sent payslips...`);
      try {
        const deletedCount = await Payslip.destroy({
          where: { id: payslipIdsToDelete },
        });
        console.log(`✅ Deleted ${deletedCount} sent payslips successfully`);
      } catch (deleteError) {
        console.log(`⚠️ Failed to delete some payslips:`, deleteError);
      }
    }

    // Optional attendance cleanup
    if (req.body.clearAttendance === true) {
      console.log("🧹 Clearing attendance data...");
      try {
        await AttendanceSummary.destroy({ where: {} });
        await Attendance.destroy({ where: {} });
        console.log("✅ Attendance data cleared successfully");
      } catch (cleanupError) {
        console.log("⚠️ Failed to clear attendance data:", cleanupError);
      }
    }

    // Final summary
    console.log("\n📊 FINAL SUMMARY:");
    console.log(`✅ Successful emails: ${successfulEmails.length}`);
    console.log(`❌ Failed emails: ${failedEmails.length}`);
    console.log(`🗑 Payslips deleted: ${payslipIdsToDelete.length}`);

    if (successfulEmails.length > 0) {
      console.log("✅ Successful email addresses:", successfulEmails);
    }

    if (failedEmails.length > 0) {
      console.log("❌ Failed emails details:", failedEmails);
    }

    const response = {
      success: true,
      message: `Successfully sent payslips. Successful emails: ${successfulEmails.length}, Failed emails: ${failedEmails.length}`,
      data: {
        successfulEmails,
        failedEmails,
        totalProcessed: payslips.length,
        payslipsDeleted: payslipIdsToDelete.length,
      },
    };

    console.log("📤 Sending response:", response);
    return res.status(200).json(response);
  } ;

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
  try {
    const { employeeId } = req.params;

    const payslip = await PayslipHistory.findOne({ 
      where: { ecode: employeeId } // ✅ use actual DB column
    });

    if (!payslip) {
      console.log(`Payslip not found for employee_id: ${employeeId}`);
      return res.status(404).json({ message: "Payslip not found" });
    }
    
    res.status(200).json(payslip);
  } catch (error) {
    console.error("Error in getPayslipByEmployeeId:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getAvailableBatches = async (req, res) => {
  try {
    const batches = await Payslip.findAll({
      attributes: ["batchId", "date"], // include date
      group: ["batchId"],
      order: [["batchId", "DESC"]],
      raw: true,
    });


    const batchDetails = await Promise.all(
      batches.map(async ({ batchId, date }) => {
        // Make sure 'date' is destructured from batches
        const payslips = await Payslip.findAll({
          where: { batchId },
          attributes: [
            "id",
            "employeeId",
            "name",
            "cutoffDate",
            "status",
            "netPay",
            "gross_pay",
            "requested_by",
            "shiftHours",
            "employmentRank",
            "regularDays",
            "sss",
            "hdmf",
            "phic",
            "ecode",
            "date",
            "payroll_type",
          ],
          order: [["name", "ASC"]],
          raw: true,
        });

        const statuses = payslips.map((p) => p.status);
        const uniqueStatuses = [...new Set(statuses)];
        const requested_name = payslips.map((p) => p.requested_by);
        const requestedBy = [...new Set(requested_name)];

        // Get the first cutoff date since they're all the same
        const cutoffDate = payslips.length > 0 ? payslips[0].cutoffDate : null;
        return {
          batchId,
          date, // Add this line - include the date field
          totalPayslips: payslips.length,
          uniqueStatuses,
          cutoffDate,
          payslips,
          requestedBy,
        };
      })
    );

    res.status(200).json(batchDetails);
  } catch (error) {
    console.error("Error fetching available batches:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch batch details" });
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

    return res.json({
      success: true,
      message: "Payroll released",
      data: payslips,
    });
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


export const getPayslipHistoryById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch payslip from the database
    const payslip = await PayslipHistory.findOne({ where: { employee_id: id } });

    if (!payslip) {
      console.log(`Payslip not found for employee_id: ${id}`);
      return res.status(404).json({ message: "Payslip History not found" });
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
    return res
      .status(400)
      .json({ success: false, message: "Project is required." });
  }

  try {
    const [results, metadata] = await sequelize.query(
      "UPDATE payslips SET status = 'released' WHERE status = 'pending' AND project = :project",
      {
        replacements: { project },
        type: QueryTypes.UPDATE,
      }
    );

    if (metadata > 0) {
      const payslips = await sequelize.query(
        "SELECT * FROM payslips WHERE status = 'released' AND project = :project",
        {
          replacements: { project },
          type: QueryTypes.SELECT,
        }
      );

      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/payslip/send-payslip`,
          { payslips }
        );
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
      return res.json({
        success: false,
        message: "No pending payslips found for this project.",
      });
    }
  } catch (error) {
    console.error("Error releasing project-specific payroll:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

export const getContributions = async (req, res) => {
  try {
    const { employeeId, startDate, endDate, year, month } = req.query;

    // Build WHERE conditions for filtering
    let whereConditions = [];
    let replacements = {};

    if (employeeId) {
      whereConditions.push("e.id = :employeeId");
      replacements.employeeId = employeeId;
    }

    // Fix date filtering - use 'date' column from PayslipHistory
    if (startDate && endDate) {
      whereConditions.push("ph.date BETWEEN :startDate AND :endDate");
      replacements.startDate = startDate;
      replacements.endDate = endDate;
    } else if (year) {
      whereConditions.push("YEAR(ph.date) = :year");
      replacements.year = year;

      if (month) {
        whereConditions.push("MONTH(ph.date) = :month");
        replacements.month = month;
      }
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // Fixed SQL query with correct column names
    const query = `
    SELECT
        e.id as employeeId,
        e.name,
        e.ecode as employeeCode,
        e.sss as employeeSSS,
        e.philhealth as employeePhilhealth,
        e.\`pag-ibig\` as employeePagibig,
        e.employmentstatus as employeeStatus,
        COUNT(ph.id) as payslipCount,
        COALESCE(SUM(CAST(ph.sss AS DECIMAL(10,2))), 0) as totalSSS,
        COALESCE(SUM(CAST(ph.phic AS DECIMAL(10,2))), 0) as totalPhilhealth,
        COALESCE(SUM(CAST(ph.hdmf AS DECIMAL(10,2))), 0) as totalPagibig,
        COALESCE(SUM(
            CAST(ph.sss AS DECIMAL(10,2)) +
            CAST(ph.phic AS DECIMAL(10,2)) +
            CAST(ph.hdmf AS DECIMAL(10,2))
        ), 0) as grandTotal,
        COUNT(CASE WHEN CAST(ph.sss AS DECIMAL(10,2)) > 0 THEN 1 END) as sssCount,
        COUNT(CASE WHEN CAST(ph.phic AS DECIMAL(10,2)) > 0 THEN 1 END) as philhealthCount,
        COUNT(CASE WHEN CAST(ph.hdmf AS DECIMAL(10,2)) > 0 THEN 1 END) as pagibigCount
    FROM Employees e
    LEFT JOIN paysliphistories ph ON e.id = ph.employee_id
    ${whereClause}
    GROUP BY e.id, e.name, e.ecode, e.sss, e.philhealth, e.\`pag-ibig\`, e.employmentstatus
    ORDER BY e.name
    `;

    const results = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    // Format the results
    const contributionsData = results.map((row) => ({
      employeeId: row.employeeId,
      employeeCode: row.employeeCode,
      name: row.name,
      status: row.employeeStatus,
      employeeSSS: row.employeeSSS,
      employeePhilhealth: row.employeePhilhealth,
      employeePagibig: row.employeePagibig,
      employerSSSshare: 100,
      employerPagibigShare: 100,
      contributions: {
        sss: {
          total: parseFloat(row.totalSSS || 0),
          count: parseInt(row.sssCount || 0),
        },
        philhealth: {
          total: parseFloat(row.totalPhilhealth || 0),
          count: parseInt(row.philhealthCount || 0),
        },
        pagibig: {
          total: parseFloat(row.totalPagibig || 0),
          count: parseInt(row.pagibigCount || 0),
        },
      },
      grandTotal: parseFloat(row.grandTotal || 0),
      payslipCount: parseInt(row.payslipCount || 0),
    }));

    // Calculate overall summary
    const overallSummary = contributionsData.reduce(
      (acc, employee) => {
        acc.totalEmployees++;
        acc.totalSSS += employee.contributions.sss.total;
        acc.totalPhilhealth += employee.contributions.philhealth.total;
        acc.totalPagibig += employee.contributions.pagibig.total;
        acc.grandTotal += employee.grandTotal;
        return acc;
      },
      {
        totalEmployees: 0,
        totalSSS: 0,
        totalPhilhealth: 0,
        totalPagibig: 0,
        grandTotal: 0,
      }
    );

    // Format summary numbers
    Object.keys(overallSummary).forEach((key) => {
      if (key !== "totalEmployees") {
        overallSummary[key] = parseFloat(overallSummary[key].toFixed(2));
      }
    });

    // Return success response
    res.status(200).json({
      success: true,
      message: "Contributions retrieved successfully",
      data: {
        summary: overallSummary,
        employees: contributionsData,
        filters: {
          employeeId: employeeId || null,
          startDate: startDate || null,
          endDate: endDate || null,
          year: year || null,
          month: month || null,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching contributions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Alternative version if you want to get contributions for a specific employee
export const getEmployeeContributions = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    // Build where condition for payslip history
    const payslipWhere = {};
    if (startDate && endDate) {
      payslipWhere.payPeriod = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    // Fetch specific employee with payslip history
    const employee = await Employee.findByPk(employeeId, {
      include: [
        {
          model: PayslipHistory,
          where: payslipWhere,
          required: false,
          attributes: [
            "id",
            "sss",
            "philhealth",
            "pagibig",
            "payPeriod",
            "createdAt",
          ],
        },
      ],
      attributes: [
        "id",
        "name",
        "sss",
        "philhealth",
        "pagibig",
        "employeeCode",
      ],
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const payslips = employee.PayslipHistories || [];

    // Calculate totals
    const totals = payslips.reduce(
      (acc, payslip) => {
        acc.totalSSS += parseFloat(payslip.sss || 0);
        acc.totalPhilhealth += parseFloat(payslip.philhealth || 0);
        acc.totalPagibig += parseFloat(payslip.pagibig || 0);
        return acc;
      },
      {
        totalSSS: 0,
        totalPhilhealth: 0,
        totalPagibig: 0,
      }
    );

    const grandTotal =
      totals.totalSSS + totals.totalPhilhealth + totals.totalPagibig;

    res.status(200).json({
      success: true,
      message: "Employee contributions retrieved successfully",
      data: {
        employeeId: employee.id,
        employeeCode: employee.employeeCode,
        name: employee.name,
        employeeSSS: employee.sss,
        employeePhilhealth: employee.philhealth,
        employeePagibig: employee.pagibig,
        contributions: {
          sss: {
            total: parseFloat(totals.totalSSS.toFixed(2)),
            count: payslips.filter((p) => p.sss && parseFloat(p.sss) > 0)
              .length,
          },
          philhealth: {
            total: parseFloat(totals.totalPhilhealth.toFixed(2)),
            count: payslips.filter(
              (p) => p.philhealth && parseFloat(p.philhealth) > 0
            ).length,
          },
          pagibig: {
            total: parseFloat(totals.totalPagibig.toFixed(2)),
            count: payslips.filter(
              (p) => p.pagibig && parseFloat(p.pagibig) > 0
            ).length,
          },
        },
        grandTotal: parseFloat(grandTotal.toFixed(2)),
        payslipCount: payslips.length,
        payslips: payslips.map((payslip) => ({
          id: payslip.id,
          sss: parseFloat(payslip.sss || 0),
          philhealth: parseFloat(payslip.philhealth || 0),
          pagibig: parseFloat(payslip.pagibig || 0),
          payPeriod: payslip.payPeriod,
          createdAt: payslip.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching employee contributions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

///////////////////////payroll generation/////////////////////////

// Function to calculate attendance metrics per employee

// Helper functions for holiday detection and calculation
const isHoliday = (date, holidays) => {
  const dateStr = new Date(date).toISOString().split("T")[0]; // Format: YYYY-MM-DD
  return holidays.find((holiday) => {
    const holidayDateStr = new Date(holiday.date).toISOString().split("T")[0];
    return holidayDateStr === dateStr;
  });
};

const calculateHolidayPay = (holidayType, dailyRate) => {
  switch (holidayType) {
    case "Regular":
      return dailyRate; // 200% for regular holidays
    case "Special":
      return dailyRate * 1.3; // 130% for special holidays
    case "Special Non-Working":
      return dailyRate * 1.3; // 130% for special non-working holidays
    default:
      return dailyRate;
  }
};

const determineCutoffPeriod = (cutoffDate) => {
  const date = new Date(cutoffDate);
  const dayOfMonth = date.getDate();
  const isSecondCutoff = dayOfMonth >= 16;

  console.log(`📅 Cut-off period analysis for ${cutoffDate}:`, {
    dayOfMonth,
    isSecondCutoff,
    cutoffType: isSecondCutoff
      ? "Second Cut-off (EC included)"
      : "First Cut-off (No EC)",
  });

  return isSecondCutoff;
};

export const generatePayroll = async (req, res) => {
  const {
    cutoffDate,
    payrollType,
    selectedEmployees = [],
    selectedSchedules = [],
    employees = [],
    attendanceData = [],
    holidaysData = [],
    individualOvertime = {},
    overtimeApprovals,
    maxOvertime = 0,
    requestedBy,
  } = req.body;

  console.log("🔍 Incoming request:", {
    cutoffDate,
    payrollType,
    selectedEmployees,
    selectedSchedules,
    employeesCount: employees.length,
    attendanceCount: attendanceData.length,
    holidaysCount: holidaysData.length,
    individualOvertime,
    overtimeApprovals,
    maxOvertime,
    requestedBy,
  });

  try {
    const now = new Date();
    const batchId = `SJM-PayrollBatch-${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${now
      .getDate()
      .toString()
      .padStart(2, "0")}-${now.getTime()}`;
    console.log(`🔗 Generated batchId: ${batchId}`);

    let employeesData,
      attendanceRecords,
      payrollInformations,
      holidays,
      attendanceSummary;

    if (employees.length > 0 && attendanceData.length > 0) {
      console.log("📦 Using data provided by frontend");
      employeesData = employees;
      attendanceRecords = attendanceData;
      holidays = holidaysData;
    } else {
      console.log("📦 Fetching data from database");
      employeesData = await Employee.findAll({
        where: { status: { [Op.ne]: "Inactive" } },
      }).catch(async (error) => {
        console.error("❌ Error fetching employees:", error);
        let allEmployees = await Employee.findAll();
        return allEmployees.filter((emp) => emp.status !== "Inactive");
      });

      attendanceRecords = await Attendance.findAll().catch((error) => {
        console.error("❌ Error fetching attendance records:", error);
        return [];
      });

      console.log(`✅ Fetched ${attendanceRecords.length} attendance records`);

      holidays = await Holidays.findAll().catch((error) => {
        console.error("❌ Error fetching holidays:", error);
        return [];
      });

      attendanceSummary = await AttendanceSummary.findAll().catch((error) => {
        console.error("❌ Error fetching attendance summary:", error);
        return [];
      });
    }

    employeesData = employeesData.filter(
      (employee) => employee.status !== "Inactive"
    );
    console.log(`✅ Processing ${employeesData.length} active employees`);

    payrollInformations = await PayrollInformation.findAll().catch((error) => {
      console.error("❌ Error fetching payroll information:", error);
      return [];
    });

    if (!employeesData || employeesData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No active employees found!",
      });
    }

    const generatedPayslips = [];
    const errors = [];

    for (let i = 0; i < employeesData.length; i++) {
      const employee = employeesData[i];

      try {
        console.log(
          `📝 Processing ${i + 1}/${employeesData.length}: ${employee.name} (${
            employee.ecode
          })`
        );

        const isRankAndFile =
          employee.employmentrank === "RANK-AND-FILE EMPLOYEE";
        const isOnCall = employee.employmentstatus === "ON-CALL";
        console.log(
          `👤 Employee ${employee.name} - Employment Rank: ${employee.employmentrank}, Is Rank-and-File: ${isRankAndFile}`
        );
        console.log(
          `👤 Employee ${employee.name} - Employment Status: ${employee.employmentstatus}, ON-CALL: ${isOnCall}`
        );

        const employeeAttendance = attendanceRecords.filter(
          (record) => record.ecode === employee.ecode
        );

        if (!employeeAttendance || employeeAttendance.length === 0) {
          console.log(
            `⏭️ Skipping ${employee.name} (${employee.ecode}) - No attendance data found`
          );
          continue;
        }

        const employeePayrollInfo =
          payrollInformations.find((info) => info.ecode === employee.ecode) ||
          {};
        const attendanceSummaryRecord = attendanceSummary
          ? attendanceSummary.find((info) => info.ecode === employee.ecode)
          : null;

        // Get employee's shift hours (default to 4.5 for day shift, but allow customization)
        const shiftHours = parseFloat(
          employee.shift_hours || employee.shiftHours || 4.5
        );
        console.log(`⏰ Employee ${employee.name} shift hours: ${shiftHours}`);

        // Calculate basic attendance metrics from attendance records
        const daysPresent = employeeAttendance.length;
        const totalLateMinutes = employeeAttendance.reduce((total, record) => {
          return total + (record.lateMinutes || 0);
        }, 0);

        // Update or create attendance summary record
        try {
            await AttendanceSummary.upsert(
              {
                ecode: employee.ecode,
                presentDays: parseFloat(daysPresent.toFixed(2)), // Preserve decimals
                totalDays: parseFloat(daysPresent.toFixed(2)),
                absentDays: 0.0,
                lateDays: employeeAttendance.filter(
                  (record) => (record.lateMinutes || 0) > 0
                ).length,
                totalLateMinutes: totalLateMinutes,
                attendanceRate: daysPresent > 0 ? 100.0 : 0.0,
              },
              {
                where: { ecode: employee.ecode },
              }
            );

          console.log(
            `📊 Attendance summary updated for ${employee.ecode} - Days Present: ${daysPresent}`
          );
        } catch (summaryError) {
          console.error(
            `❌ Failed to update attendance summary for ${employee.ecode}:`,
            summaryError
          );
        }

        // Use attendance summary data if available, with proper field names and NaN checking
        let finalDaysPresent = attendanceSummaryRecord
          ? Number(attendanceSummaryRecord.presentDays)
          : daysPresent;

        let finalTotalLateMinutes = attendanceSummaryRecord
          ? Number(attendanceSummaryRecord.totalLateMinutes)
          : totalLateMinutes;

        // CRITICAL FIX: Ensure no NaN values
        finalDaysPresent = isNaN(finalDaysPresent)
          ? daysPresent
          : finalDaysPresent;
        finalTotalLateMinutes = isNaN(finalTotalLateMinutes)
          ? totalLateMinutes
          : finalTotalLateMinutes;

        // Ensure we have valid numbers
        finalDaysPresent = Math.max(0.0, parseFloat(finalDaysPresent) || 0.0);
        finalTotalLateMinutes = Math.max(0, finalTotalLateMinutes || 0);

        const rates = {
          dailyRate: Number(employeePayrollInfo.daily_rate) || 500,
          hourlyRate:
            Number(employeePayrollInfo.hourly_rate) ||
            (Number(employeePayrollInfo.daily_rate) || 500) / shiftHours,
          otHourlyRate:
            ((Number(employeePayrollInfo.daily_rate) || 500) / shiftHours) *
            1.25, // 125% of regular hourly rate
          tardinessRate:
            (Number(employeePayrollInfo.daily_rate) || 500) / 8 / 60, // per minute rate
        };

        console.log(`💰 Calculated rates for ${employee.name}:`, {
          dailyRate: rates.dailyRate,
          hourlyRate: rates.hourlyRate.toFixed(2),
          otHourlyRate: rates.otHourlyRate.toFixed(2),
          tardinessRate: rates.tardinessRate.toFixed(4),
          shiftHours: shiftHours,
        });

        // Safer salary package calculation with NaN protection
        const salaryPackage =
          Number(employee.salaryPackage) ||
          Number(employee.salary_package) ||
          0;

        // DEBUG: Add debugging for attendance data structure
        console.log(`🔍 DEBUG for ${employee.name} (${employee.ecode}):`);
        console.log(
          `   📊 employeeAttendance.length: ${employeeAttendance.length}`
        );
        console.log(`   📊 finalDaysPresent: ${finalDaysPresent}`);
        console.log(
          `   📋 Sample attendance records:`,
          employeeAttendance.slice(0, 3).map((record) => ({
            date: record.date,
            ecode: record.ecode,
            present: record.present || "undefined",
            status: record.status || "undefined",
          }))
        );

        // Initialize counters
        let regularHolidayDays = 0;
        let specialHolidayDays = 0;
        let specialNonWorkingHolidayDays = 0;
        let regularDaysWorked = 0.0;

        let specialHolidayPay = 0;
        let regularHolidayPay = 0;

        console.log(
          `   🎯 Starting counters - regularDaysWorked: ${regularDaysWorked}`
        );

        // Categorize attendance days based on actual attendance records only
          employeeAttendance.forEach((record) => {
            const isPresent =
              record.present === true ||
              record.present === 1 ||
              record.present === "1" ||
              record.status === "present" ||
              record.status === "Present";

            if (!isPresent) {
              console.log(
                `   ⏭️ Skipping ${record.date} for ${employee.name} - Employee was absent`
              );
              return;
            }

            // Get the fractional day value (1.0 for full day, 0.5 for half day, etc.)
            const dayValue = parseFloat(record.dayValue || record.day_value || 1.0);

            const holiday = isHoliday(record.date, holidays);

            if (holiday) {
              console.log(
                `    Holiday found (Present): ${record.date} - ${holiday.type} - Day Value: ${dayValue}`
              );
              switch (holiday.type) {
                case "Regular":
                  regularHolidayDays += dayValue; // Use fractional value
                  regularHolidayPay += calculateHolidayPay("Regular", rates.dailyRate) * dayValue;
                  break;
                case "Special":
                  specialHolidayDays += dayValue;
                  specialHolidayPay += calculateHolidayPay("Special", rates.dailyRate) * dayValue;
                  break;
                case "Special Non-Working":
                  specialNonWorkingHolidayDays += dayValue;
                  specialHolidayPay += calculateHolidayPay("Special Non-Working", rates.dailyRate) * dayValue;
                  break;
              }
            } else {
              regularDaysWorked += dayValue; // Use fractional value
              console.log(
                `   📅 Regular day (Present): ${record.date} - Day Value: ${dayValue} - Total regular days now: ${regularDaysWorked}`
              );
            }
          });

        // DEBUG: Final counts
        console.log(`    FINAL COUNTS for ${employee.name}:`);
        console.log(`      regularDaysWorked: ${regularDaysWorked}`);
        console.log(`      regularHolidayDays: ${regularHolidayDays}`);
        console.log(`      specialHolidayDays: ${specialHolidayDays}`);
        console.log(
          `      specialNonWorkingHolidayDays: ${specialNonWorkingHolidayDays}`
        );
        console.log(
          `      Total holiday days: ${
            regularHolidayDays +
            specialHolidayDays +
            specialNonWorkingHolidayDays
          }`
        );
        console.log(
          `      Sum should equal employeeAttendance.length: ${
            regularDaysWorked +
            regularHolidayDays +
            specialHolidayDays +
            specialNonWorkingHolidayDays
          } = ${employeeAttendance.length}`
        );

        // Total holiday days and pay
        const totalHolidayDays =
          regularHolidayDays +
          specialHolidayDays +
          specialNonWorkingHolidayDays;
        const totalHolidayPay = specialHolidayPay + regularHolidayPay;
        const totalSpecialHolidayPay = specialHolidayPay;
        const actualDaysPresent = regularDaysWorked + totalHolidayDays;

        const basicPay = finalDaysPresent * rates.dailyRate; // This will now work with decimals

        console.log(`💰 Basic Pay Calculation for ${employee.name}:`);
        console.log(`   📊 finalDaysPresent: ${finalDaysPresent}`);
        console.log(`   💵 dailyRate: ${rates.dailyRate}`);
        console.log(
          `   🧮 basicPay: ${finalDaysPresent} × ${rates.dailyRate} = ${basicPay}`
        );

        // Verify the calculation
        console.log(`📊 Days breakdown for ${employee.name}:`, {
          totalAttendanceDays: employeeAttendance.length,
          regularDaysWorked: regularDaysWorked,
          totalHolidayDays: totalHolidayDays,
          finalDaysPresent: finalDaysPresent,
          shouldEqual: regularDaysWorked + totalHolidayDays,
          regularHolidayDays: regularHolidayDays,
          specialHolidayDays: specialHolidayDays,
          specialNonWorkingHolidayDays: specialNonWorkingHolidayDays,
        });

        // Verify the math
        const calculatedTotal = parseFloat((regularDaysWorked + totalHolidayDays).toFixed(2));
        const expectedTotal = employeeAttendance.reduce((sum, record) => {
          return sum + parseFloat(record.dayValue || record.day_value || 1.0);
        }, 0);

        if (Math.abs(calculatedTotal - expectedTotal) > 0.01) { // Allow small floating point differences
          console.warn(`⚠️ Days calculation mismatch for ${employee.name}:`, {
            regularDaysWorked: regularDaysWorked.toFixed(2),
            totalHolidayDays: totalHolidayDays.toFixed(2),
            calculatedTotal: calculatedTotal.toFixed(2),
            expectedTotal: expectedTotal.toFixed(2),
            attendanceRecords: employeeAttendance.length,
          });
        }

        // RANK-AND-FILE LOGIC: Skip allowance for rank-and-file employees
        let allowance = 0;
        if (!isRankAndFile && salaryPackage > 0 && finalDaysPresent > 0) {
          const allowancePerDay = (salaryPackage - rates.dailyRate * 26) / 26;
          allowance = allowancePerDay * finalDaysPresent;
          // Ensure allowance is not NaN
          allowance = isNaN(allowance) ? 0 : Math.max(0, allowance);
        }

        // Add debugging with NaN protection
        console.log("Salary package debug:", {
          ecode: employee.ecode,
          name: employee.name,
          isRankAndFile: isRankAndFile,
          salaryPackage: employee.salaryPackage,
          salary_package: employee.salary_package,
          parsedSalaryPackage: salaryPackage,
          dailyRate: rates.dailyRate,
          finalDaysPresent: finalDaysPresent,
          calculatedAllowance: allowance,
          finalTotalLateMinutes: finalTotalLateMinutes,
          regularDaysWorked: regularDaysWorked,
          totalHolidayDays: totalHolidayDays,
          regularHolidayDays: regularHolidayDays,
        });

        // UPDATED: Proper overtime calculation using overtimeApprovals
        let totalRegularOvertime = 0;
        let totalHolidayOvertime = 0;
        let specialHolidayOvertime = 0;
        let regularHolidayOvertime = 0;

        // Find approved overtime for this employee
        const employeeOvertimeApproval = overtimeApprovals?.find(
          (approval) => approval.ecode === employee.ecode && approval.isApproved
        );

        if (employeeOvertimeApproval) {
          const approvedOvertimeHours =
            Number(employeeOvertimeApproval.approvedOvertimeHours) || 0;

          console.log(
            `⏰ Processing overtime for ${employee.name} (${employee.ecode}):`,
            {
              approvedOvertimeHours,
              isApproved: employeeOvertimeApproval.isApproved,
            }
          );

          // Categorize overtime hours based on when they were worked
          // For now, we'll assume all overtime is regular overtime
          // You can enhance this logic to distribute overtime across different day types
          totalRegularOvertime = approvedOvertimeHours;
        }

        // Calculate overtime pay
        const regularOvertimePay = totalRegularOvertime * rates.otHourlyRate;

        // Holiday overtime rates are typically higher
        const specialHolidayOTRate = rates.otHourlyRate * 1.3; // 130% of regular OT rate
        const regularHolidayOTRate = rates.otHourlyRate * 1.6; // 160% of regular OT rate

        const specialHolidayOTPay =
          specialHolidayOvertime * specialHolidayOTRate;
        const regularHolidayOTPay =
          regularHolidayOvertime * regularHolidayOTRate;

        const totalOvertimePay =
          regularOvertimePay + specialHolidayOTPay + regularHolidayOTPay;

        console.log(`⏰ Overtime calculation for ${employee.name}:`, {
          totalRegularOvertime: totalRegularOvertime.toFixed(2),
          specialHolidayOvertime: specialHolidayOvertime.toFixed(2),
          regularHolidayOvertime: regularHolidayOvertime.toFixed(2),
          regularOvertimePay: regularOvertimePay.toFixed(2),
          specialHolidayOTPay: specialHolidayOTPay.toFixed(2),
          regularHolidayOTPay: regularHolidayOTPay.toFixed(2),
          totalOvertimePay: totalOvertimePay.toFixed(2),
        });

        const nightDifferentialPay = 0;

        // Calculate gross pay with proper basic pay, holiday pay, and overtime pay
        const grossPay =
          basicPay + totalHolidayPay + allowance + totalOvertimePay;

        // Ensure gross pay is valid number
        const safeGrossPay = isNaN(grossPay) ? basicPay : grossPay;

        // RANK-AND-FILE LOGIC: Apply different deduction rules
        // Replace the existing deductions object with this updated version:

        const deductions = {
          sss: !isOnCall
            ? calculateSSSWithCutoff(safeGrossPay, new Date(cutoffDate))
                .employeeContribution 
            : 0,
          
          // FIXED: PhilHealth calculation - 2.5% of basic pay
          phic: !isOnCall
            ? basicPay * 0.025  // 2.5% of basic pay
            : 0,
            
          hdmf: !isOnCall
            ? Number(employeePayrollInfo.pagibig_contribution) || 50
            : 0,
          loan: Number(employeePayrollInfo.loan) || 0,
          otherDeductions: !isOnCall
            ? Number(employeePayrollInfo.otherDeductions) || 0
            : 0,
          taxDeduction: !isOnCall
            ? Number(employeePayrollInfo.tax_deduction) || 0
            : 0,
          tardiness: finalTotalLateMinutes * rates.tardinessRate,
        };

// Add PhilHealth calculation logging
console.log(`💳 PhilHealth calculation for ${employee.name}:`, {
  basicPay: basicPay,
  phicRate: '2.5%',
  phicAmount: (basicPay * 0.025).toFixed(2),
  isOnCall: isOnCall
});




        console.log(
          `💳 Deductions for ${employee.name} (Is on call: ${isOnCall}):`,
          {
            sss: deductions.sss,
            phic: deductions.phic,
            hdmf: deductions.hdmf,
            loan: deductions.loan,
            otherDeductions: deductions.otherDeductions,
            taxDeduction: deductions.taxDeduction,
            tardiness: deductions.tardiness.toFixed(2),
          }
        );

        // Ensure all deductions are valid numbers
        Object.keys(deductions).forEach((key) => {
          if (isNaN(deductions[key])) {
            deductions[key] = 0;
          }
        });

        const adjustment = Number(employeePayrollInfo.adjustment) || 0;
        const safeAdjustment = isNaN(adjustment) ? 0 : adjustment;

        const totalEarnings = safeGrossPay + safeAdjustment;
        const totalDeductions =
          deductions.sss +
          deductions.phic +
          deductions.hdmf +
          deductions.loan +
          deductions.otherDeductions +
          deductions.taxDeduction +
          deductions.tardiness;
        const netPay = grossPay - totalDeductions;

        // Calculate total hours using decimal shift hours
        const totalRegularHours = parseFloat(
          (regularDaysWorked * shiftHours).toFixed(2)
        );
        const totalHolidayHours = parseFloat(
          (totalHolidayDays * shiftHours).toFixed(2)
        );
        const specialHolidayHours = parseFloat(
          (specialHolidayDays * shiftHours).toFixed(2)
        );
        const regularHolidayHours = parseFloat(
          (regularHolidayDays * shiftHours).toFixed(2)
        );
        const totalHours = parseFloat(
          (
            finalDaysPresent * shiftHours +
            totalRegularOvertime +
            totalHolidayOvertime
          ).toFixed(2)
        );

        console.log(`⏰ Hours breakdown for ${employee.name}:`, {
          shiftHours: shiftHours,
          totalRegularHours: totalRegularHours,
          totalHolidayHours: totalHolidayHours,
          specialHolidayHours: specialHolidayHours,
          regularHolidayHours: regularHolidayHours,
          overtimeHours: (totalRegularOvertime + totalHolidayOvertime).toFixed(
            2
          ),
          totalHours: totalHours,
        });

        let sssBreakdown = {
          employeeContribution: 0,
          employerContribution: 0,
          ecContribution: 0,
          totalContribution: 0,
        };
        if (!isOnCall) {
          sssBreakdown = calculateSSSWithCutoff(
            safeGrossPay,
            new Date(cutoffDate)
          );
          console.log(`🏛️ SSS Breakdown for ${employee.name}:`, {
            employeeContribution: sssBreakdown.employeeContribution,
            employerContribution: sssBreakdown.employerContribution,
            ecContribution: sssBreakdown.ecContribution,
            totalContribution: sssBreakdown.totalContribution,
            isSecondCutoff: new Date(cutoffDate).getDate() >= 16,
          });
        }

        // CRITICAL: Ensure all values are valid numbers before database insertion
        const payslipData = {
          ecode: employee.ecode,
          email: employee.email_address || employee.email || "",
          employeeId: employee.id,
          name: employee.name,
          project: employee.project || "N/A",
          position: employee.positiontitle || employee.position || "N/A",
          department: employee.department || "N/A",
          schedule: employee.schedule || "N/A",
          cutoffDate,
          payrollType,
          dailyrate: parseFloat(rates.dailyRate.toFixed(2)),
          basicPay: parseFloat(basicPay.toFixed(2)),
          noOfDays: parseFloat(finalDaysPresent.toFixed(2)) || 0,

          // Holiday fields
          holidayDays: parseFloat(totalHolidayDays.toFixed(2)),
          regularDays: parseFloat(regularDaysWorked.toFixed(2)),
          specialHolidayDays: parseFloat(specialHolidayDays.toFixed(2)),
          regularHolidayDays: parseFloat(regularHolidayDays.toFixed(2)),
          specialNonWorkingHolidayDays: parseFloat(specialNonWorkingHolidayDays.toFixed(2)),

          // UPDATED: Overtime fields with proper calculation
          overtimePay: parseFloat(totalOvertimePay.toFixed(2)),
          totalOvertime: parseFloat(
            (totalRegularOvertime + totalHolidayOvertime).toFixed(2)
          ),
          regularOvertime: parseFloat(totalRegularOvertime.toFixed(2)),
          holidayOvertime: parseFloat(totalHolidayOvertime.toFixed(2)),

          // Updated hours fields to use decimal shift hours
          totalRegularHours: parseFloat((regularDaysWorked * shiftHours).toFixed(2)),
          totalHolidayHours: parseFloat((totalHolidayDays * shiftHours).toFixed(2)),
          specialHolidayHours: parseFloat((specialHolidayDays * shiftHours).toFixed(2)),
          regularHolidayHours: parseFloat((regularHolidayDays * shiftHours).toFixed(2)),

          // Holiday pay fields
          holidayPay: parseFloat(totalHolidayPay.toFixed(2)),
          specialHolidayPay: parseFloat(specialHolidayPay.toFixed(2)),
          regularHolidayPay: parseFloat(regularHolidayPay.toFixed(2)),
          specialHolidayOTPay: parseFloat(specialHolidayOTPay.toFixed(2)),
          regularHolidayOTPay: parseFloat(regularHolidayOTPay.toFixed(2)),

          // Night shift
          nightDifferential: parseFloat(nightDifferentialPay.toFixed(2)),
          nightShiftHours: parseFloat("0.00"),

          // Allowances (0 for rank-and-file)
          allowance: parseFloat(allowance.toFixed(2)),

          // Government contributions (0 for rank-and-file)
          sss: parseFloat(sssBreakdown.employeeContribution.toFixed(2)),
          sssEmployerShare: parseFloat(
            sssBreakdown.employerContribution.toFixed(2)
          ),
          sssEC: parseFloat(sssBreakdown.ecContribution.toFixed(2)),
          sssTotalContribution: parseFloat(sssBreakdown.totalContribution),

          phic: parseFloat(deductions.phic.toFixed(2)),
          hdmf: parseFloat(deductions.hdmf.toFixed(2)),

          // Loans - separate SSS and Pag-IBIG loans
          loan: parseFloat(deductions.loan.toFixed(2)),
          sssLoan: parseFloat(
            (Number(employeePayrollInfo.sss_loan) || 0).toFixed(2)
          ),
          pagibigLoan: parseFloat(
            (Number(employeePayrollInfo.pagibig_loan) || 0).toFixed(2)
          ),

          // Other deductions - updated tardiness calculation
          totalTardiness: parseFloat(deductions.tardiness.toFixed(2)),
          totalHours: totalHours, // Now includes overtime hours
          otherDeductions: parseFloat(deductions.otherDeductions.toFixed(2)),
          taxDeduction: parseFloat(deductions.taxDeduction.toFixed(2)),

          // Totals
          totalEarnings: parseFloat(totalEarnings.toFixed(2)),
          totalDeductions: parseFloat(totalDeductions.toFixed(2)),
          adjustment: parseFloat(safeAdjustment.toFixed(2)),
          gross_pay: parseFloat(safeGrossPay.toFixed(2)),
          netPay: parseFloat(netPay.toFixed(2)),

          // System fields
          requestedBy: requestedBy,
          status: "pending",
          batchId,

          // Add shift hours and employment rank to payslip data for reference
          shiftHours: parseFloat(shiftHours.toFixed(2)),
          employmentRank: employee.employmentrank || "N/A",
          isRankAndFile: isRankAndFile,
        };

        console.log("ito yung na save sa data base",payslipData);

        // Final validation: Check for any remaining NaN values
        const nanFields = [];
        Object.keys(payslipData).forEach((key) => {
          if (typeof payslipData[key] === "number" && isNaN(payslipData[key])) {
            nanFields.push(key);
            payslipData[key] = 0; // Set to 0 as fallback
          }
        });

        if (nanFields.length > 0) {
          console.warn(
            `⚠️ NaN values found and corrected for ${employee.name}:`,
            nanFields
          );
        }

        // Add logging for holiday information
        console.log(`🎉 Holiday breakdown for ${employee.name}:`, {
          totalHolidayDays,
          regularHolidayDays,
          specialHolidayDays,
          specialNonWorkingHolidayDays,
          regularDaysWorked,
          totalHolidayPay: totalHolidayPay.toFixed(2),
          regularHolidayPay: regularHolidayPay.toFixed(2),
          specialHolidayPay: specialHolidayPay.toFixed(2),
        });

        console.log(
          `💰 Payslip calculated for ${employee.name} (Rank-and-File: ${isRankAndFile}):`,
          {
            basicPay: payslipData.basicPay,
            holidayPay: payslipData.holidayPay,
            overtimePay: payslipData.overtimePay,
            allowance: payslipData.allowance,
            totalOvertimeHours: payslipData.totalOvertime,
            daysPresent: payslipData.noOfDays,
            holidayDays: payslipData.holidayDays,
            regularDays: payslipData.regularDays,
            netPay: payslipData.netPay,
            grossPay: payslipData.gross_pay,
            shiftHours: payslipData.shiftHours,
            totalHours: payslipData.totalHours,
            tardinessDeduction: payslipData.totalTardiness,
            totalDeductions: payslipData.totalDeductions,
            // ADD THESE NEW LINES:
            sssEmployee: payslipData.sss,
            sssEmployer: payslipData.sssEmployerShare,
            sssEC: payslipData.sssEC,
            isSecondCutoff: new Date(cutoffDate).getDate() >= 16,
          }
        );

        const newPayslip = await Payslip.create(payslipData);
        generatedPayslips.push(newPayslip);
      } catch (employeeError) {
        console.error(
          `❌ Error processing employee ${employee.name}:`,
          employeeError
        );
        errors.push({
          employee: employee.name,
          ecode: employee.ecode,
          error: employeeError.message,
        });
      }
    }

    // Clean up attendance data after all employees are processed
    try {
      await AttendanceSummary.destroy({ where: {}, truncate: true });
      await Attendance.destroy({ where: {}, truncate: true });
      console.log("🧹 Cleaned up attendance data and summary tables");
    } catch (error) {
      console.log("❌ Error cleaning up attendance data:", error);
    }

    // Email notification logic
    const approvers = await User.findAll({
      where: { role: "approver", isBlocked: false },
    });
    const successfulEmails = [];

    for (const approver of approvers) {
      const scheduleInfo =
        selectedSchedules.length > 0
          ? ` (using schedules: ${selectedSchedules.join(
              ", "
            )} for tardiness calculation)`
          : "";

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: approver.email,
        subject: `Payroll Generated: ${cutoffDate} (Batch: ${batchId})`,
        html: `
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Payroll Request</title>
      </head>

      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9;">
        <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px;">
          <img src="https://stjohnmajore.com/images/HEADER.png" alt="Header" style="width: 100%; height: auto;" />

          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h3>Hello ${approver.name},</h3>
            <p>Payroll has been successfully generated for the cutoff date <strong>${cutoffDate}</strong>${scheduleInfo}.</p>
            <p>Batch ID: <strong>${batchId}</strong></p>
            <p>Total Payslips Generated: <strong>${generatedPayslips.length}</strong></p>
            <p>Please review the payslips in the payroll system.</p>
            <br />
            <p>Best regards,<br />SJM Payroll System</p>
          </div>
            <p style="color: #333; font-size: 15px;">Please login to <a href="https://payroll.stjohnmajore.com/">https://payroll.stjohnmajore.com/</a> to review and take appropriate action.</p>
            
            <p style="color: #333; font-size: 15px;">Best regards,<br />SJM Payroll System</p>
          <div style="font-size: 12px; color: #777; margin-top: 20px; text-align: center;">
            <strong>This is an automated email—please do not reply.</strong><br />
            Keep this message for your records.
          </div>
          <img src="https://stjohnmajore.com/images/FOOTER.png" alt="Footer" style="width: 100%; height: auto; margin-top: 20px;" />
        </div>
      `,
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

      try {
        await transporter.sendMail(mailOptions);
        successfulEmails.push(approver.email);
        console.log(`✅ Email sent to ${approver.email}`);
      } catch (emailError) {
        console.error(
          `❌ Failed to send email to ${approver.email}:`,
          emailError
        );
      }
    }

    res.status(201).json({
      success: true,
      message: `Payroll generated for ${generatedPayslips.length} employees!`,
      batchId,
      payslips: generatedPayslips,
      notified: successfulEmails,
      schedulesUsedForTardiness: selectedSchedules,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("❌ Payroll Generation Critical Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during payroll generation.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};
