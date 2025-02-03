import mongoose, { Schema } from "mongoose";

const benefitsSchema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
  sss: { type: String, default: "" },
  philHealth: { type: String, default: "" },
  pagibig: { type: String, default: "" },
});

const Benefits = mongoose.model("Benefits", benefitsSchema);
export default Benefits;
