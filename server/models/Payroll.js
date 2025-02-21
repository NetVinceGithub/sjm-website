import mongoose from "mongoose";

const PayrollSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  basicPay: { type: Number, required: true },
  holidayPay: { type: Number, required: true },
  allowance: { type: Number, required: true }
});

const Payroll = mongoose.model("Payroll", PayrollSchema);
export default Payroll;
