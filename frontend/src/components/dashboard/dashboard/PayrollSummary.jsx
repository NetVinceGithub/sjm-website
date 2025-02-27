  import React, { useEffect, useState } from "react";
  import DataTable from "react-data-table-component";
  import { FaUsers, FaCashRegister, FaHandHoldingUsd, FaChartPie } from "react-icons/fa";
  import { Link } from "react-router-dom";
  import SummaryCard from "./SummaryCard";
  import axios from "axios";

  const PayrollSummary = () => {
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState("");
    const [cutoffDate, setCutoffDate] = useState("");

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
      try {
        setMessage("");
        setLoading(true);
    
        const response = await axios.post("http://localhost:5000/api/payslip/generate", { cutoffDate });
    
        if (response.data.success) {
          setPayslips(response.data.payslips);
          setMessage("✅ Payroll successfully generated!");
        } else {
          setMessage(`❌ Failed to generate payroll: ${response.data.message}`);
        }
      } catch (error) {
        console.error("Error generating payroll:", error.response ? error.response.data : error);
        setMessage("❌ An error occurred while generating payroll.");
      } finally {
        setLoading(false);
      }
    };
    
    

    const handleRelease = async () => {
      if (!payslips.length) {
        alert("No payslips available!");
        return;
      }
    
      console.log("Sending payslips:", payslips); // Debugging line
    
      setSending(true);
      setMessage("");
    
      try {
        const response = await axios.post("http://localhost:5000/api/payslip/send-payslip", { payslips });
    
        console.log("Response:", response.data); // Debugging line
    
        if (response.data.success) {
          setMessage("✅ Payslips successfully sent to employees' emails!");
        } else {
          setMessage("❌ Failed to send payslips.");
        }
      } catch (error) {
        console.error("Error sending payslips:", error);
        setMessage("❌ An error occurred while sending payslips.");
      } finally {
        setSending(false);
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
      { name: "Payslip", 
        cell: (row) => (
          <Link 
            to={`/payslip/${row.ecode}`} 
            style={{
              textDecoration: "none"
            }}
          >
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
      }
      
    ];
    

    return (
      <div className="p-6">
        <h3 className="text-2xl font-bold">Payroll Dashboard Overview</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <SummaryCard icon={<FaCashRegister />} text="Total Payroll" number={payslips.length} color="bg-[#88B9D3]" />
          <SummaryCard icon={<FaHandHoldingUsd />} text="Gross Salary" 
            number={payslips.reduce((acc, p) => acc + (p.basicPay || 0), 0).toLocaleString()} color="bg-[#B9DD8B]" />
          <SummaryCard icon={<FaChartPie />} text="Total Employee Benefits" number={0} color="bg-[#D18AA6]" />
          <SummaryCard icon={<FaUsers />} text="Total Headcount" number={payslips.length} color="bg-[#95B375]" />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">Cutoff Date:</label>
          <input type="text" onChange={(e) => setCutoffDate(e.target.value)} className="mt-1 p-2 border rounded w-full" required />
        </div>

        {/* Button Section */}
        <div className="flex space-x-4 mt-6">
        <button
          onClick={handleCreatePayroll}
          className={`px-4 py-2 rounded text-white ${cutoffDate ? "bg-teal-600 hover:bg-teal-700" : "bg-gray-400 cursor-not-allowed"}`}
          disabled={loading || !cutoffDate} // Disable if loading OR no cutoffDate
        >
          {loading ? "Generating..." : "Create Payroll"}
        </button>

  

          <button
            onClick={handleReleaseRequest}
            className="px-4 py-2 bg-green-600 rounded text-white hover:bg-green-700"
            disabled={sending}
          >
            {sending ? "Sending..." : "Request"}
          </button>
        </div>

        {message && <p className="mt-4 text-center text-green-600">{message}</p>}

        {/* Data Table */}
        <div className="mt-6">
          <h4 className="text-lg font-semibold mb-2">Payroll Details</h4>
          {loading ? (
            <p className="mt-6 text-center text-gray-600">Loading payslips...</p>
          ) : payslips.length > 0 ? (
            <DataTable columns={columns} data={payslips} pagination highlightOnHover striped />
          ) : (
            <p className="mt-6 text-center text-gray-600">No payslip records available.</p>
          )}
        </div>
      </div>
    );
  };

  export default PayrollSummary;
