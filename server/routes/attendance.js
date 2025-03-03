import express from "express";
import { insertAttendance, getAttendance } from "../controllers/attendanceController.js";
const router = express.Router();

router.post("/", insertAttendance); // Insert attendance data
router.get("/", getAttendance); // Get all attendance records

export default router;
