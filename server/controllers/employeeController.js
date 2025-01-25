import multer from "multer";
import Employee from "../models/Employee.js";
import path from "path";
import fs from "fs";

// Configure multer for file storage in 'uploads' folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true }); // Ensure the directory exists
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const validTypes = ['image/jpeg', 'image/png'];
    if (validTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});


export const uploadFields = upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "signature", maxCount: 1 },
]);

// Add Employee API
export const addEmployee = async (req, res) => {
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
      project,
      sss,
      tin,
      philHealth,
      pagibig,
      bankAccount,
      nameOfContact,
      addressOfContact,
      numberOfContact,
    } = req.body;

    const profileImage = req.files?.profileImage?.[0]?.filename || null;
    const signature = req.files?.signature?.[0]?.filename || null;

    if (!profileImage || !signature) {
      return res.status(400).json({ success: false, error: "Both profile image and signature are required." });
    }

    // Create a new employee record
    const newEmployee = new Employee({
      name,
      address,
      email,
      mobileNo,
      dob: new Date(dob),
      gender,
      employeeId,
      maritalStatus,
      designation,
      project,
      sss,
      tin,
      philHealth,
      pagibig,
      bankAccount,
      nameOfContact,
      addressOfContact,
      numberOfContact,
      profileImage, // Store the file name (path for later retrieval)
      signature,
    });

    await newEmployee.save();
    res.status(201).json({ success: true, message: "Employee added successfully." });
  } catch (error) {
    console.error("Error adding employee:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Fetch Employee API (with file URLs)
export const getEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee not found" });
    }

    // Construct full URLs for the profile image and signature
    const profileImageUrl = employee.profileImage
      ? `${req.protocol}://${req.get("host")}/uploads/${employee.profileImage}`
      : null;

    const signatureUrl = employee.signature
      ? `${req.protocol}://${req.get("host")}/uploads/${employee.signature}`
      : null;

    const employeeData = {
      ...employee.toObject(), // Convert MongoDB document to a plain object
      profileImage: profileImageUrl, // Include the full URL
      signature: signatureUrl, // Include the full URL
    };

    res.status(200).json({ success: true, employee: employeeData });
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


// Fetch all employees (with image URLs)
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().populate("project").exec();

    const employeesWithUrls = employees.map((emp) => ({
      ...emp.toObject(),
      profileImage: emp.profileImage
        ? `${req.protocol}://${req.get("host")}/uploads/${emp.profileImage}`
        : null, // Default to null if no image
    }));
    
    

    res.status(200).json({ success: true, employees: employeesWithUrls });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


export const updateEmployee = async (req, res) => {
  try {
    console.log("Uploaded files:", req.files);
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
      project,
      sss,
      tin,
      philHealth,
      pagibig,
      bankAccount,
      nameOfContact,
      addressOfContact,
      numberOfContact,
    } = req.body;

    // Extract files from `req.files`
    const profileImage = req.files?.profileImage?.[0]?.filename || null;
    const signature = req.files?.signature?.[0]?.filename || null;

    // Find the employee by ID
    const { id } = req.params;
    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee not found." });
    }

    // Remove old files if new files are uploaded
    if (profileImage && employee.profileImage) {
      fs.unlinkSync(path.join("uploads", employee.profileImage));
    }

    if (signature && employee.signature) {
      fs.unlinkSync(path.join("uploads", employee.signature));
    }

    // Update the employee fields
    employee.name = name || employee.name;
    employee.address = address || employee.address;
    employee.email = email || employee.email;
    employee.mobileNo = mobileNo || employee.mobileNo;
    employee.dob = dob ? new Date(dob) : employee.dob;
    employee.gender = gender || employee.gender;
    employee.employeeId = employeeId || employee.employeeId;
    employee.maritalStatus = maritalStatus || employee.maritalStatus;
    employee.designation = designation || employee.designation;
    employee.project = project || employee.project;
    employee.sss = sss || employee.sss;
    employee.tin = tin || employee.tin;
    employee.philHealth = philHealth || employee.philHealth;
    employee.pagibig = pagibig || employee.pagibig;
    employee.bankAccount = bankAccount || employee.bankAccount;
    employee.nameOfContact = nameOfContact || employee.nameOfContact;
    employee.addressOfContact = addressOfContact || employee.addressOfContact;
    employee.numberOfContact = numberOfContact || employee.numberOfContact;

    // Update files only if they are provided
    if (profileImage) employee.profileImage = profileImage;
    if (signature) employee.signature = signature;

    await employee.save();

    res.status(200).json({ success: true, message: "Employee updated successfully." });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
