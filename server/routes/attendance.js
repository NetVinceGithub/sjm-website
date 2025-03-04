import express from "express";
import { saveAttendance, saveAttendanceSummary } from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/add-attendance", saveAttendance);
router.post("/add-attendance-summary", saveAttendanceSummary);

export default router;