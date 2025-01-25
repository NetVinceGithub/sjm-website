import { useNavigate } from "react-router-dom";
import axios from 'axios'
import dayjs from "dayjs";

export const columns = [
  {
    name: "Project Name", 
    selector: (row) => row.proj_name
  },
  {
    name: "Starting Date", 
    selector: (row) => dayjs(row.startingDate).format('YYYY-MM-DD'),
    sortable: true
  },
  {
    name: "No. of Employees",
    selector: (row) => row.employeeCount, // Display the number of employees for each project
    sortable: true
  },
  {
    name: "Action", 
    selector: (row) => row.action
  },
];



export const ProjectButtons = ({ id }) => {
  const navigate = useNavigate();

  return (
    <div className="flex space-x-3">
      <button
        className="px-3 py-1 bg-teal-600 text-white"
        onClick={() => navigate(`/admin-dashboard/edit-project/${id}`)}
      >
        Edit
      </button>

      <button
        className="px-3 py-1 bg-red-600 text-white"

      >
        Delete
      </button>
    </div>
  );
};
