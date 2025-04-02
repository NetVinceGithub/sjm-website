import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sequelize from "./db/db.js";
import Employee from "./models/Employee.js";
import PayrollInformation from "./models/PayrollInformation.js";



dotenv.config();

// Define associations
Employee.hasOne(PayrollInformation, { foreignKey: "employee_id", onDelete: "CASCADE" });
PayrollInformation.belongsTo(Employee, { foreignKey: "employee_id" });

// Sync Database
sequelize.sync({ alter: true })
  .then(() => console.log("✅ MySQL Database Synced"))
  .catch((err) => console.error("❌ MySQL Connection Error:", err));

const app = express();
const PORT = process.env.PORT || 5000;


// Get current directory using ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/public", express.static(path.join(__dirname, "../frontend/public")));

// ✅ Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ✅ Test Route to Serve Image
app.get("/long-logo", (req, res) => {
  const filePath = path.join(__dirname, "../frontend/public/fonts/long-logo.png");

  // Check if file exists before sending
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("File not found!");
  }
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Move `upload` setup before importing routes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExt);
  }
});

export const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// ✅ Now import routes (after `upload` is initialized)
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
import connectRouter from "./routes/connect.js"; // ✅ Import connectRouter
import holidaysRouter from "./routes/holidays.js"; // ✅ Correct import
// Add logging middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`Request URL: ${req.url}, Method: ${req.method}`);
  next();
});


// Serve frontend's public folder as static
app.use("/public", express.static(path.join(__dirname, "public")));

// Example route to test access


// Start server
app.listen(5000, () => console.log("Server running on port 5000"));


// Your existing routes go here
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
app.use("/api/connect", connectRouter); // Ensure this line is included
app.use("/api/holidays", holidaysRouter)


app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

export { Employee, PayrollInformation };
