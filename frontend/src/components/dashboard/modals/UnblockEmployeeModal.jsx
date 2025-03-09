import React from "react";

const UnBlockEmployeeModal = ({ isOpen, onClose, onConfirm, employee }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-lg font-semibold text-red-500">Unblock Employee</h2>
        <p className="mt-2 text-gray-700">
          Are you sure you want to unblock <strong>{employee?.name}</strong>?
        </p>
        <div className="mt-4 flex justify-center gap-4">
        <button
          onClick={onConfirm} // Calls function to toggle status
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Yes
        </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnBlockEmployeeModal;
