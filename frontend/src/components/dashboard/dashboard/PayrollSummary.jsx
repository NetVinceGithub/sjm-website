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
  
      const response = await axios.post("http://localhost:5000/api/payslip/generate", { cutoffDate });
  
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
        <Link to={`/payslip/${row.ecode}`} style={{ textDecoration: "none" }}>
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
      <Breadcrumb items={[{ label: "Dashboard", href: "" }, { label: "Payroll Overview", href: "" }]} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6 items-stretch">
        <SummaryCard icon={<FaCashRegister />} title="Total Payroll" number={payslips.length} color="bg-[#88B9D3]" />
        <SummaryCard icon={<FaHandHoldingUsd />} title="Gross Salary" number={payslips.reduce((acc, p) => acc + (p.basicPay || 0), 0).toLocaleString()} color="bg-[#B9DD8B]" />
        <SummaryCard icon={<FaChartPie />} title="Total Employee Benefits" number={0} color="bg-[#D18AA6]" />
        <SummaryCard icon={<FaUsers />} title="Total Headcount" number={payslips.length} color="bg-[#95B375]" />
      </div>

      <div className="flex gap-6 mt-6">
        {/* Left Section (Form + Table) */}
        <div className="w-[70%]">
          {/* Cutoff Date Input */}
          <label className="block text-sm font-medium text-gray-700">Cutoff Date:</label>
          <input
            type="text"
            value={cutoffDate} // Display the selected date
            readOnly
            className="mt-1 p-2 border rounded w-full bg-gray-100 cursor-not-allowed"
          />

          {/* Button Section */}
          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleCreatePayroll}
              className={`px-2 py-1 -mt-3 rounded w-32 h-10 text-white ${cutoffDate ? "bg-brandPrimary hover:bg-neutralDGray" : "bg-neutralGray cursor-not-allowed"}`}
              disabled={loading || !cutoffDate}
            >
              {loading ? "Generating..." : "Create Payroll"}
            </button>

            <button
              onClick={handleReleaseRequest}
              className="px-4 bg-brandPrimary py-1 -mt-3 rounded w-32 h-10 text-white hover:bg-neutralDGray"
              disabled={sending}
            >
              {sending ? "Sending..." : "Request"}
            </button>
          </div>

          {/* Success/Error Message */}
          {message && <p className="mt-4 text-center text-green-600">{message}</p>}

          {/* Data Table */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold px-2 py-2 bg-gray-200 mb-2">Payroll Details</h4>
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
        <div className="w-[30%]">
          <CustomCalendar onDateChange={setCutoffDate} />
        </div>
      </div>
    </div>
  );
};

export default PayrollSummary;
