import express from "express";
import { saveAttendance, saveAttendanceSummary, getAttendance } from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/add-attendance", saveAttendance);
router.post("/add-attendance-summary", saveAttendanceSummary);
router.get("/get-attendance", getAttendance);

export default router;