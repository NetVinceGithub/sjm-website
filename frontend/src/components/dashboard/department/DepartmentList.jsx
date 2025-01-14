import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { columns, DepartmentButtons } from '../../../utils/DepartmentHelper';
import axios from 'axios';

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [depLoading, setDepLoading] = useState(false);
  const [filterDepartments, setFilteredDepartments] = useState([]);
  
  const onDepartmentDelete = (id) => {
    // Filter out the deleted department from both state variables
    const updatedDepartments = departments.filter((dep) => dep.id !== id);
    setDepartments(updatedDepartments);
    setFilteredDepartments(updatedDepartments);
  };
  useEffect(() => {
    const fetchDepartments = async () => {
      setDepLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/department', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.data.success) {
          let sno = 1;
          const data = response.data.departments.map((dep) => ({
            id: dep._id, // This must match the backend's field
            sno: sno++,
            dep_name: dep.dep_name,
            action: (<DepartmentButtons id={dep._id} onDepartmentDelete={onDepartmentDelete} />),
          }));
          
          setDepartments(data);
          setFilteredDepartments(data);
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      } finally {
        setDepLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  // Correctly name this function to avoid overwriting the filteredDepartments state
  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    const filtered = departments.filter((dep) =>
      dep.dep_name.toLowerCase().includes(searchValue)
    );
    setFilteredDepartments(filtered);
  };

  return (
    <>
      {depLoading ? (
        <div>Loading....</div>
      ) : (
        <div className="p-5">
          <div className="text-center">
            <h3 className="text-2xl font-bold">Manage Departments</h3>
          </div>

          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="Search by Department"
              className="px-4 py-0.5 border"
              onChange={handleSearch} // Use the renamed search handler
            />
            <Link
              to="/admin-dashboard/add-department"
              className="px-4 py-1 bg-teal-600 rounded text-white"
            >
              Add New Department
            </Link>
          </div>

          <div className="mt-5">
            <DataTable
              columns={columns}
              data={filterDepartments} pagination// Use filtered data
            />
          </div>
        </div>
      )}
    </>
  );
};

export default DepartmentList;
