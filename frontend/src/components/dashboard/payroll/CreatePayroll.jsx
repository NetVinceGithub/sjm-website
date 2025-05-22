import React, { useEffect, useState } from "react";
import { EmployeeButtons } from "../../../utils/EmployeeHelper";
import DataTable from "react-data-table-component";
import axios from "axios";
import { Link } from "react-router-dom";
import { PayrollButtons } from "../../../utils/PayrollHelper";

const CreatePayroll = () => {
  const [employees, setEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [filteredEmployee, setFilteredEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      setEmpLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/employee`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.data.success) {
          const data = response.data.employees.map((emp) => ({
            ...emp,
            profileImage: emp.profileImage
              ? `${emp.profileImage}` // Use the full URL provided by the backend
              : `${import.meta.env.VITE_API_URL}/uploads/default-profile.png`, // Default profile image
            action: <PayrollButtons Id={emp._id} />, // Add action buttons
          }));

          setEmployees(data);
          setFilteredEmployees(data);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setEmpLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleFilter = (e) => {
    const records = employees.filter((emp) =>
      emp.name.toLowerCase().includes(e.target.value.toLowerCase())
    );

    setFilteredEmployees(records);
  };

  const renderProfileImage = (row) => {
    return (
      <div className="flex justify-center items-center">
        <img
          src={row.profileImage}
          alt="Profile"
          className="w-12 h-12 rounded-full border object-cover"
          onError={(e) => {
            e.target.src = `${import.meta.env.VITE_API_URL}/uploads/default-profile.png`; // Fallback image
          }}
        />
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold">Create Payroll</h3>
      </div>
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search by Name"
          onChange={handleFilter}
          className="px-4 py-0.5 border"
        />
        
      </div>
      <div className="mt-6">
        <DataTable
          columns={[
            {
              name: "Profile Image",
              cell: renderProfileImage,
              sortable: false,
            },
            {
              name: "Name",
              selector: (row) => row.name,
              sortable: true,
            },
            {
              name: "ID",
              selector: (row) => row.ecode || row._id,
              sortable: false,
            },
            {
              name: "Email",
              selector: (row) => row.emailaddress,
              sortable: true,
            },
            {
              name: "Project",
              selector: (row) => row.area || "No Project",
              sortable: true,
            },
            {
              name: "Action",
              selector: (row) => row.action,
              sortable: true,
            },
          ]}
          data={filteredEmployee}
          
          progressPending={empLoading}
        />
      </div>
    </div>
  );
};

export default CreatePayroll;
