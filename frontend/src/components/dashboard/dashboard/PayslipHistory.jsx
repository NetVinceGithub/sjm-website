import axios from "axios";
import { div } from "framer-motion/client";
import * as XLSX from "xlsx";
import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "./Breadcrumb";
import { FaSearch, FaSyncAlt } from "react-icons/fa";
import {
  FaPrint,
  FaRegFileExcel,
  FaRegFilePdf,
  FaReceipt,
} from "react-icons/fa6";
import { Modal, Button } from "react-bootstrap";
import PayslipHistoryModal from "../payroll/PayslipHistoryModal";
import { ThreeDots } from "react-loader-spinner";

const PayslipHistory = () => {
  const [payslips, setPayslips] = useState([]);
  const [filteredPayslips, setFilteredPayslips] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { Id } = useParams();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = (employeeId) => {
    console.log("Opening modal for employee:", employeeId); // Debugging
    setSelectedEmployee(employeeId);
    setModalOpen(true);
  };

  const exportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = filteredPayslips.map((payslip, index) => ({
        "No.": index + 1,
        "Employee Code": payslip.employeeId || "N/A",
        "Employee Name": payslip.name || "N/A",
        Position: payslip.position || "N/A",
        Project: payslip.project || "N/A",
        "Cut-off Date": payslip.cutoffDate || "N/A",
        "Basic Pay": payslip.basicPay ?? 0,
        "Overtime Pay": payslip.overtimePay ?? 0,
        "Holiday Pay": payslip.holidayPay ?? 0,
        Allowance: payslip.allowance ?? 0,
        "Total Deductions": payslip.totalDeductions ?? 0,
        "Net Pay": payslip.netPay ?? 0,
      }));

      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Convert data to worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const columnWidths = [
        { wch: 5 }, // No.
        { wch: 15 }, // Employee Code
        { wch: 25 }, // Employee Name
        { wch: 20 }, // Position
        { wch: 20 }, // Project
        { wch: 15 }, // Cut-off Date
        { wch: 12 }, // Basic Pay
        { wch: 12 }, // Overtime Pay
        { wch: 12 }, // Holiday Pay
        { wch: 12 }, // Allowance
        { wch: 15 }, // Total Deductions
        { wch: 12 }, // Net Pay
      ];
      worksheet["!cols"] = columnWidths;

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Payslip History");

      // Generate filename with current date
      const currentDate = new Date().toISOString().split("T")[0];
      const filename = `Payslip_History_${currentDate}.xlsx`;

      // Save the file
      XLSX.writeFile(workbook, filename);

      console.log("Excel file exported successfully");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Failed to export data to Excel. Please try again.");
    }
  };

  useEffect(() => {
    const fetchPayslipHistory = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        console.log("Stored Token:", token);

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/payslip/history`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("API Full Response:", response);
        console.log("API Data:", response.data); // Check actual data structure

        let dataArray = response.data.payslips || response.data; // Adjust based on API structure

        if (Array.isArray(dataArray)) {
          console.log("Payslip Data:", dataArray);

          const data = dataArray.map((payslip) => ({
            id: payslip._id,
            name: payslip.name,
            employeeId: payslip.ecode,
            position: payslip.position,
            project: payslip.project,
            basicPay: payslip.basicPay,
            overtimePay: payslip.overtimePay,
            holidayPay: payslip.holidayPay,
            totalDeductions: payslip.totalDeductions,
            netPay: payslip.netPay,
            allowance: payslip.allowance,
            cutoffDate: payslip.cutoffDate,
          }));

          setPayslips(data);
          setFilteredPayslips(data);
        } else {
          console.error("Unexpected data structure:", response.data);
        }
      } catch (error) {
        console.error("Error fetching payslip history:", error);
      }
      setLoading(false);
    };

    fetchPayslipHistory();
  }, []);

  // Log changes in state
  useEffect(() => {
    console.log("Updated Payslips State:", payslips);
  }, [payslips]);

  useEffect(() => {
    console.log("Updated Filtered Payslips State:", filteredPayslips);
  }, [filteredPayslips]);

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    console.log("Search Query:", searchValue);

    const filtered = payslips.filter(
      (payslip) =>
        payslip.name.toLowerCase().includes(searchValue) ||
        payslip.employeeId.toLowerCase().includes(searchValue)
    );

    console.log("Filtered Payslips:", filtered);
    setFilteredPayslips(filtered);
  };

  const columns = [
    {
      name: "Ecode",
      selector: (row) => row.employeeId || "N/A",
      sortable: true,
      center: true,
    },
    {
      name: "Name",
      selector: (row) => row.name || "N/A",
      sortable: true,
      center: true,
      width: "200px",
    },
    {
      name: "Cut off Date ",
      selector: (row) => row.cutoffDate || "N/A",
      sortable: true,
      center: true,
      width: "200px",
    },
    {
      name: "Basic Pay",
      selector: (row) => `₱${(row.basicPay ?? 0).toLocaleString()}`,
      sortable: true,
      center: true,
      width: "130px",
    },
    {
      name: "Overtime Pay",
      selector: (row) => `₱${(row.overtimePay ?? 0).toLocaleString()}`,
      sortable: true,
      center: true,
      width: "130px",
    },
    {
      name: "Holiday Pay",
      selector: (row) => `₱${(row.holidayPay ?? 0).toLocaleString()}`,
      sortable: true,
      center: true,
      width: "130px",
    },
    {
      name: "Allowance",
      selector: (row) => `₱${(row.allowance ?? 0).toLocaleString()}`,
      sortable: true,
      center: true,
      width: "130px",
    },
    {
      name: "Total Deductions",
      selector: (row) => `₱${(row.totalDeductions ?? 0).toLocaleString()}`,
      sortable: true,
      center: true,
      width: "160px",
    },
    {
      name: "Net Pay",
      selector: (row) => `₱${(row.netPay ?? 0).toLocaleString()}`,
      sortable: true,
      center: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <button
          onClick={() => handleOpenModal(row.employeeId)} // ✅ Use correct key
          title="View Payslip"
          className="px-3 py-0.5 w-auto h-8 border text-neutralDGray hover:bg-neutralSilver rounded flex items-center space-x-2 disabled:opacity-50"
        >
          <FaReceipt />
        </button>
      ),
      ignoreRowClick: true,
    },
    ,
  ];

  return (
    <div className=" right-0 bottom-0  min-h-screen w-full bg-neutralSilver p-3 pt-16">
      <>
        <Breadcrumb
          items={[
            { label: "Payroll", href: "" },
            {
              label: "Payroll Information",
              href: "/admin-dashboard/employees",
            },
            { label: "Payroll Generator", href: "/admin-dashboard/employees" },
            { label: "Payroll History", href: "/admin-dashboard/employees" },
          ]}
        />
        <div className="bg-white p-2 -mt-3 rounded-lg shadow w-[calc(100vw-310px)] flex justify-between">
          <div className="inline-flex border border-neutralDGray rounded h-8">
            <button
              onClick={exportToExcel} // Export as Excel
              className="px-3 w-20 h-full hover:bg-neutralSilver border-l-0 transition-all duration-300 rounded-r flex items-center justify-center"
            >
              <FaRegFileExcel
                title="Export to PDF"
                className=" text-neutralDGray"
              />
            </button>
          </div>

          <div className="flex flex-row gap-2 w-1/2 justify-end">
            <div className="flex w-full">
              <input
                type="text"
                placeholder="Search Employee Name or ID"
                onChange={handleSearch}
                className="px-2 text-xs rounded w-full h-8 py-0.5 border"
              />
              <FaSearch className="-ml-6 mt-1.5 text-neutralDGray/60" />
            </div>
            <div className="w-1/4">
              <select className="w-full p-2 border text-neutralDGray text-xs border-gray-300 rounded-md">
                <option value="">Select Project</option>
              </select>
            </div>
          </div>
        </div>
        <div className="mt-2 bg-white w-[calc(100vw-310px)] h-[calc(100vh-80px)] p-2 rounded-lg shadow">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div>
              <div className=" border border-neutralDGray rounded overflow-auto">
                <div className="w-full overflow-x-auto">
                  <DataTable
                    columns={columns}
                    data={filteredPayslips}
                    pagination
                    progressPending={loading}
                    progressComponent={
                      <div className="flex justify-center items-center gap-2 text-gray-600 text-sm">
                        <ThreeDots
                          visible={true}
                          height="60"
                          width="60"
                          color="#4fa94d"
                          radius="9"
                          ariaLabel="three-dots-loading"
                          wrapperStyle={{}}
                          wrapperClass=""
                        />
                      </div>
                    }
                    noDataComponent={
                      <div className="text-gray-500 text-sm italic py-4 text-center">
                        *** No data found ***
                      </div>
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </>

      <PayslipHistoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        employeeId={selectedEmployee}
      />
    </div>
  );
};

export default PayslipHistory;
