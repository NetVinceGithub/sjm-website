import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import {
  FaUsers,
  FaCashRegister,
  FaHandHoldingUsd,
  FaChartPie,
} from "react-icons/fa";
import axios from "axios";
import { Link } from "react-router-dom";
import SummaryCard from "./SummaryCard";
import Breadcrumb from "./Breadcrumb";
import CustomCalendar from "./CustomCalendar";
import { FaSearch, FaSyncAlt } from "react-icons/fa";
import PayrollLineChart from "./PayrollLineChart";
import { LineChart } from "recharts";

const Overview = () => {
  const [payslips, setPayslips] = useState([]);
  const [cutoffDate, setCutoffDate] = useState("");
  const [employees, setEmployees] = useState([]); // will fetch the active employees

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/payslip");
        setPayslips(response.data);
      } catch (error) {
        console.error("Error fetching payslips:", error);
      }
    };

    fetchPayslips();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/employee/status"
        );
        setEmployees(response.data);
      } catch (error) {
        console.log("Error fetching active employees", error);
      }
    };
    fetchEmployees();
  }, []);

  const totalGrossSalary = payslips.reduce((acc, p) => acc + (p.gross_pay || 0), 0);
  const totalBenefits = payslips.reduce((acc, p) => acc + (p.allowance || 0), 0);
  const totalPayroll = payslips.reduce((acc, p) => acc + (p.netPay || 0), 0);

  const handleCreatePayroll = async () => {
    if (!cutoffDate) {
      alert("Please select a cutoff date!");
      return;
    }

    try {
      setMessage("");
      const response = await axios.post(
        "http://localhost:5000/api/payslip/generate",
        { cutoffDate }
      );

      if (response.data.success && Array.isArray(response.data.payslips)) {
        setPayslips(response.data.payslips);
        setMessage("✅ Payroll successfully generated!");
      } else {
        setMessage(
          `❌ Failed to generate payroll: ${
            response.data.message || "Unknown error"
          }`
        );
      }
    } catch (error) {
      setMessage(
        `❌ ${
          error.response?.data?.message ||
          "An error occurred while generating payroll."
        }`
      );
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
      const response = await axios.post(
        "http://localhost:5000/api/payslip/request-release",
        { status: "pending" }
      );

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

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      width: "200px",
    },
    {
      name: "Position",
      selector: (row) => row.positiontitle,
      width: "250px",
    },
    {
      name: "Status",
      width: "100px",
      cell: (row) => (
        <span className="flex items-center gap-2">
          <span
            className={`w-3 h-3 rounded-full ${
              row.status.toLowerCase() === "active"
                ? "bg-green-500"
                : "bg-red-500"
            }`}
          ></span>
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <div className="fixed w-full max-w-7xl mx-auto p-6 pt-16">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "" },
          { label: "Overview", href: "" },
        ]}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
      <SummaryCard
          icon={<FaCashRegister />}
          title="Total Payroll"
          number={`₱${payslips.reduce((acc, p) => acc + parseFloat(p.netPay), 0).toLocaleString()}`}
          color="bg-blue-400"
        />
        <SummaryCard
          icon={<FaHandHoldingUsd />}
          title="Gross Salary"
          number={`₱${payslips.reduce((acc, p) => acc + parseFloat(p.gross_pay), 0).toLocaleString()}`}
          color="bg-green-400"
        />
        <SummaryCard
          icon={<FaChartPie />}
          title="Total Employee Benefits"
          number={`₱${payslips.reduce((acc, p) => acc + parseFloat(p.allowance), 0).toLocaleString()}`}
          color="bg-pink-400"
        />


        <SummaryCard
          icon={<FaUsers />}
          title="Total Headcount"
          number={payslips.length}
          color="bg-yellow-400"
        />
      </div>

      <div className="flex gap-3 mt-3">
        <div className="w-[45%]">
          <PayrollLineChart
            payslips={payslips}
            className="border border-neutralDGray"
          />
          <div className="bg-white overflow-auto w-[550px] h-[205px] fixed border border-neutralDGray rounded shadow-sm mt-3">
            <div className="flex justify-between">
              <h6 className="p-3 mb-0 ml-1 text-neutralDGray">
                <strong>Employee Status</strong>
              </h6>
              <div className="flex items-center gap-3">
                <div className="flex rounded items-center">
                  <input
                    type="text"
                    placeholder="Search Employee"
                    className="px-2 rounded py-0.5 text-sm border"
                  />
                  <FaSearch className="ml-[-20px] mr-3 text-neutralDGray" />
                </div>
              </div>
            </div>
            
            <DataTable columns={columns} data={employees} />
          </div>
        </div>
        <div className="w-[55%]">
          <div className="p-3 border w-[668px] h-[331px] border-neutralDGray bg-white shadow-sm rounded">
            <CustomCalendar onDateChange={setCutoffDate} />
          </div>
          <div className="bg-white border-neutralDGray h-[180px] shadow-sm mt-3 rounded">
            <h6 className="p-3 ml-1 text-neutralDGray">
              <strong>Notes:</strong>
            </h6>
            <ul className="-space-y-1 -mt-5">
              <li>
                <p>
                  <strong className="text-neutralDGray">PhilHealth</strong> - 5%
                  of basic salary, split equally between employer and employee.
                </p>
              </li>
              <li>
                <p>
                  <strong className="text-neutralDGray">SSS</strong> - 15% of
                  monthly salary credit, shared by employer (9.5%) and employee
                  (4.5%).
                </p>
              </li>
              <li>
                <p>
                  <strong className="text-neutralDGray">Pag-IBIG</strong> - 2%
                  of salary for both employer and employee for salaries over
                  P1,500.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
