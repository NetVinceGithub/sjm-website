import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    projectName: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });
  
const Project = mongoose.model('Project', projectSchema);
export default Project;
  