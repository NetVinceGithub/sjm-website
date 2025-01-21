import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { fetchEmployees } from '../../../utils/ProjectHelper';

const AddProject = () => {
  // State to store project details and selected employees
  const [projectName, setProjectName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [employees, setEmployees] = useState([]); // List of employees for the dropdown
  const [selectedEmployees, setSelectedEmployees] = useState([]); // List of selected employees

  // Fetch employees from the API to populate the dropdown
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchEmployees();
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees", error);
      }
    };
    fetchData();
  }, []);

  // Handle employee selection change
  const handleEmployeeChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedEmployees(selectedOptions);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectName || !location || !date || selectedEmployees.length === 0) {
      alert('Please fill all fields and select at least one employee');
      return;
    }

    try {
      const projectData = {
        projectName,
        location,
        date,
        employeeIds: selectedEmployees, // Send the array of selected employees
      };

      // Send the project data to the backend
      const response = await axios.post('http://localhost:5000/api/projects', projectData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        alert('Project added successfully');
        // Clear the form after submission
        setProjectName('');
        setLocation('');
        setDate('');
        setSelectedEmployees([]);
      } else {
        alert('Failed to add project');
      }
    } catch (error) {
      console.error('Error adding project:', error.message);
      alert('An error occurred while adding the project');
    }
  };

  return (
    <div>
      <h2>Add Project</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label className='block text-sm font-medium text-grey-700'>Project Name:</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder='Insert Email'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
            required
          />
        </div>

        <div>
          <label>Location:</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder='Insert Email'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
            required
          />
        </div>

        <div>
          <label>Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder='Insert Email'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
            required
          />
        </div>

        <div>
          <label>Assign Employees in the Project:</label>
          <select
            multiple
            value={selectedEmployees}
            onChange={handleEmployeeChange}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
            required
          >
            {Array.isArray(employees) &&
              employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
          </select>
        </div>

        <button type="submit"
         className='w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4'>Add Project</button>
      </form>
    </div>
  );
};

export default AddProject;
