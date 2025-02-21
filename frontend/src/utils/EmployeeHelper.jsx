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
    name: "Project", 
    selector: (row) => row.project,
    width: "120px"
  }
];



export const fetchDepartments = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/department', {
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

export const fetchProjects = async () => {
  try{
    const response = await axios.get('http://localhost:5000/api/projects', {
      headers: {
        Authorization:`Bearer ${localStorage.getItem('token')}`,
      },
    });
    if(response.data.success) {
      return response.data.projects;
    }
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}


export const EmployeeButtons = ({ Id }) => {
  const navigate = useNavigate();

  if (!Id) {
    console.error("Invalid Employee ID");
    return null;
  }

  return (
    <div className="flex gap-2 justify-center items-center flex-nowrap">
      <button
        className="px-4 py-1 bg-teal-600 text-white text-sm rounded hover:bg-teal-700"
        onClick={() => {
          console.log(`Navigating to: /admin-dashboard/employees/employee-id/${Id}`); 
          navigate(`/admin-dashboard/employees/employee-id/${Id}`);
        }}
      >
        View ID
      </button>

      <button
        className="px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        onClick={() => navigate(`/admin-dashboard/employees/allowance/${Id}`)}
      >
        Allowance
      </button>

      <button
        className="px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        onClick={() => navigate(`/admin-dashboard/employees/edit/${Id}`)}
      >
        Benefits
      </button>
    </div>
  );
};





