import React, { useEffect, useState } from 'react';
import { fetchDepartments, fetchProjects } from '../../../utils/EmployeeHelper';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs'; // Install dayjs with: npm install dayjs

const Edit = () => {
  const [employee, setEmployee] = useState({
    name: '',
    address: '',
    email: '',
    mobileNo: '',
    dob: '',
    gender: '',
    employeeId: '',
    maritalStatus: '',
    designation: '',
    project: '',
    sss: '',
    tin: '',
    philHealth: '',
    pagibig: '',
    bankAccount: '',
    nameOfContact: '',
    addressOfContact: '',
    numberOfContact: '',
  });

  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  const arrayBufferToBase64 = (buffer) => {
    const binary = new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '');
    return window.btoa(binary);
  };

  // Fetch Employee Data
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
            name: employee?.name || '',
            address: employee?.address || '',
            email: employee?.email || '',
            mobileNo: employee?.mobileNo || '',
            dob: employee?.dob ? dayjs(employee.dob).format('YYYY-MM-DD') : '',
            gender: employee?.gender || '',
            employeeId: employee?.employeeId || '',
            maritalStatus: employee?.maritalStatus || '',
            designation: employee?.designation || '',
            project: employee?.project || '',
            sss: employee?.sss || '',
            tin: employee?.tin || '',
            philHealth: employee?.philHealth || '',
            pagibig: employee?.pagibig || '',
            bankAccount: employee?.bankAccount || '',
            nameOfContact: employee?.nameOfContact || '',
            addressOfContact: employee?.addressOfContact || '',
            numberOfContact: employee?.numberOfContact || '',
          
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
      const response = await axios.put(`http://localhost:5000/api/employee/${id}`, formData, {
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
      alert(error.response?.data?.error || "Failed to update employee.");
    }
  };
  
  

  return (
    <div className='max-w-4x1 mx-auto mt-10 bg-white p-8 rounded-md shadow-md'>
      <h2 className='text-2x1 font-bold mb-6'>Edit Employee</h2>
      <form onSubmit={handleSubmit}>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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

          {/* Address */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>Address</label>
            <input
              type="text"
              name="address"
              onChange={handleChange}
              value={employee.address}
              placeholder='Insert Address'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>Email</label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              value={employee.email}
              placeholder='Insert Email'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>Mobile Number</label>
            <input
              type="text"
              name="mobileNo"
              onChange={handleChange}
              value={employee.mobileNo}
              placeholder='Insert Mobile Number'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>Date of Birth</label>
            <input
              type="date"
              name="dob"
              onChange={handleChange}
              value={employee.dob}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Gender */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>Gender</label>
            <select
              name='gender'
              onChange={handleChange}
              value={employee.gender}
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
            <label className='block text-sm font-medium text-grey-700'>Employee ID</label>
            <input
              type="text"
              name="employeeId"
              onChange={handleChange}
              value={employee.employeeId}
              placeholder='Employee ID'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Marital Status */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>Marital Status</label>
            <select
              name='maritalStatus'
              onChange={handleChange}
              value={employee.maritalStatus}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            >
              <option value="">Select Status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
            </select>
          </div>

          {/* Project */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>Project</label>
            <select
              name='project'
              onChange={handleChange}
              value={employee.project}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            >
              <option value="">Select Project</option>
              {projects.map((proj) => (
                <option key={proj._id} value={proj._id}>{proj.projectName}</option>
              ))}
            </select>
          </div>

          {/* SSS */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>SSS</label>
            <input
              type="text"
              name="sss"
              onChange={handleChange}
              value={employee.sss}
              placeholder='SSS'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Tin */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>TIN</label>
            <input
              type="text"
              name="tin"
              onChange={handleChange}
              value={employee.tin}
              placeholder='TIN'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* PhilHealth */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>PhilHealth</label>
            <input
              type="text"
              name="philHealth"
              onChange={handleChange}
              value={employee.philHealth}
              placeholder='PhilHealth'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Pag-IBIG */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>Pag-IBIG</label>
            <input
              type="text"
              name="pagibig"
              onChange={handleChange}
              value={employee.pagibig}
              placeholder='Pag-IBIG'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Bank Account */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>Bank Account</label>
            <input
              type="text"
              name="bankAccount"
              onChange={handleChange}
              value={employee.bankAccount}
              placeholder='Bank Account'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Emergency Contact */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>Name of Contact</label>
            <input
              type="text"
              name="nameOfContact"
              onChange={handleChange}
              value={employee.nameOfContact}
              placeholder='Name of contact'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-grey-700'>Address of Contact</label>
            <input
              type="text"
              name="addressOfContact"
              onChange={handleChange}
              value={employee.addressOfContact}
              placeholder='Address of contact'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-grey-700'>Contact Number</label>
            <input
              type="text"
              name="numberOfContact"
              onChange={handleChange}
              value={employee.numberOfContact}
              placeholder='Contact Number'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

           {/* Profile Image */}
           <div>
            <label className='block text-sm font-medium text-grey-700'>Profile Image</label>
            <input
              type="file"
              name="profileImage"
              accept="image/*"
              onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
            />
          </div>

          {/* Signature */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>Signature</label>
            <input
              type="file"
              name="signature"
              accept="image/*"
              onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
            />
          </div>

        </div>

        <button type="submit" className='w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4'>
          Confirm
        </button>
      </form>
    </div>
  );
};

export default Edit;
