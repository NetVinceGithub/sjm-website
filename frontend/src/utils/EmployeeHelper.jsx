import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import axios from "axios";
import { FaIdCard, FaEnvelope, FaMinusSquare } from "react-icons/fa";
import EmployeeIDCard from "../components/dashboard/EmployeeIDCard.jsx";

Modal.setAppElement("#root"); // Required for accessibility

export const columns = [
  {
    name: "Image",
    selector: (row) => row.profileImage,
    width: "90px",
  },
  {
    name: "Name",
    selector: (row) => row.name,
    width: "70px",
  },
  {
    name: "ID",
    selector: (row) => row.id,
    width: "70px",
  },
  {
    name: "Email",
    selector: (row) => row.email,
    sortable: true,
    width: "100px",
  },
  {
    name: "Project",
    selector: (row) => row.project,
    width: "120px",
  },
];

export const fetchDepartments = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/department", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
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
  try {
    const response = await axios.get("http://localhost:5000/api/projects", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (response.data.success) {
      return response.data.projects;
    }
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};

export const EmployeeButtons = ({ Id }) => {
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);

  if (!Id) {
    console.error("Invalid Employee ID");
    return null;
  }

  return (
    <div className="grid grid-cols-3 gap-x-2 justify-center items-center">
      {/* View ID Button */}
      <button className="m-0 p-0" onClick={() => setModalIsOpen(true)}>
        <FaIdCard className="w-7 h-7" title="View ID" />
      </button>

      {/* Message Button */}
      <button
        className="m-0 p-0"
        onClick={() => navigate(`/admin-dashboard/employees/allowance/${Id}`)}
      >
        <FaEnvelope className="w-7 h-7" title="Message" />
      </button>

      {/* Block Employee Button */}
      <button
        className="m-0 p-0"
        onClick={() => navigate(`/admin-dashboard/employees/edit/${Id}`)}
      >
        <FaMinusSquare className="w-7 h-7 text-red-600" title="Block Employee" />
      </button>

      {/* Modal for displaying Employee ID Card */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
          <EmployeeIDCard employeeId={Id} />
          <button
            onClick={() => setModalIsOpen(false)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Close
          </button>
        </div>
      </Modal>

    </div>
  );
};