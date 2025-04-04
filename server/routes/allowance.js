import express from "express";
import path from "path";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getAllowance,
} from "../controllers/allowanceController.js";

const router = express.Router();

// Serve static files from the 'uploads' folder
//router.use("/uploads", express.static(path.resolve("uploads")));

// Fetch all employees
//router.get("/", authMiddleware, getEmployees);

// Fetch a single employee by ID
router.get("/:id", authMiddleware, getAllowance);

// Add a new employee with file upload
//router.post("/add", authMiddleware, uploadFields, addEmployee);

// Update an employee with file upload
//router.put("/:id", authMiddleware, uploadFields, updateEmployee);

export default router;
