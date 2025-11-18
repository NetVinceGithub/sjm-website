import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Payslip from "../models/Payslip.js";
import Employee from "../models/Employee.js";
import PayslipHistory from "../models/PayslipHistory.js";
import { Op } from "sequelize"; // Ensure you have Sequelize operators
import Attendance from "../models/Attendance.js";
import { PayrollInformation } from "../models/Employee.js";
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
import { calculateSSSWithCutoff, isSecondCutoffPeriod } from "../utils/sssCalculator.js";
import { calculatePagIBIGContribution, calculatePagIBIGSemiMonthly } from "../utils/pagibigCalculator.js";
import { calculatePhilHealthContribution, calculatePhilHealthSemiMonthly } from "../utils/philhealthCalculator.js";


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
            "noOfDays"
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
    const { batchId } = req.query;

    // Get all payslips with email and name information
    const payslips = await Payslip.findAll({
      where: batchId ? { batchId } : {},
      attributes: ['requestedByName', 'requestedBy']
    });

    // Extract unique emails (filter out null/empty emails)
    const uniqueEmails = [...new Set(
      payslips
        .map(p => p.requestedBy) // requestedBy is the email
        .filter(requestedBy => requestedBy && requestedBy.trim() !== '')
    )];

    console.log(`Found ${uniqueEmails.length} unique email(s) to notify`);

    // Delete the payslips
    const deletedCount = batchId 
      ? await Payslip.destroy({ where: { batchId } })
      : await Payslip.destroy({ where: {}, truncate: true });

    console.log(`Deleted ${deletedCount} payslip(s)`);

    // Send emails to all affected users
    let successfulEmails = [];
    let failedEmails = [];

    for (const email of uniqueEmails) {
      try {
        // Find the name associated with this email from the payslips
        const payslip = payslips.find(p => p.requestedBy === email); // Fix: use requestedBy instead of email
        const userName = payslip?.requestedByName || 'User'; // Fix: use requestedByName instead of name

        let mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: `Payslip Deletion Notification`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Payslip Deletion Notice</title>
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #f9f9f9;">
              <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px;">
                <img src="https://stjohnmajore.com/images/HEADER.png" alt="Header" style="width: 100%; height: auto;" />
                
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #333;">Payslip Deletion Notification</h2>
                  <p style="color: #333; font-size: 15px;">
                    Dear ${userName},
                  </p>
                  <p style="color: #333; font-size: 15px;">
                    This is to inform you that your payslip request${batchId ? ` for batch <strong>${batchId}</strong>` : 's'} 
                    has been rejected.
                  </p>
                  <p style="color: #333; font-size: 15px;">
                    If you have any questions or concerns, please contact your approver.
                  </p>
                  <p style="color: #333; font-size: 15px;">
                    You can access the payroll system at: 
                    <a href="https://payroll.stjohnmajore.com/">https://payroll.stjohnmajore.com/</a>
                  </p>
                </div>

                <p style="color: #333; font-size: 15px;">Best regards,<br />SJM Payroll System</p>
                <div style="font-size: 12px; color: #777; margin-top: 20px; text-align: center;">
                  <strong>This is an automated email—please do not reply.</strong><br />
                  Keep this message for your records.
                </div>
                <img src="https://stjohnmajore.com/images/FOOTER.png" alt="Footer" style="width: 100%; height: auto; margin-top: 20px;" />
              </div>
            </body>
            </html>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✓ Notification sent to ${email}`);
        successfulEmails.push(email);
      } catch (emailError) {
        console.error(`✗ Failed to send email to ${email}:`, emailError.message);
        failedEmails.push(email);
      }
    }

    res.status(200).json({
      message: "Payslips deleted successfully.",
      deletedCount,
      emailsSent: successfulEmails.length,
      emailsFailed: failedEmails.length,
      successfulEmails,
      failedEmails
    });

  } catch (error) {
    console.error("Error deleting all payslips:", error);
    res.status(500).json({ 
      message: "Internal server error.",
      error: error.message 
    });
  }
};

export const deletePayslip = async (req, res) => {

  const {employeeId} = req.params;

  console.log("Incoming id to cancel", employeeId);
  try {
    const response = await Payslip.findOne({where: {employeeId}});

    console.log("Payslip that will be deleted", employeeId);

    await response.destroy();

    console.log("Payslip deleted");

    return res.status(200).json({success:true, message:"Success in deleting:", employeeId});
  }catch (error) {
    return res.status(500).json({success:false, message: error.message});
  }
}

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
    const response = await PayslipHistory.findAll({});
    
    return res.status(200).json({success:true, data: response});
  }catch (error) {
    return res.status(500).json({success:false, message:error.message});
  }
}



//the api response is the summation of the contributions, it cannot be used for filters
// export const getContributions = async (req, res) => {
//   try {
//     // 1️⃣ Get Sum Contribution Per Employee
//     const historyData = await PayslipHistory.findAll({
//       attributes: [
//         "ecode",
//         "name",
//         [fn("SUM", col("sss")), "total_sss"],
//         [fn("SUM", col("phic")), "total_phic"],
//         [fn("SUM", col("hdmf")), "total_hdmf"],
//       ],
//       group: ["ecode", "name"],
//       raw: true,
//     });

//     // 2️⃣ Extract Unique Ecode List
//     const ecodes = historyData.map((item) => item.ecode);

//     // 3️⃣ Get Employee Static Government IDs
//     const employeeData = await Employee.findAll({
//       attributes: ["ecode", "sss", "phil_health", "pag_ibig"],
//       where: { ecode: ecodes },
//       raw: true,
//     });

//     // 4️⃣ Merge Result Without Associations
//     const finalResult = historyData.map((item) => {
//       const emp = employeeData.find((e) => e.ecode === item.ecode) || {};
//       return {
//         ...item,
//         employee_sss: emp.sss || null,
//         employee_phil_health: emp.phil_health || null,
//         employee_pag_ibig: emp.pag_ibig || null,
//       };
//     });

//     return res.status(200).json({ success: true, data: finalResult });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

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

// Add this to your payslipController.js
export const approveBatch = async (req, res) => {
  try {
    const { batchId } = req.body;
    const approverEmail = req.user?.email; // Get approver's email from authenticated user
    const approverName = req.user?.name || 'Admin'; // Get approver's name

    // Validation: Check if batchId is provided
    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: "Batch ID is required",
        error: "Missing batchId parameter"
      });
    }

    // Check if batch exists and get payslips
    const payslips = await Payslip.findAll({
      where: { 
        batchId: batchId,
        status: 'pending' // Only update pending payslips
      },
      attributes: ['id', 'ecode', 'name', 'status', 'batchId', 'netPay', 'requestedBy', 'requestedByName']
    });

    if (payslips.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No pending payslips found for this batch",
        error: "Batch not found or already processed"
      });
    }

    // Extract unique requesters before updating
    const uniqueRequesters = [...new Set(
      payslips
        .map(p => p.requestedBy)
        .filter(email => email && email.trim() !== '')
    )];

    // Update all payslips in the batch to approved status
    const [updatedCount] = await Payslip.update(
      { 
        status: 'approved'
      },
      {
        where: { 
          batchId: batchId,
          status: 'pending'
        }
      }
    );

    if (updatedCount === 0) {
      return res.status(400).json({
        success: false,
        message: "No payslips were updated",
        error: "All payslips in batch may already be processed"
      });
    }

    // Get updated payslips for response
    const updatedPayslips = await Payslip.findAll({
      where: { 
        batchId: batchId,
        status: 'approved'
      },
      attributes: ['id', 'ecode', 'name', 'status', 'batchId', 'netPay']
    });

    // Send email notifications to all requesters
    let successfulEmails = [];
    let failedEmails = [];

    for (const email of uniqueRequesters) {
      try {
        // Find the name associated with this email
        const payslip = payslips.find(p => p.requestedBy === email);
        const requesterName = payslip?.requestedByName || 'User';

        let mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: `Payroll Request Approved - Batch ${batchId}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Payroll Approved</title>
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #f9f9f9;">
              <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px;">
                <img src="https://stjohnmajore.com/images/HEADER.png" alt="Header" style="width: 100%; height: auto;" />
                
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #28a745;">Payroll Request Approved ✓</h2>
                  <p style="color: #333; font-size: 15px;">
                    Dear ${requesterName},
                  </p>
                  <p style="color: #333; font-size: 15px;">
                    Your generated payroll request for batch <strong>${batchId}</strong> has been reviewed and approved.
                  </p>
                  <p style="color: #333; font-size: 15px;">
                    For more information, you can directly contact the approver: <strong>${approverName}</strong>
                    ${approverEmail ? ` (${approverEmail})` : ''}
                  </p>
                  <p style="color: #333; font-size: 15px;">
                    You can view the approved payroll at: 
                    <a href="https://payroll.stjohnmajore.com/">https://payroll.stjohnmajore.com/</a>
                  </p>
                </div>

                <p style="color: #333; font-size: 15px;">Best regards,<br />SJM Payroll System</p>
                <div style="font-size: 12px; color: #777; margin-top: 20px; text-align: center;">
                  <strong>This is an automated email—please do not reply.</strong><br />
                  Keep this message for your records.
                </div>
                <img src="https://stjohnmajore.com/images/FOOTER.png" alt="Footer" style="width: 100%; height: auto; margin-top: 20px;" />
              </div>
            </body>
            </html>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✓ Approval notification sent to ${email}`);
        successfulEmails.push(email);
      } catch (emailError) {
        console.error(`✗ Failed to send approval email to ${email}:`, emailError.message);
        failedEmails.push(email);
      }
    }

    res.status(200).json({
      success: true,
      message: `Batch ${batchId} approved successfully`,
      data: {
        batchId: batchId,
        updatedCount: updatedCount,
        payslips: updatedPayslips,
        totalNetPay: updatedPayslips.reduce((sum, payslip) => 
          sum + parseFloat(payslip.netPay || 0), 0
        ).toFixed(2)
      },
      notifications: {
        emailsSent: successfulEmails.length,
        emailsFailed: failedEmails.length,
        successfulEmails,
        failedEmails
      }
    });

  } catch (error) {
    console.error("Error approving batch:", error);
    
    res.status(500).json({
      success: false,
      message: "Internal server error while approving batch",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

// Alternative: Approve multiple batches at once
export const approveMultipleBatches = async (req, res) => {
  try {
    const { batchIds } = req.body;

    // Validation: Check if batchIds array is provided
    if (!batchIds || !Array.isArray(batchIds) || batchIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Batch IDs array is required",
        error: "Missing or invalid batchIds parameter"
      });
    }

    // Update all payslips in the specified batches
    const [updatedCount] = await Payslip.update(
      { 
        status: 'approved'
      },
      {
        where: { 
          batchId: batchIds,
          status: 'pending'
        }
      }
    );

    if (updatedCount === 0) {
      return res.status(400).json({
        success: false,
        message: "No payslips were updated",
        error: "All payslips in specified batches may already be processed"
      });
    }

    // Get summary of updated batches
    const batchSummary = await sequelize.query(`
      SELECT 
        batchId,
        COUNT(*) as payslipCount,
        SUM(netPay) as totalNetPay
      FROM payslips 
      WHERE batchId IN (:batchIds) AND status = 'approved'
      GROUP BY batchId
    `, {
      replacements: { batchIds },
      type: QueryTypes.SELECT
    });

    res.status(200).json({
      success: true,
      message: `${batchIds.length} batch(es) approved successfully`,
      data: {
        approvedBatches: batchIds,
        updatedCount: updatedCount,
        batchSummary: batchSummary
      }
    });

  } catch (error) {
    console.error("Error approving multiple batches:", error);
    
    res.status(500).json({
      success: false,
      message: "Internal server error while approving batches",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};


///////////////////////payroll generation/////////////////////////
//di pa tpaoss
const calculateRegularHolidayPay = ( dailyRate, regularHolidayHours) => {
  return ((dailyRate/ 8) *2 )*(regularHolidayHours); // 200% total = 100% base (in basicPay) + 100% premium
};
const calculateSpecialHolidayPay = ( dailyRate, specialHolidayHours) => {
  return ((dailyRate/ 8) *0.3 )*(specialHolidayHours); // 200% total = 100% base (in basicPay) + 100% premium
};
const calculateSpecialNonWorkingHolidayPay = (dailyRate, specialNonWorkingHours) => {
  return ((dailyRate/ 8) *0.3 )*(specialHolidayHours); // 200% total = 100% base (in basicPay) + 100% premium
};

export const generatePayroll = async (req, res) => {
  const {
    cutoffDate,
    payrollType,
    selectedEmployees = [],
    selectedSchedules = [],
    individualOvertime = {},
    overtimeApprovals,
    maxOvertime = 0,
    requestedBy,
    requestedByName,
  } = req.body;

  console.log("Incoming request to generate payroll", {
    cutoffDate,
    payrollType,
    selectedEmployees,
    selectedSchedules,
    maxOvertime,
    requestedBy,
    requestedByName
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

    // Fetch data from database
    console.log("📦 Fetching data from database");
    
    const employeesData = await Employee.findAll({
      where: { status: { [Op.ne]: "Inactive" } },
    }).catch(async (error) => {
      console.error("❌ Error fetching employees:", error);
      const allEmployees = await Employee.findAll();
      return allEmployees.filter((emp) => emp.status !== "Inactive");
    });

    const attendanceSummaries = await AttendanceSummary.findAll().catch((error) => {
      console.error("❌ Error fetching attendance summaries:", error);
      return [];
    });

    const payrollInformations = await PayrollInformation.findAll().catch((error) => {
      console.error("❌ Error fetching payroll information:", error);
      return [];
    });

    console.log(`✅ Processing ${employeesData.length} active employees`);
    console.log(`✅ Found ${attendanceSummaries.length} attendance summaries`);

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
          `📝 Processing ${i + 1}/${employeesData.length}: ${employee.name} (${employee.ecode})`
        );

        const isRankAndFile = employee.employmentrank === "RANK-AND-FILE EMPLOYEE";
        const isOnCall = employee.employmentstatus === "ON-CALL";
        
        console.log(`👤 Employee ${employee.name} - Rank: ${employee.employmentrank}, Is Rank-and-File: ${isRankAndFile}, ON-CALL: ${isOnCall}`);

        // Get attendance summary for this employee
        const attendanceSummary = attendanceSummaries.find(
          (summary) => summary.ecode === employee.ecode
        );

        if (!attendanceSummary) {
          console.log(
            `⏭️ Skipping ${employee.name} (${employee.ecode}) - No attendance summary found`
          );
          continue;
        }

        const employeePayrollInfo = payrollInformations.find(
          (info) => info.ecode === employee.ecode
        ) || {};

        // Get employee's shift hours (default to 4.5 for day shift)
        const shiftHours = parseFloat(employee.shift_hours || employee.shiftHours || 4.5);
        console.log(`⏰ Employee ${employee.name} shift hours: ${shiftHours}`);

        // Extract attendance data from summary
        const finalDaysPresent = parseFloat(attendanceSummary.presentDays) || 0;
        const finalTotalLateMinutes = parseInt(attendanceSummary.totalLateMinutes) || 0;
        const hourlyRate = 0;

        // Get hours directly from attendance summary (NO division by shiftHours needed)
        const totalRegularHours = parseFloat(attendanceSummary.totalRegularHours) || 0;
        const regularHolidayHours = parseFloat(attendanceSummary.regularHolidayHours) || 0;
        const specialHolidayHours = parseFloat(attendanceSummary.specialHolidayHours) || 0;
        const specialNonWorkingHours = parseFloat(attendanceSummary.specialNonWorkingHours) || 0;
        const totalHolidayHours = regularHolidayHours + specialHolidayHours + specialNonWorkingHours;
        const totalHoursWorked = totalRegularHours + totalHolidayHours;

        console.log(`📊 Raw Attendance Hours from DB for ${employee.name}:`, {
          totalRegularHours: totalRegularHours.toFixed(2),
          regularHolidayHours: regularHolidayHours.toFixed(2),
          specialHolidayHours: specialHolidayHours.toFixed(2),
          specialNonWorkingHours: specialNonWorkingHours.toFixed(2),
          totalHolidayHours: totalHolidayHours.toFixed(2),
          totalHoursWorked: totalHoursWorked.toFixed(2),
          totalLateMinutes: finalTotalLateMinutes,
        });

        // Calculate days worked from hours
        const regularDaysWorked = totalRegularHours / shiftHours;
        const regularHolidayDays = regularHolidayHours / shiftHours;
        const specialHolidayDays = specialHolidayHours / shiftHours;
        const specialNonWorkingHolidayDays = specialNonWorkingHours / shiftHours;
        const totalHolidayDays = regularHolidayDays + specialHolidayDays + specialNonWorkingHolidayDays;
        

        console.log(`📊 Days Calculation for ${employee.name} (Hours ÷ ${shiftHours}):`, {
          regularDaysWorked: regularDaysWorked.toFixed(2),
          regularHolidayDays: regularHolidayDays.toFixed(2),
          specialHolidayDays: specialHolidayDays.toFixed(2),
          specialNonWorkingHolidayDays: specialNonWorkingHolidayDays.toFixed(2),
          totalHolidayDays: totalHolidayDays.toFixed(2),
        });

        // Calculate rates
        // ===== CALCULATE RATES (ALWAYS compute hourly from daily) =====
        const dailyRate = Number(employeePayrollInfo.daily_rate) || 520;
        // Calculate holiday pay premiums using the days calculated from hours
        console.log(`🎉 Starting Holiday Pay Calculation for ${employee.name}...`);

        //holidays
        const regularHolidayPay = calculateRegularHolidayPay(dailyRate,regularHolidayHours)
        const specialHolidayPayAmount = calculateSpecialHolidayPay(dailyRate, specialHolidayHours)
        const specialNonWorkingHolidayPayAmount = calculateSpecialNonWorkingHolidayPay(dailyRate, specialNonWorkingHours);

        console.log("Holiday Computation");
        console.log("Regular holiday Pay", regularHolidayPay);
        console.log("Special Holiday Pay", specialHolidayPayAmount);
        console.log("Special Non Working Holiday Pay", specialNonWorkingHolidayPayAmount);

        // Calculate basic pay (includes 100% pay for ALL days present, including holidays)
        const basicPay = finalDaysPresent * dailyRate;

        // Calculate allowance (skip for rank-and-file)
        const salaryPackage = Number(employee.salaryPackage) || Number(employee.salary_package) || 0;
        let allowance = 0;
        
        if (!isRankAndFile && salaryPackage > 0 && finalDaysPresent > 0) {
          const allowancePerDay = (salaryPackage - dailyRate * 26) / 26;
          allowance = allowancePerDay * finalDaysPresent;
          allowance = isNaN(allowance) ? 0 : Math.max(0, allowance);
        }

        console.log(`💵 Allowance Calculation for ${employee.name}:`, {
          isRankAndFile,
          salaryPackage,
          allowance: allowance.toFixed(2),
        });

        // Calculate overtime
        let totalRegularOvertime = 0;
        let totalHolidayOvertime = 0;

        const employeeOvertimeApproval = overtimeApprovals?.find(
          (approval) => approval.ecode === employee.ecode && approval.isApproved
        );

        if (employeeOvertimeApproval) {
          totalRegularOvertime = Number(employeeOvertimeApproval.approvedOvertimeHours) || 0;
          console.log(`⏰ Approved overtime for ${employee.name}: ${totalRegularOvertime} hours`);
        }

        const regularOvertimePay = totalRegularOvertime;
        const specialHolidayOTPay = 0; // No holiday overtime in this version
        const regularHolidayOTPay = 0;
        const totalOvertimePay = regularOvertimePay + specialHolidayOTPay + regularHolidayOTPay;

        console.log(`⏰ Overtime Pay Calculation for ${employee.name}:`, {
          totalRegularOvertime: totalRegularOvertime.toFixed(2),
          otHourlyRate: rates.otHourlyRate.toFixed(2),
          regularOvertimePay: regularOvertimePay.toFixed(2),
          totalOvertimePay: totalOvertimePay.toFixed(2),
        });

        // Calculate gross pay
        const grossPay = basicPay + totalHolidayPay + allowance + totalOvertimePay;
        const safeGrossPay = isNaN(grossPay) ? basicPay : grossPay;

        console.log(`💰 Gross Pay Calculation for ${employee.name}:`, {
          basicPay: basicPay.toFixed(2),
          totalHolidayPay: totalHolidayPay.toFixed(2),
          allowance: allowance.toFixed(2),
          totalOvertimePay: totalOvertimePay.toFixed(2),
          grossPay: safeGrossPay.toFixed(2),
        });

        // Calculate tardiness FIRST (before government contributions)
        const tardinessDeduction = finalTotalLateMinutes * rates.tardinessRate;

        // Calculate ADJUSTED gross pay for SSS basis
        const adjustedGrossPayForSSS = Math.max(0, safeGrossPay - tardinessDeduction);

        console.log(`⏱️ Tardiness Calculation for ${employee.name}:`, {
          totalLateMinutes: finalTotalLateMinutes,
          tardinessRate: rates.tardinessRate.toFixed(4),
          tardinessDeduction: tardinessDeduction.toFixed(2),
          grossPayBeforeTardiness: safeGrossPay.toFixed(2),
          adjustedGrossPayForSSS: adjustedGrossPayForSSS.toFixed(2),
        });

        // Calculate government contributions based on ADJUSTED gross pay
        const projectedMonthlyBasicSalary = dailyRate * 26;
        const isFirstCutoff = new Date(cutoffDate).getDate() <= 15;
        const isSecondCutoff = isSecondCutoffPeriod(new Date(cutoffDate));

        // Initialize contribution objects
        let sssContribution = { 
          employeeContribution: 0, 
          employerContribution: 0, 
          ecContribution: 0, 
          totalContribution: 0 
        };
        let pagibigContribution = { 
          employeeContribution: 0, 
          employerContribution: 0, 
          totalContribution: 0 
        };
        let philhealthContribution = { 
          employeeContribution: 0, 
          employerContribution: 0, 
          totalContribution: 0 
        };

        if (!isOnCall) {
          // Use adjustedGrossPayForSSS instead of safeGrossPay
          sssContribution = calculateSSSWithCutoff(adjustedGrossPayForSSS, new Date(cutoffDate));
          pagibigContribution = calculatePagIBIGSemiMonthly(projectedMonthlyBasicSalary, isFirstCutoff);
          philhealthContribution = calculatePhilHealthSemiMonthly(
            projectedMonthlyBasicSalary,
            "full_second",
            isFirstCutoff
          );
        }

        console.log(`💳 Government Contributions for ${employee.name}:`, {
          isOnCall,
          isFirstCutoff,
          isSecondCutoff,
          projectedMonthlyBasicSalary: projectedMonthlyBasicSalary.toFixed(2),
          grossPay: safeGrossPay.toFixed(2),
          tardinessDeduction: tardinessDeduction.toFixed(2),
          adjustedGrossPayForSSS: adjustedGrossPayForSSS.toFixed(2),
          sss: sssContribution.employeeContribution,
          phic: philhealthContribution.employeeContribution,
          hdmf: pagibigContribution.employeeContribution,
        });

        // Calculate deductions using the pre-calculated tardiness
        const deductions = {
          sss: parseFloat(sssContribution.employeeContribution.toFixed(2)),
          phic: parseFloat(philhealthContribution.employeeContribution.toFixed(2)/2),
          hdmf: parseFloat(pagibigContribution.employeeContribution.toFixed(2)),
          loan: Number(employeePayrollInfo.loan) || 0,
          otherDeductions: !isOnCall ? Number(employeePayrollInfo.otherDeductions) || 0 : 0,
          taxDeduction: !isOnCall ? Number(employeePayrollInfo.tax_deduction) || 0 : 0,
          tardiness: parseFloat(tardinessDeduction.toFixed(2)),
          // ADD THESE THREE NEW DEDUCTIONS
          underTime: Number(employeePayrollInfo.underTime) || 0,
          cashAdvance: Number(employeePayrollInfo.cashAdvance) || 0,
        };

        // Ensure all deductions are valid numbers
        Object.keys(deductions).forEach((key) => {
          if (isNaN(deductions[key])) {
            deductions[key] = 0;
          }
        });

        console.log(`💸 Deductions for ${employee.name}:`, {
          sss: deductions.sss.toFixed(2),
          phic: deductions.phic.toFixed(2),
          hdmf: deductions.hdmf.toFixed(2),
          loan: deductions.loan.toFixed(2),
          otherDeductions: deductions.otherDeductions.toFixed(2),
          taxDeduction: deductions.taxDeduction.toFixed(2),
          tardiness: deductions.tardiness.toFixed(2),
          underTime: deductions.underTime.toFixed(2),
          cashAdvance: deductions.cashAdvance.toFixed(2),
        });

        const adjustment = Number(employeePayrollInfo.adjustment) || 0;
        const safeAdjustment = isNaN(adjustment) ? 0 : adjustment;

        const totalEarnings = safeGrossPay + safeAdjustment;
        const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);
        const netPay = safeGrossPay - totalDeductions + safeAdjustment;


        console.log(`💰 Final Calculation for ${employee.name}:`, {
          grossPay: safeGrossPay.toFixed(2),
          adjustment: safeAdjustment.toFixed(2),
          underTime: deductions.underTime.toFixed(2),
          cashAdvance: deductions.cashAdvance.toFixed(2),
          totalEarnings: totalEarnings.toFixed(2),
          totalDeductions: totalDeductions.toFixed(2),
          netPay: netPay.toFixed(2),
        });

        // Calculate total hours
        const totalRegularHoursForPayslip = parseFloat((regularDaysWorked * shiftHours).toFixed(2));
        const totalHolidayHoursForPayslip = parseFloat(totalHolidayHours.toFixed(2));
        const specialHolidayHoursForPayslip = parseFloat(specialHolidayHours.toFixed(2));
        const regularHolidayHoursForPayslip = parseFloat(regularHolidayHours.toFixed(2));
        const totalHours = parseFloat(
          (finalDaysPresent * shiftHours + totalRegularOvertime + totalHolidayOvertime).toFixed(2)
        );

        // Create payslip data
        const payslipData = {
          ecode: employee.ecode,
          email: employee.email_address || employee.email || "",
          employeeId: employee.id,
          name: employee.name,
          project: employee.project || "N/A",
          position: employee.positiontitle || employee.position || employee.position_title || "N/A",
          department: employee.department || "N/A",
          schedule: employee.schedule || "N/A",
          cutoffDate,
          payrollType,
          dailyrate: parseFloat(dailyRate.toFixed(2)),
          basicPay: parseFloat(basicPay.toFixed(2)),
          noOfDays: parseFloat(finalDaysPresent.toFixed(2)),

          // Holiday fields
          holidayDays: parseFloat(totalHolidayDays.toFixed(2)),
          regularDays: parseFloat(regularDaysWorked.toFixed(2)),
          specialHolidayDays: parseFloat(specialHolidayDays.toFixed(2)),
          regularHolidayDays: parseFloat(regularHolidayDays.toFixed(2)),
          specialNonWorkingHolidayDays: parseFloat(specialNonWorkingHolidayDays.toFixed(2)),

          // Overtime fields
          overtimePay: parseFloat(totalOvertimePay.toFixed(2)),
          totalOvertime: parseFloat((totalRegularOvertime + totalHolidayOvertime).toFixed(2)),
          regularOvertime: parseFloat(totalRegularOvertime.toFixed(2)),
          holidayOvertime: parseFloat(totalHolidayOvertime.toFixed(2)),

          // Hours fields
          totalRegularHours: totalRegularHoursForPayslip,
          totalHolidayHours: totalHolidayHoursForPayslip,
          specialHolidayHours: specialHolidayHoursForPayslip,
          regularHolidayHours: regularHolidayHoursForPayslip,

          // Holiday pay fields
          holidayPay: parseFloat(totalHolidayPay.toFixed(2)),
          specialHolidayPay: parseFloat(specialHolidayPay.toFixed(2)),
          regularHolidayPay: parseFloat(regularHolidayPay.toFixed(2)),
          specialHolidayOTPay: parseFloat(specialHolidayOTPay.toFixed(2)),
          regularHolidayOTPay: parseFloat(regularHolidayOTPay.toFixed(2)),

          // Night shift
          nightDifferential: 0,
          nightShiftHours: 0,

          // Allowances
          allowance: parseFloat(allowance.toFixed(2)),

          // Government contributions
          sss: parseFloat(sssContribution.employeeContribution.toFixed(2)),
          sssEmployerShare: parseFloat(sssContribution.employerContribution.toFixed(2)),
          sssEC: parseFloat(sssContribution.ecContribution.toFixed(2)),
          sssTotalContribution: parseFloat(sssContribution.totalContribution.toFixed(2)),
          
          phic: parseFloat(deductions.phic.toFixed(2)),
          phicEmployerShare: parseFloat(philhealthContribution.employerContribution.toFixed(2)),
          phicTotalContribution: parseFloat(philhealthContribution.totalContribution.toFixed(2)),
          phicIsMinimum: philhealthContribution.isMinimum || false,
          
          hdmf: parseFloat(pagibigContribution.employeeContribution.toFixed(2)),
          hdmfEmployerShare: parseFloat(pagibigContribution.employerContribution.toFixed(2)),
          hdmfTotalContribution: parseFloat(pagibigContribution.totalContribution.toFixed(2)),
          hdmfIsCapped: pagibigContribution.isCapped || false,

          // Loans
          loan: parseFloat(deductions.loan.toFixed(2)),
          sssLoan: parseFloat((Number(employeePayrollInfo.sss_loan) || 0).toFixed(2)),
          pagibigLoan: parseFloat((Number(employeePayrollInfo.pagibig_loan) || 0).toFixed(2)),

          // Other deductions
          totalTardiness: parseFloat(deductions.tardiness.toFixed(2)),
          totalHours: totalHours,
          otherDeductions: parseFloat(deductions.otherDeductions.toFixed(2)),
          taxDeduction: parseFloat(deductions.taxDeduction.toFixed(2)),
          underTime: parseFloat(deductions.underTime.toFixed(2)),
          cashAdvance: parseFloat(deductions.cashAdvance.toFixed(2)),

          // Totals
          totalEarnings: parseFloat(totalEarnings.toFixed(2)),
          totalDeductions: parseFloat(totalDeductions.toFixed(2)),
          adjustment: parseFloat(safeAdjustment.toFixed(2)),
          gross_pay: parseFloat(safeGrossPay.toFixed(2)),
          netPay: parseFloat(netPay.toFixed(2)),

          // System fields
          requestedBy,
          requestedByName,
          status: "pending",
          batchId,
          shiftHours: parseFloat(shiftHours.toFixed(2)),
          employmentRank: employee.employmentrank || "N/A",
          isRankAndFile,
        };

        console.log(`✅ Payslip created for ${employee.name}:`, {
          basicPay: payslipData.basicPay,
          holidayPay: payslipData.holidayPay,
          overtimePay: payslipData.overtimePay,
          grossPay: payslipData.gross_pay,
          totalDeductions: payslipData.totalDeductions,
          netPay: payslipData.netPay,
        });

        const newPayslip = await Payslip.create(payslipData);
        generatedPayslips.push(newPayslip);

        try {
          await PayrollInformation.update(
            {
              adjustment: 0,
              underTime: 0,
              cashAdvance: 0,
              sss_loan: 0,
              pagibig_loan: 0

            },
            {
              where: { ecode: employee.ecode }
            }
          );
          console.log(`✅ Reset adjustment, underTime, and cashAdvance for ${employee.name}`);
        } catch (resetError) {
          console.error(`⚠️ Failed to reset fields for ${employee.name}:`, resetError.message);
          // Don't fail the entire process if reset fails
        }

      } catch (employeeError) {
        console.error(`❌ Error processing employee ${employee.name}:`, employeeError);
        errors.push({
          employee: employee.name,
          ecode: employee.ecode,
          error: employeeError.message,
        });
      }
    }

    // Send email notifications
    const approvers = await User.findAll({
      where: { role: "approver", isBlocked: false },
    });
    const successfulEmails = [];

    for (const approver of approvers) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: approver.email,
        subject: `Payroll Generated: ${cutoffDate} (Batch: ${batchId})`,
        html: `
          <body style="font-family: Arial, sans-serif; background-color: #f9f9f9;">
            <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px;">
              <img src="https://stjohnmajore.com/images/FOOTER.png" alt="Footer" style="width: 100%; height: auto; margin-top: 20px;" />
            </div>
          </body>
        `,
      };

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: { rejectUnauthorized: false },
      });

      try {
        await transporter.sendMail(mailOptions);
        successfulEmails.push(approver.email);
        console.log(`✅ Email sent to ${approver.email}`);
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
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error("❌ Payroll Generation Critical Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during payroll generation.",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};