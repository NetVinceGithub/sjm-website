import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaClipboardCheck } from "react-icons/fa";

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState(""); // To store API response messages

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/payslip");
        setRequests(response.data);
      } catch (error) {
        console.error("Error fetching payroll requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Function to release payroll (approve all pending payslips)
  const handleApprove = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/release-payroll");
  
      if (response.data.success) {
        setMessage(response.data.message);
        setRequests((prev) =>
          prev.map((p) => ({ ...p, status: "approved" })) // Update UI
        );
      } else {
        setMessage("Failed to release payroll.");
      }
    } catch (error) {
      console.error("Error approving payroll:", error);
      setMessage("Error processing payroll release.");
    }
  };
  

  // Function to delete all payslips (Reject)
  const handleDeleteAll = async () => {
    try {
      await axios.delete("http://localhost:5000/api/payslip");
      setRequests([]); 
      setShowModal(false);
    } catch (error) {
      console.error("Error deleting payroll requests:", error);
      alert("Failed to delete payslips.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 mt-1 flex text-neutralDGray items-center gap-2">
        <FaClipboardCheck className="h-8 w-8 text-neutralDGray" />
        Payroll Requests
      </h2>

      {message && <p className="text-green-600">{message}</p>} {/* Show success/error message */}

      {loading ? (
        <p className="text-gray-500">Loading payroll requests...</p>
      ) : requests.length > 0 ? (
        <div className="border p-4 rounded shadow-md">
          <p className="text-lg font-semibold mb-4">Total Payslips: {requests.length}</p>

          <p><strong>Amount:</strong> ${requests[0]?.amount}</p>
          <p><strong>Date Requested:</strong> {new Date(requests[0]?.date).toLocaleDateString()}</p>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleApprove} // Call handleApprove function on click
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            >
              Approve
            </button>
            <button
              onClick={() => setShowModal(true)} 
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Reject
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">No pending payroll requests.</p>
      )}

      {/* Confirmation Modal for Rejection */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Confirm Rejection</h3>
            <p>Are you sure you want to reject the request?</p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)} 
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll} 
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;
