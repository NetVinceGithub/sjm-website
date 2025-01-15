import React, { useEffect, useState } from 'react'
import { fetchDepartments } from '../../../utils/EmployeeHelper';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Add = () => {
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ 
    name: '', 
    address: '', 
    email: '', 
    mobileNo: '', 
    dob: '', 
    gender: '', 
    employeeId: '', 
    maritalStatus: '', 
    designation: '', 
    department: '', 
    sss: '', 
    tin: '', 
    philHealth: '', 
    pagibig: '', 
    nameOfContact: '', 
    addressOfContact: '', 
    numberOfContact: '', });

    const [imageFile, setImageFile] = useState(null); 
    const [signatureFile, setSignatureFile] = useState(null);

  useEffect(()=>{
    const getDepartments = async () => {
      const departments = await fetchDepartments();
      setDepartments(departments);
    };
    getDepartments();
  }, []);

  const handleChange = (e) => { 
    const { name, value } = e.target; 
    setFormData({ ...formData, [name]: value }); 
  };


  const handleFileChange = (e) => { const { name, files } = e.target; 
  if (name === "image") { 
    setImageFile(files[0]); 
  } else if (name === "signature") { 
    setSignatureFile(files[0]); 
  } 
};



  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    const formDataObj = new FormData(); 
    Object.keys(formData).forEach((key) => { 
      formDataObj.append(key, formData[key]); 
    }); 
    if (imageFile) { 
      formDataObj.append('image', imageFile); 
    }  
    if (signatureFile) { 
      formDataObj.append('signature', signatureFile); 
    } try { 
      console.log('Submitting form data:', formDataObj); // Debugging 
      const response = await axios.post('http://localhost:5000/api/employee/add', formDataObj, { 
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem('token')}`, 
          "Content-Type": "multipart/form-data", 
        }, 
      }); 
      
      console.log('Response:', response.data); // Debugging 
      if (response.data.success) { 
        navigate('/admin-dashboard/employees'); 
      } 
    } catch (error) { console.error('Error:', error.response ? error.response.data : error.message); 
      if (error.response && !error.response.data.success) { 
        alert(error.response.data.error); 
      } 
    } 
  };

  return(
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

         {/* Department */} <div> <label className='block text-sm font-medium text-grey-700'> Department </label> <select name='department' onChange={handleChange} className='mt-1 p-2 block w-full border border-gray-300 rounded-md' required > <option value="">Select Department</option> {Array.isArray(departments) && departments.map((dep) => ( <option key={dep._id} value={dep._id}>{dep.dep_name}</option> ))} </select> </div>

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

          {/* tin */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              tin
            </label>
            <input
              type="text"
              name="tin"
              placeholder='tin'
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
              placeholder='Phil health'
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
            <input type="file" name="image" onChange={handleFileChange} placeholder='Upload Image' accept="image/*" className='mt-1 p-2 block w-full border border-gray-300 rounded-md' required />
          </div>

          {/* Signature Upload */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              Upload Signature
            </label>
            <input type="file" name="signature" onChange={handleFileChange} placeholder='Upload Signature' accept="image/*" className='mt-1 p-2 block w-full border border-gray-300 rounded-md' required />
          </div>

          <div>
            Incase of Emergency
          </div>

          {/* name of contact */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              name of contact
            </label>
            <input
              type="text"
              name="nameOfContact"
              placeholder='Name of contact '
              onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* address of contact */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              address of contact
            </label>
            <input
              type="text"
              name="addressOfContact"
              placeholder='Name of contact'
              onChange={handleChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

            {/* number of contact */}
            <div>
            <label className='block text-sm font-medium text-grey-700'>
              number of contact
            </label>
            <input
              type="text"
              name="numberOfContact"
              placeholder='Number of contact'
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

export default Add