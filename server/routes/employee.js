import express from "express";
import {
  getEmployee,
  getEmployees,
  importEmployeesFromGoogleSheet,
} from "../controllers/employeeController.js";

const router = express.Router();

router.get("/import", importEmployeesFromGoogleSheet); // Manual Sync API
router.get("/", getEmployees);
router.get("/:id", getEmployee);
//router.post("/add", addEmployee);

export default router;
