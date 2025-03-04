import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { FaUsers, FaCashRegister, FaHandHoldingUsd, FaChartPie } from "react-icons/fa";
import axios from "axios";
import { Link } from "react-router-dom";
import SummaryCard from "./SummaryCard";
import Breadcrumb from "./Breadcrumb";
import CustomCalendar from "./CustomCalendar";

const Overview = () => {
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


  return (
    <div className="fixed w-[80rem] h-screen p-6 pt-20">
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={[{ label: "Dashboard", href: "" }, { label: "Overview", href: "" }]} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6 items-stretch">
        <SummaryCard icon={<FaCashRegister />} title="Total Payroll" number={payslips.length} color="bg-[#88B9D3]" />
        <SummaryCard icon={<FaHandHoldingUsd />} title="Gross Salary" number={payslips.reduce((acc, p) => acc + (p.basicPay || 0), 0).toLocaleString()} color="bg-[#B9DD8B]" />
        <SummaryCard icon={<FaChartPie />} title="Total Employee Benefits" number={0} color="bg-[#D18AA6]" />
        <SummaryCard icon={<FaUsers />} title="Total Headcount" number={payslips.length} color="bg-[#95B375]" />
      </div>

      <div>



        {/* Right Section (Calendar) */}
        <div className="w-[30%]">
          <CustomCalendar onDateChange={setCutoffDate} />
        </div>
      </div>
    </div>
  );
};

export default Overview;
