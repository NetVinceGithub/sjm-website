import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaClipboardCheck } from "react-icons/fa";

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loadingPayroll, setLoadingPayroll] = useState(false); // New loading state

  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/payslip");
        console.log(response.data);
        setRequests(response.data);
      } catch (error) {
        console.error("Error fetching payroll requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleApprove = async () => {
    try {
      setLoadingPayroll(true); // Show loading modal
      const response = await axios.post("http://localhost:5000/api/payslip/release-payroll");
  
      if (response.data.success) {
        setMessage(response.data.message);
        setRequests((prev) =>
          prev.map((p) => ({ ...p, status: "approved" })) 
        );
        setShowSuccessModal(true);
      } else {
        setMessage("Failed to release payroll.");
      }
    } catch (error) {
      console.error("Error approving payroll:", error);
      setMessage("Error processing payroll release.");
    } finally {
      setLoadingPayroll(false); // Hide loading modal after process
    }
  };

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

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setRequests([]); 
  };

  const totalNetPay = requests.reduce((acc, curr) => acc + Number(curr.netPay || 0), 0);

  return (
    <div className="p-6 bg-white rounded shadow-sm">
      <h2 className="text-2xl font-bold mb-6 mt-1 flex text-neutralDGray items-center gap-2">
        <FaClipboardCheck className="h-8 w-8 text-neutralDGray" />
        Payroll Requests
      </h2>

      {message && <p className="text-green-600">{message}</p>}

      {loading ? (
        <p className="text-gray-500">Loading payroll requests...</p>
      ) : requests.length > 0 ? (
        <div className="border p-4 rounded shadow-md">
          <p className="text-lg font-semibold mb-4">Total Payslips: {requests.length}</p>
          <p><strong>Amount:</strong> ₱ {totalNetPay}</p>
          <p><strong>Date Requested:</strong> {new Date(requests[0]?.date).toLocaleDateString()}</p>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleApprove}
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
      
      {/* Loading Modal */}
      {loadingPayroll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <h3 className="text-lg font-semibold mb-4">Processing Payroll</h3>
            <p>Payroll is being distributed.</p>
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          </div>
        </div>
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

      {/* Success Modal for Approval */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Success!</h3>
            <p>Payroll has been successfully approved.</p>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleCloseSuccessModal}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;
