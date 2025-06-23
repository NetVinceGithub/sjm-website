import express from "express";
import { saveAttendance, saveAttendanceSummary, getAttendance, getAttendanceSummary, getAttendanceHistory, deleteAllAttendance, uploadAttendanceFile } from "../controllers/attendanceController.js";
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post("/upload", upload.single('attendanceFile'), uploadAttendanceFile);


router.post("/add-attendance", saveAttendance);
router.post("/add-attendance-summary", saveAttendanceSummary);
router.get("/get-attendance", getAttendance);
router.get("/get-history", getAttendanceHistory);
router.get("/get-summary", getAttendanceSummary);
router.delete("/delete-all-attendance", deleteAllAttendance);


export default router;