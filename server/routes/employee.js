import express from "express";
import {
  
  getEmployees,
  importEmployeesFromGoogleSheet,
} from "../controllers/employeeController.js";

const router = express.Router();

router.get("/", getEmployees);
//router.get("/:id", getEmployee);
//router.post("/add", addEmployee);
router.get("/import", importEmployeesFromGoogleSheet); // Manual Sync API

export default router;
