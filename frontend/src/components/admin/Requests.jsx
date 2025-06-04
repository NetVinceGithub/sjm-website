import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaClipboardCheck, FaCheck, FaTimes, FaEye } from "react-icons/fa";
import { FaPenRuler } from "react-icons/fa6";
import { notifyPayrollRequests } from "../../utils/toastHelpers"
import { notifyChangeRequests } from "../../utils/toastHelper2"
import { toast } from 'react-toastify';

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

  const [userRole, setUserRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Add state for batch selection
  const [batches, setAvailableBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');

  useEffect(() => {
    const checkUserRole = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthorized(false);
        return;
      }
  
      try {
        const userResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/current`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        const currentUserRole = userResponse.data.user.role;
        setUserRole(currentUserRole);
  
        if (currentUserRole === "approver") {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Error checking authorization:", error);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };
  
    checkUserRole();
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      notifyChangeRequests();
      notifyPayrollRequests();
      fetchAvailableBatches(); // Fetch available batches when authorized
    }
  }, [isAuthorized]);

  useEffect(() => {
    if (isAuthorized && Array.isArray(changesRequests)) {
      notifyChangeRequests(changesRequests);
    }
  }, [isAuthorized, changesRequests]);

  // Fetch available batches
  const fetchAvailableBatches = async () => {
    try {
      // You may need to create this endpoint to get all unique batch IDs
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/payslip/batches`);
      setAvailableBatches(response.data);
      
      // Auto-select the latest batch if available
      if (response.data.length > 0) {
        setSelectedBatchId(response.data[0].batchId);
      }
    } catch (error) {
      console.error("Error fetching available batches:", error);
      // If the batches endpoint doesn't exist, you can set a default batchId
      // or handle this differently based on your requirements
    }
  };

  useEffect(() => {
    const fetchRequests = async () => {
      if (!selectedBatchId) return; // Don't fetch if no batch is selected
      
      try {
        setLoading(true);
        // Updated to use batchId parameter
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/payslip?batchId=${selectedBatchId}`);
        console.log(response.data);
        setRequests(response.data);
        notifyPayrollRequests(response.data);
      } catch (error) {
        console.error("Error fetching payroll requests:", error);
        setRequests([]); // Clear requests on error
      } finally {
        setLoading(false);
      }
    };

    const fetchChangeRequests = async () => {
      try {
        setLoadingChanges(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/employee/payroll-change-requests`
        );
        console.log("Change requests response:", response.data);

        if (response.data.success) {
          const filteredRequests = (response.data.data || []).filter(
            (req) => !["approved", "rejected"].includes(req.status.toLowerCase())
          );
          setChangesRequests(filteredRequests);
          notifyChangeRequests(filteredRequests);
        } else {
          console.error("Failed to fetch change requests:", response.data);
          setChangesRequests([]);
        }
      } catch (error) {
        console.error("Error fetching change requests:", error);
        setChangesRequests([]);
      } finally {
        setLoadingChanges(false);
      }
    };

    if (isAuthorized) {
      fetchRequests();
      fetchChangeRequests();
    }
  }, [isAuthorized, selectedBatchId]); // Added selectedBatchId as dependency

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
        toast.success(
          <div style={{ fontSize: '0.9rem'}}>
           Payroll approved successfully.
          </div>,
          {
            autoClose: 3000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            closeButton: false,
            position: "top-right",
          }
        );
      } else {
        toast.error(
          <div style={{ fontSize: '0.9rem'}}>
           Failed to approve payroll.
          </div>,
          {
            autoClose: 3000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            closeButton: false,
            position: "top-right",
          }
        );
      }
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error approving payroll:", error);
      toast.error(
        <div style={{ fontSize: '0.9rem'}}>
         Error approving payroll.
        </div>,
        {
          autoClose: 3000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          closeButton: false,
          position: "top-right",
        }
      );
      setShowSuccessModal(true);
    } finally {
      setLoadingPayroll(false);
    }
  };

  const formatRequestId = (id) => {
    const prefix = "SJM-C";
    const paddedNumber = id.toString().padStart(4, "0");
    return `${prefix}${paddedNumber}`;
  };

  const handleDeleteAll = async () => {
    try {
      // Updated to include batchId parameter for deletion
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/payslip?batchId=${selectedBatchId}`);
      setRequests([]);
      setShowModal(false);
    } catch (error) {
      console.error("Error deleting payroll requests:", error);
      toast.error(
        <div style={{ fontSize: '0.9rem'}}>
          Failed to delete payslips.
        </div>,
        {
          autoClose: 3000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          closeButton: false,
          position: "top-right",
        }
      );
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
        toast.success(
          <div style={{ fontSize: '0.9rem'}}>
           Change request approved successfully.
          </div>,
          {
            autoClose: 3000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            closeButton: false,
            position: "top-right",
          }
        );
        setShowChangeDetailModal(false);
        setTimeout(() => setChangesMessage(''), 3000);
      }
    } catch (error) {
      console.error("Error approving individual change:", error);
      toast.error(
        <div style={{ fontSize: '0.9rem'}}>
         Error approving change request.
        </div>,
        {
          autoClose: 3000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          closeButton: false,
          position: "top-right",
        }
      );
    }
  };

  const handleRejectIndividualChange = async (requestId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/employee/reject-payroll-change/${requestId}`
      );

      if (response.data.success) {
        setChangesRequests(prev => prev.filter(req => req.id !== requestId));
        toast.success(
          <div style={{ fontSize: '0.9rem'}}>
           Change request rejected successfully.
          </div>,
          {
            autoClose: 3000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            closeButton: false,
            position: "top-right",
          }
        );
        setShowChangeDetailModal(false);
        setTimeout(() => setChangesMessage(''), 3000);
      }
    } catch (error) {
      console.error("Error rejecting individual change:", error);
      toast.error(
        <div style={{ fontSize: '0.9rem'}}>
         Error rejecting change request.
        </div>,
        {
          autoClose: 3000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          closeButton: false,
          position: "top-right",
        }
      );
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

  if (loading) {
    return (
      <div className="p-6 h-[calc(100vh-150px)] flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!isAuthorized) {
    return (
      <div className="p-6 h-[calc(100vh-150px)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
          <p className="text-neutralDGray">You don't have permission to access this page.</p>
          <p className="text-sm italic text-gray-500 -mt-2">Only approvers can manage user accounts.</p>
        </div>
      </div>
    );
  }


return (
    <div className="flex flex-row gap-8 p-4 overflow-auto h-[calc(100vh-150px)]">
      {/* Payroll Requests Section */}
      <section className="flex-1 flex flex-col rounded-lg border p-2">
        <h2 className="text-neutralDGray text-lg font-semibold mb-3 flex items-center gap-2">
          <FaClipboardCheck className="h-8 w-8 text-lg text-neutralDGray" />
          Payroll Requests
        </h2>

        

        {message && <p className="text-green-500">{message}</p>}

        <div className="leading-snug overflow-y-auto pr-2 flex-1">
          {loading ? (
            <p className="text-gray-500">Loading payroll requests...</p>
          ) : batches && batches.length > 0 ? (
            <div className="space-y-4">
              {/* Summary Header */}
              <div className="border p-3 rounded shadow-md bg-blue-50">
                <p className="text-md mb-1 italic">
                  Total Batches: <span className="font-normal text-blue-600">{batches.length}</span>
                </p>
                <p className="text-md mb-1 italic">
                  Total Payslips: <span className="font-normal text-red-500">
                    {batches.reduce((total, batch) => {
                      const batchRequests = requests.filter(req => req.batchId === batch.batchId);
                      return total + batchRequests.length;
                    }, 0)}
                  </span>
                </p>
                <p className="text-md mb-1 italic">
                  Grand Total Amount: <span className="font-normal text-green-600">
                    ₱ {batches.reduce((total, batch) => {
                      const batchRequests = requests.filter(req => req.batchId === batch.batchId);
                      return total + batchRequests.reduce((sum, req) => sum + (req.net_pay || req.netPay || 0), 0);
                    }, 0).toLocaleString()}
                  </span>
                </p>
                <hr className="my-2" />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleApprove}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-900"
                  >
                    Approve All Batches
                  </button>
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-900"
                  >
                    Reject All Batches
                  </button>
                </div>
              </div>

              {/* Individual Batch Details */}
              {batches.map((batch, batchIndex) => {
                const batchRequests = requests.filter(req => req.batchId === batch.batchId);
                const batchTotalNetPay = batchRequests.reduce((sum, req) => sum + (req.net_pay || req.netPay || 0), 0);
                
                return (
                  <div key={batch.batchId} className="border p-3 rounded shadow-md">
                    <p className="text-md mb-1 italic">
                      Batch Payslips: <span className="font-normal text-red-500">{batchRequests.length}</span>
                    </p>
                    <div className="mb-2">
                      <hr className="mb-2 mt-1" />
                      <p><strong>Batch ID:</strong> {batch.batchId}</p>
                      <p><strong>Batch Amount:</strong> ₱ {batchTotalNetPay.toLocaleString()}</p>
                      <p>
                        <strong>Date Requested:</strong>{" "}
                        {batchRequests.length > 0 ? new Date(batchRequests[0]?.date).toLocaleDateString() : 'N/A'}
                      </p>

                      {/* Individual Payslips Display */}
                      {batchRequests.length > 0 && (
                        <div className="mt-4 mb-2">
                          <hr className="mb-2" />
                          <p className="text-sm font-semibold mb-2">Individual Payslips:</p>
                          <div className="max-h-64 overflow-y-auto">
                            {batchRequests.map((payslip, index) => (
                              <div key={index} className="border p-2 rounded shadow-sm bg-gray-50 mb-2">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-semibold text-sm">
                                      {payslip.employee_name || payslip.name || `Employee ${index + 1}`}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      Employee ID: {payslip.employee_id || payslip.employeeId || 'N/A'}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      Department: {payslip.department || 'N/A'}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      Position: {payslip.position || 'N/A'}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-semibold text-green-600">
                                      ₱ {(payslip.net_pay || payslip.netPay || 0).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Gross: ₱ {(payslip.gross_pay || payslip.grossPay || 0).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Deductions: ₱ {(payslip.total_deductions || payslip.totalDeductions || 0).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
              <div className="bg-white p-6 rounded-lg shadow-2xl w-11/12 sm:w-96 md:w-[28rem] lg:w-[30rem] relative">
                <h3 className="text-base mb-2 text-red-500">Confirm Rejection</h3>
                <p className="text-justify text-sm">Are you sure you want to reject all batch requests?</p>
                <p className="text-justify text-sm text-gray-600 mt-1">
                  This will reject {batches ? batches.length : 0} batches containing {" "}
                  {batches ? batches.reduce((total, batch) => {
                    const batchRequests = requests.filter(req => req.batchId === batch.batchId);
                    return total + batchRequests.length;
                  }, 0) : 0} total payslips.
                </p>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 w-24 h-8 border flex justify-center items-center text-center text-neutralDGray rounded-lg hover:bg-red-400 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAll}
                    className="px-4 py-2 w-24 h-8 border flex justify-center items-center text-center  text-neutralDGray rounded-lg hover:bg-green-400 hover:text-white transition-all"
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
                <h3 className="text-base mb-2 text-green-500">Success!</h3>
                <p className="text-justify text-sm">Payroll has been successfully approved.</p>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleCloseSuccessModal}
                    className="-mt-3 px-2 py-2 w-20 h-8 flex justify-center text-center items-center border border-neutralDGray text-neutralDGray rounded hover:bg-green-400"
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
      <section className="flex-1 flex flex-col rounded-lg border p-2">
        <h2 className="text-neutralDGray text-lg font-semibold mb-3 flex items-center gap-2">
          <FaPenRuler className="h-8 w-8 text-lg text-neutralDGray" />
          Change Requests
        </h2>

        {changesMessage && <p className="text-green-500">{changesMessage}</p>}

        <div className="leading-snug overflow-y-auto pr-2 flex-1">
          {changesLoading ? (
            <p className="text-gray-500">Loading change requests...</p>
          ) : changesRequests.length > 0 ? (
            <div className="border p-3 rounded shadow-md">
              <p className="text-md mb-1 italic">
                Total Changes: <span className="font-normal text-red-500">{changesRequests.length}</span>
              </p>
              <hr className="mb-2 mt-1" />

              {/* Individual Change Requests - Now inside the total changes div */}
              <div className="mb-2">
                {changesRequests.map((request) => {
                  const changedFields = getChangedFields(request.changes);
                  return (
                    <div key={request.id} className="border p-2 h-[100px] rounded shadow-sm bg-gray-50 mb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">Request ID: {formatRequestId(request.id)}</p>
                          <p className="text-xs -mt-3 text-gray-600">
                            Requested by: {request.requested_by}
                          </p>
                          <p className="text-xs -mt-3 text-gray-500">
                            Status: <span
                              className={`font-semibold ${
                                request.status === 'Pending'
                                  ? 'text-orange-500'
                                  : request.status === 'Rejected'
                                    ? 'text-red-600'
                                    : 'text-green-600'
                                }`}
                            >
                              {request.status}
                            </span>
                          </p>
                          <p className="text-xs -mt-3 text-gray-500">
                            Created at: {new Date(request.createdAt).toLocaleDateString()} at {new Date(request.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex gap-1 items-center border h-8 w-32 rounded justify-end">
                          <button
                            onClick={() => {
                              setSelectedChangeRequest(request);
                              setShowChangeDetailModal(true);
                            }}
                            className="p-2 text-neutralDGray hover:text-blue-600 rounded flex items-center justify-center"
                            title="View Details"
                          >
                            <FaEye size={14} />
                          </button>
                          {request.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleApproveIndividualChange(request.id)}
                                className="p-2 text-neutralDGray hover:text-green-600 rounded flex items-center justify-center"
                                title="Approve"
                              >
                                <FaCheck size={14} />
                              </button>
                              <button
                                onClick={() => handleRejectIndividualChange(request.id)}
                                className="p-2 text-neutralDGray hover:text-red-100 rounded flex items-center justify-center"
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
                  className="bg-green-500 text-white w-32 h-8 text-sm px-3 py-1 rounded hover:bg-green-900 disabled:opacity-50"
                >
                  {loadingChanges ? 'Processing...' : 'Approve All'}
                </button>
                <button
                  onClick={() => setShowChangesModal(true)}
                  disabled={loadingChanges}
                  className="bg-red-500 text-white px-3 py-1 w-32 h-8 text-sm  rounded hover:bg-red-900 disabled:opacity-50"
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
                <h3 className="text-[18px] mb-3">Change Request Details</h3>
                <hr />
                <div className="space-y-3">
                  <div>
                    <p className="text-sm">Request ID: {formatRequestId(selectedChangeRequest.id)}</p>
                  </div>
                  <div>
                    <p className="text-sm">Requested By: {selectedChangeRequest.requested_by}</p>
                  </div>
                  <div>
                    <p className="text-sm">
                      Status:{" "}
                      <span
                        className={`font-semibold ${
                          selectedChangeRequest.status === "Pending"
                            ? "text-orange-500"
                            : selectedChangeRequest.status === "Rejected"
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                      >
                        {selectedChangeRequest.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <div className="bg-gray-100 p-2 rounded space-y-2">
                    <p className="text-sm italic mb-1 ">Requested Changes:</p>
                      {getChangedFields(selectedChangeRequest.changes).map((change, index) => (
                        <div key={index} className="text-sm">
                          <p>
                            <span className="font-medium">{change.displayName}:</span>{" "}
                            {String(change.value)}
                          </p>
                        </div>
                      ))}
                       <p className="text-sm italic mb-1 ">Reason for Changes: </p>
                       <p className="text-sm">{selectedChangeRequest.reasons}</p>

                    </div>
                  </div>
                  <div>
                    <p className="text-sm">Created at: {new Date(selectedChangeRequest.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => setShowChangeDetailModal(false)}
                    className="flex items-center justify-center px-4 py-2 w-32 h-8 text-sm text-center bg-gray-600 text-white rounded hover:bg-neutralDGray"

                  >
                    Close
                  </button>

                  {selectedChangeRequest.status === "Pending" && (
                    <>
                      <button
                        onClick={() => handleApproveIndividualChange(selectedChangeRequest.id)}
                        className="flex items-center justify-center px-4 py-2 w-32 h-8 text-sm text-center bg-green-600 text-white rounded hover:bg-neutralDGray"

                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectIndividualChange(selectedChangeRequest.id)}
                        className="flex items-center justify-center px-4 py-2 w-32 h-8 text-sm text-center bg-red-600 text-white rounded hover:bg-neutralDGray"

                      >
                        Reject
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