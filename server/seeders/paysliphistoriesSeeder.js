import { Sequelize } from "sequelize";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PayslipHistory from "../models/PayslipHistory.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually load .env.local or .env
const envLocalPath = path.resolve(__dirname, "../.env.local");
const envPath = path.resolve(__dirname, "../.env");

let envFile = envLocalPath;
if (!fs.existsSync(envLocalPath)) {
  envFile = envPath;
}

const envContent = fs.readFileSync(envFile, "utf8");
envContent.split("\n").forEach(line => {
  const [key, ...valueParts] = line.split("=");
  if (key && valueParts.length) {
    process.env[key.trim()] = valueParts.join("=").trim();
  }
});

console.log(`📄 Loaded environment from: ${path.basename(envFile)}\n`);

// Create sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false
  }
);

const paysliphistoriesSeeder = [
  {
    ecode: "M00008",
    email: "trishaona@gmail.com",
    employeeId: 1,
    name: "John Doe",
    project: "Project A",
    department: "IT",
    position: "Developer",
    schedule: "Day Shift",
    cutoffDate: "2025-01-15",
    payrollType: "Regular",
    batchId: "BATCH-001",
    dailyrate: 500.00,
    basicPay: 15000.00,
    noOfDays: 15.00,
    holidayDays: 2.00,
    regularDays: 13.00,
    specialHolidayDays: 1.00,
    regularHolidayDays: 1.00,
    specialNonWorkingHolidayDays: 0.00,
    overtimePay: 600.00,
    totalOvertime: 5.00,
    regularOvertime: 3.00,
    holidayOvertime: 2.00,
    totalRegularHours: 104.00,
    totalHolidayHours: 16.00,
    specialHolidayHours: 8.00,
    regularHolidayHours: 8.00,
    holidayPay: 1000.00,
    specialHolidayPay: 500.00,
    regularHolidayPay: 500.00,
    specialHolidayOTPay: 150.00,
    regularHolidayOTPay: 200.00,
    nightDifferential: 200.00,
    nightShiftHours: 10.00,
    allowance: 300.00,
    sss: 300.00,
    sssEmployerShare: 300.00,
    sssEC: 10.00,
    sssTotalContribution: 610.00,
    phic: 200.00,
    hdmf: 100.00,
    loan: 0.00,
    sssLoan: 0.00,
    pagibigLoan: 0.00,
    totalTardiness: 100.00,
    totalHours: 160.00,
    otherDeductions: 0.00,
    taxDeduction: 500.00,
    underTime: 50.00,
    cashAdvance: 0.00,
    totalEarnings: 20000.00,
    totalDeductions: 1250.00,
    adjustment: 0.00,
    gross_pay: 20000.00,
    netPay: 18750.00,
    shiftHours: 4.50,
    employmentRank: "Rank and File",
    isRankAndFile: true,
    requestedBy: "jpcastillo@gmail.com",
    requestedByName: "Admin User",
    date: new Date(),
    status: "approved",
  },
  {
    ecode: "M0002",
    email: "jpcastillo@gmail.com",
    employeeId: 2,
    name: "Jane Smith",
    project: "Project B",
    department: "HR",
    position: "HR Manager",
    schedule: "Day Shift",
    cutoffDate: "2025-01-15",
    payrollType: "Regular",
    batchId: "BATCH-001",
    dailyrate: 800.00,
    basicPay: 24000.00,
    noOfDays: 15.00,
    holidayDays: 1.00,
    regularDays: 14.00,
    specialHolidayDays: 0.00,
    regularHolidayDays: 1.00,
    specialNonWorkingHolidayDays: 0.00,
    overtimePay: 800.00,
    totalOvertime: 4.00,
    regularOvertime: 4.00,
    holidayOvertime: 0.00,
    totalRegularHours: 112.00,
    totalHolidayHours: 8.00,
    specialHolidayHours: 0.00,
    regularHolidayHours: 8.00,
    holidayPay: 800.00,
    specialHolidayPay: 0.00,
    regularHolidayPay: 800.00,
    specialHolidayOTPay: 0.00,
    regularHolidayOTPay: 0.00,
    nightDifferential: 0.00,
    nightShiftHours: 0.00,
    allowance: 500.00,
    sss: 500.00,
    sssEmployerShare: 500.00,
    sssEC: 10.00,
    sssTotalContribution: 1010.00,
    phic: 300.00,
    hdmf: 100.00,
    loan: 500.00,
    sssLoan: 500.00,
    pagibigLoan: 0.00,
    totalTardiness: 0.00,
    totalHours: 160.00,
    otherDeductions: 100.00,
    taxDeduction: 1200.00,
    underTime: 0.00,
    cashAdvance: 200.00,
    totalEarnings: 26100.00,
    totalDeductions: 2900.00,
    adjustment: 0.00,
    gross_pay: 26100.00,
    netPay: 23200.00,
    shiftHours: 4.50,
    employmentRank: "Managerial",
    isRankAndFile: false,
    requestedBy: "admin@example.com",
    requestedByName: "Admin User",
    date: new Date(),
    status: "released",
  },
];

const seed = async () => {
  try {
    console.log("🌱 Starting PayslipHistory seeding...\n");
    console.log(`📡 Connecting to: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`   Database: ${process.env.DB_NAME}\n`);
    
    await sequelize.authenticate();
    console.log("✅ Database connected\n");
    
    console.log("📝 Inserting records...");
    for (const payslip of paysliphistoriesSeeder) {
      await PayslipHistory.create(payslip);
      console.log(`   ✓ Created payslip history for ${payslip.name} (${payslip.ecode})`);
    }
    
    console.log(`\n✅ Seeded ${paysliphistoriesSeeder.length} records successfully!\n`);
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Seeder Error:", err.name);
    console.error("Error message:", err.message);
    console.error("\nFull error:");
    console.error(err);
    await sequelize.close();
    process.exit(1);
  }
};

seed();