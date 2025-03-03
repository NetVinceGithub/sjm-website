import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import axios from "axios";
import { FaIdCard, FaEnvelope, FaMinusSquare } from "react-icons/fa";

Modal.setAppElement("#root"); // Required for accessibility

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
    <div className="grid grid-cols-3 gap-x-2 place-items-center">
      <div className="inline-flex border border-neutralDGray rounded h-8">
        <button className="w-20 h-full border-r border-neutralDGray rounded-l flex items-center justify-center">
          <FaIdCard title="View ID" className="text-neutralDGray w-5 h-5" />
        </button>
        <button className="w-20 h-full border-r border-neutralDGray flex items-center justify-center">
          <FaEnvelope title="Message" className="text-neutralDGray w-5 h-5" />
        </button>
        <button className="w-20 h-full rounded-r flex items-center justify-center">
          <FaMinusSquare title="Block" className="text-neutralDGray w-5 h-5" />
        </button>
      </div>
    </div>

  );
};