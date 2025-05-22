import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddProject = () => {
  const [projectName, setProjectName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);



  const handleCheckboxChange = (employeeId) => {
    setSelectedEmployees((prevSelected) =>
      prevSelected.includes(employeeId)
        ? prevSelected.filter((id) => id !== employeeId)
        : [...prevSelected, employeeId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate input fields
    if (!projectName || !location || !date ) {
      alert('Please fill all fields and select at least one employee');
      return;
    }
  
    const projectData = { projectName, location, date,};
    console.log('Submitting project data:', projectData); // Debugging
  
    try {
      const response = await axios.post(
        '${import.meta.env.VITE_API_URL}/api/projects/add-project',
        projectData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Corrected syntax
          },
        }
      );
  
      if (response.data.success) {
        alert('Project added successfully');
        setProjectName('');
        setLocation('');
        setDate('');
        setSelectedEmployees([]);
      } else {
        alert('Failed to add project');
      }
    } catch (error) {
      console.error('Error adding project:', error.message); // Debugging
      alert('An error occurred while adding the project');
    }
  };

  return (
    <div>
      <h2>Add Project</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Project Name:</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Location:</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Starting Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

       
        

        <button type="submit">Add Project</button>
      </form>
    </div>
  );
};

export default AddProject;
