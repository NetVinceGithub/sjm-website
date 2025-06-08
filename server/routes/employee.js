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
  toggleEmployeeStatus,
  requestPayrollChange,
  reviewPayrollChange,
  rejectPayrollChange,
  approvePayrollChange,
  messageEmployee
} from "../controllers/employeeController.js";

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = "./uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Multer
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

// SPECIFIC ROUTES FIRST (most specific to least specific)

// Import and basic employee routes
router.get("/import", importEmployeesFromGoogleSheet);
router.get("/status", getEmployeeStatus);

// Payroll information routes
router.get("/payroll-informations", getPayrollInformations);
router.get("/payroll-informations/:id", getPayrollInformationsById);
router.put("/payroll-informations/:id", updatePayrollInformation);

// Payroll change request routes - VERY SPECIFIC ROUTES FIRST
router.post("/payroll-change-requests", requestPayrollChange);
router.get("/payroll-change-requests", reviewPayrollChange);

// Approval/Rejection routes - THESE NEED TO BE BEFORE /:id
router.post("/approve-payroll-change/:id", approvePayrollChange);
router.post("/reject-payroll-change/:id", rejectPayrollChange);

// Bulk operations (if you have them)
// router.post("/bulk-approve-payroll-changes", bulkApprovePayrollChanges);
// router.post("/bulk-reject-payroll-changes", bulkRejectPayrollChanges);

// Employee status and update routes
router.put("/toggle-status/:id", toggleEmployeeStatus);
router.put("/update-details/:id", upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "esignature", maxCount: 1 }
]), updateIDDetails);

// GENERIC ROUTES LAST
router.get("/", getEmployees); // This should be after specific routes
router.get("/:id", getEmployee); // This MUST be the very last route

router.post('/messaging', messageEmployee);

export default router;