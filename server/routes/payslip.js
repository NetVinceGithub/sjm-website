import express from "express";
import axios from "axios";
import {
  addPayslip, getPayslips, sendPayslips,
  getPayslipsHistory, getPayslipByEcode, generatePayroll, requestRelease, 
  releasePayroll,
  pendingRequests
} from "../controllers/payslipController.js";
import { sequelize } from "../db/db.js"; // Ensure correct path
import { QueryTypes } from "sequelize";
import PayrollInformation from "../models/PayrollInformation.js";
import Payslip from "../models/Payslip.js";

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

// Generate Payroll
router.post("/generate", async (req, res) => {
  try {
    const { cutoffDate } = req.body;
    if (!cutoffDate) {
      return res.status(400).json({ success: false, message: "Missing cutoff date!" });
    }

    const payslips = await generatePayroll(cutoffDate);

    res.json({
      success: true,
      payslips: payslips || [], // Ensure array is returned
    });
  } catch (error) {
    console.error("❌ Payroll generation error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", payslips: [] });
  }
});




// Request payroll release
router.post("/request-release", requestRelease);

// Admin approves and releases payroll
router.post("/release-payroll", releasePayroll);

// Fetch pending payroll release requests
router.get("/pending-requests", pendingRequests);

export default router;