import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { FaUsers, FaCashRegister, FaHandHoldingUsd, FaChartPie } from "react-icons/fa";
import axios from "axios";
import { Link } from "react-router-dom";
import SummaryCard from "./SummaryCard";
import Breadcrumb from "./Breadcrumb";
import CustomCalendar from "./CustomCalendar";

import PayrollLineChart from "./PayrollLineChart";
import { LineChart } from "recharts";

const Overview = () => {
  const [payslips, setPayslips] = useState([]);
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


  const handleCreatePayroll = async () => {
    if (!cutoffDate) {
      alert("Please select a cutoff date!");
      return;
    }

    try {
      setMessage("");
      setLoading(true);
      const response = await axios.post("http://localhost:5000/api/payslip/generate", { cutoffDate });

  

  

      if (response.data.success && Array.isArray(response.data.payslips)) {
        setPayslips(response.data.payslips);
        setMessage("✅ Payroll successfully generated!");
      } else {

        setMessage(`❌ Failed to generate payroll: ${response.data.message || "Unknown error"}`);
      }
    } catch (error) {

       
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
      const response = await axios.post("http://localhost:5000/api/payslip/request-release", { status: "pending" });


    
      if (response.data.success) {
        setMessage("✅ Payroll release request sent to Admin!");
      } else {
        setMessage("❌ Failed to send request.");
      }
    } catch (error) {


     
      setMessage("❌ An error occurred while sending the request.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed w-full max-w-7xl mx-auto p-6 pt-20">
      <Breadcrumb items={[{ label: "Dashboard", href: "" }, { label: "Overview", href: "" }]} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
        <SummaryCard icon={<FaCashRegister />} title="Total Payroll" number={payslips.length} color="bg-blue-400" />
        <SummaryCard icon={<FaHandHoldingUsd />} title="Gross Salary" number={payslips.reduce((acc, p) => acc + (p.basicPay || 0), 0).toLocaleString()} color="bg-green-400" />
        <SummaryCard icon={<FaChartPie />} title="Total Employee Benefits" number={0} color="bg-pink-400" />
        <SummaryCard icon={<FaUsers />} title="Total Headcount" number={payslips.length} color="bg-yellow-400" />
      </div>

      <div className="flex gap-6 mt-6">
        <div className="w-[45%]">
          <PayrollLineChart payslips={payslips} className="border border-neutralDGray" />
          <div className="bg-white h-[220px] border border-neutralDGray rounded shadow-sm mt-6">
            <h6>Padisplay ng active employees dito ang ilalagay lang ay Name Position Status</h6>
          </div>

        </div>
        <div className="w-[55%]">
          <div className="p-3 border border-neutralDGray bg-white shadow-sm rounded">
            <CustomCalendar onDateChange={setCutoffDate} />
          </div>
          <div className="bg-white h-[148px] shadow-sm mt-6 rounded">
            <h6 className="p-1 ml-1 text-neutralDGray"><strong>Notes:</strong></h6>
            <ul className="space-y-1">
              <li><p><strong className="text-neutralDGray">PhilHealth</strong> - 5% of basic salary, split equally between employer and employee.</p></li>
              <li><p><strong className="text-neutralDGray">SSS</strong> - 14% of monthly salary credit, shared by employer (9.5%) and employee (4.5%).</p></li>
              <li><p><strong className="text-neutralDGray">Pag-IBIG</strong> - 2% of salary for both employer and employee for salaries over P1,500.</p></li>
            </ul>
          </div>

  
        </div>
      </div>
    </div>
  );
};

export default Overview;
