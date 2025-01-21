import React, { useEffect, useState } from "react";
import { fetchDepartments } from "../../../utils/EmployeeHelper";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Add = () => {
  const [departments, setDepartments] = useState([]);
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
    department: "",
    sss: "",
    tin: "",
    philHealth: "",
    pagibig: "",
    nameOfContact: "",
    addressOfContact: "",
    numberOfContact: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [signature, setSignature] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchDepartments();
        setDepartments(data);
      } catch (err) {
        console.error("Error fetching departments:", err);
        alert("Failed to load departments.");
      }
    };
    fetchData();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle file input
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
      name === "profileImage" ? setProfileImage(file) : setSignature(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formDataObj = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataObj.append(key, formData[key]);
    });
    if (profileImage) formDataObj.append("profileImage", profileImage);
    if (signature) formDataObj.append("signature", signature);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/employee/add",
        formDataObj,
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
  

  return (
    <div className='max-w-4x1 mx-auto mt-10 bg-white p-8 rounded-md shadow-md'>
      <h2 className='text-2x1 font-bold mb-6'>Add New Employee</h2>
      <form onSubmit={handleSubmit}>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>

          {/* Name */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              Name
            </label>
            <input
              type="text"
              name="name"
              onChange={handleChange}
              placeholder='Insert Name'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Address */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              Address
            </label>
            <input
              type="text"
              name="address"
              onChange={handleChange}
              placeholder='Insert Address'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              Email
            </label>
            <input
              type="text"
              name="email"
              onChange={handleChange}
              placeholder='Insert Email'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              Mobile Number
            </label>
            <input
              type="text"
              name="mobileNo"
              onChange={handleChange}
              placeholder='Insert Mobile Number'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              onChange={handleChange}
              placeholder='Date of Birth'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Gender */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              Gender
            </label>
            <select
              name='gender'
              onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Employee ID */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              Employee ID
            </label>
            <input
              type="text"
              name="employeeId"
              onChange={handleChange}
              placeholder='Employee ID'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Marital Status */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              Marital Status
            </label>
            <select
              name='maritalStatus'
              onChange={handleChange}
              placeholder='Marital Status'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            >
              <option value="">Select Status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
            </select>
          </div>

          {/* Designation */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              Designation
            </label>
            <input
              type="text"
              name="designation"
              onChange={handleChange}
              placeholder='Designation'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Department */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              Department
            </label>
            <select
              name='department'
              onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            >
              <option value="">Select Department</option>
              {Array.isArray(departments) &&
                departments.map((dep) => (
                  <option key={dep._id} value={dep._id}>
                    {dep.dep_name}
                  </option>
                ))}
            </select>
          </div>

          {/* SSS */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              SSS
            </label>
            <input
              type="text"
              name="sss"
              onChange={handleChange}
              placeholder='SSS'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* TIN */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              TIN
            </label>
            <input
              type="text"
              name="tin"
              placeholder='TIN'
              onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Phil Health */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              Phil Health
            </label>
            <input
              type="text"
              name="philHealth"
              placeholder='Phil Health'
              onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Pag ibig */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              Pag ibig
            </label>
            <input
              type="text"
              name="pagibig"
              placeholder='Pag ibig'
              onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              Upload Image
            </label>
            <input
              type="file"
              name="profileImage"
              onChange={handleFileChange}
              placeholder='Upload Image'
              accept="image/*"
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Signature Upload */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              Upload Signature
            </label>
            <input
              type="file"
              name="signature"
              onChange={handleFileChange}
              placeholder='Upload Signature'
              accept="image/*"
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          <div>
            In case of Emergency
          </div>

          {/* Name of Contact */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              Name of Contact
            </label>
            <input
              type="text"
              name="nameOfContact"
              placeholder='Name of Contact'
              onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Address of Contact */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              Address of Contact
            </label>
            <input
              type="text"
              name="addressOfContact"
              placeholder='Address of Contact'
              onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Number of Contact */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              Number of Contact
            </label>
            <input
              type="text"
              name="numberOfContact"
              placeholder='Number of Contact'
              onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

        </div>

        <button
          type="submit"
          className='w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4'
        >
          Add Employee
        </button>
      </form>
    </div>
  );
};

export default Add;
