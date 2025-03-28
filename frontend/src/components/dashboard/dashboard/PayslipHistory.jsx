import axios from "axios";
import { div } from "framer-motion/client";
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

  useEffect(() => {
    const fetchPayslipHistory = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        console.log("Stored Token:", token);

        const response = await axios.get(
          "http://localhost:5000/api/payslip/history",
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
    <div className="fixed p-6 pt-16">
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
        <div className="bg-white p-3 w-[77rem] h-[37rem] rounded shadow-sm border -mt-3">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div>
              <div>
                <div className="flex items-center justify-between">
                  <div className="inline-flex border border-neutralDGray rounded h-8">
                    <button className="px-3 w-20 h-full border-r hover:bg-neutralSilver transition-all duration-300 border-neutralDGray rounded-l flex items-center justify-center">
                      <FaPrint
                        title="Print"
                        className="text-neutralDGray] transition-all duration-300"
                      />
                    </button>

                    <button className="px-3 w-20 h-full border-r hover:bg-neutralSilver transition-all duration-300 border-neutralDGray flex items-center justify-center">
                      <FaRegFileExcel
                        title="Export to Excel"
                        className=" text-neutralDGray"
                      />
                    </button>
                    <button className="px-3 w-20 h-full hover:bg-neutralSilver transition-all duration-300 rounded-r flex items-center justify-center">
                      <FaRegFilePdf
                        title="Export to PDF"
                        className=" text-neutralDGray"
                      />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex rounded items-center">
                      <input
                        type="text"
                        placeholder="Search by Name or Employee ID"
                        className="px-2 w-[268px] rounded py-0.5 border"
                        onChange={handleSearch}
                      />
                      <FaSearch className="ml-[-20px] text-neutralDGray" />
                    </div>
                  </div>
                </div>
              </div>
              <hr />
              <div className="mt-3 border h-[31rem] border-neutralDGray rounded overflow-auto">
                <div className="w-full overflow-x-auto">
                  <DataTable columns={columns} data={filteredPayslips} />
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
