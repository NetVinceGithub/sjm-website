import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getEmployee,
  getEmployees,
  importEmployeesFromGoogleSheet,
  getPayrollInformations,
  getPayrollInformationsById,
  updatePayrollInformation,
  updateIDDetails,
  getEmployeeStatus,
  toggleEmployeeStatus
} from "../controllers/employeeController.js";

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = "./uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Multer (Define upload inside employee.js)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExt = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + fileExt);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Employee Routes
router.get("/import", importEmployeesFromGoogleSheet);
router.get("/", getEmployees);
router.get("/status", getEmployeeStatus);
router.put("/toggle-status/:id", toggleEmployeeStatus);
router.get("/payroll-informations/:id", getPayrollInformationsById);
router.put("/payroll-informations/:id", updatePayrollInformation);
router.put("/update-details/:id", upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "esignature", maxCount: 1 }
]), updateIDDetails);
router.get("/payroll-informations", getPayrollInformations);
router.get("/:id", getEmployee);

export default router;
