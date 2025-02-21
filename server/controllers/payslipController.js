import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Payslip from "../models/Payslip.js";
import Employee from "../models/Employee.js";
import PayslipHistory from "../models/PayslipHistory.js";

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

    const { cutoffDate } = req.body;

    const employees = await Employee.findAll();
    if (!employees || employees.length === 0) {
      console.log("⚠️ No Employees Found!");
      return res.status(400).json({ success: false, message: "No employees found!" });
    }

    let generatedPayslips = [];

    for (const employee of employees) {
      console.log(`📌 Processing Payroll for: ${employee.name} (${employee.ecode})`);

      // Ensure default values to prevent "null" issues
      const regularduty = Number(employee.regularduty) || 0;
      const regularholiday = Number(employee.regularholiday) || 0;
      const regularholidaypay = Number(employee.regholidaypay) * regularholiday || 0;
      const allowance = employee.allowance || 0;
      const tardinessDeductions = 65/60;
      const tardiness = Number((tardinessDeductions * employee.tardiness || 0).toFixed(2));

      const basicPay = Number(employee.dailyrate) * regularduty || 0;
      const gross_pay = basicPay + regularholidaypay + allowance;
      
      console.log("regular duty:", regularduty);
      console.log("regular holiday:", regularholiday);
      console.log("regular regularholidaypay:", regularholidaypay);
      console.log("regular basic pay:", basicPay);
      console.log("regular gross pay:", gross_pay);
      console.log("tardiness:", tardiness);

      const overtimePay = employee.overtime_pay || 0;
      const holidayPay = employee.regholidaypay || 0;
      const sss = employee.sss || 0;
      const phic = employee.phic || 0;
      const hdmf = employee.hdmf || 0;

      const totalEarnings = gross_pay;
      const totalDeductions = (Number(sss) || 0) + (Number(phic) || 0) + (Number(hdmf) || 0) + (Number(tardiness) || 0);
      
      const netPay = Math.round(Number(totalEarnings) - Number(totalDeductions));
      console.log("Payroll Data:", employee.emailaddress); // Check if email exists before saving

      const payslipData = {
        ecode: employee.ecode,
        email: employee.emailaddress,
        employeeId: employee.id,
        name: employee.name,
        project: employee.area || "N/A",
        position: employee.positiontitle || "N/A",
        department: employee.department,
        regularduty: employee.regularduty,
        regularholiday: employee.regularholiday,
        dailyrate: employee.dailyrate || 0,
        cutoffDate,
        basicPay,
        overtimePay,
        holidayPay,
        gross_pay,
        allowance,
        tardiness,
        sss,
        phic,
        hdmf,
        totalEarnings,
        totalDeductions,
        netPay,
        status:"pending",
      };

      console.log("✅ Payslip Data:", payslipData);

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
