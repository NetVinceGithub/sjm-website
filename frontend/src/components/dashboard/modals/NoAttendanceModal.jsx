import React from "react";

const NoAttendanceModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-lg font-semibold text-red-500">⚠ No Attendance Data</h2>
        <p className="mt-2 text-gray-700">Payroll cannot be generated because no attendance records were found.</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-black-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default NoAttendanceModal;
