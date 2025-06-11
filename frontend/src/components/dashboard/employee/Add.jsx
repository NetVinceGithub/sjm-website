import React, { useEffect, useState } from "react";
import { fetchDepartments, fetchProjects } from "../../../utils/EmployeeHelper";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Add = () => {
  const [projects, setProjects] = useState([])
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    email: "",
    mobileNo: "",
    dob: "",
    gender: "",
    employeeId: "",
    maritalStatus: "",
    designation: "",
    project:"",
    sss: "",
    tin: "",
    philHealth: "",
    pagibig: "",
    bankAccount:"",
    nameOfContact: "",
    addressOfContact: "",
    numberOfContact: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [signature, setSignature] = useState(null);
  const [loading, setLoading] = useState(false);



  useEffect(()=>{
    const fetchData = async () => {
      try{
        const projectsData = await fetchProjects();
        setProjects(projectsData);
      } catch (error){
        console.error("Error fetching projects:", error);
        alert("Failed to load projects")
      };
    };
    fetchData();
  })

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      const file = files[0];
      const validTypes = ["image/jpeg", "image/png"];
      if (!validTypes.includes(file.type)) {
        alert("Invalid file type. Please upload a JPEG or PNG image.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB.");
        return;
      }
  
      const reader = new FileReader();
      reader.onload = () => {
        if (name === "profileImage") {
          setProfileImage(file);  // Store the raw file object (not the Base64)
        } else if (name === "signature") {
          setSignature(file);  // Store the raw file object (not the Base64)
        }
      };
      reader.readAsDataURL(file);  // You can also use reader.readAsArrayBuffer(file) if you prefer to get the raw buffer
    }
  };
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    // Ensure both files are selected
    if (!profileImage || !signature) {
      alert("Both profile image and signature are required.");
      setLoading(false);
      return;
    }
  
    const formDataToSend = new FormData();
  
    // Append form fields
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });
  
    // Append files
    formDataToSend.append("profileImage", profileImage);
    formDataToSend.append("signature", signature);
  
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/employee/add`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      if (response.data.success) {
        navigate("/admin-dashboard/employees");
      } else {
        alert(response.data.error || "Failed to add employee.");
      }
    } catch (error) {
      console.error("Error adding employee:", error.response?.data || error);
      alert("An error occurred while adding the employee.");
    } finally {
      setLoading(false);
    }
  };
  
  
  
  const renderProfileImage = (row) => {
    if (!row.profileImage) return "No Image";
  
    const imageUrl = `${import.meta.env.VITE_API_URL}/uploads/${row.profileImage}`;
  
    return (
      <img
        src={imageUrl}
        alt="Profile"
        className="w-12 h-12 rounded-full border object-cover"
        onError={(e) => {
          e.target.src = "/default-profile.png"; // Fallback image
        }}
      />
    );
  };
  
  
  
  

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md">
      <h2 className="text-2xl font-bold mb-6">Add New Employee</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              onChange={handleChange}
              placeholder="Insert Name"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              name="address"
              onChange={handleChange}
              placeholder="Insert Address"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              placeholder="Insert Email"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
            <input
              type="text"
              name="mobileNo"
              onChange={handleChange}
              placeholder="Insert Mobile Number"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              type="date"
              name="dob"
              onChange={handleChange}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              name="gender"
              onChange={handleChange}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Employee ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Employee ID</label>
            <input
              type="text"
              name="employeeId"
              onChange={handleChange}
              placeholder="Insert Employee ID"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Marital Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Marital Status</label>
            <select
              name="maritalStatus"
              onChange={handleChange}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
            </select>
          </div>

          {/* Designation */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Designation</label>
            <input
              type="text"
              name="designation"
              onChange={handleChange}
              placeholder="Insert Designation"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>


          
          {/* Projects */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Assign Project</label>
            <select
              name="project"
              onChange={handleChange}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Project</option>
              {projects.map((proj) => (
                <option key={proj._id} value={proj._id}>
                  {proj.projectName}
                </option>
              ))}
            </select>
          </div>

          {/* SSS */}
          <div>
            <label className="block text-sm font-medium text-gray-700">SSS</label>
            <input
              type="text"
              name="sss"
              onChange={handleChange}
              placeholder="Insert SSS"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* TIN */}
          <div>
            <label className="block text-sm font-medium text-gray-700">TIN</label>
            <input
              type="text"
              name="tin"
              onChange={handleChange}
              placeholder="Insert TIN"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* PhilHealth */}
          <div>
            <label className="block text-sm font-medium text-gray-700">PhilHealth</label>
            <input
              type="text"
              name="philHealth"
              onChange={handleChange}
              placeholder="Insert PhilHealth"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Pagibig */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Pagibig</label>
            <input
              type="text"
              name="pagibig"
              onChange={handleChange}
              placeholder="Insert Pagibig"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Bank account */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Bank Account</label>
            <input
              type="text"
              name="bankAccount"
              onChange={handleChange}
              placeholder="Insert Bank Account"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Name of Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Name of Contact</label>
            <input
              type="text"
              name="nameOfContact"
              onChange={handleChange}
              placeholder="Insert Name of Contact"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Address of Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Address of Contact</label>
            <input
              type="text"
              name="addressOfContact"
              onChange={handleChange}
              placeholder="Insert Address of Contact"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Number of Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Number of Contact</label>
            <input
              type="text"
              name="numberOfContact"
              onChange={handleChange}
              placeholder="Insert Number of Contact"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Profile Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Profile Image</label>
            <input
              type="file"
              name="profileImage"
              onChange={handleFileChange}
              accept="image/*"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            />
          </div>

          {/* Signature Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Signature</label>
            <input
              type="file"
              name="signature"
              onChange={handleFileChange}
              accept="image/*"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md"
        >
          {loading ? "Saving..." : "Add Employee"}
        </button>
      </form>
    </div>
  );
};

export default Add;
