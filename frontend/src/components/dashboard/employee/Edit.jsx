import React, { useEffect, useState } from 'react';
import { fetchDepartments } from '../../../utils/EmployeeHelper';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const Edit = () => {
  const [employee, setEmployee] = useState({
    name: '',
    maritalStatus: '',
    designation: '',
    salary: 0,
    department: '',
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch Departments
  useEffect(() => {
    const getDepartments = async () => {
      try {
        const departments = await fetchDepartments();
        setDepartments(departments || []);
      } catch (error) {
        console.error('Error fetching departments:', error.message);
        alert('Unable to fetch departments.');
      }
    };
    getDepartments();
  }, []);

  // Fetch Employee
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/employee/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.data.success) {
          const employee = response.data.employee;
          setEmployee({
            name: employee?.userId?.name || '',
            maritalStatus: employee?.maritalStatus || '',
            designation: employee?.designation || '',
            salary: employee?.salary || 0,
            department: employee?.department || '',
          });
        } else {
          console.error('Error fetching employee:', response.data.error);
          alert('Error fetching employee details.');
        }
      } catch (error) {
        console.error('Error fetching employee:', error.message);
        alert('Failed to fetch employee details.');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `http://localhost:5000/api/employee/${id}`,
        employee,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        alert('Employee updated successfully!');
        navigate('/admin-dashboard/employees');
      } else {
        console.error('Error updating employee:', response.data.error);
        alert(response.data.error || 'Failed to update employee.');
      }
    } catch (error) {
      console.error('Error:', error.message);
      alert(error.response?.data?.error || 'Failed to update employee.');
    }
  };

  return  (
  <div>Edit employee </div>
            
         
  )
};

export default Edit;
