import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const View = () => {
  const [employee, setEmployee] = useState(null);
  const { id } = useParams();

  // Fetch Employee Data
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/employee/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
  
        if (response.data.success) {
          console.log("Employee data:", response.data.employee); // Debug log
          setEmployee(response.data.employee);
        } else {
          console.error("Failed to fetch employee data.");
        }
      } catch (error) {
        console.error("Error fetching employee:", error.message);
      }
    };
  
    fetchEmployee();
  }, [id]);
  

  if (!employee) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md">
      <h2 className="text-2xl font-bold mb-6">Employee Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Display Profile Image */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Profile Image</label>
          {employee.profileImage ? (
            <img
              src={employee.profileImage} // Full URL from the backend
              alt="Profile"
              className="mt-1 w-32 h-32 rounded-md object-cover border border-gray-300"
            />
          ) : (
            <p className="mt-1">No profile image available</p>
          )}
        </div>

        {/* Display Signature */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Signature</label>
          {employee.signature ? (
            <img
              src={employee.signature} // Full URL from the backend
              alt="Signature"
              className="mt-1 w-32 h-16 object-cover border border-gray-300"
            />
          ) : (
            <p className="mt-1">No signature available</p>
          )}
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <p className="mt-1 p-2 block w-full border border-gray-300 rounded-md">
            {employee.name || "N/A"}
          </p>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <p className="mt-1 p-2 block w-full border border-gray-300 rounded-md">
            {employee.address || "N/A"}
          </p>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="mt-1 p-2 block w-full border border-gray-300 rounded-md">
            {employee.email || "N/A"}
          </p>
        </div>

        {/* Additional fields as needed */}
      </div>
    </div>
  );
};

export default View;
