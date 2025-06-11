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
  messageEmployee,
  bulkMessaging,
  bulkRequestPayrollChange
} from "../controllers/employeeController.js";

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = "./uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Multer for memory storage (since your controller expects file.buffer)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100mb limit per file
});

// Create a dynamic fields configuration for bulk messaging
const createBulkMessagingUpload = (maxFiles = 10) => {
  const fields = [];
  for (let i = 0; i < maxFiles; i++) {
    fields.push({ name: `attachment_${i}`, maxCount: 1 });
  }
  return upload.fields(fields);
};

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
router.post("/bulk-payroll-change-requests", bulkRequestPayrollChange);
router.get("/payroll-change-requests", reviewPayrollChange);

// Approval/Rejection routes - THESE NEED TO BE BEFORE /:id
router.post("/approve-payroll-change/:id", approvePayrollChange);
router.post("/reject-payroll-change/:id", rejectPayrollChange);

// Employee status and update routes
router.put("/toggle-status/:id", toggleEmployeeStatus);
router.put("/update-details/:id", upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "esignature", maxCount: 1 }
]), updateIDDetails);

// GENERIC ROUTES LAST
router.get("/", getEmployees); // This should be after specific routes
router.get("/:id", getEmployee); // This MUST be the very last route

// Messaging routes
router.post('/messaging', upload.array('attachments', 10), messageEmployee);
router.post('/bulk-messaging', createBulkMessagingUpload(10), bulkMessaging);

export default router;