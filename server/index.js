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
import sequelize from "./db/db.js"; // Sequelize connection

// Import Models
import Employee from "./models/Employee.js";
import PayrollInformation from "./models/PayrollInformation.js";

dotenv.config();




// Define associations
Employee.hasOne(PayrollInformation, { foreignKey: "employee_id", onDelete: "CASCADE" });
PayrollInformation.belongsTo(Employee, { foreignKey: "employee_id" });

// Sync Database
sequelize.sync({ alter: true }) // Use `alter: true` to update without dropping tables
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

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

export { Employee, PayrollInformation };