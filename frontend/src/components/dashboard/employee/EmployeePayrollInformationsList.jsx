import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import Tooltip from "@mui/material/Tooltip";
import { Link } from "react-router-dom";
import axios from "axios";
import { EmployeeButtons } from "../../../utils/EmployeeHelper";
import { FaSearch, FaSyncAlt } from "react-icons/fa";
import { PayrollButtons } from "../../../utils/PayrollHelper";
import Breadcrumb from "../dashboard/Breadcrumb";
import { Modal, Button } from "react-bootstrap";
import {
  FaRegPenToSquare,
  FaXmark,
  FaRegFileExcel,
  FaRegFilePdf,
  FaFilter,
} from "react-icons/fa6";
import { useAuth } from "../../../context/authContext";
import { ThreeDots } from "react-loader-spinner";
import * as XLSX from "xlsx";

const EmployeePayrollInformationsList = () => {
  const { user } = useAuth();
  const [payrollInformations, setPayrollInformations] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [show, setShow] = useState(false);

  // Bulk edit states
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [bulkEditField, setBulkEditField] = useState("default");
  const [bulkEditValue, setBulkEditValue] = useState("");
  const [bulkEditReason, setBulkEditReason] = useState(""); // Added reason field
  const [bulkSearchTerm, setBulkSearchTerm] = useState("");
  const [filteredBulkEmployees, setFilteredBulkEmployees] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // Added loading state
  const [perPage, setPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedEmploymentRanks, setSelectedEmploymentRanks] = useState([]);
  const [selectedEmploymentRank, setSelectedEmploymentRank] = useState(""); // Changed to single selection
  const [availableEmploymentRanks, setAvailableEmploymentRanks] = useState([]);

  // Mock current user - replace with actual user context/auth
  const currentUser = "Admin User"; // Replace this with actual user from context/auth

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  };

  useEffect(() => {
    fetchPayrollInformations();
  }, []);

  useEffect(() => {
    if (payrollInformations.length > 0) {
      const ranks = [
        ...new Set(
          payrollInformations.map((emp) => emp.employmentrank).filter(Boolean)
        ),
      ];
      setAvailableEmploymentRanks(ranks);
    }
  }, [payrollInformations]);

  const applyEmploymentRankFilter = () => {
    let filtered = payrollInformations;

    if (selectedEmploymentRanks.length > 0) {
      filtered = filtered.filter((emp) =>
        selectedEmploymentRanks.includes(emp.employmentrank)
      );
    }

    setFilteredEmployees(filtered);
    setShowFilterModal(false);
  };

  const handleEmploymentRankChange = (rank) => {
    setSelectedEmploymentRanks((prev) => {
      if (prev.includes(rank)) {
        return prev.filter((r) => r !== rank);
      }
      return [...prev, rank];
    });
  };

  const clearFilters = () => {
    setSelectedEmploymentRank("");
    setFilteredEmployees(payrollInformations);
    setShowFilterModal(false);
  };

  // Update your filter options button click handler
  const openFilterList = () => {
    setShowFilterModal(true);
  };

  useEffect(() => {
    // Filter employees for bulk edit modal
    const filtered = payrollInformations.filter(
      (emp) =>
        emp.name.toLowerCase().includes(bulkSearchTerm.toLowerCase()) ||
        emp.ecode.toLowerCase().includes(bulkSearchTerm.toLowerCase())
    );
    setFilteredBulkEmployees(filtered);
  }, [bulkSearchTerm, payrollInformations]);

  const fetchPayrollInformations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/employee/payroll-informations`
      );
      if (response.data.success) {
        console.log(response.data);
        setPayrollInformations(response.data.payrollInformations);
        setFilteredEmployees(response.data.payrollInformations);
        setFilteredBulkEmployees(response.data.payrollInformations);
      }
    } catch (error) {
      console.error("Error fetching payroll-informations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const records = payrollInformations.filter(
      (emp) =>
        emp.name.toLowerCase().includes(searchTerm) ||
        emp.ecode.toLowerCase().includes(searchTerm)
    );
    setFilteredEmployees(records);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetchPayrollInformations();
    } catch (error) {
      console.error("Error syncing data:", error);
    } finally {
      setSyncing(false);
    }
  };

  const bulkEdit = () => {
    setShow(true);
    setSelectedEmployees([]);
    setBulkEditField("default");
    setBulkEditValue("");
    setBulkEditReason(""); // Reset reason
    setBulkSearchTerm("");
  };

  const handleClose = () => {
    setShow(false);
    setSelectedEmployees([]);
    setBulkEditField("default");
    setBulkEditValue("");
    setBulkEditReason(""); // Reset reason
    setBulkSearchTerm("");
  };

  const handleExportExcel = () => {
    if (filteredEmployees.length === 0) {
      alert("⚠ No data available to export.");
      return;
    }

    // Define headers
    const headers = [
      "Employee Code",
      "Name",
      "Position",
      "Daily Rate",
      "Salary Package",
      "Holiday Pay",
      "Night Differential",
      "Allowance",
      "Tax",
      "SSS",
      "Pagibig",
      "PhilHealth",
      "Loan",
    ];

    // Map employees to row data
    const excelData = filteredEmployees.map((emp) => ({
      "Employee Code": emp.ecode,
      Name: emp.name,
      Position: emp.positiontitle || emp.designation,
      "Daily Rate": emp.daily_rate || 0,
      "Salary Package": emp.salary_package || 0, // <- added since your headers include it
      "Holiday Pay": emp.holiday_pay || 0,
      "Night Differential": emp.night_differential || 0,
      Allowance: emp.allowance || 0,
      Tax: emp.tax_deduction || 0,
      SSS: emp.sss_contribution || 0,
      Pagibig: emp.pagibig_contribution || 0,
      PhilHealth: emp.philhealth_contribution || 0,
      Loan: emp.loan || 0,
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData, { header: headers });

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payroll");

    // Export to Excel file
    XLSX.writeFile(wb, "Payroll_Information.xlsx");
  };

  const handleExportPDF = () => {
    // Simple PDF export using window.print
    const printWindow = window.open("", "_blank");
    const tableHTML = `
      <html>
        <head>
          <title>Payroll Information</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2>Payroll Information Report</h2>
          <table>
            <thead>
              <tr>
                <th>Employee Code</th>
                <th>Name</th>
                <th>Position</th>
                <th>Daily Rate</th>
                <th>Holiday Pay</th>
                <th>Night Differential</th>
                <th>Allowance</th>
                <th>Tax</th>
                <th>SSS</th>
                <th>Pagibig</th>
                <th>PhilHealth</th>
                <th>Loan</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEmployees
                .map(
                  (emp) => `
                <tr>
                  <td>${emp.ecode}</td>
                  <td>${emp.name}</td>
                  <td>${emp.positiontitle || emp.designation}</td>
                  <td>₱${parseFloat(emp.daily_rate || 0).toLocaleString()}</td>
                  <td>₱${parseFloat(emp.holiday_pay || 0).toLocaleString()}</td>
                  <td>₱${parseFloat(
                    emp.night_differential || 0
                  ).toLocaleString()}</td>
                  <td>₱${parseFloat(emp.allowance || 0).toLocaleString()}</td>
                  <td>₱${parseFloat(
                    emp.tax_deduction || 0
                  ).toLocaleString()}</td>
                  <td>₱${parseFloat(
                    emp.sss_contribution || 0
                  ).toLocaleString()}</td>
                  <td>₱${parseFloat(
                    emp.pagibig_contribution || 0
                  ).toLocaleString()}</td>
                  <td>₱${parseFloat(
                    emp.philhealth_contribution || 0
                  ).toLocaleString()}</td>
                  <td>₱${parseFloat(emp.loan || 0).toLocaleString()}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(tableHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Bulk edit functions
  const handleEmployeeSelect = (employeeId, isSelected) => {
    if (isSelected) {
      setSelectedEmployees((prev) => [...prev, employeeId]);
    } else {
      setSelectedEmployees((prev) => prev.filter((id) => id !== employeeId));
    }
  };

  const handleSelectAll = () => {
    const allIds = filteredBulkEmployees.map((emp) => emp.employee_id);
    setSelectedEmployees(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedEmployees([]);
  };

  const handleApplyBulkEdit = async () => {
    if (
      bulkEditField === "default" ||
      !bulkEditValue ||
      selectedEmployees.length === 0
    ) {
      alert(
        "Please select a field, enter a value, and select at least one employee."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payrolls/bulk-change-requests`,
        {
          employee_ids: selectedEmployees,
          field: bulkEditField,
          value: bulkEditValue,
          reason:
            bulkEditReason ||
            `Bulk update: ${bulkEditField.replace(
              /_/g,
              " "
            )} to ${bulkEditValue}`,
          requested_by: user.name,
        },
        getAuthHeaders()
      );

      if (response.data.success) {
        const { summary } = response.data;
        let message = `Successfully submitted ${summary.successful} change requests`;

        if (summary.failed > 0) {
          message += ` (${summary.failed} failed)`;
        }

        if (
          response.data.notifications_sent &&
          response.data.notifications_sent.length > 0
        ) {
          message += `\nNotifications sent to ${response.data.notifications_sent.length} approver(s)`;
        }

        alert(message);
        handleClose();

        // Optionally refresh the data
        await fetchPayrollInformations();
      } else {
        alert("Error: " + response.data.message);
      }
    } catch (error) {
      console.error("Error submitting bulk changes:", error);
      let errorMessage = "Error submitting bulk changes. Please try again.";

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      }

      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestChanges = async () => {
    // This function is now replaced by handleApplyBulkEdit
    // But keeping it for backward compatibility or if you want separate functionality
    await handleApplyBulkEdit();
  };

  const customStyles = {
    table: {
      style: {
        fontWeight: "bold",
        backgroundColor: "#fff",
        width: "100%",
        margin: "0 auto",
      },
    },
    headCells: {
      style: {
        backgroundColor: "#fff",
        color: "#333",
        fontWeight: "bold",
        justifyContent: "center",
        display: "flex",
        alignItems: "center",
      },
    },
    cells: {
      style: {
        padding: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
    },
  };

  const columns = [
    {
      name: "Ecode",
      selector: (row) => row.ecode,
      sortable: true,
      center: true,
      width: "90px",
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      center: true,
      width: "200px",
    },
    {
      name: "Position",
      selector: (row) => row.positiontitle || row.designation,
      sortable: true,
      center: true,
      width: "320px",
    },
    {
      name: "Employment Rank",
      selector: (row) => row.employment_rank,
      sortable: true,
      center: true,
      width: "320px",
    },
    {
      name: "Daily Rate",
      selector: (row) => `₱${parseFloat(row.daily_rate || 0).toLocaleString()}`,
      sortable: true,
      center: true,
      width: "110px",
    },
    {
      name: "Salary Package",
      selector: (row) =>
        `₱${parseFloat(row.salary_package || 0).toLocaleString()}`,
      sortable: true,
      center: true,
      width: "150px",
    },
    {
      name: "Holiday Pay",
      selector: (row) =>
        `₱${parseFloat(row.holiday_pay || 0).toLocaleString()}`,
      sortable: true,
      center: true,
      width: "120px",
    },
    {
      name: "Night Differential",
      selector: (row) =>
        `₱${parseFloat(row.night_differential || 0).toLocaleString()}`,
      sortable: true,
      center: true,
      width: "150px",
    },
    {
      name: "Allowance",
      selector: (row) => `₱${parseFloat(row.allowance || 0).toLocaleString()}`,
      sortable: true,
      center: true,
      width: "120px",
    },
    {
      name: "Tax",
      selector: (row) =>
        `₱${parseFloat(row.tax_deduction || 0).toLocaleString()}`,
      sortable: true,
      center: true,
    },
    {
      name: "SSS",
      selector: (row) =>
        `₱${parseFloat(row.sss_contribution || 0).toLocaleString()}`,
      sortable: true,
      center: true,
    },
    {
      name: "Pagibig",
      selector: (row) =>
        `₱${parseFloat(row.pagibig_contribution || 0).toLocaleString()}`,
      sortable: true,
      center: true,
    },
    {
      name: "PhilHealth",
      selector: (row) =>
        `₱${parseFloat(row.philhealth_contribution || 0).toLocaleString()}`,
      sortable: true,
      center: true,
      width: "120px",
    },
    {
      name: "Loan",
      selector: (row) => `₱${parseFloat(row.loan || 0).toLocaleString()}`,
      sortable: true,
      center: true,
    },
  ];

  return (
    <div className=" right-0 bottom-0  min-h-screen w-full bg-neutralSilver p-3 pt-16">
      <div>
        <Breadcrumb
          items={[
            { label: "Payroll" },
            {
              label: "Payroll Information",
              href: "/admin-dashboard/employees/payroll-informations/list",
            },
          ]}
        />
        <div className="bg-white p-2 -mt-3 rounded-lg shadow w-[calc(100vw-310px)] flex justify-between">
          <div className="inline-flex border border-neutralDGray rounded h-8">
            <button
              onClick={bulkEdit}
              className="px-3 w-20 h-full border-r  hover:bg-neutralSilver transition-all duration-300 border-neutralDGray rounded-l flex items-center justify-center"
            >
              <FaRegPenToSquare
                title="Print"
                className="text-neutralDGray] transition-all duration-300"
              />
            </button>

            <button
              onClick={handleExportExcel} // Export as Excel
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
                placeholder="Search Employee"
                onChange={handleFilter}
                className="px-2 text-xs rounded w-full h-8 py-0.5 border"
              />
              <FaSearch className="-ml-6 mt-1.5 text-neutralDGray/60" />
            </div>
            <div
              onClick={openFilterList} // Add this line
              className="px-2 text-xs text-neutralDGray rounded w-1/4 items-center hover:bg-neutralSilver flex justify-between h-8 py-0.5 border cursor-pointer" // Add cursor-pointer
            >
              Filter Options{" "}
              <span>
                <FaFilter className="mr-2" />
              </span>
            </div>
          </div>
        </div>
        <div className="mt-2 bg-white w-[calc(100vw-310px)] p-2 rounded-lg shadow">
          {/* Table Container */}
          <div>
            <div className="w-full">
              <div className="h-full overflow-y-auto text-neutralDGray border rounded-md">
                <div>
                  <DataTable
                    customStyles={customStyles}
                    columns={columns}
                    data={filteredEmployees}
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
                    pagination
                    paginationPerPage={20}
                    onChangeRowsPerPage={handlePerRowsChange}
                    onChangePage={handlePageChange}
                    paginationDefaultPage={currentPage}
                    highlightOnHover
                    pointerOnHover
                    dense
                    fixedHeader
                    fixedHeaderScrollHeight="530px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Edit Modal */}
        <Modal show={show} onHide={handleClose} centered size="lg" scrollable>
          <Modal.Header className="py-2 px-3 text-[12px]" closeButton>
            <Modal.Title as="h6" className="text-lg">
              Payroll Information Edit
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="flex flex-col">
              <div className="w-full max-w-3xl bg-white p-6 border border-gray-300 rounded-md shadow-md min-h-[500px]">
                <div className="flex rounded justify-end items-center -mt-2">
                  <input
                    type="text"
                    placeholder="Search employee by name or ID"
                    value={bulkSearchTerm}
                    onChange={(e) => setBulkSearchTerm(e.target.value)}
                    className="px-2 h-8 w-80 text-xs font-normal rounded py-0.5 border"
                  />
                  <FaSearch className="ml-[-20px] text-neutralDGray" />
                </div>

                <label className="block text-xs font-medium text-gray-500 mb-2">
                  Apply changes to field:
                </label>
                <div className="flex gap-2 mb-3">
                  <select
                    className="rounded border-gray-300 w-1/2 h-8 text-xs"
                    name="info_fields"
                    id="info_fields"
                    value={bulkEditField}
                    onChange={(e) => setBulkEditField(e.target.value)}
                  >
                    <option className="text-gray-300" value="default">
                      Select Information Field
                    </option>
                    <option value="daily_rate">Daily Rate</option>
                    <option value="daily_rate">Salary Package</option>
                    <option value="adjustment">Adjustments</option>
                    <option value="tax_deduction">Tax</option>
                    <option value="loan">Loan</option>
                  </select>
                  <input
                    className="h-8 border-gray-300 w-1/2 text-xs rounded"
                    placeholder="Enter value"
                    type="number"
                    value={bulkEditValue}
                    onChange={(e) => setBulkEditValue(e.target.value)}
                  />
                </div>

                {/* Added Reason Field */}
                <div className="mb-3 -mt-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Reason for change (optional):
                  </label>
                  <textarea
                    className="w-full h-16 text-xs border border-gray-300 rounded px-2 py-1 resize-none"
                    placeholder="Enter reason for this bulk change..."
                    value={bulkEditReason}
                    onChange={(e) => setBulkEditReason(e.target.value)}
                  />
                </div>

                <p className="text-xs text-red-300 text-center -mt-3 italic">
                  **Note: Changes will be submitted as requests for approval.**
                </p>

                <div className="border border-neutralDGray rounded p-2 overflow-auto -mt-2">
                  <div className="flex justify-between mb-3">
                    <div>
                      <h5 className="text-neutralDGray text-sm italic">
                        List of Employees ({selectedEmployees.length} selected)
                      </h5>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSelectAll}
                        className="px-2 py-1 text-xs border h-7 w-36 text-neutralDGray rounded hover:bg-green-400 hover:text-white"
                      >
                        Select All
                      </button>
                      <button
                        onClick={handleDeselectAll}
                        className="px-2 text-xs py-1 border h-7 w-36 text-neutralDGray rounded hover:bg-red-400 hover:text-white"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  {/* Employee List */}
                  <div className="max-h-64 overflow-y-auto -mt-2">
                    {filteredBulkEmployees.map((employee) => (
                      <div
                        key={employee.employee_id}
                        className="flex items-center p-2 border-b hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(
                            employee.employee_id
                          )}
                          onChange={(e) =>
                            handleEmployeeSelect(
                              employee.employee_id,
                              e.target.checked
                            )
                          }
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="text-xs font-medium">
                            {employee.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {employee.ecode} -{" "}
                            {employee.positiontitle || employee.designation}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button
              className="px-4 py-2 text-sm h-8 border flex justify-center items-center text-center text-neutralDGray rounded-lg hover:bg-green-400 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleApplyBulkEdit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting Requests..." : "Submit Requests"}
            </button>
            <button
              className="px-4 py-2 text-sm h-8 border flex justify-center items-center text-center text-neutralDGray rounded-lg hover:bg-red-400 hover:text-white transition-all"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Close
            </button>
          </Modal.Footer>
        </Modal>

        {/* Filter Modal */}
        <Modal
          show={showFilterModal}
          onHide={() => setShowFilterModal(false)}
          centered
          size="md"
        >
          <Modal.Header className="py-2 px-3 text-[12px]" closeButton>
            <Modal.Title as="h6" className="text-lg">
              Filter Options
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="p-2">
              <div className="">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Rank
                </label>
                {/* Updated dropdown styling - removed the wrapper div and border */}
                <select
                  value={selectedEmploymentRank}
                  onChange={(e) => handleEmploymentRankChange(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="">All Employment Ranks</option>
                  {availableEmploymentRanks.map((rank) => (
                    <option key={rank} value={rank}>
                      {rank}
                    </option>
                  ))}
                </select>
              </div>

              {/* Show selected filter info */}
              {selectedEmploymentRank && (
                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-xs text-blue-700 font-medium">
                    Selected Filter: {selectedEmploymentRank}
                  </p>
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button
              className="px-4 py-2 text-sm h-8 border flex justify-center items-center text-center text-neutralDGray rounded-lg hover:bg-green-400 hover:text-white transition-all"
              onClick={applyEmploymentRankFilter}
            >
              Apply Filter
            </button>
            <button
              className="px-4 py-2 text-sm h-8 border flex justify-center items-center text-center text-neutralDGray rounded-lg hover:bg-red-400 hover:text-white transition-all"
              onClick={clearFilters}
            >
              Clear All
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default EmployeePayrollInformationsList;
