import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const AddDepartment = () => {
  const[department, setDepartment] = useState({
    dep_name: '',
    description: ''
  })

  const navigate = useNavigate()

  const handleChange = (e) => {
    const {name, value} = e.target;
    setDepartment({...department, [name] : value})
    }

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        console.log('Sending request with data:', department); // Debug the request payload
        const response = await axios.post('${import.meta.env.VITE_API_URL}/api/department/add', department, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`,
          },
        });
    
        console.log('Response from server:', response.data); // Debug the response
        if (response.data.success) {
          navigate('/admin-dashboard/departments'); // Fixed typo here
        }
      } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      }
    };
    


  return(
    <div className='max-w-3x1 mx-auto mt-10 bg-white p-8 rounded-md shadow-md w-96'>
      <h2 className='text-2x1 font-bold mb-6'>Add New Department</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label 
            htmlFor='dep_name'
            className='text-sm font-medium text-gray-700'
            >
              Department Name
            </label>
            <input 
            type='text' 
            name='dep_name'
            onChange={handleChange}
            placeholder='Enter Dep Name'
            className='mt-1 w-full p-2 border border-gray-300 rounded-md'
            required
            />
          </div>
          
          <div>
            <label
            htmlFor='description'
            className='block text-sm font-medium text-gray-700'
            >Description
            </label>
            <textarea 
            name='description' 
            onChange={handleChange}
            placeholder='Description'
            className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
            rows="4"
            /> 
          </div>
          <button
          type="submit"
          className='w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded'
          >Add Department
          </button>
        </form>
    </div>
  )
}

export default AddDepartment