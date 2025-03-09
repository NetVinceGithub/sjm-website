import express from "express";
import { saveAttendance, saveAttendanceSummary, getAttendance, getAttendanceSummary, getAttendanceHistory } from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/add-attendance", saveAttendance);
router.post("/add-attendance-summary", saveAttendanceSummary);
router.get("/get-attendance", getAttendance);
router.get("/get-history", getAttendanceHistory);
router.get("/get-summary", getAttendanceSummary);

export default router;