import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { FaUsers, FaCashRegister, FaHandHoldingUsd, FaChartPie } from "react-icons/fa";
import axios from "axios";
import { Link } from "react-router-dom";
import SummaryCard from "./SummaryCard";
import Breadcrumb from "./Breadcrumb";
import CustomCalendar from "./CustomCalendar";

const PayrollSummary = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [cutoffDate, setCutoffDate] = useState(""); // Store selected cutoff date

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/payslip");
        setPayslips(response.data);
      } catch (error) {
        console.error("Error fetching payslips:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayslips();
  }, []);

  // Compute and generate payslips
  const handleCreatePayroll = async () => {
    if (!cutoffDate) {
      alert("Please select a cutoff date!");
      return;
    }
  
    try {
      setMessage("");
      setLoading(true);
      console.log("📩 Sending request with cutoffDate:", cutoffDate);
  
      const response = await axios.post("http://localhost:5000/api/payslip/generate", { cutoffDate: cutoffDate.trim() });
  
      console.log("✅ Payroll response:", response.data);
  
      if (response.data.success && Array.isArray(response.data.payslips)) {
        setPayslips(response.data.payslips);
        setMessage("✅ Payroll successfully generated!");
      } else {
        console.error("❌ Error Details:", response.data);
        setMessage(`❌ Failed to generate payroll: ${response.data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("❌ Full error response:", error.response?.data || error);
      setMessage(`❌ ${error.response?.data?.message || "An error occurred while generating payroll."}`);
    } finally {
      setLoading(false);
    }
  };
  
  
  
  const handleReleaseRequest = async () => {
    if (!payslips.length) {
      alert("No payslips available!");
      return;
    }

    setSending(true);
    setMessage("");

    try {
      // Send release request to the backend
      const response = await axios.post("http://localhost:5000/api/payslip/request-release", { status: "pending" });

      if (response.data.success) {
        setMessage("✅ Payroll release request sent to Admin!");
      } else {
        setMessage("❌ Failed to send request.");
      }
    } catch (error) {
      console.error("Error sending request:", error);
      setMessage("❌ An error occurred while sending the request.");
    } finally {
      setSending(false);
    }
  };

  // Define table columns
  const columns = [
    { name: "Employee ID", selector: (row) => row.ecode || "N/A", sortable: true },
    { name: "Employee Name", selector: (row) => row.name || "Unknown", sortable: true },
    { name: "Email", selector: (row) => row.email || "Unknown", sortable: true },
    { name: "Basic Pay", selector: (row) => `₱${(row.basicPay || 0).toLocaleString()}`, sortable: true },
    { name: "Gross Salary", selector: (row) => `₱${(row.gross_pay || 0).toLocaleString()}`, sortable: true },
    { name: "Deductions", selector: (row) => `₱${(row.totalDeductions || 0).toLocaleString()}`, sortable: true },
    { name: "Net Salary", selector: (row) => `₱${(row.netPay || 0).toLocaleString()}`, sortable: true },
    {
      name: "Payslip",
      cell: (row) => (
        <Link to={`/admin-dashboard/employees/payslip/${row.employeeId}`} style={{ textDecoration: "none" }}>
          <button
            style={{
              backgroundColor: "#007bff",
              color: "white",
              padding: "5px 10px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            View Payslip
          </button>
        </Link>
      ),
    },
  ];

  return (
    <div className="fixed w-[80rem] h-screen p-6 pt-20">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
          items={[
            { label: "Payroll", href: "" },
            { label: "Payroll Information", href: "/admin-dashboard/employees" },
            { label: "Payroll Generator", href: "/admin-dashboard/employees" },
          ]}
        />
        <div className="flex gap-4 mt-3">
          {/* Left Section (Payroll Form) */}
          <div className="w-[60%] bg-white rounded shadow-sm p-3">
            {/* Cutoff Date Input */}
            <label className="block text-sm font-medium text-gray-700">Cutoff Date:</label>
            <div className="flex items-center justify-between mt-3">
              {/* Cutoff Date Input */}
              <input
                type="text"
                value={cutoffDate}
                readOnly
                className="p-2 border rounded w-[60%] bg-gray-100 cursor-not-allowed"
              />

              {/* Button Section */}
              <div className="flex space-x-2">
                <button
                  onClick={handleCreatePayroll}
                  className={`px-2 py-1 ml-2 rounded w-36 h-10 text-white ${
                    cutoffDate ? "bg-brandPrimary hover:bg-neutralDGray" : "bg-neutralGray cursor-not-allowed opacity-50"
                  }`}
                  disabled={loading || !cutoffDate}
                >
                  {loading ? "Generating..." : "Create Payroll"}
                </button>

                <button
                  onClick={handleReleaseRequest}
                  className="px-4 bg-brandPrimary py-1 rounded w-32 h-10 text-white hover:bg-neutralDGray disabled:opacity-50"
                  disabled={sending}
                >
                  {sending ? "Sending..." : "Request"}
                </button>
              </div>
            </div>

            {/* Success/Error Message */}
            {message && <p className="mt-4 text-center text-green-600">{message}</p>}

            {/* Data Table */}
            <div className="mt-6">
              <h4 className="text-lg text-neutralDGray rounded font-semibold px-2 py-2 bg-gray-200 mb-2">Payroll Details</h4>
              {loading ? (
                <p className="mt-6 text-center text-gray-600">Loading payslips...</p>
              ) : payslips.length > 0 ? (
                <DataTable columns={columns} data={payslips} pagination highlightOnHover striped />
              ) : (
                <p className="mt-6 text-center text-gray-600">No payslip records available.</p>
              )}
            </div>
          </div>

          {/* Right Section (Calendar) */}
          <div className="w-[40%]">
            <CustomCalendar onDateChange={setCutoffDate} />
          </div>
        </div>
      </div>
  );
};

export default PayrollSummary;
