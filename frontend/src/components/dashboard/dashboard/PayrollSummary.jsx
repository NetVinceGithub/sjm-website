import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { FaSearch } from "react-icons/fa";
import axios from "axios";
import { Link } from "react-router-dom";
import SummaryCard from "./SummaryCard";
import Breadcrumb from "./Breadcrumb";
import CustomCalendar from "./CustomCalendar";
import { FaPrint, FaRegFileExcel, FaRegFilePdf } from "react-icons/fa6";
import { FaReceipt } from "react-icons/fa6";
import PayslipModal from "../payroll/PayslipModal"



const PayrollSummary = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [cutoffDate, setCutoffDate] = useState(""); // Store selected cutoff date
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  const handleOpenModal = (employeeId) => {
    setSelectedEmployee(employeeId);
    setModalOpen(true);
  };  

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

  const handleFilter = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const records = payslips.filter((emp) =>
      emp.name.toLowerCase().includes(searchTerm)
    );
    setPayslips(records);    
  };

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
    { name: "Employee ID", selector: (row) => row.ecode || "N/A", sortable: true, width: "120px", center: true},
    { name: "Employee Name", selector: (row) => row.name || "Unknown", sortable: true, width: "200px", center: true },
    { name: "Email", selector: (row) => row.email || "Unknown", sortable: true, width: "220px", center:true  },
    { name: "Basic Pay", selector: (row) => `₱${(row.basicPay || 0).toLocaleString()}`, sortable: true, width: "120px", center: true },
    { name: "Gross Salary", selector: (row) => `₱${(row.gross_pay || 0).toLocaleString()}`, sortable: true, width: "140px", center: true },
    { name: "Deductions", selector: (row) => `₱${(row.totalDeductions || 0).toLocaleString()}`, sortable: true, width: "140px", center: true },
    { name: "Net Salary", selector: (row) => `₱${(row.netPay || 0).toLocaleString()}`, sortable: true, width: "140px", center: true },
    {
      name: "Payslip",
      cell: (row) => (
          <button
          onClick={() => handleOpenModal(row.employeeId)}
            title="View Payslip"
            className="px-3 py-0.5 w-auto h-8 border text-neutralDGray hover:bg-neutralSilver rounded flex items-center space-x-2 disabled:opacity-50"
          >
            <FaReceipt />
          </button>
          
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
        <div className="flex gap-3 -mt-1">
          {/* Left Section (Payroll Form) */}
          <div className="w-[60%] bg-white rounded gap-2 shadow-sm p-3">
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
              <div className="flex items-center justify-between">
                {/* Button Group - Centered Vertically */}
                <div className="inline-flex border border-neutralDGray rounded h-8">
                  <button className="px-3 w-20 h-full border-r hover:bg-neutralSilver transition-all duration-300 border-neutralDGray rounded-l flex items-center justify-center">
                    <FaPrint title="Print" className="text-neutralDGray] transition-all duration-300" />
                  </button>
        
                  <button className="px-3 w-20 h-full border-r hover:bg-neutralSilver transition-all duration-300 border-neutralDGray flex items-center justify-center">
                    <FaRegFileExcel title="Export to Excel" className=" text-neutralDGray" />
                  </button>
                  <button className="px-3 w-20 h-full hover:bg-neutralSilver transition-all duration-300 rounded-r flex items-center justify-center">
                    <FaRegFilePdf title="Export to PDF" className=" text-neutralDGray" />
                  </button>
                </div>
        
                {/* Search & Sync Section - Aligned with Buttons */}
                <div className="flex items-center gap-3">
                  <div className="flex rounded items-center">
                    <input
                      type="text"
                      placeholder="Search Employee"
                      onChange={handleFilter}
                      className="px-2 rounded py-0.5 border"
                    />
                    <FaSearch className="ml-[-20px] text-neutralDGray" />
                  </div>
                </div>
              </div>
              <hr className="mt-2" />
              <div className="h-[22rem] overflow-auto" >
                {loading ? (
                  <p className="mt-6 text-center text-gray-600">Loading payslips...</p>
                ) : payslips.length > 0 ? (
                  <DataTable columns={columns} data={payslips} pagination highlightOnHover striped />
                ) : (
                  <p className="mt-6 text-center text-gray-600">No payslip records available.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Section (Calendar) */}
          <div className="w-[39%]">
            <CustomCalendar onDateChange={setCutoffDate} />
          </div>
        </div>
        {/* Payslip Modal */}
        <PayslipModal
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)} 
          employeeId={selectedEmployee}
        />
      </div>
  );
};

export default PayrollSummary;
