import express from "express";
import axios from "axios";
import {
  addPayslip, getPayslips, sendPayslips,
  getPayslipsHistory, getPayslipByEcode, generatePayroll, requestRelease, 
  releasePayroll,
  pendingRequests,
  getPayslipById
} from "../controllers/payslipController.js";
import { sequelize } from "../db/db.js"; // Ensure correct path
import { QueryTypes } from "sequelize";
import PayrollInformation from "../models/PayrollInformation.js";
import Payslip from "../models/Payslip.js";

const router = express.Router();

// Fetch payslips
router.get("/", getPayslips);

router.get("/:id", getPayslipById);

// Add a payslip
router.post("/", addPayslip);

// Send payslips via email
router.post("/send-payslip", sendPayslips);

// Fetch all payslip history
router.get("/history", getPayslipsHistory);

// Fetch payslip history by Employee Code
router.get("/history/ecode/:ecode", getPayslipByEcode);

// Generate Payroll
router.post("/generate", generatePayroll);
  

// Request payroll release
router.post("/request-release", requestRelease);

// Admin approves and releases payroll
router.post("/release-payroll", releasePayroll);

// Fetch pending payroll release requests
router.get("/pending-requests", pendingRequests);

export default router;