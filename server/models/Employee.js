import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const employeeSchema = new Schema({

  name:{type:String, required:true},
  address:{type:String, required:true},
  email:{type:String, required:true},
  mobileNo:{type:String, required:true},
  dob:{type: Date},
  gender:{type:String},
  employeeId:{type: String, required: true, unique: true}, 
  maritalStatus:{type:String}, 
  designation:{type:String}, 
  department:{type: Schema.Types.ObjectId, ref:"Department", required:true }, 
  sss:{type:String},
  tin:{type:String},
  philHealth:{type:String},
  pagibig:{type:String},
  profileImage: { type: Buffer }, // Field to store the image data 
  signature: { type: Buffer }, // Field to store the signature data 
  nameOfContact:{type: String}, 
  addressOfContact:{type: String}, 
  numberOfContact:{type: String}, 
  createdAt: {type: Date, default: Date.now}, 
  updatedAt: {type: Date, default: Date.now}, 
   
});

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;