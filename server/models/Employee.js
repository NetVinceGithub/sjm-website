import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const EmployeeSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true, default: () => `EMP-${uuidv4()}` },
  name: { type: String, required: true },
  department: { type: String },
  ecode: { type: String, unique: true } // ✅ Add this if "ecode" is required
});

// Ensure `employeeId` is set before saving
EmployeeSchema.pre("save", function (next) {
  if (!this.employeeId) {
    this.employeeId = `EMP-${uuidv4()}`;
  }
  next();
});

const Employee = mongoose.model("Employee", EmployeeSchema);
export default Employee;
