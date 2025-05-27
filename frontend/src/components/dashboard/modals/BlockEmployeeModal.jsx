import React from "react";

const BlockEmployeeModal = ({ isOpen, onClose, onConfirm, employee }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-11/12 sm:w-96 md:w-[28rem] lg:w-[30rem] relative">
        <h2 className="text-base mb-2 text-red-500">Block Employee</h2>
        <p className="text-center text-sm">
          Are you sure you want to block <strong>{employee?.name}</strong>?
        </p>
        <div className="mt-4 flex justify-center gap-4">
        <button
            onClick={onClose}
            className="px-4 py-2 w-24 h-8 border flex justify-center items-center text-center text-neutralDGray rounded-lg hover:bg-red-400 hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm} // Calls function to toggle status
            className="px-4 py-2 w-24 h-8 border flex justify-center items-center text-center  text-neutralDGray rounded-lg hover:bg-green-400 hover:text-white transition-all"
          >
            Yes
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default BlockEmployeeModal;
