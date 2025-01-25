import React, { useEffect, useState } from 'react';
import SummaryCard from './SummaryCard';
import { FaUsers, FaBuilding, FaMoneyBillWave, FaCashRegister, FaHandHoldingUsd, FaChartPie  } from 'react-icons/fa';
import { SalaryButtons } from '../../../utils/SalaryHelper';
import DataTable from 'react-data-table-component';
import axios from 'axios';

const AdminSummary = () => {
  const [employees, setEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [filteredEmployee, setFilteredEmployees] = useState([]);

  // Function to convert Buffer to Base64
  const bufferToBase64 = (buffer) => {
    const binary = new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '');
    return window.btoa(binary); // Convert to Base64 string
  };

  // Fetch employees from the API
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
          const data = response.data.employees.map((emp) => {
            const profileImage = emp.profileImage?.data
              ? `data:image/jpeg;base64,${bufferToBase64(emp.profileImage.data)}`
              : null;

            return {
              id: emp.employeeId || emp._id,
              name: emp.name,
              email: emp.email,
              project: emp.project?.projectName || 'N/A',
              profileImage: profileImage,
              action: <SalaryButtons Id={emp._id} />,
            };
          });

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

  // Function to filter employees by name
  const handleFilter = (e) => {
    const records = employees.filter((emp) =>
      emp.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredEmployees(records);
  };

  // Function to get total employee count
  const getTotalHeadcount = () => employees.length;

  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold">Dashboard Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <SummaryCard icon={<FaCashRegister />} text="Total Payroll" number={13} color="bg-[#88B9D3]" />
        <SummaryCard icon={<FaHandHoldingUsd  />} text="Gross Salary" number={5} color="bg-[#B9DD8B]" />
        <SummaryCard icon={<FaChartPie />} text="Total Employee Benefits" number="$654" color="bg-[#D18AA6]" />
        <SummaryCard icon={<FaUsers />} text="Total Headcount" number={getTotalHeadcount()} color="bg-[#95B375]" />
      </div>

      <div className="p-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold">Employee Payroll Data</h3>
        </div>
        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder="Search by Name"
            onChange={handleFilter}
            className="px-4 py-0.5 border"
          />
        </div>
        <div className="mt-6">
          <DataTable
            columns={[
              {
                name: 'Profile Image',
                cell: (row) =>
                  row.profileImage ? (
                    <img
                      src={row.profileImage}
                      alt="Profile"
                      className="w-12 h-12 rounded-full border"
                    />
                  ) : (
                    'No Image'
                  ),
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
                name: 'Project',
                selector: (row) => row.project,
                sortable: true,
              },
              {
                name: 'Action',
                selector: (row) => row.action,
                sortable: true,
              },
            ]}
            data={filteredEmployee}
            pagination
            progressPending={empLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminSummary;
