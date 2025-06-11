import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchDepartments } from "../../../utils/EmployeeHelper";

const ViewSalary = () => {
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams(); // Correctly retrieve the id from the URL
  const [employee, setEmployee] = useState(null);

  useEffect(()=>{
    const getDepartments = async () => {
    const departments = await fetchDepartments()
    setDepartments(departments)
    };
    getDepartments();
  }, []);


  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/employee/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.data.success) {
          setEmployee(response.data.employee);
        } else {
          console.error("Error fetching employee:", response.data.error);
        }
      } catch (error) {
        console.error('Error fetching employee:', error.response ? error.response.data : error.message);
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      }
    };
    fetchEmployee();
  }, [id]);







  return (
    <>
      {employee && departments? (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <div
            id="id-card"
            className="w-96 bg-white shadow-lg rounded-lg border p-5"
          >
            <div className="flex flex-col items-center">
              <img
                src={`${import.meta.env.VITE_API_URL}/${employee.userId.profileImage}`}
                className="rounded-full border w-32 h-32 mb-5"
                alt="Employee Profile"
              />
              <h1 className="text-xl font-bold">{employee.userId.name}</h1>
              <p className="text-gray-500 mb-3">Employee ID: {employee.employeeId}</p>
            </div>

            <div className="mt-5">
              
              <div className="flex justify-between border-b py-2">
                <span className="font-medium">Department:</span>
                <span>{employee.department.dep_name}</span>
              </div>
          
            </div>

          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-screen">
          Loading...
        </div>
      )}
    </>
  );
};

export default ViewSalary;
