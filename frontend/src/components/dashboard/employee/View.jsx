import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';

const View = () => {
  const [employee, setEmployee] = useState(null);
  const { id } = useParams();

  const bufferToBase64 = (buffer) => {
    const binary = new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '');
    return window.btoa(binary); // Convert to Base64 string
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
          

          setEmployee(response.data.employee);
        } else {
          console.error('Failed to fetch employee data.');
        }
      } catch (error) {
        console.error('Error fetching employee:', error.message);
      }
    };

    fetchEmployee();
  }, [id]);

  if (!employee) {
    return <div>Loading...</div>;
  }

  return (
    <div className='max-w-4x1 mx-auto mt-10 bg-white p-8 rounded-md shadow-md'>
      <h2 className='text-2x1 font-bold mb-6'>Employee Details</h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>

         {/* Display Profile Image */}
      <div className='mb-6'>
        <label className='block text-sm font-medium text-grey-700'>Profile Image</label>
        {employee.profileImage ? (
          <img
            src={`data:image/jpeg;base64,${bufferToBase64(employee.profileImage.data)}`}
            alt="Profile"
            className='mt-1 w-32 h-32 rounded-md object-cover border border-gray-300'
          />
        ) : (
          <p className='mt-1'>No profile image available</p>
        )}
      </div>

      {/* Display Signature */}
      <div className='mb-6'>
        <label className='block text-sm font-medium text-grey-700'>Signature</label>
        {employee.signature ? (
          <img
            src={`data:image/jpeg;base64,${bufferToBase64(employee.signature.data)}`}
            alt="Signature"
            className='mt-1 w-32 h-16 object-cover border border-gray-300'
          />
        ) : (
          <p className='mt-1'>No signature available</p>
        )}
      </div>
        {/* Display Name */}
        <div>
          <label className='block text-sm font-medium text-grey-700'>Name</label>
          <p className='mt-1 p-2 block w-full border border-gray-300 rounded-md'>{employee.name || 'N/A'}</p>
        </div>

        {/* Display Address */}
        <div>
          <label className='block text-sm font-medium text-grey-700'>Address</label>
          <p className='mt-1 p-2 block w-full border border-gray-300 rounded-md'>{employee.address || 'N/A'}</p>
        </div>

        {/* Display Email */}
        <div>
          <label className='block text-sm font-medium text-grey-700'>Email</label>
          <p className='mt-1 p-2 block w-full border border-gray-300 rounded-md'>{employee.email || 'N/A'}</p>
        </div>

        {/* Display Mobile Number */}
        <div>
          <label className='block text-sm font-medium text-grey-700'>Mobile Number</label>
          <p className='mt-1 p-2 block w-full border border-gray-300 rounded-md'>{employee.mobileNo || 'N/A'}</p>
        </div>

        {/* Display Date of Birth */}
        <div>
          <label className='block text-sm font-medium text-grey-700'>Date of Birth</label>
          <p className='mt-1 p-2 block w-full border border-gray-300 rounded-md'>{employee.dob ? dayjs(employee.dob).format('YYYY-MM-DD') : 'N/A'}</p>
        </div>

        {/* Display Gender */}
        <div>
          <label className='block text-sm font-medium text-grey-700'>Gender</label>
          <p className='mt-1 p-2 block w-full border border-gray-300 rounded-md'>{employee.gender || 'N/A'}</p>
        </div>

        {/* Display Employee ID */}
        <div>
          <label className='block text-sm font-medium text-grey-700'>Employee ID</label>
          <p className='mt-1 p-2 block w-full border border-gray-300 rounded-md'>{employee.employeeId || 'N/A'}</p>
        </div>

        {/* Display Marital Status */}
        <div>
          <label className='block text-sm font-medium text-grey-700'>Marital Status</label>
          <p className='mt-1 p-2 block w-full border border-gray-300 rounded-md'>{employee.maritalStatus || 'N/A'}</p>
        </div>

        {/* Display Department */}
        <div>
          <label className='block text-sm font-medium text-grey-700'>Department</label>
          <p className='mt-1 p-2 block w-full border border-gray-300 rounded-md'>{employee.department?.dep_name || 'N/A'}</p>
        </div>

        {/* Display SSS */}
        <div>
          <label className='block text-sm font-medium text-grey-700'>SSS</label>
          <p className='mt-1 p-2 block w-full border border-gray-300 rounded-md'>{employee.sss || 'N/A'}</p>
        </div>

        {/* Display TIN */}
        <div>
          <label className='block text-sm font-medium text-grey-700'>TIN</label>
          <p className='mt-1 p-2 block w-full border border-gray-300 rounded-md'>{employee.tin || 'N/A'}</p>
        </div>

        {/* Display PhilHealth */}
        <div>
          <label className='block text-sm font-medium text-grey-700'>PhilHealth</label>
          <p className='mt-1 p-2 block w-full border border-gray-300 rounded-md'>{employee.philHealth || 'N/A'}</p>
        </div>

        {/* Display Pag-IBIG */}
        <div>
          <label className='block text-sm font-medium text-grey-700'>Pag-IBIG</label>
          <p className='mt-1 p-2 block w-full border border-gray-300 rounded-md'>{employee.pagibig || 'N/A'}</p>
        </div>

        {/* Display Emergency Contact */}
        <div>
          <label className='block text-sm font-medium text-grey-700'>Name of Contact</label>
          <p className='mt-1 p-2 block w-full border border-gray-300 rounded-md'>{employee.nameOfContact || 'N/A'}</p>
        </div>

        <div>
          <label className='block text-sm font-medium text-grey-700'>Address of Contact</label>
          <p className='mt-1 p-2 block w-full border border-gray-300 rounded-md'>{employee.addressOfContact || 'N/A'}</p>
        </div>

        <div>
          <label className='block text-sm font-medium text-grey-700'>Contact Number</label>
          <p className='mt-1 p-2 block w-full border border-gray-300 rounded-md'>{employee.numberOfContact || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default View;
