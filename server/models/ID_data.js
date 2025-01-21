import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const idDataSchema = new Schema({

  name:{type:String, required:true},
  position:{type:String, required:true}, 
  signature: { type: Buffer }, 
  createdAt: {type: Date, default: Date.now}, 
  updatedAt: {type: Date, default: Date.now}, 
   
});

const id_data = mongoose.model("id_data", idDataSchema);
export default id_data;