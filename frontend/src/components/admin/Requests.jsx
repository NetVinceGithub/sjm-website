import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaClipboardCheck } from "react-icons/fa";
import { FaPenRuler } from "react-icons/fa6";

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [changesRequests, setChangesRequests] = useState([]);
  const [changesLoading, setChangesLoading] = useState(false);
  const [changesMessage, setChangesMessage] = useState('');
  const [showChangesModal, setShowChangesModal] = useState(false);

  // Also handlers like handleApproveChanges, setShowChangesModal, etc.

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loadingPayroll, setLoadingPayroll] = useState(false); // New loading state

  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/payslip`);
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
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payslip/release-payroll`
      );

      if (response.data.success) {
        setMessage(response.data.message);
        setRequests((prev) => prev.map((p) => ({ ...p, status: "approved" })));
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
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/payslip`);
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

const safeRequests = Array.isArray(requests) ? requests : [];

const totalNetPay = safeRequests.reduce(
  (acc, curr) => acc + Number(curr.netPay || 0),
  0
);


  return (
    <div className="flex flex-row gap-8 p-4 overflow-auto h-[450px]">
      {/* Payroll Requests Section */}
      <section className="flex-1 flex flex-col">
        <h2 className="text-neutralDGray text-lg font-semibold -mt-3 mb-3 flex items-center gap-2">
          <FaClipboardCheck className="h-8 w-8 text-lg text-neutralDGray" />
          Payroll Requests
    </h2>

        {message && <p className="text-green-500">{message}</p>}

        <div className="leading-snug overflow-y-auto pr-2 flex-1">
          {loading ? (
            <p className="text-gray-500">Loading payroll requests...</p>
          ) : requests.length > 0 ? (
            <div className="border p-3 rounded shadow-md">
              <p className="text-lg font-semibold mb-1">
                Total Payslips: <span className="font-normal">{requests.length}</span>
              </p>
              <hr className="mb-2 mt-1" />
              <p><strong>Amount:</strong> ₱ {totalNetPay}</p>
              <p>
                <strong>Date Requested:</strong>{" "}
                {new Date(requests[0] ?.date).toLocaleDateString()}
              </p>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleApprove}
                  className="bg-green-500 text-white w-20 px-2 py-1 rounded hover:bg-green-900"
                >
                  Approve
            </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-red-500 text-white w-20 px-2 py-1 rounded hover:bg-red-900"
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
      </section>

      {/* Changes Requests Section */}
      <section className="flex-1 flex flex-col">
        <h2 className="text-neutralDGray text-lg font-semibold -mt-3 mb-3 flex items-center gap-2">
          <FaPenRuler className="h-8 w-8 text-lg text-neutralDGray" />
          Changes Requests
    </h2>

        {changesMessage && <p className="text-green-500">{changesMessage}</p>}

        <div className="leading-snug overflow-y-auto pr-2 flex-1">
          {changesLoading ? (
            <p className="text-gray-500">Loading changes requests...</p>
          ) : changesRequests.length > 0 ? (
            <div className="border p-3 rounded shadow-md">
              <p className="text-lg font-semibold mb-1">
                Total Changes: <span className="font-normal">{changesRequests.length}</span>
              </p>
              <hr className="mb-2 mt-1" />
              <p><strong>Requested On:</strong> {new Date(changesRequests[0] ?.date).toLocaleDateString()}</p>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleApproveChanges}
                  className="bg-green-500 text-white w-20 px-2 py-1 rounded hover:bg-green-900"
                >
                  Approve
            </button>
                <button
                  onClick={() => setShowChangesModal(true)}
                  className="bg-red-500 text-white w-20 px-2 py-1 rounded hover:bg-red-900"
                >
                  Reject
            </button>
              </div>
            </div>
          ) : (
                <p className="text-gray-500">No pending changes requests.</p>
              )}

          {/* You can add modals for changes requests here similarly */}
        </div>
      </section>
    </div>

  );
};

export default Requests;
