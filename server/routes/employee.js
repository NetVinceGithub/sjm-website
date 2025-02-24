import express from "express";
import {
  getEmployee,
  getEmployees,
  importEmployeesFromGoogleSheet,
  getPayrollInformations,
  getPayrollInformationsById,
  updatePayrollInformation
} from "../controllers/employeeController.js";

const router = express.Router();

router.get("/import", importEmployeesFromGoogleSheet); // Manual Sync API
router.get("/", getEmployees);
router.get("/payroll-informations/:id", getPayrollInformationsById)
router.put("/payroll-informations/:id", updatePayrollInformation);
router.get("/payroll-informations", getPayrollInformations)
router.get("/:id", getEmployee);
//router.post("/add", addEmployee);

export default router;
