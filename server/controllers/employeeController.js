import path from 'path';
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import multer from "multer";
import Department from "../models/Department.js";

const storage = multer.memoryStorage(); // Use memory storage to read the file as buffer

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(file.originalname.toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb("Error: Images Only!");
    }
  },
  limits: { fileSize: 1024 * 1024 * 5 } // Set file size limit to 5MB
});

export const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'signature', maxCount: 1 }
]);

const addEmployee = async (req, res) => {
  try {
    const {
      name,
      address,
      email,
      mobileNo,
      dob,
      gender,
      employeeId,
      maritalStatus,
      designation,
      department,
      sss,
      tin,
      philHealth,
      pagibig,
      nameOfContact,
      addressOfContact,
      numberOfContact
    } = req.body;

    const profileImage = req.files['image'] ? req.files['image'][0].buffer : null;    
    const signature = req.files['signature'] ? req.files['signature'][0].buffer : null;    

    const newEmployee = new Employee({
      name,
      address,
      email,
      mobileNo,
      dob,
      gender,
      employeeId,
      maritalStatus,
      designation,
      department,
      sss,
      tin,
      philHealth,
      pagibig,
      nameOfContact,
      addressOfContact,
      numberOfContact,
      profileImage, 
      signature
      
    });

    await newEmployee.save();
 
    return res.status(200).json({ success: true, message: "Employee created" });
  } catch (error) {
    console.error("Server error in adding employee:", error);
    return res.status(500).json({ success: false, error: "Server error in adding employee" });
  }
};

const getEmployee = async (req, res) => {
  try {  
    const employee = await Employee.findById(req.params.id).populate("department", "dep_name");

    return res.status(200).json({ success: true, employee }); 
  } catch (error) {
    return res.status(500).json({ success: false, error: "get employees server error" });
  }
}

const getEmployees = async (req, res) => {
  try {  
    const employees = await Employee.find().populate("department", "dep_name"); // Only return dep_name
    return res.status(200).json({ success: true, employees }); 
  } catch (error) {
    return res.status(500).json({ success: false, error: "get employees server error" });
  }
};

const getEmployeeImage = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee || !employee.profileImage) {
      return res.status(404).json({ success: false, error: 'Image not found' });
    }

    // Send the image binary data as a response
    res.set('Content-Type', 'image/png'); // or 'image/jpeg' depending on your image type
    return res.send(Buffer.from(employee.profileImage.data));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Error fetching image' });
  }
};






const fetchEmployeesByDepId = async (req, res) => {
  const { id } = req.params;
  try {
    const employees = await Employee.find({ department: id }).populate('userId', { password: 0 });
    return res.status(200).json({ success: true, employees });
  } catch (error) {
    console.error("Server error in fetching employees by department ID:", error); // Added detailed error message
    return res.status(500).json({ success: false, error: "Server error in fetching employees by department ID" });
  }
};

const updateEmployee = async (req, res) =>{
  try{
    const { id } = req.params;
    const {
      name,
      address,
      email,
      mobileNo,
      dob,
      gender,
      employeeId,
      maritalStatus,
      designation,
      department,
      sss,
      tin,
      philHealth,
      pagibig,
      nameOfContact,
      addressOfContact,
      numberOfContact,
    } = req.body;

    const updateEmp = await Employee.findByIdAndUpdate(
      id, // Provide the ID directly
      {
        name,
        address,
        email,
        mobileNo,
        dob,
        gender,
        employeeId,
        maritalStatus,
        designation,
        department,
        sss,
        tin,
        philHealth,
        pagibig,
        nameOfContact,
        addressOfContact,
        numberOfContact,
      },
      { new: true } // Option to return the updated document
    );
    
    if (!updateEmp) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    return res.status(200).json({ success: true, updateEmp });
  } catch (error) {
    console.error("Error updating employee:", error); // Log the error for debugging
    return res.status(500).json({ success: false, error: "Server error in updating employee" });
  }
};

   
export { addEmployee, upload, getEmployees, getEmployee, updateEmployee, fetchEmployeesByDepId, getEmployeeImage };
