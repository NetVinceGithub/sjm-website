import mongoose, { Schema } from "mongoose";

const loanSchema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
  amount: { type: Number, required: true },
  
});

const Loan = mongoose.model("Loan", loanSchema);
export default Loan;
