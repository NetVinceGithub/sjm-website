import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState({
    projectName: '',
    location: '',
    date: '',
  });
  
  const [projLoading, setProjLoading] = useState(true); // Default to true while loading project

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.data.success) {
          console.log('Success fetching project |Edit Project|');
          setProject(response.data.project);
          setProjLoading(false);
        }
      } catch (error) {
        console.error('Error fetching project |Edit Project|', error);
        setProjLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/projects/${id}`, project, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        navigate('/admin-dashboard/projects'); // Redirect to the project details page after update
      } else {
        alert('Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project', error);
    }
  };

  return (
    <>
      {projLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="max-w-3xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md w-96">
          <h2 className="text-2xl font-bold mb-6">Edit Project</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="projectName" className="text-sm font-medium text-gray-700">
                Project Name
              </label>
              <input
                type="text"
                name="projectName"
                value={project.projectName}
                onChange={handleChange}
                placeholder="Enter Project Name"
                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={project.location}
                onChange={handleChange}
                placeholder="Enter Location"
                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={project.date}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded"
            >
              Update Project
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default EditProject;
