
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';

// Rest of your imports and code...
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import sequelize from "./db/db.js";
import Employee from "./models/Employee.js";
import { PayrollInformation } from "./models/Employee.js";
import setupAssociations from "./models/associations.js";
import { userRegister } from "./userSeed.js";

// Load environment variables
dotenv.config();

// Define associations
Employee.hasOne(PayrollInformation, { foreignKey: "employee_id", onDelete: "CASCADE" });
PayrollInformation.belongsTo(Employee, { foreignKey: "employee_id" });

// Sync Database
sequelize.sync({ alter: true })
  .then(() => {
    console.log("✅ MySQL Database Synced");
    return userRegister();
  })
  .then(() => {
    console.log("✅ Admin user ensured");
  })
  .catch((err) => {
    console.error("❌ MySQL Connection Error:", err);
  });

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/static", express.static(path.join(__dirname, "public")));

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
  // Remove the fileFilter to allow all file types (use with caution!)
  // fileFilter: (req, file, cb) => {
  //   if (file.mimetype.startsWith("image/")) {
  //     cb(null, true);
  //   } else {
  //     cb(new Error("Only image files are allowed!"), false);
  //   }
  // },
  limits: { fileSize: 100 * 1024 * 1024 } // 100mb limit
});

setupAssociations();

import authRouter from "./routes/auth.js";
import employeeRouter from "./routes/employee.js";
import payslipRouter from "./routes/payslip.js";
import userRouter from "./routes/user.js";
import invoiceRouter from "./routes/invoice.js";
import jobsRouter from "./routes/jobs.js";
import attendanceRouter from "./routes/attendance.js";
import connectRouter from "./routes/connect.js";
import holidaysRouter from "./routes/holidays.js";
import loginRouter from './routes/login.js';
import changeRequestRouter from './routes/changeRequest.js';
import clientsRouter from './routes/clients.js';

app.use((req, res, next) => {
  console.log(`Request URL: ${req.url}, Method: ${req.method}`);
  next();
});

app.get("/long-logo", (req, res) => {
  const filePath = path.join(__dirname, "../frontend/public/fonts/long-logo.png");
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("File not found!");
  }
});



app.use("/api/auth", authRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/payslip", payslipRouter);
app.use("/api/users", userRouter);
app.use("/api/invoice", invoiceRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/connect", connectRouter);
app.use("/api/holidays", holidaysRouter);
app.use("/api/login", loginRouter);
app.use("/api/change-requests", changeRequestRouter);
app.use('/api/clients', clientsRouter);

app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

export { Employee, PayrollInformation };
