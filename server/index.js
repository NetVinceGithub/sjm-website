import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth.js";
import departmentRouter from "./routes/department.js";
import employeeRouter from "./routes/employee.js";
import ratesRouter from "./routes/ratesAndDeductions.js";
import projectRouter from "./routes/project.js";
import allowanceRouter from "./routes/allowance.js";
import payslipRouter from "./routes/payslip.js";
import userRouter from "./routes/user.js";
import invoiceRouter from "./routes/invoice.js";
import jobsRouter from "./routes/jobs.js";
import attendanceRouter from "./routes/attendance.js";
import sequelize from "./db/db.js"; // Sequelize connection

// Import Models
import "./models/Employee.js"; // Import only, no assignment needed
import "./models/PayrollInformation.js"; // Import only

// Setup Associations (must be after all models are imported)
import setupAssociations from "./models/associations.js";
setupAssociations();

// Sync Database
sequelize.sync({ alter: false }) // Use `alter: true` to update schema without dropping tables
  .then(() => console.log("✅ MySQL Database Synced"))
  .catch((err) => console.error("❌ MySQL Connection Error:", err));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/department", departmentRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/rates", ratesRouter);
app.use("/api/projects", projectRouter);
app.use("/api/allowance", allowanceRouter);
app.use("/api/payslip", payslipRouter);
app.use("/api/users", userRouter);
app.use("/api/invoice", invoiceRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/attendance", attendanceRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
