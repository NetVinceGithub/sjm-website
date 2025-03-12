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
          <div className="payslip bg-white">
                      <div className="bg-[#0093DD] w-[200px] h-[100px] border-2 border-[#0093DD] rounded-b-[30px] ml-[45px]">
                        <h1 className="text-white font-bold text-[25px] text-center mt-[10px]">e-PAYROLL SLIP</h1>
                        <img  alt="Company Logo" className="mt-[-65px] ml-[265px] w-[140px] h-auto" />
                      </div>
          
                      <h2 className="font-bold mt-[30px] ml-[40px] text-[18px]">Payslip No.:</h2>
                      <table>
                        <thead>
                          <tr className="border-[3px] border-[#AA396F]">
                            <th className="border-[3px] border-[#AA396F] text-center">ECODE</th>
                            <th className="w-[200px] border-[3px] border-[#AA396F] text-center">EMPLOYEE NAME</th>
                            <th className="w-[200px] border-[3px] border-[#AA396F] text-center">PROJECT SITE</th>
                            <th className="w-[200px] border-[3px] border-[#AA396F] text-center">RATE</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="h-[45px]">
                            <td className="border-[3px] border-[#AA396F]">${payslip.ecode || "N/A"}</td>
                            <td className="border-[3px] border-[#AA396F] w-[290px]">${
                              payslip.name || "N/A"
                            }</td>
                            <td className="border-[3px] border-[#AA396F]">${payslip.project || "N/A"}</td>
                            <td className="border-[3px] border-[#AA396F]">${
                              payslip.dailyrate || "0.00"
                            }</td>
                          </tr>
                          <tr>
                            <th className="border-[3px] border-[#AA396F] text-center" colSpan={2}>
                              POSITION
                            </th>
                            <th className="border-[3px] border-[#AA396F] text-center" colSpan={2}>
                              CUT-OFF DATE
                            </th>
                          </tr>
                          <tr>
                            <td className="h-[45px] border-[3px] border-[#AA396F]" colSpan={2}>
                              ${payslip.position || "N/A"}
                            </td>
                            <td className="h-[45px] border-[3px] border-[#AA396F]" colSpan={2}>
                              ${payslip.cutoff_date || "N/A"}
                            </td>
                          </tr>
                          <tr>
                            <th className="w-[200px] border-[3px] border-[#AA396F] text-center">EARNINGS</th>
                            <th className="w-[200px] border-[3px] border-[#AA396F] text-center">FIGURES</th>
                            <th className="w-[200px] border-[3px] border-[#AA396F] text-center">DEDUCTIONS</th>
                            <th className="w-[200px] border-[3px] border-[#AA396F] text-center">FIGURES</th>
                          </tr>
                          <tr>
                            <td className="border-b-0 border-[3px] border-[#AA396F] text-left">Basic Pay</td>
                            <td className="border-b-0 border-[3px] border-[#AA396F]">${
                              payslip.dailyrate || "0.00"
                            }</td>
                            <td className="border-b-0 border-[3px] border-[#AA396F] font-normal w-[280px] text-[9px] bg-[#AA396F] rounded-[10px] p-[1px] text-center">GOVERNMENT CONTRIBUTIONS</td>
                            <td className="border-b-0 border-[3px] border-[#AA396F]"></td>
                          </tr>
                          <tr>
                            <td className="cell4 bor left">No. of Days</td>
                            <td className="cell4 bor">${
                              payslip.no_of_days || "0"
                            }</td>
                            <td className="cell4 bor left">SSS</td>
                            <td className="cell4 bor">${
                              payslip.sss || "0.00"
                            }</td>
                          </tr>
                          <tr>
                            <td className="cell4 bor left">Overtime Pay</td>
                            <td className="cell4 bor">${
                              payslip.overtime_pay || "0.00"
                            }</td>
                            <td className="cell4 bor left">PHIC</td>
                            <td className="cell4 bor">${
                              payslip.phic || "0.00"
                            }</td>
                          </tr>
                          <tr>
                            <td className="cell4 bor left">Overtime Hours</td>
                            <td className="cell4 bor">${
                              payslip.overtime_hours
                            }</td>
                            <td className="cell4 bor down left">HDMF</td>
                            <td className="cell4 bor down">${payslip.hdmf}</td>
                          </tr>
                          <tr>
                            <td className="cell4 bor left">Holiday Pay</td>
                            <td className="cell4 bor">${
                              payslip.holiday_pay
                            }</td>
                            <td className="cell4  bor left">Cash Advance/Loan</td>
                            <td className="cell4 bor">${payslip.loan}</td>
                          </tr>
                          <tr>
                            <td className="cell4 bor left">Night Differenctial</td>
                            <td className="cell4 bor">${
                              payslip.night_differential
                            }</td>
                            <td className="cell4 bor left">Tardiness</td>
                            <td className="cell4 bor">${payslip.tardiness}</td>
                          </tr>
                          <tr>
                            <td className="cell4 bor left">Allowance</td>
                            <td className="cell4 bor">${payslip.allowance}</td>
                            <td className="cell4 bor left">Other Deductions</td>
                            <td className="cell4 bor">${
                              payslip.other_deductions
                            }</td>
                          </tr>
                          <tr>
                            <td className="cell4 bor left"></td>
                            <td className="cell4 bor"></td>
                            <td className="cell4 bor left">Total Deductions</td>
                            <td className="cell4 bor">
                              ${payslip.total_deductions || "0.00"}
                            </td>
                          </tr>
                          <tr>
                            <td className="cell4 bor left"></td>
                            <td className="cell4 bor"></td>
                            <td className="cell4 bor left">Adjustments</td>
                            <td className="cell4 bor">${payslip.adjustment}</td>
                          </tr>
                          <tr>
                            <th className="cell bor align" colSpan={2}>
                              NET PAY
                            </th>
                            <th className="cell bor align" colSpan={2}>
                              AMOUNT
                            </th>
                          </tr>
                          <tr className="cell5">
                            <td className="cell5 net" colSpan={2}>
                              NETPAY: ₱${payslip.net_pay || "0.00"}
                            </td>
                            <td className="cell5" colSpan={2}></td>
                          </tr>
                        </tbody>
                      </table>
                      <div className="footer">
                        <div className="block">
                          <h6 className="font-bold text-[14px] text-center">
                            Mia Mary Sora
                          </h6>
                          <p className="-mt-3 text-[12px] text-center">
                            Human Resource Head
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-[12px] -mt-1">
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
        `,
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
          dailyrate: parseFloat(payslip.dailyrate) || 0,
          basicPay: parseFloat(payslip.basic_pay) || 0,
          totalHours: parseFloat(payslip.total_hours || 0).toFixed(2),
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
