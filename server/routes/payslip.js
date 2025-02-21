import express from "express";
import axios from "axios";
import {
  addPayslip, getPayslips, sendPayslips,
  getPayslipsHistory, getPayslipByEcode, generatePayroll, requestRelease 
} from "../controllers/payslipController.js";
import { sequelize } from "../db/db.js"; // Ensure correct path
import { QueryTypes } from "sequelize";

const router = express.Router();

// Fetch payslips
router.get("/", getPayslips);

// Add a payslip
router.post("/", addPayslip);

// Send payslips via email
router.post("/send-payslip", sendPayslips);

// Fetch all payslip history
router.get("/history", getPayslipsHistory);

// Fetch payslip history by Employee Code
router.get("/history/ecode/:ecode", getPayslipByEcode);

router.post("/generate", generatePayroll);


router.post("/request-release", requestRelease);

// Admin approves and releases payroll
router.post("/release-payroll", async (req, res) => {
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
});


// Fetch pending payroll release requests
router.get("/pending-requests", async (req, res) => {
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
});


export default router;
