import express from "express";
import {
  getEmployee,
  getEmployees,
  importEmployeesFromGoogleSheet,
  getPayrollInformations,
  getPayrollInformationsById,
  updatePayrollInformation, 
  saveEmployeeIDDetails
} from "../controllers/employeeController.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Configure Storage for Images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save images in "uploads" folder
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Get file extension
    const fileName = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, fileName); // Unique filename
  },
});

// Initialize Multer
const upload = multer({ storage });

// Routes
router.get("/import", importEmployeesFromGoogleSheet); // Manual Sync API
router.get("/", getEmployees);
router.get("/payroll-informations/:id", getPayrollInformationsById);
router.put("/payroll-informations/:id", updatePayrollInformation);
router.get("/payroll-informations", getPayrollInformations);
router.get("/:id", getEmployee);

// ✅ Fix: Use Multer to handle profileImage & esignature uploads
router.put("/saveIDDetails", upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "esignature", maxCount: 1 }
]), saveEmployeeIDDetails);

// ✅ Correctly export the router (only one default export)
export default router;
