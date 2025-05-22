import React, { useEffect, useState } from 'react';
import { fetchDepartments, fetchProjects } from '../../../utils/EmployeeHelper';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs'; // Install dayjs with: npm install dayjs

const EmployeePayrollData = () => {
  const [employee, setEmployee] = useState({
    name: '', 
    designation: '',
    project: '',
    bankAccount: '',
  });

  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();



  // Fetch Employee Data
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/employee/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
    
        if (response.data.success) {
          const employee = response.data.employee;
          setEmployee({
            name: employee?.name || '',
            designation: employee?.designation || '',
            project: employee?.project || '',
            bankAccount: employee?.bankAccount || '',
          });
        } else {
        }
      } catch (error) {
        console.error('Error fetching employee:', error.message);
      }
    };
    fetchEmployee();
  }, [id]);

  // Fetch Departments

  useEffect(() => {
    const getProjects = async () => {
      try {
        const projects = await fetchProjects();
        setProjects(projects || []);
      } catch (error) {
        console.error('Error fetching projects:', error.message);
        alert('Unable to fetch projects');
      }
    };
    getProjects();
  }, []);
  

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setEmployee((prevData) => ({
      ...prevData,
      [name]: files && files.length > 0 ? files[0] : value, // Handle file inputs
    }));
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
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/employee/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      if (response.data.success) {
        navigate("/admin-dashboard/employees");
      } else {
        console.error("Error updating employee:", response.data.error);
        alert(response.data.error || "Failed to update employee.");
      }
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
    }
  };
  
  

  return (
    <div className='max-w-4x1 mx-auto mt-10 bg-white p-8 rounded-md shadow-md'>
      <h2 className='text-2x1 font-bold mb-6'>Employee Payroll Data</h2>
      <form onSubmit={handleSubmit}>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>

          {/* Payslip No */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>Payslip No.</label>
            <input
              type="text"
              name="payslip"
              onChange={handleChange}
              placeholder='Insert Payslip No.'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>
          
          {/* Ecode */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>E code</label>
            <input
              type="text"
              name="ecode"
              onChange={handleChange}
              placeholder='Insert Ecode'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Name */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>Name</label>
            <input
              type="text"
              name="name"
              onChange={handleChange}
              value={employee.name}
              placeholder='Insert Name'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Project */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>Project</label>
            <input
              name='project'
              onChange={handleChange}
              value={employee.project}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
              
          </div>

           {/* Rate */}
           <div>
            <label className='block text-sm font-medium text-grey-700'>Rate</label>
            <input
              name='rate'
              onChange={handleChange}
             
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />

            {/* Position */}
           <div>
            <label className='block text-sm font-medium text-grey-700'>Position</label>
            <input
              name='position'
              onChange={handleChange}
             
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
              
          </div>

          
            {/* Cut off Date */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>Cut off date</label>
            <input
              name='cutOffDate'
              onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
              
          </div>

          {/* Basic Pay */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>Basic Pay</label>
            <input
              name='basicPay'
              onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
              
          </div>

            {/* No. Of days */}
            <div>
            <label className='block text-sm font-medium text-grey-700'>No. Of days</label>
            <input
              name='basicPay'
              onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
              
          </div>

            {/* Overtime Pay */}
            <div>
            <label className='block text-sm font-medium text-grey-700'>Overtime pay</label>
            <input
              name='overtime'
              onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
              
          </div>

           {/* Overtime Hours */}
           <div>
            <label className='block text-sm font-medium text-grey-700'>Overtime Hours</label>
            <input
              name='overtimeHours'
              onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
              
          </div>

          
           {/* Holiday Pay */}
           <div>
            <label className='block text-sm font-medium text-grey-700'>Holiday Pay</label>
            <input
              name='holidayPay'
              onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
              
          </div>

           {/* Night Differential */}
           <div>
            <label className='block text-sm font-medium text-grey-700'>Night Differential</label>
            <input
              name='nightDifferential'
              onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
              
          </div>

          {/* Allowance */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>Allowance </label>
            <input
              name='allowance'
              onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
              
          </div>

          {/* SSS */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>SSS </label>
            <input
              name='sss'
              onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
              
          </div>

             {/* PHIC */}
             <div>
            <label className='block text-sm font-medium text-grey-700'>PHIC </label>
            <input
              name='phic'
              onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
              
          </div>

           {/* HDMF */}
             <div>
            <label className='block text-sm font-medium text-grey-700'>HDMF </label>
            <input
              name='hdmf'
              onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
              
          </div>

             {/* Cash Advance/Loan  */}
             <div>
            <label className='block text-sm font-medium text-grey-700'>Cash Advance/Loan </label>
            <input
              name='cashAdvanceLoan'
              onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
              
          </div>

          {/* Tardiness  */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>Tardiness </label>
            <input
              name='tardiness'
              onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
              
          </div>

          {/* Other Deductions  */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>Other Deductions </label>
            <input
              name='otherDeductions'
              onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
              
          </div>

          {/* Total Deductions  */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>Total Deductions </label>
            <input
              name='totalDeductions'
              onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
              
          </div>

          
          {/* Adjustment  */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>Adjustment </label>
            <input
              name='adjustment'
              onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
              
          </div>

          {/* Net Pay  */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>Net Pay </label>
            <input
              name='netPay'
              onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
              
          </div>

          {/*  Amount  */}
          <div>
            <label className='block text-sm font-medium text-grey-700'> Amount </label>
            <input
              name='amount'
              onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
              
          </div>



        </div>
        </div>

        <button type="submit" className='w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4'>
          Confirm
        </button>
        
      </form>
    </div>
  );
};

export default EmployeePayrollData;
