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
dotenv.config();

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

      let mailOptions = {
        from: process.env.EMAIL_USER,
        to: payslip.email,
        subject: `Payslip for ${payslip.name}`,
        html: `
          <div style="background-color: white; align-items: center;">
                      <div style="background-color: #0093DD; width: 200px; height: 100px; border: 2px solid #0093DD; border-bottom-left-radius: 30px; border-bottom-right-radius: 30px; margin-left: 45px;">
                        <h1 style="color: white; font-weight: bold; font-size: 25px; text-align: center; margin-top: 10px;">e-PAYROLL SLIP</h1>
                        <img src="" alt="Company Logo" style="margin-top: -65px; margin-left: 265px; width: 140px; height: auto;" />  
                      </div>
          
                      <h2 style="font-weight: bold; margin-top: 30px; margin-left: 40px; font-size: 18px;">Payslip No.:</h2>
                      <table style="border-collapse: collapse;">
                        <thead>
                          <tr style="border: 3px solid #AA396F;">
                            <th style="border: 3px solid #AA396F; text-align: center;">ECODE</th>
                            <th style="width: 200px; border: 3px solid #AA396F; text-align: center;">EMPLOYEE NAME</th>
                            <th style="width: 200px; border: 3px solid #AA396F; text-align: center;">PROJECT SITE</th>
                            <th style="width: 200px; border: 3px solid #AA396F; text-align: center;">RATE</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style="height: 45px;">
                            <td style="border: 3px solid #AA396F; text-align: center;">${
                              payslip.ecode || "N/A"
                            }</td>
                            <td style="border: 3px solid #AA396F; width: 290px; text-align: center;">${
                              payslip.name || "N/A"
                            }</td>
                            <td style="border: 3px solid #AA396F; text-align: center;">${
                              payslip.project || "N/A"
                            }</td>
                            <td style="border: 3px solid #AA396F; text-align: center;">${
                              payslip.dailyrate || "0.00"
                            }</td>
                          </tr>
                          <tr>
                            <th style="border: 3px solid #AA396F; text-align: center;" colspan="2">
                              POSITION
                            </th>
                            <th style="border: 3px solid #AA396F; text-align: center;" colspan="2">
                              CUT-OFF DATE
                            </th>
                          </tr>
                          <tr>
                            <td style="height: 45px; border: 3px solid #AA396F; text-align: center;" colspan="2">
                              ${payslip.position || "N/A"}
                            </td>
                            <td style="height: 45px; border: 3px solid #AA396F; text-align: center;" colspan="2">
                              ${payslip.cutoff_date || "N/A"}
                            </td>
                          </tr>
                          <tr>
                            <th style="width: 200px; border: 3px solid #AA396F; text-align: center;">EARNINGS</th>
                            <th style="width: 200px; border: 3px solid #AA396F; text-align: center;">FIGURES</th>
                            <th style="width: 200px; border: 3px solid #AA396F; text-align: center;">DEDUCTIONS</th>
                            <th style="width: 200px; border: 3px solid #AA396F; text-align: center;">FIGURES</th>
                          </tr>
                          <tr>
                            <td style="border-bottom: 0; border: 3px solid #AA396F; border-bottom-width: 0; text-align: left;">Basic Pay</td>
                            <td style="border: 3px solid #AA396F; border-bottom-width: 0;">${
                              payslip.dailyrate || "0.00"
                            }</td>
                            <td style="border: 3px solid #AA396F; border-bottom-width: 0; font-weight: bold; width: 280px; font-size: 9px; background-color: #AA396F; border-radius: 10px; padding: 1px; text-align: center;">GOVERNMENT CONTRIBUTIONS</td>
                            <td style="border: 3px solid #AA396F; border-bottom-width: 0;"></td>
                          </tr>
                          <tr>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0; text-align: left;">No. of Days</td>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0;">${
                              payslip.no_of_days || "0"
                            }</td>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0; text-align: left;">SSS</td>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0;">${
                              payslip.sss || "0.00"
                            }</td>
                          </tr>
                          <tr>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0; text-align: left;">Overtime Pay</td>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0;">${
                              payslip.overtime_pay || "0.00"
                            }</td>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0; text-align: left;">PHIC</td>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0;">${
                              payslip.phic || "0.00"
                            }</td>
                          </tr>
                          <tr>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0; text-align: left;">Overtime Hours</td>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0;">${
                              payslip.overtime_hours
                            }</td>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0; text-align: left;">HDMF</td>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0;">${
                              payslip.hdmf
                            }</td>
                          </tr>
                          <tr>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0; text-align: left;">Holiday Pay</td>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0;">${
                              payslip.holiday_pay
                            }</td>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0; text-align: left;">Cash Advance/Loan</td>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0;">${
                              payslip.loan
                            }</td>
                          </tr>
                          <tr>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0; text-align: left;">Night Differenctial</td>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0;">${
                              payslip.night_differential
                            }</td>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0; text-align: left;">Tardiness</td>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0;">${
                              payslip.tardiness
                            }</td>
                          </tr>
                          <tr>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0; text-align: left;">Allowance</td>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0;">${
                              payslip.allowance
                            }</td>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0; text-align: left;">Other Deductions</td>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0;">${
                              payslip.other_deductions
                            }</td>
                          </tr>
                          <tr>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0; text-align: left;"></td>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0;"></td>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0; text-align: left;">Total Deductions</td>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0;">
                              ${payslip.total_deductions || "0.00"}
                            </td>
                          </tr>
                          <tr>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0; text-align: left;"></td>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0;"></td>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0; text-align: left;">Adjustments</td>
                            <td style="border: 3px solid #AA396F; border-top: 0; border-bottom: 0;">${
                              payslip.adjustment
                            }</td>
                          </tr>
                          <tr>
                            <th style="border: 3px solid #AA396F; text-align: center;" colspan="2">
                              NET PAY
                            </th>
                            <th style="border: 3px solid #AA396F; text-align: center;"  colspan="2">
                              AMOUNT
                            </th>
                          </tr>
                          <tr style="border: 3px solid #AA396F;">
                            <td style="border: 3px solid #AA396F; text-align: left" colspan="2">
                              NETPAY: ₱${payslip.net_pay || "0.00"}
                            </td>
                            <td style="border: 3px solid #AA396F;" colspan="2"></td>
                          </tr>
                        </tbody>
                      </table>
                        <div style="min-height: 100px; width: auto; background-color: #bbe394; padding: 10px;">
                          <div style="display: block;">
                            <h6 style="font-weight: bold; font-size: 14px; text-align: center; margin-bottom: 2px;">
                              Mia Mary Sora
                            </h6>
                            <p style="margin-top: 0; font-size: 12px; text-align: center;">
                              Human Resource Head
                            </p>
                          </div>
                          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; font-size: 12px; margin-top: -4px; max-width: 100%;">
                            <div>
                            <p>
                              <strong>Company:</strong> St. John Majore Services Company
                              Inc.
                            </p>
                            <p>
                              <strong>Email:</strong> sjmajore@gmail.com
                            </p>
                            <p>
                              <strong>Web:</strong> N/A
                            </p>
                            </div>
                                
                            <div>
                            <p>
                              <strong>Address:</strong>
                            </p>
                            <p>
                              8 Patron Central Plaza De Villa St., Poblacion <br />
                              San Juan, Batangas
                            </p>
                          </div>
                          </div>
                        </div>
                      </div>
                    </div>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`📩 Payslip sent to ${payslip.email}`);
        successfulEmails.push(payslip.email);

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
export const getPayslipByEcode = async (req, res) => {
  const { ecode } = req.params;
  try {
    const payslip = await PayslipHistory.findOne({ ecode });
    if (!payslip) {
      return res
        .status(404)
        .json({ success: false, message: "Payslip not found" });
    }
    res.status(200).json({ success: true, payslip });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const generatePayroll = async (req, res) => {
  console.log("🔍 Incoming request body:", req.body);
  const { cutoffDate } = req.body;

  if (!cutoffDate) {
    return res
      .status(400)
      .json({ success: false, message: "cutoffDate is required" });
  }

  try {
    console.log("🚀 Starting Payroll Generation for cutoffDate:", cutoffDate);

    // Fetch data
    const employees = await Employee.findAll();
    const attendanceSummaries = await AttendanceSummary.findAll();
    const payrollInformations = await PayrollInformation.findAll();

    console.log(
      "📊 Attendance Summaries:",
      JSON.stringify(attendanceSummaries, null, 2)
    );
    console.log(
      "📊 Payroll Informations:",
      JSON.stringify(payrollInformations, null, 2)
    );

    if (!employees || employees.length === 0) {
      console.log("⚠️ No Employees Found!");
      return res
        .status(400)
        .json({ success: false, message: "No employees found!" });
    }

    let generatedPayslips = [];

    for (const employee of employees) {
      // Skip inactive employees
      if (employee.status === "inactive") {
        console.log(
          `⏭️ Skipping inactive employee: ${employee.name} (${employee.ecode})`
        );
        continue;
      }

      console.log(
        `Processing Payroll for: ${employee.name} (${employee.ecode})`
      );

      const employeeAttendance =
        attendanceSummaries.find(
          (summary) => summary.ecode === employee.ecode
        ) || {};
      const employeePayrollInfo =
        payrollInformations.find((info) => info.ecode === employee.ecode) || {};

      const totalHours = Number(employeeAttendance?.totalHours) || 0;
      const totalOvertime = Number(employeeAttendance?.totalOvertime) || 0;

      const hourlyRate = employeePayrollInfo.hourly_rate || 0;
      const overtimeRate = employeePayrollInfo.overtime_pay || 0;
      const holidayHours = Number(employeeAttendance?.holiday) || 0;
      const dailyRate = employeePayrollInfo.daily_rate || 0;
      const allowance = employeePayrollInfo.allowance || 0;
      const sss = employeePayrollInfo.sss_contribution || 0;
      const phic = employeePayrollInfo.philhealth_contribution || 0;
      const hdmf = employeePayrollInfo.pagibig_contribution || 0;
      const tardiness =
        (Number(employeeAttendance?.totalTardiness) || 0) * 1.08;
      const nightDifferential = employeePayrollInfo.night_differential || 0;
      const loan = employeePayrollInfo.loan || 0;
      const otherDeductions = employeePayrollInfo.otherDeductions || 0;
      const adjustment = employeePayrollInfo.adjustment || 0;

      // Salary Computation
      const basicPay = totalHours * hourlyRate;
      const overtimePay = totalOvertime * overtimeRate;
      const holidayPay = holidayHours * hourlyRate;
      const grossPay = basicPay + overtimePay + holidayPay + allowance;
      const totalEarnings = grossPay + adjustment;
      const totalDeductions =
        tardiness + sss + phic + hdmf + loan + otherDeductions;
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
        noOfDays: 0,
        overtimePay: overtimePay.toFixed(2),
        totalOvertime: totalOvertime,
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
      { type: QueryTypes.RAW }
    );

    console.log("✅ Payroll release successful.");
    console.log("🔹 Rows affected:", metadata.affectedRows);

    if (metadata.affectedRows > 0) {
      // 🔍 Fetch all approved payslips
      const payslips = await sequelize.query(
        "SELECT * FROM payslips WHERE status = 'released';", // Change 'approved' to 'released'
        { type: QueryTypes.SELECT }
      );

      console.log("📄 Approved Payslips:", payslips); // ✅ Log fetched payslips

      if (payslips.length > 0) {
        console.log("📤 Triggering payslip email API...");

        try {
          const emailResponse = await axios.post(
            "http://localhost:5000/api/payslip/send-payslip",
            { payslips }
          );

          console.log("📩 Email API Response:", emailResponse.data);

          res.json({
            success: true,
            message: "Payroll successfully released and payslips sent!",
          });
        } catch (emailError) {
          console.error("❌ Error sending emails:", emailError);
          res.json({
            success: true,
            message: "Payroll released, but failed to send emails.",
          });
        }
      } else {
        console.log("⚠️ No approved payslips found to send.");
        res.json({
          success: true,
          message: "Payroll released, but no approved payslips found to send.",
        });
      }
    } else {
      res.json({ success: false, message: "No pending payroll found." });
    }
  } catch (error) {
    console.error("❌ Error releasing payroll:", error);
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
