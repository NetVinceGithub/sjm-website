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
      return res.status(400).json({ success: false, message: "No payslips provided." });
    }

    let successfulEmails = [];
    let failedEmails = [];
    let payslipIdsToDelete = [];

    for (let payslip of payslips) {
      if (!payslip.email) {
        console.warn(`⚠️ Skipping payslip for ${payslip.name} (No email provided)`);
        failedEmails.push({ name: payslip.name, reason: "No email provided" });
        continue;
      }

      let mailOptions = {
        from: process.env.EMAIL_USER,
        to: payslip.email,
        subject: `Payslip for ${payslip.name}`,
        html: `
          <div style="border: 3px solid #000; width: 60%; margin: 0 auto; padding: 20px; font-family: Arial, Helvetica, sans-serif;">
            <div style="background-color: #0093DD; width: 100%; height: 100px; border-radius: 0 0 30px 30px; text-align: center;">
              <h2 style="color: #fff; font-weight: bold; font-size: 30px; line-height: 100px;">e-PAYROLL SLIP</h2>
            </div>
            <h3 style="margin-top: 20px;">Payslip No.: </h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr style="background-color: #f2f2f2; text-align: center;">
                <th style="border: 3px solid #AA396F; padding: 8px;">ECODE</th>
                <th style="border: 3px solid #AA396F; padding: 8px;">EMPLOYEE NAME</th>
                <th style="border: 3px solid #AA396F; padding: 8px;">PROJECT SITE</th>
                <th style="border: 3px solid #AA396F; padding: 8px;">RATE</th>
              </tr>
              <tr style="text-align: center;">
                <td style="border: 3px solid #AA396F; padding: 8px;">${payslip.ecode || "N/A"}</td>
                <td style="border: 3px solid #AA396F; padding: 8px;">${payslip.name || "-"}</td>
                <td style="border: 3px solid #AA396F; padding: 8px;">${payslip.project || "-"}</td>
                <td style="border: 3px solid #AA396F; padding: 8px;">₱${(payslip.dailyrate || 0).toLocaleString()}</td>
              </tr>
            </table>

            <table>
              <tr style="background-color: #f2f2f2; text-align: center;">
                <th style="border: 3px solid #AA396F; padding: 8px;">POSITION</th>          
                <th style="border: 3px solid #AA396F; padding: 8px;">CUT-OFF DATE</th>          
              </tr>
              <tr style="text-align: center;">
                <td style="border: 3px solid #AA396F; padding: 8px;">${payslip.position || "N/A"}</td>   
                <td style="border: 3px solid #AA396F; padding: 8px;">${payslip.cutoff_date || "N/A"}</td>
              </tr>
            </table>
            
            <h3>Payroll Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background-color: #f2f2f2;">
                <th style="border: 3px solid #AA396F; padding: 8px;">EARNINGS</th>
                <th style="border: 3px solid #AA396F; padding: 8px;">FIGURES</th>
                <th style="border: 3px solid #AA396F; padding: 8px;">DEDUCTIONS</th>
                <th style="border: 3px solid #AA396F; padding: 8px;">FIGURES</th>
              </tr>
              <tr>
                <td style="border: 3px solid #AA396F; padding: 8px;">Basic Pay</td>
                <td style="border: 3px solid #AA396F; padding: 8px;">₱${(payslip.basic_pay || 0).toLocaleString()}</td>
                <td style="border: 3px solid #AA396F; padding: 8px;">Total Deductions</td>
                <td style="border: 3px solid #AA396F; padding: 8px;">₱${(payslip.total_deductions || 0).toLocaleString()}</td>
              </tr>
              <tr style="background-color: #f2f2f2;">
                <th style="border: 3px solid #AA396F; padding: 8px;" colspan="2">NET PAY</th>
                <th style="border: 3px solid #AA396F; padding: 8px;" colspan="2">₱${(payslip.net_pay || 0).toLocaleString()}</th>
              </tr>
            </table>

            <p style="margin-top: 20px;">Thank you, <br><strong>HR Payroll Team</strong></p>
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`📩 Payslip sent to ${payslip.email}`);
        successfulEmails.push(payslip.email);
        console.log("For payslip history" , payslip)
        // Save to history
        await PayslipHistory.create({
          ecode: payslip.ecode,
          employeeId: Number(payslip.employeeId),
          email: payslip.email,
          name: payslip.name,
          position: payslip.position,
          project: payslip.project,
          cutoffDate: payslip.cutoff_date || "N/A",  // Ensure correct field name
          allowance: payslip.allowance || 0,
          basicPay: payslip.basic_pay ?? 0,  
          overtimePay: payslip.overtimePay ?? 0,  
          holidayPay: payslip.holiday_pay ?? 0,  
          totalDeductions: payslip.total_deductions ?? 0,  
          netPay: payslip.net_pay ?? 0,  
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

    res.status(200).json({
      success: true,
      message: "Payslips processed.",
      summary: {
        sent: successfulEmails.length,
        failed: failedEmails.length,
        failedDetails: failedEmails,
      },
    });
  } catch (error) {
    console.error("❌ Server error while sending payslips:", error);
    res.status(500).json({ success: false, message: "Server error while sending payslips." });
  }
};


// 🔹 Add Payslip
export const addPayslip = async (req, res) => {
  try {
    const {
      ecode, email, employeeId, name, project, position,
      dailyRate, basicPay, overtimePay, holidaySalary, allowance,
      sss, phic, hdmf, totalEarnings, totalDeductions, netPay
    } = req.body;

    if (!employeeId || !name || !position || !dailyRate || !basicPay) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newPayslip = new Payslip({
      ecode, email, employeeId, name, project, position,
      dailyRate, basicPay, overtimePay, holidaySalary, allowance,
      sss, phic, hdmf, totalEarnings, totalDeductions, netPay
    });

    await newPayslip.save();
    res.status(201).json({ success: true, message: "Payslip created successfully", payslip: newPayslip });

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
      return res.status(404).json({ success: false, message: "Payslip not found" });
    }
    res.status(200).json({ success: true, payslip });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};



export const generatePayroll = async (req, res) => {
  try {
    console.log("🚀 Starting Payroll Generation...");
    console.log("📩 Received Request Body:", req.body); // ✅ Debugging step
    const { cutoffDate } = req.body;

    // Fetch all required data
    const employees = await Employee.findAll();
    if (!employees || employees.length === 0) {
      console.log("⚠️ No Employees Found!");
      return res.status(400).json({ success: false, message: "No employees found!" });
    }

    const attendanceSummaries = await AttendanceSummary.findAll();
    const payrollInformations = await PayrollInformation.findAll();

    let generatedPayslips = [];

    for (const employee of employees) {
      console.log(`Processing Payroll for: ${employee.name} (${employee.ecode})`);

      // 🔍 Find the employee's attendance summary
      const employeeAttendance = attendanceSummaries.find(summary => summary.ecode === employee.ecode) || {};

      const employeePayrollInfo = payrollInformations.find(info => info.ecode === employee.ecode) || {};

      const basicPay = (employeeAttendance.totalHours || 0) * (employeePayrollInfo.hourly_rate || 0);
      const overtimePay = (employeeAttendance.totalOvertime || 0) * (employeePayrollInfo.overtime_pay ) ;
      const holidayPay = (employeeAttendance.holiday || 0) * (employeePayrollInfo.hourly_rate || 0);
      const allowance = employeePayrollInfo.allowance || 0;
      const sss = employeePayrollInfo.sss || 0;
      const phic = employeePayrollInfo.phic || 0;
      const hdmf = employeePayrollInfo.hdmf || 0;

      const tardiness = (employeeAttendance.totalTardiness || 0) * (employeePayrollInfo.hourly_rate/ 60);
      const gross_pay = basicPay + overtimePay + holidayPay;
      const totalEarnings = gross_pay + allowance;
      const totalDeductions = tardiness + sss + phic + hdmf;

      const netPay = totalEarnings - totalDeductions;

      const payslipData = {
        ecode: employee.ecode,
        email: employee.emailaddress,
        employeeId: employee.id,
        name: employee.name,
        project: employee.area || "N/A",
        position: employee.positiontitle || "N/A",
        department: employee.department,
        cutoffDate,
        dailyrate: employeePayrollInfo.daily_rate || 0,
        basicPay: basicPay.toFixed(2),
        noOfDays: 0,
        overtimePay: overtimePay.toFixed(2),
        totalOvertime: attendanceSummaries.totalOvertime.toFixed(2),
        holidayPay: holidayPay.toFixed(2),
        nightDifferential: payrollInformations.night_differential,
        allowance: allowance.toFixed(2),
        sss: sss.toFixed(2),
        phic: phic.toFixed(2),
        hdmf: hdmf.toFixed(2),
        loan: payrollInformations.load.toFixed(2),
        totalTardiness: tardiness.toFixed(2),
        totalHours: employeeAttendance.totalHours.toFixed(2),
        otherDeductions:payrollInformations.otherDeductions.toFixed(2),
        totalEarnings: totalEarnings.toFixed(2),
        totalDeductions: totalDeductions.toFixed(2),
        adjustment: payrollInformations.adjustment,
        gross_pay: gross_pay.toFixed(2),
        netPay: netPay.toFixed(2),
        status: "pending",
      };

      console.log("✅ Payslip Data:", payslipData);

      // Save the payslip to the database
      try {
        const newPayslip = await Payslip.create(payslipData);
        generatedPayslips.push(newPayslip);
      } catch (dbError) {
        console.error("❌ Error Saving Payslip to Database:", dbError);
      }
    }

    res.status(201).json({ success: true, message: "Payroll generated!", payslips: generatedPayslips });

  } catch (error) {
    console.error("❌ Payroll Generation Error:", error);
    res.status(500).json({ success: false, message: "Server error during payroll generation." });
  }
};





export const requestRelease = async (req, res) => {
  try {
    await Payslip.update(
      { status: "pending" },  // ✅ Set status to "pending"
      { where: {} }
    );
    res.json({ success: true, message: "Payroll release request sent!" });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


export const releasePayroll = async (req, res) => {
  try {
    const [results, metadata] = await sequelize.query(
      "UPDATE payslips SET status = 'approved' WHERE status = 'pending';",
      { type: QueryTypes.RAW }
    );

    console.log("✅ Payroll release successful.");
    console.log("🔹 Rows affected:", metadata.affectedRows);

    if (metadata.affectedRows > 0) {
      // 🔍 Fetch all approved payslips
      const payslips = await sequelize.query(
        "SELECT * FROM payslips WHERE status = 'approved';",
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
}

export const pendingRequests = async (req, res) => {
  try {
    const pendingRequests = await sequelize.query(
      "SELECT * FROM payslips WHERE status = 'pending';",
      { type: QueryTypes.SELECT }
    );

    res.json(pendingRequests);
  } catch (error) {
    console.error("❌ Error fetching pending requests:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}