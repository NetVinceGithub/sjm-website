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
        // Updated to use your new API endpoint
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/employee/payroll-change-requests`);
        console.log("Change requests response:", response.data);
        
        if (response.data.success) {
          setChangesRequests(response.data.data || []);
        } else {
          console.error("Failed to fetch change requests:", response.data);
          setChangesRequests([]);
        }
      } catch (error) {
        console.error("Error fetching change requests:", error);
        setChangesRequests([]);
      } finally {
        setChangesLoading(false);
      }
    };

    fetchRequests();
    fetchChangeRequests();
  }, []);

  // Function to get changed fields from the changes object
  const getChangedFields = (changes) => {
    if (!changes || typeof changes !== 'object') return [];
    
    // Convert changes object to array of changed fields
    return Object.entries(changes).map(([field, value]) => ({
      field,
      value,
      displayName: formatFieldName(field)
    }));
  };

  const handleApprove = async () => {
    try {
      setLoadingPayroll(true);
      // Send the entire list of requests in one POST request
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/payslip/send-payslip`, {
        payslips: requests,
      });
  
      if (response.data.success) {
        setMessage("Payroll approved successfully.");
      } else {
        setMessage("Failed to approve payroll.");
      }
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error approving payroll:", error);
      setMessage("Error approving payroll.");
      setShowSuccessModal(true);
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

  // Change request handlers - Updated for new API structure
  const handleApproveChanges = async () => {
    try {
      setLoadingChanges(true);
      // You'll need to implement a bulk approve endpoint or loop through individual requests
      const promises = changesRequests.map(request => 
        axios.post(`${import.meta.env.VITE_API_URL}/api/employee/approve-payroll-change/${request.id}`)
      );
      
      await Promise.all(promises);
      setChangesMessage("All change requests approved successfully");
      setChangesRequests([]);
      setTimeout(() => setChangesMessage(''), 3000);
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
      // You'll need to implement a bulk reject endpoint or loop through individual requests
      const promises = changesRequests.map(request => 
        axios.post(`${import.meta.env.VITE_API_URL}/api/employee/reject-payroll-change/${request.id}`)
      );
      
      await Promise.all(promises);
      setChangesMessage("All change requests rejected successfully");
      setChangesRequests([]);
      setShowChangesModal(false);
      setTimeout(() => setChangesMessage(''), 3000);
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
        `${import.meta.env.VITE_API_URL}/api/employee/approve-payroll-change/${requestId}`
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
        `${import.meta.env.VITE_API_URL}/api/employee/reject-payroll-change/${requestId}`
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
      'overtime_pay': 'Overtime Pay',
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
    return fieldMap[fieldName] || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const safeRequests = Array.isArray(requests) ? requests : [];
  const totalNetPay = safeRequests.reduce(
    (acc, curr) => acc + Number(curr.netPay || 0),
    0
  );

  return (
    <div className="flex flex-row gap-8 p-4 overflow-auto h-[calc(100vh-150px)]">
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
            <div className="border p-3 rounded shadow-md">
              <p className="text-lg font-semibold mb-1">
                Total Changes: <span className="font-normal">{changesRequests.length}</span>
              </p>
              <hr className="mb-2 mt-1" />
              
              {/* Individual Change Requests - Now inside the total changes div */}
              <div className="space-y-2 mb-3">
                {changesRequests.map((request) => {
                  const changedFields = getChangedFields(request.changes);
                  return (
                    <div key={request.id} className="border p-3 rounded shadow-sm bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">Request ID: {request.id}</p>
                          <p className="text-xs text-gray-600">
                            Requested by: {request.requested_by}
                          </p>
                          <p className="text-xs text-gray-500">
                            Status: <span className={`font-semibold ${request.status === 'Pending' ? 'text-orange-600' : 'text-green-600'}`}>
                              {request.status}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500">
                            Created at: {new Date(request.createdAt).toLocaleDateString()} at {new Date(request.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex gap-1 items-center justify-end">
                          <button
                            onClick={() => {
                              setSelectedChangeRequest(request);
                              setShowChangeDetailModal(true);
                            }}
                            className="p-2 text-blue-500 hover:bg-blue-100 rounded flex items-center justify-center"
                            title="View Details"
                          >
                            <FaEye size={14} />
                          </button>
                          {request.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleApproveIndividualChange(request.id)}
                                className="p-2 text-green-500 hover:bg-green-100 rounded flex items-center justify-center"
                                title="Approve"
                              >
                                <FaCheck size={14} />
                              </button>
                              <button
                                onClick={() => handleRejectIndividualChange(request.id)}
                                className="p-2 text-red-500 hover:bg-red-100 rounded flex items-center justify-center"
                                title="Reject"
                              >
                                <FaTimes size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Approve All and Reject All buttons - Now at the bottom */}
              <div className="flex gap-2 mt-2">
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
              <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-lg max-h-[80vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">Change Request Details</h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold">Request ID:</p>
                    <p className="text-gray-700">{selectedChangeRequest.id}</p>
                  </div>
                  
                  <div>
                    <p className="font-semibold">Payroll Info ID:</p>
                    <p className="text-gray-700">{selectedChangeRequest.payroll_info_id}</p>
                  </div>
                  
                  <div>
                    <p className="font-semibold">Requested By:</p>
                    <p className="text-gray-700">{selectedChangeRequest.requested_by}</p>
                  </div>
                  
                  <div>
                    <p className="font-semibold">Status:</p>
                    <p className={`font-semibold ${selectedChangeRequest.status === 'Pending' ? 'text-orange-600' : 'text-green-600'}`}>
                      {selectedChangeRequest.status}
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-semibold">Requested Changes:</p>
                    <div className="bg-gray-50 p-3 rounded mt-1 space-y-2">
                      {getChangedFields(selectedChangeRequest.changes).map(({field, value, displayName}) => (
                        <div key={field} className="text-sm">
                          <span className="font-medium">{displayName}:</span>
                          <span className="text-green-600 ml-2">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-semibold">Created:</p>
                    <p className="text-gray-700">
                      {new Date(selectedChangeRequest.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold">Last Updated:</p>
                    <p className="text-gray-700">
                      {new Date(selectedChangeRequest.updatedAt).toLocaleString()}
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
                  {selectedChangeRequest.status === 'Pending' && (
                    <>
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
                    </>
                  )}
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