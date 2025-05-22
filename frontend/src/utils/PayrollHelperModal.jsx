// utils/PayrollHelper.jsx
import React, { useState } from "react";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import EditPayrollModal from "../components/EditPayrollModal";

export const PayrollButtons = ({ Id, employee, refreshData }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleEditSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
    // Optionally refresh data if needed
    if (refreshData) {
      refreshData();
    }
  };

  const handleView = () => {
    // Implement view functionality
    console.log("View employee:", Id);
  };

  const handleDelete = () => {
    // Implement delete functionality with confirmation
    if (window.confirm("Are you sure you want to delete this employee's payroll information?")) {
      // Add delete API call here
      console.log("Delete employee:", Id);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
          {successMessage}
        </div>
      )}
      
      <button
        onClick={handleView}
        className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-colors"
        title="View Details"
      >
        <FaEye size={14} />
      </button>
      
      <button
        onClick={handleEditClick}
        className="p-2 text-green-500 hover:bg-green-100 rounded-full transition-colors"
        title="Request Changes"
      >
        <FaEdit size={14} />
      </button>
      
      <button
        onClick={handleDelete}
        className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
        title="Delete"
      >
        <FaTrash size={14} />
      </button>

      <EditPayrollModal
        employee={employee}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};