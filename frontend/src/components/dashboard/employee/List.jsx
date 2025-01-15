import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmployeeButtons } from '../../../utils/EmployeeHelper';
import DataTable from 'react-data-table-component';
import axios from 'axios';

const List = () => {
  const [employees, setEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [filteredEmployee, setFilteredEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      setEmpLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/employee', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        console.log('API Response:', response.data);

        if (response.data.success) {
          const data = response.data.employees.map((emp) => ({
            id: emp.employeeId || emp._id,
            name: emp.name,
            email: emp.email,
            department: emp.department?.dep_name || 'N/A',
            profileImage: (
              <img
                width={40}
                className="rounded-full"
                src={`http://localhost:5000/api/employee/image/${emp._id}`} // Dynamic image URL
                alt="Profile"
              />
            ),
            action: <EmployeeButtons Id={emp._id} />,
          }));
          
          

          setEmployees(data);
          setFilteredEmployees(data);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      } finally {
        setEmpLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleFilter = (e) => {
    const records = employees.filter((emp) =>
      emp.name.toLowerCase().includes(e.target.value.toLowerCase())
    );

    setFilteredEmployees(records);
  };

  return (
    <div className="p-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold">Manage Employee</h3>
      </div>
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search by Department"
          onChange={handleFilter}
          className="px-4 py-0.5 border"
        />
        <Link
          to="/admin-dashboard/add-employee"
          className="px-4 py-1 bg-teal-600 rounded text-white"
        >
          Add New Employee
        </Link>
      </div>
      <div className="mt-6">
        <DataTable
          columns={[
            {
              name: 'Profile Image',
              selector: (row) => row.profileImage,
              sortable: false,
            },
            {
              name: 'Name',
              selector: (row) => row.name,
              sortable: true,
            },
            {
              name: 'ID',
              selector: (row) => row.id,
              sortable: false,
            },
            {
              name: 'Email',
              selector: (row) => row.email,
              sortable: true,
            },
            {
              name: 'Department',
              selector: (row) => row.department,
              sortable: true,
            },
            {
              name: 'Action',
              selector: (row) => row.action,
              sortable: true,
            }
          
          ]}
          data={filteredEmployee}
          pagination
          progressPending={empLoading}
        />
      </div>
    </div>
  );
};

export default List;
