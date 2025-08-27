import React, { useEffect, useState } from "react";
import { fetchDepartments, fetchProjects } from "../../../utils/EmployeeHelper";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import Breadcrumb from "../dashboard/Breadcrumb";
import { FaAngleLeft } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const Edit = () => {
  const [employee, setEmployee] = useState({
    ecode: "",
    last_name: "",
    first_name: "",
    middle_name: "",
    name: "",
    gender: "",
    civil_status: "",
    birthdate: "",
    age: "",
    current_address: "",
    permanent_address: "",
    contact_no: "",
    email_address: "",
    position_title: "",
    project: "",
    department: "",
    area_section: "", // Add this
    employment_rank: "",
    date_of_hire: "",
    date_of_separation: "", // Add this
    employment_classification: "",
    sss: "",
    tin: "",
    phil_health: "",
    pag_ibig: "",
    government_id_type: "",
    government_id_number: "",
    emergency_contact_name: "",
    emergency_contact_number: "",
    emergency_contact_address: "",
    daily_rate: "",
    salary_package: "",
    profile_image: null,
    esignature: null,
  });

  const [projects, setProjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  const arrayBufferToBase64 = (buffer) => {
    const binary = new Uint8Array(buffer).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ""
    );
    return window.btoa(binary);
  };

  // Format date for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    return dayjs(dateString).format("YYYY-MM-DD");
  };

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await apiClient.get(`/api/employee/${id}`);
        console.log("Employee API Response:", response.data);
  
        if (response.data.success && response.data.employee) { // Change from 'employees' to 'employee'
          const employeeData = response.data.employee; // Access directly, no [0]
          
          setEmployee({
            ecode: employeeData.ecode || "",
            last_name: employeeData.last_name || "",
            first_name: employeeData.first_name || "",
            middle_name: employeeData.middle_name || "",
            name: employeeData.complete_name || employeeData.name || "", // Note: API uses 'complete_name'
            gender: employeeData.gender || "",
            civil_status: employeeData.civil_status || "",
            birthdate: formatDateForInput(employeeData.birthdate),
            age: employeeData.age || "",
            current_address: employeeData.current_address || "",
            permanent_address: employeeData.permanent_address || "",
            contact_no: employeeData.contact_no || "",
            email_address: employeeData.email_address || "",
            position_title: employeeData.position_title || "",
            project: employeeData.project || "",
            department: employeeData.department || "",
            area_section: employeeData.area_section || employeeData["area/section"] || "", // Add this
            employment_rank: employeeData.employment_rank || "",
            date_of_hire: formatDateForInput(employeeData.date_of_hire),
            date_of_separation: formatDateForInput(employeeData.date_of_separation || employeeData.dateofseparation), // Add this
            employment_classification: employeeData.employment_classification || "",
            sss: employeeData.sss || "",
            tin: employeeData.tin || "",
            phil_health: employeeData.phil_health || "",
            pag_ibig: employeeData.pag_ibig || "",
            government_id_type: employeeData.government_id_type || "",
            government_id_number: employeeData.government_id_number || "",
            emergency_contact_name: employeeData.emergency_contact_name || "",
            emergency_contact_number: employeeData.emergency_contact_number || "",
            emergency_contact_address: employeeData.emergency_contact_address || "",
            daily_rate: employeeData.daily_rate || "",
            salary_package: employeeData.salary_package || "",
            profile_image: null,
            esignature: null,
          });
        } else {
          console.error("Error fetching employee: Invalid response structure", response.data);
          alert("Failed to load employee data. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching employee:", error);
        // ... existing error handling
      }
    };
  
    if (id) {
      fetchEmployee();
    }
  }, [id]);

 

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "birthdate" && value) {
      // Auto-calculate age when birthdate changes
      const today = dayjs();
      const birthDate = dayjs(value);
      const age = today.diff(birthDate, "year");

      setEmployee((prev) => ({
        ...prev,
        [name]: value,
        age: age.toString(),
      }));
    } else {
      setEmployee((prev) => ({
        ...prev,
        [name]: files && files.length > 0 ? files[0] : value,
      }));
    }

    // Update complete name when first, middle, or last name changes
    if (
      name === "first_name" ||
      name === "middle_name" ||
      name === "last_name"
    ) {
      setEmployee((prev) => {
        const firstName = name === "first_name" ? value : prev.first_name;
        const middleName = name === "middle_name" ? value : prev.middle_name;
        const lastName = name === "last_name" ? value : prev.last_name;

        const middleInitial = middleName ? `${middleName.charAt(0)}.` : "";
        const completeName = `${firstName} ${middleInitial} ${lastName}`
          .trim()
          .replace(/\s+/g, " ");

        return {
          ...prev,
          [name]: value,
          name: completeName,
        };
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(employee).forEach((key) => {
      if (employee[key] instanceof File) {
        formData.append(key, employee[key]);
      } else {
        formData.append(key, employee[key]);
      }
    });

    // Debugging: Check FormData contents
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
      // In handleSubmit function, change this line:
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/employee/update-details/${id}`, // Add 'update-details'
        formData,
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
        console.error("Error updating employee:", response.data.error);
        alert(response.data.error || "Failed to update employee.");
      }
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
      alert(error.response?.data?.error || "Failed to update employee.");
    }
  };

  return (
    <div className="right-0 bottom-0 min-h-screen w-full bg-neutralSilver p-3 pt-16">
      <Breadcrumb
        items={[
          { label: "Employee" },
          { label: "Masterlist", href: "/admin-dashboard/employees" },
          {
            label: "Add New Employee",
            href: "/admin-dashboard/employees/add-employee",
          },
          {
            label: "Edit Employee",
          },
        ]}
      />
      <div
        className="bg-white p-3 rounded-lg border-t-4 shadow-md mb-2 -mt-2 h-20"
        style={{ borderTopColor: "#974364" }}
      >
        <h2
          className="text-sm font-medium cursor-pointer hover:text-red-500 text-neutralDGray mb-2 flex items-center gap-2"
          title="Back to Masterlist"
          onClick={() => navigate("/admin-dashboard/employees")}
        >
          <FaAngleLeft className="h-5 w-5" /> Edit Employee
        </h2>
        <p className="text-neutralDGray text-xs">
          Update the employee details below. Make sure all information is
          correct before confirming the changes.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Personal Information */}
        <div className="bg-white p-3 rounded-lg shadow-md mb-2">
          <div className="bg-red-50 px-2 rounded">
            <h3 className="text-sm text-neutralDGray mb-3 flex items-center gap-2">
              Personal Information
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Ecode<span className="text-red-500">*</span>
              </label>
              <input
                name="ecode"
                value={employee.ecode}
                disabled
                className="w-full p-2 border text-xs border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Last Name<span className="text-red-500">*</span>
              </label>
              <input
                name="last_name"
                value={employee.last_name}
                onChange={handleChange}
                className="w-full p-2 border text-xs rounded-md border-gray-300"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                First Name<span className="text-red-500">*</span>
              </label>
              <input
                name="first_name"
                value={employee.first_name}
                onChange={handleChange}
                className="w-full p-2 border text-xs rounded-md border-gray-300"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Middle Name <span className="italic"> (Optional)</span>
              </label>
              <input
                name="middle_name"
                value={employee.middle_name}
                onChange={handleChange}
                className="w-full p-2 border text-xs rounded-md border-gray-300"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Complete Name<span className="text-red-500">*</span>
              </label>
              <input
                value={employee.name}
                className="w-full p-2 border text-xs border-gray-300 rounded-md bg-gray-100"
                disabled
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Gender<span className="text-red-500">*</span>
              </label>
              <select
                required
                name="gender"
                value={employee.gender}
                onChange={handleChange}
                className="w-full p-2 border text-xs rounded-md border-gray-300"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Civil Status<span className="text-red-500">*</span>
              </label>
              <select
                required
                name="civil_status"
                value={employee.civil_status}
                onChange={handleChange}
                className="w-full p-2 border text-xs rounded-md border-gray-300"
              >
                <option value="">Select</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="widowed">Widowed</option>
                <option value="separated">Separated</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Birthdate<span className="text-red-500">*</span>
              </label>
              <input
                name="birthdate"
                type="date"
                value={employee.birthdate}
                onChange={handleChange}
                className="w-full p-2 border text-xs rounded-md border-gray-300"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Age<span className="text-red-500">*</span>
              </label>
              <input
                name="age"
                value={employee.age}
                onChange={handleChange}
                className="w-full p-2 border text-xs rounded-md border-gray-300 bg-gray-100"
                disabled
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Contact Number<span className="text-red-500">*</span>
              </label>
              <input
                name="contact_no"
                type="tel"
                value={employee.contact_no}
                onChange={handleChange}
                className="w-full p-2 border text-xs rounded-md border-gray-300"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Email Address<span className="text-red-500">*</span>
              </label>
              <input
                name="email_address"
                type="email"
                value={employee.email_address}
                onChange={handleChange}
                className="w-full p-2 border text-xs rounded-md border-gray-300"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Current Address<span className="text-red-500">*</span>
              </label>
              <input
                name="current_address"
                value={employee.current_address}
                onChange={handleChange}
                className="w-full p-2 border text-xs rounded-md border-gray-300"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Permanent Address<span className="text-red-500">*</span>
              </label>
              <input
                name="permanent_address"
                value={employee.permanent_address}
                onChange={handleChange}
                className="w-full p-2 border text-xs rounded-md border-gray-300"
                required
              />
            </div>
          </div>
        </div>

        {/* Employment Information */}
        <div className="bg-white p-3 rounded-lg shadow-md mb-2">
          <div className="bg-red-50 px-2 rounded">
            <h3 className="text-sm text-neutralDGray mb-3 flex items-center gap-2">
              Employment Information
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Position Title<span className="text-red-500">*</span>
              </label>
              <input
                name="position_title"
                value={employee.position_title}
                onChange={handleChange}
                className="w-full p-2 border text-xs rounded-md border-gray-300"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Project<span className="text-red-500">*</span>
              </label>
              <input
                name="project"
                value={employee.project}
                onChange={handleChange}
                className="w-full p-2 border text-xs rounded-md border-gray-300"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Department<span className="text-red-500">*</span>
              </label>
              <input
                name="department"
                value={employee.department}
                onChange={handleChange}
                className="w-full p-2 border text-xs rounded-md border-gray-300"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Area/Section<span className="text-red-500">*</span>
              </label>
              <input
                name="area_section"
                value={employee.area_section}
                onChange={handleChange}
                className="w-full p-2 border text-xs rounded-md border-gray-300"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Employment Rank<span className="text-red-500">*</span>
              </label>
              <select
                name="employment_rank"
                value={employee.employment_rank}
                onChange={handleChange}
                className="w-full p-2 border text-xs rounded-md border-gray-300"
                required
              >
                <option value="">Select Rank</option>
                <option value="rank-and-file">Rank and File</option>
                <option value="supervisory">Supervisory</option>
                <option value="managerial">Managerial Staff</option>
                <option value="managerial">Managerial</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Employment Classification<span className="text-red-500">*</span>
              </label>
              <input
                name="employment_classification"
                value={employee.employment_classification}
                onChange={handleChange}
                className="w-full p-2 border text-xs rounded-md border-gray-300"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Date of Hire<span className="text-red-500">*</span>
              </label>
              <input
                name="date_of_hire"
                type="date"
                value={employee.date_of_hire}
                onChange={handleChange}
                className="w-full p-2 border text-xs rounded-md border-gray-300"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Date of Separation<span className="text-red-500">*</span>
              </label>
              <input
                name="date_of_separation"
                type="date"
                value={employee.date_of_separation}
                onChange={handleChange}
                className="w-full p-2 border text-xs rounded-md border-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Government Information */}
        <div className="bg-white p-3 rounded-lg shadow-md mb-2">
          <div className="bg-red-50 px-2 rounded">
            <h3 className="text-sm text-neutralDGray mb-3 flex items-center gap-2">
              Government ID Information
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                TIN Number
              </label>
              <input
                name="tin"
                value={employee.tin}
                onChange={handleChange}
                className="w-full p-2 border text-xs rounded-md border-gray-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                ID Type
              </label>
              <input
                name="government_id_type"
                value={employee.government_id_type}
                onChange={handleChange}
                className="w-full p-2 border text-xs rounded-md border-gray-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                ID Number
              </label>
              <input
                name="government_id_number"
                value={employee.government_id_number}
                onChange={handleChange}
                className="w-full p-2 border text-xs rounded-md border-gray-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Government ID
              </label>
              <input
                name="government_id_number"
                value={employee.government_id_number}
                onChange={handleChange}
                className="w-full p-2 border text-xs rounded-md border-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Mandatory benefits */}
        <div className="bg-white p-3 rounded-lg shadow-md mb-2">
          <div className="bg-red-50 px-2 rounded">
            <h3 className="text-sm text-neutralDGray mb-3 flex items-center gap-2">
              Government Benefits Section
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                SSS Number
              </label>
              <input
                name="sss"
                value={employee.sss}
                onChange={handleChange}
                className="w-full p-2 border text-xs rounded-md border-gray-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                PhilHealth Number
              </label>
              <input
                name="phil_health"
                value={employee.phil_health}
                onChange={handleChange}
                className="w-full p-2 border text-xs rounded-md border-gray-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Pag-IBIG Number
              </label>
              <input
                name="pag_ibig"
                value={employee.pag_ibig}
                onChange={handleChange}
                className="w-full p-2 border text-xs rounded-md border-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact Information */}
        <div className="bg-white p-3 rounded-lg shadow-md mb-2">
          <div className="bg-red-50 px-2 rounded">
            <h3 className="text-sm text-neutralDGray mb-3 flex items-center gap-2">
              Emergency Contact Information
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Emergency Contact Name
              </label>
              <input
                name="emergency_contact_name"
                value={employee.emergency_contact_name}
                onChange={handleChange}
                className="w-full p-2 border text-xs rounded-md border-gray-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Emergency Contact Number
              </label>
              <input
                name="emergency_contact_number"
                type="tel"
                value={employee.emergency_contact_number}
                onChange={handleChange}
                className="w-full p-2 border text-xs rounded-md border-gray-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutralDGray mb-1">
                Emergency Contact Address
              </label>
              <input
                name="emergency_contact_address"
                value={employee.emergency_contact_address}
                onChange={handleChange}
                className="w-full p-2 border text-xs rounded-md border-gray-300"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-10 bg-[#974364] hover:bg-[#5f263d] disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
        >
          Update Employee
        </button>
      </form>
    </div>
  );
};

export default Edit;
