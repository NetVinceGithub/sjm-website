import React from "react";

const DeleteAttendanceModal = ({ isOpen, onClose, onConfirm, employee }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-sm text-red-500 text-left">Delete Attendance</h2>
        <p className="mt-2 text-xs text-left text-gray-700">
          Are you sure you want to delete attendance?{" "}
          <strong>{employee?.name}</strong>
        </p>
        <div className="mt-4 flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-4 h-8 flex justify-center items-center items text-xs center py-2 border border-neutralDGray text-neutralDGray rounded hover:bg-red-400 hover:text-white transition-all duration-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm} // Calls function to toggle status
            className="px-4 h-8 flex justify-center items-center items text-xs center py-2 border border-neutralDGray text-neutralDGray rounded hover:bg-green-400 hover:text-white transition-all duration-300"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAttendanceModal;
