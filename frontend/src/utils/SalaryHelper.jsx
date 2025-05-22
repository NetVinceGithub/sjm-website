import axios from 'axios'
import { useNavigate } from 'react-router-dom';

export const columns = [
  {
    name: "Image", 
    selector: (row) => row.profileImage,
    width: "90px"
  },
  {
    name: "Name", 
    selector: (row) => row.name,
    width: "70px"
  },
  {
    name: "ID", 
    selector: (row) => row.id,
    width: "70px"
  },
  {
    name: "Email", 
    selector: (row) => row.email,
    sortable: true,
    width: "100px"
  },
  {
    name: "Department", 
    selector: (row) => row.dep_name,
    width: "120px"
  }
];



export const fetchDepartments = async () => {
  try {
    const response = await axios.get('${import.meta.env.VITE_API_URL}/api/department', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (response.data.success) {
      return response.data.departments;
    }
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
};



export const getEmployees = async (id) => {
  let employees;
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/employee/department/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (response.data.success) {
      employees = response.data.employees
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      console.error("Error Fetching Employees:", error);
      return employees;
    }
  }
};


export const SalaryButtons = ({ Id }) => {
  const navigate = useNavigate();

  return (
    <div className="flex gap-2 justify-center items-center flex-nowrap">
      <button
        className="px-4 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
        onClick={() => navigate(`/admin-dashboard/employees/payslip/${Id}`)}

      >
        Edit Payroll
      </button>
    </div>
  );
};




