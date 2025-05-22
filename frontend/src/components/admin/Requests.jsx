import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaClipboardCheck, FaCheck, FaTimes, FaEye } from "react-icons/fa";
import { FaPenRuler } from "react-icons/fa6";

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [changesRequests, setChangesRequests] = useState([]);
  const [changesLoading, setChangesLoading] = useState(false);
  const [changesMessage, setChangesMessage] = useState('');
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [selectedChangeRequest, setSelectedChangeRequest] = useState(null);
  const [showChangeDetailModal, setShowChangeDetailModal] = useState(false);
  const [loadingChanges, setLoadingChanges] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loadingPayroll, setLoadingPayroll] = useState(false);
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

    const fetchChangeRequests = async () => {
      try {
        setChangesLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/change-requests/pending`);
        if (response.data.success) {
          setChangesRequests(response.data.requests);
        }
      } catch (error) {
        console.error("Error fetching change requests:", error);
      } finally {
        setChangesLoading(false);
      }
    };

    fetchRequests();
    fetchChangeRequests();
  }, []);

  // Payroll request handlers
  const handleApprove = async () => {
    try {
      setLoadingPayroll(true);
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
      setLoadingPayroll(false);
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

  // Change request handlers
  const handleApproveChanges = async () => {
    try {
      setLoadingChanges(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/change-requests/approve-all`,
        { reviewed_by: 1 } // Replace with actual admin ID
      );

      if (response.data.success) {
        setChangesMessage(response.data.message);
        setChangesRequests([]);
        setTimeout(() => setChangesMessage(''), 3000);
      } else {
        setChangesMessage("Failed to approve changes.");
      }
    } catch (error) {
      console.error("Error approving changes:", error);
      setChangesMessage("Error processing change approval.");
    } finally {
      setLoadingChanges(false);
    }
  };

  const handleRejectAllChanges = async () => {
    try {
      setLoadingChanges(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/change-requests/reject-all`,
        { reviewed_by: 1 } // Replace with actual admin ID
      );

      if (response.data.success) {
        setChangesMessage(response.data.message);
        setChangesRequests([]);
        setShowChangesModal(false);
        setTimeout(() => setChangesMessage(''), 3000);
      } else {
        setChangesMessage("Failed to reject changes.");
      }
    } catch (error) {
      console.error("Error rejecting changes:", error);
      setChangesMessage("Error processing change rejection.");
    } finally {
      setLoadingChanges(false);
    }
  };

  const handleApproveIndividualChange = async (requestId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/change-requests/approve/${requestId}`,
        { reviewed_by: 1 } // Replace with actual admin ID
      );

      if (response.data.success) {
        setChangesRequests(prev => prev.filter(req => req.id !== requestId));
        setChangesMessage("Change request approved successfully");
        setShowChangeDetailModal(false);
        setTimeout(() => setChangesMessage(''), 3000);
      }
    } catch (error) {
      console.error("Error approving individual change:", error);
      setChangesMessage("Error approving change request");
    }
  };

  const handleRejectIndividualChange = async (requestId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/change-requests/reject/${requestId}`,
        { reviewed_by: 1 } // Replace with actual admin ID
      );

      if (response.data.success) {
        setChangesRequests(prev => prev.filter(req => req.id !== requestId));
        setChangesMessage("Change request rejected successfully");
        setShowChangeDetailModal(false);
        setTimeout(() => setChangesMessage(''), 3000);
      }
    } catch (error) {
      console.error("Error rejecting individual change:", error);
      setChangesMessage("Error rejecting change request");
    }
  };

  const formatFieldName = (fieldName) => {
    const fieldMap = {
      'daily_rate': 'Daily Rate',
      'holiday_pay': 'Holiday Pay',
      'night_differential': 'Night Differential',
      'allowance': 'Allowance',
      'tax_deduction': 'Tax Deduction',
      'sss_contribution': 'SSS Contribution',
      'pagibig_contribution': 'Pag-IBIG Contribution',
      'philhealth_contribution': 'PhilHealth Contribution',
      'loan': 'Loan',
      'name': 'Name',
      'designation': 'Position'
    };
    return fieldMap[fieldName] || fieldName;
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
              <p><strong>Amount:</strong> ₱ {totalNetPay.toLocaleString()}</p>
              <p>
                <strong>Date Requested:</strong>{" "}
                {new Date(requests[0]?.date).toLocaleDateString()}
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
          Change Requests
        </h2>

        {changesMessage && <p className="text-green-500">{changesMessage}</p>}

        <div className="leading-snug overflow-y-auto pr-2 flex-1">
          {changesLoading ? (
            <p className="text-gray-500">Loading change requests...</p>
          ) : changesRequests.length > 0 ? (
            <div className="space-y-3">
              <div className="border p-3 rounded shadow-md">
                <p className="text-lg font-semibold mb-1">
                  Total Changes: <span className="font-normal">{changesRequests.length}</span>
                </p>
                <hr className="mb-2 mt-1" />
                
                <div className="flex gap-2 mt-2 mb-3">
                  <button
                    onClick={handleApproveChanges}
                    disabled={loadingChanges}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-900 disabled:opacity-50"
                  >
                    {loadingChanges ? 'Processing...' : 'Approve All'}
                  </button>
                  <button
                    onClick={() => setShowChangesModal(true)}
                    disabled={loadingChanges}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-900 disabled:opacity-50"
                  >
                    Reject All
                  </button>
                </div>
              </div>

              {/* Individual Change Requests */}
              <div className="space-y-2">
                {changesRequests.map((request) => (
                  <div key={request.id} className="border p-3 rounded shadow-sm bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{request.employee_name}</p>
                        <p className="text-xs text-gray-600">
                          {formatFieldName(request.field_name)}: {request.old_value} → {request.new_value}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(request.requested_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setSelectedChangeRequest(request);
                            setShowChangeDetailModal(true);
                          }}
                          className="p-1 text-blue-500 hover:bg-blue-100 rounded"
                          title="View Details"
                        >
                          <FaEye size={12} />
                        </button>
                        <button
                          onClick={() => handleApproveIndividualChange(request.id)}
                          className="p-1 text-green-500 hover:bg-green-100 rounded"
                          title="Approve"
                        >
                          <FaCheck size={12} />
                        </button>
                        <button
                          onClick={() => handleRejectIndividualChange(request.id)}
                          className="p-1 text-red-500 hover:bg-red-100 rounded"
                          title="Reject"
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No pending change requests.</p>
          )}

          {/* Confirmation Modal for Rejecting All Changes */}
          {showChangesModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h3 className="text-lg font-semibold mb-4">Confirm Rejection</h3>
                <p>Are you sure you want to reject all change requests?</p>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowChangesModal(false)}
                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRejectAllChanges}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Change Detail Modal */}
          {showChangeDetailModal && selectedChangeRequest && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-lg">
                <h3 className="text-lg font-semibold mb-4">Change Request Details</h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold">Employee:</p>
                    <p className="text-gray-700">{selectedChangeRequest.employee_name}</p>
                  </div>
                  
                  <div>
                    <p className="font-semibold">Field:</p>
                    <p className="text-gray-700">{formatFieldName(selectedChangeRequest.field_name)}</p>
                  </div>
                  
                  <div>
                    <p className="font-semibold">Change:</p>
                    <p className="text-gray-700">
                      <span className="line-through text-red-500">{selectedChangeRequest.old_value}</span>
                      {' → '}
                      <span className="text-green-600">{selectedChangeRequest.new_value}</span>
                    </p>
                  </div>
                  
                  {selectedChangeRequest.reason && (
                    <div>
                      <p className="font-semibold">Reason:</p>
                      <p className="text-gray-700">{selectedChangeRequest.reason}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="font-semibold">Requested:</p>
                    <p className="text-gray-700">
                      {new Date(selectedChangeRequest.requested_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowChangeDetailModal(false)}
                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleRejectIndividualChange(selectedChangeRequest.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApproveIndividualChange(selectedChangeRequest.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Requests;