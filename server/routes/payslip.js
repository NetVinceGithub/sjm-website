import express from "express";
import axios from "axios";
import {
  addPayslip, getPayslips, sendPayslips,
  getPayslipsHistory, generatePayroll, requestPayrollRelease, 
  releasePayroll,
  pendingRequests,
  getPayslipById,
  deleteAllPayslips, 
  getPayslipByEmployeeId
} from "../controllers/payslipController.js";
import { sequelize } from "../db/db.js"; // Ensure correct path
import { QueryTypes } from "sequelize";
import PayrollInformation from "../models/PayrollInformation.js";
import Payslip from "../models/Payslip.js";

const router = express.Router();

router.get("/", getPayslips);
router.get("/history", getPayslipsHistory);
router.get("/history/:employeeId", getPayslipByEmployeeId);
router.post("/generate", generatePayroll);
router.post("/request-release", requestPayrollRelease);

// ✅ Fix: Ensure this is before "/:id"
router.get("/pending-requests", pendingRequests);

router.post("/release-payroll", releasePayroll);
router.post("/send-payslip", sendPayslips);
router.post("/", addPayslip);

// ❌ Wrong order before, now correct
router.get("/:id", getPayslipById);

router.delete("/", deleteAllPayslips); // Add this line

export default router;
