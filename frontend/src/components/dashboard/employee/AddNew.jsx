import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component"; // Import Data Table
import Breadcrumb from "../dashboard/Breadcrumb";
import { fetchProjects } from "../../../utils/EmployeeHelper";
import axios from "axios";
import { FaUserPlus, FaSearch } from "react-icons/fa";
import { FaPrint, FaRegFileExcel, FaRegFilePdf } from "react-icons/fa6";

const AddNew = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submittedEmployees, setSubmittedEmployees] = useState([]); // Store submitted employees
  const [searchTerm, setSearchTerm] = useState(""); // Search input state

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
    project: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsData = await fetchProjects();
        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching projects:", error);
        alert("Failed to load projects");
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/employee/add", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        setSubmittedEmployees([...submittedEmployees, formData]); // Add new entry to table
        setFormData({
          name: "",
          address: "",
          email: "",
          mobileNo: "",
          dob: "",
          gender: "",
          employeeId: "",
          maritalStatus: "",
          designation: "",
          project: "",
        });
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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter employees based on search input
  const filteredEmployees = submittedEmployees.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: "Designation",
      selector: (row) => row.designation,
      sortable: true,
    },
    {
      name: "Project",
      selector: (row) => projects.find((p) => p._id === row.project)?.projectName || "N/A",
      sortable: true,
    },
  ];

  return (
    <div className="fixed p-6 pt-16">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: "Employee", href: "" },
          { label: "Masterlist", href: "/admin-dashboard/employees" },
          { label: "Add Employee", href: "" },
        ]}
      />
      <div className="flex gap-6 -mt-2">
        {/* Left Side - Employee Form */}
        <div className="w-[50%]">
          <div className="w-[606px] mx-auto bg-white p-3 rounded-md shadow-md">
            <h2 className="text-[1.2rem] text-neutralDGray font-bold mb-3 flex items-center gap-2">
              <FaUserPlus className="h-6 w-6" /> Add Employee
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 -space-y-1">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Insert Name"
                    className="m-0 text-sm p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Insert Address"
                    className="m-0 text-sm p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Insert Email"
                      className="m-0 text-sm p-2 block w-full border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="text"
                      name="mobileNo"
                      value={formData.mobileNo}
                      onChange={handleChange}
                      placeholder="Insert Phone Number"
                      className="m-0 text-sm p-2 block w-full border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Designation</label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      placeholder="Insert Designation"
                      className="m-0 text-sm p-2 block w-full border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  {/* Assign Project */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Project</label>
                    <select
                      name="project"
                      value={formData.project}
                      onChange={handleChange}
                      className="m-0 text-sm p-2 block w-full border border-gray-300 rounded-md"
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="m-0 text-sm  p-2 block w-full border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Civil Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Civil Status</label>
                    <select
                      name="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={handleChange}
                      className="m-0 text-sm  p-2 block w-full border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select Civil Status</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="widowed">Widowed</option>
                      <option value="divorced">Divorced</option>
                      <option value="separated">Separated</option>
                    </select>
                  </div>
                </div>
                {/* Date Hired */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date Hired</label>
                  <input
                    type="date"
                    name="dateHired"
                    value={formData.dateHired}
                    onChange={handleChange}
                    className="m-0 p-2 block w-full border text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>

              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-3 h-10 bg-brandPrimary hover:bg-neutralDGray text-white py-2 px-4 rounded-md"
              >
                {loading ? "Saving..." : "Add Employee"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side - Data Table with Search */}
        <div className="w-[50%]">
          <div className="bg-white w-[606px] p-4 rounded-md shadow-md">
            <h2 className="text-[1.2rem] text-neutralDGray font-bold mb-4">New Employee List</h2>
              <div className="flex item justify-between">
                <div className="inline-flex border border-neutralDGray rounded h-7 mb-4">
                  <button className="px-3 w-20 h-full border-r hover:bg-neutralSilver transition-all duration-300 border-neutralDGray rounded-l flex items-center justify-center">
                    <FaPrint title="Print" className="text-neutralDGray" />
                  </button>
                  <button className="px-3 w-20 h-full border-r hover:bg-neutralSilver transition-all duration-300 border-neutralDGray flex items-center justify-center">
                    <FaRegFileExcel title="Export to Excel" className="text-neutralDGray" />
                  </button>
                  <button className="px-3 w-20 h-full hover:bg-neutralSilver transition-all duration-300 rounded-r flex items-center justify-center">
                    <FaRegFilePdf title="Export to PDF" className="text-neutralDGray" />
                  </button>
                </div>

                {/* Search Input */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex rounded items-center border border-gray-300 px-2">
                    <input
                      type="text"
                      placeholder="Search Employee"
                      onChange={handleSearch}
                      value={searchTerm}
                      className="px-2 py-1 border-none outline-none w-full"
                    />
                    <FaSearch className="ml-[-20px] text-neutralDGray" />
                  </div>
                </div>
              </div>

            {/* React Data Table */}
            <DataTable
              columns={columns}
              data={filteredEmployees} // Use filtered data
              pagination
              highlightOnHover
              striped
              responsive
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNew;
