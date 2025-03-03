import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaClipboardCheck } from "react-icons/fa";

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/payslip/pending-requests");
        setRequests(response.data || []);
      } catch (error) {
        console.error("Error fetching payroll requests:", error);
      }
    };

    fetchRequests();
  }, []);

  const handleApproveRelease = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/payslip/release-payroll");

      if (response.data.success) {
        alert("✅ Payroll successfully released!");
        setRequests([]); // Clear requests after approval
      } else {
        alert("❌ Failed to release payroll. " + response.data.message);
      }
    } catch (error) {
      console.error("❌ Error releasing payroll:", error.response?.data || error);
      alert("❌ An error occurred: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 mt-1 flex text-neutralDGray items-center gap-2">
        <FaClipboardCheck className="h-8 w-8 text-neutralDGray" />Payroll Requests</h2>

      {requests.length === 0 ? (
        <p className="text-gray-500">No pending payroll requests.</p>
      ) : (
        <ul className="divide-y divide-gray-300">
          {requests.map((request, index) => (
            <li key={index} className="py-2">
              <p><strong>Employee:</strong> {request.employeeName}</p>
              <p><strong>Amount:</strong> ${request.amount}</p>
              <p><strong>Date Requested:</strong> {new Date(request.date).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleApproveRelease}
          disabled={requests.length === 0 || loading}
          className={`mt-4 w-[20%] px-4 py-2 rounded ${
            requests.length === 0 || loading ? "bg-gray-400 cursor-not-allowed" : "bg-brandPrimary hover:bg-neutralDGray text-white"
          }`}
        >
          {loading ? "Processing..." : "Approve Payroll Release"}
        </button>
      </div>
    </div>
  );
};

export default Requests;
