import { useNavigate } from "react-router-dom";
import axios from 'axios'

export const columns = [
  {
    name: "S no", 
    selector: (row) => row.sno
  },
  {
    name: "Department Name", 
    selector: (row) => row.dep_name,
    sortable: true
  },
  {
    name: "Action", 
    selector: (row) => row.action
  },
];

export const DepartmentButtons = ({ id, onDepartmentDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    const confirm = window.confirm("Do you want to delete?");
    if (confirm) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/department/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.data.success) {
          onDepartmentDelete(id); // Call parent function to update the UI
        } else {
          alert("Failed to delete department.");
        }
      } catch (error) {
        console.error("Error deleting department:", error.response?.data || error.message);
        alert(error.response?.data?.error || "Failed to delete department.");
      }
    }
  };

  return (
    <div className="flex space-x-3">
      <button
        className="px-3 py-1 bg-teal-600 text-white"
        onClick={() => navigate(`/admin-dashboard/department/${id}`)}
      >
        Edit
      </button>

      <button
        className="px-3 py-1 bg-red-600 text-white"
        onClick={handleDelete} // Use `handleDelete` without passing `id`
      >
        Delete
      </button>
    </div>
  );
};
