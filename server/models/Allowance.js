import mongoose, { Schema } from "mongoose";

const allowanceSchema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
  amount: { type: Number, required: true },
});

const Allowance = mongoose.model("Allowance", allowanceSchema);
export default Allowance;
