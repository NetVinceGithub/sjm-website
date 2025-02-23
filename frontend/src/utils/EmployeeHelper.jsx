import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import { FaIdCard, FaEnvelope, FaMinusSquare  } from "react-icons/fa";

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
    <div className="grid grid-cols-3 gap-x-0 justify-center items-center">
      <button
        className="m-0 p-0"
        onClick={() => {
          console.log(`Navigating to: /admin-dashboard/employees/employee-id/${Id}`); 
          navigate(`/admin-dashboard/employees/employee-id/${Id}`);
        }}
      >
        <FaIdCard className='w-7 h-7' title='View ID' />
      </button>

      <button
        className="m-0 p-0"
        onClick={() => navigate(`/admin-dashboard/employees/allowance/${Id}`)}
      >
        <FaEnvelope className='w-7 h-7' title='Message' />
      </button>

      <button
        className="m-0 p-0"
        onClick={() => navigate(`/admin-dashboard/employees/edit/${Id}`)}
      >
        <FaMinusSquare className='w-7 h-7 text-red-600' title='Block Employee' />
      </button>
    </div>
  );
};





