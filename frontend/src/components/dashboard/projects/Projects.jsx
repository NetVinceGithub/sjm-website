import axios from 'axios';
import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Link } from 'react-router-dom';
import { columns, ProjectButtons } from '../../../utils/ProjectHelper';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [projLoading, setProjLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/projects', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          }
        });

        if (response.data.success) {
          const data = response.data.projects.map((proj) => ({
            id: proj._id,
            proj_name: proj.projectName,
            startingDate: proj.date,
            employeeCount: proj.employeeCount, // Add employee count here
            action: (<ProjectButtons id={proj._id}/>),
          }));

          console.log("Success on fetching projects |Projects.jsx|");

          setProjects(data);
          setFilteredProjects(data);
        }

      } catch (error) {
        if (error.response && !error.response.data.success) {
          console.log("Error on fetching projects |Projects.jsx|");
        }
      }
    };
    fetchProjects();
  }, []);

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    const filtered = projects.filter((proj) => 
      proj.proj_name.toLowerCase().includes(searchValue)
    );
    setFilteredProjects(filtered);
  };

  return (
    <>
      {projLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <h1>Project Dashboard</h1>
          <div className="text-center">
            <h3 className="text-2xl font-bold">Manage Projects</h3>
          </div>
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="Search by Name"
              className="px-4 py-0.5 border"
              onChange={handleSearch}
            />
            <Link
              to="/admin-dashboard/add-project"
              className="px-4 py-1 bg-teal-600 rounded text-white"
            >
              Add Project
            </Link>
          </div>

          <div className="mt-5">
            <DataTable
              columns={columns}
              data={filteredProjects} // Use filtered data
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Projects;
