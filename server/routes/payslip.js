import express from "express";
import axios from "axios";
import {
  addPayslip, getPayslips, sendPayslips,
  getPayslipsHistory, generatePayroll, requestPayrollRelease, 
  releasePayroll,
  pendingRequests,
  getPayslipById,
  deleteAllPayslips, 
  getPayslipByEmployeeId,
  releasePayrollByProject,
  getAvailableBatches 
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

router.get("/pending-requests", pendingRequests);

router.post("/release-payroll", releasePayroll);
router.post("/send-payslip", sendPayslips);
router.post("/", addPayslip);


router.get("/batches", getAvailableBatches); // <-- Add this

router.get("/:id", getPayslipById);


router.delete("/", deleteAllPayslips); // Add this line
router.post("/release-payroll/project", releasePayrollByProject);


export default router;
