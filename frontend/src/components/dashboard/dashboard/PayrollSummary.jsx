import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { FaSearch } from "react-icons/fa";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import SummaryCard from "./SummaryCard";
import Breadcrumb from "./Breadcrumb";
import CustomCalendar from "./CustomCalendar";
import { FaPrint, FaRegFileExcel, FaRegFilePdf } from "react-icons/fa6";
import { FaReceipt } from "react-icons/fa6";
import PayslipModal from "../payroll/PayslipModal";
import NoAttendanceModal from "../modals/NoAttendanceModal";
import * as XLSX from "xlsx";
import { Modal, Button } from "react-bootstrap";

const PayrollSummary = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [cutoffDate, setCutoffDate] = useState(""); // Store selected cutoff date
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [noAttendanceModalOpen, setNoAttendanceModalOpen] = useState(false); // State for modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [show, setShow] = useState(false);
  const [employees, setEmployeeList] = useState("");
  const [selectedOvertime, setSelectedOvertime] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmployeesOvertime, setFilteredEmployeesOvertime] = useState(
    []
  );
  const [maxOvertime, setMaxOvertime] = useState("");

  const navigate = useNavigate();

  // Function to filter employees based on search term
  const filterEmployeesForOvertime = () => {
    if (!searchTerm) {
      // If no search term, return all filtered employees
      setFilteredEmployeesOvertime(filteredEmployees);
    } else {
      // Filter employees by name or ecode, case-insensitive
      const filtered = filteredEmployees.filter(
        (employee) =>
          employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.ecode.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployeesOvertime(filtered);
    }
  };

  // Use effect to run filtering when search term or filtered employees change
  useEffect(() => {
    filterEmployeesForOvertime();
  }, [searchTerm, filteredEmployees]);

  useEffect(() => {
    const fetchAttendanceAndFilterEmployees = async () => {
      try {
        console.log("📩 Fetching attendance data...");
        const attendanceResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/attendance/get-attendance`
        );

        const attendanceData = attendanceResponse.data.attendance || [];
        console.log("📊 Attendance Data:", attendanceData);

        const validEcodes = new Set(
          attendanceData.map((record) => record.ecode)
        );

        const filtered = employees.filter(
          (employee) =>
            validEcodes.has(employee.ecode) && employee.status !== "Inactive"
        );

        setFilteredEmployees(filtered);
      } catch (error) {
        console.error(
          "❌ Error fetching attendance:",
          error.response?.data || error
        );
      }
    };

    if (show) {
      fetchAttendanceAndFilterEmployees();
    }
  }, [show, employees]);

  const handleOpenModal = (employeeId) => {
    setSelectedEmployee(employeeId);
    setModalOpen(true);
  };

  const handleCheckboxChange = (ecode) => {
    setSelectedOvertime((prevSelected) =>
      prevSelected.includes(ecode)
        ? prevSelected.filter((id) => id !== ecode)
        : [...prevSelected, ecode]
    );
  };

  const fetchPayslips = async () => {
    try {
      setLoading(true); // Ensure loading state is set
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/payslip`);
      setPayslips([...response.data]); // Force a new reference to trigger re-render
    } catch (error) {
      console.error("Error fetching payslips:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      // Pre-select all employees' ecode by default when the modal opens
      setSelectedOvertime(filteredEmployees.map((employee) => employee.ecode));
    }
  }, [show, filteredEmployees]);

  useEffect(() => {
    fetchPayslips(); // Fetch when component mounts
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
    try {
      console.log("📩 Fetching employee data...");
      const employeeResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/employee`
      );

      const employeeData = employeeResponse.data.employees || [];
      console.log("📊 Fetched employee data:", employeeData);

      if (!employeeData.length) {
        console.log("🚫 No employees found!");
        setMessage("No employees available for payroll.");
        return;
      }

      // Step 1: Show modal for selecting employees for overtime approval
      setShow(true);
      console.log(employeeData);
      setEmployeeList(employeeData); // Store employees in state to display in modal
    } catch (error) {
      console.error("❌ Error fetching employees:", error);
      console.error(
        "🔴 Full error details:",
        error.response?.status,
        error.response?.data
      );
      setMessage(
        `❌ Failed to fetch employees: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const proceedWithPayroll = async (selectedEmployees) => {
    if (!cutoffDate) {
      return;
    }

    setMessage("");
    setLoading(true);

    try {
      console.log("📩 Fetching attendance data...");
      const attendanceResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/attendance/get-attendance`
      );

      const attendanceData = attendanceResponse.data.attendance || [];
      console.log("📊 Fetched attendance data:", attendanceData);

      if (!attendanceData.length) {
        console.log(
          "🚫 No attendance data found! Stopping payroll generation."
        );
        setNoAttendanceModalOpen(true);
        setLoading(false);
        return;
      }

      console.log("📩 Sending payroll request with cutoffDate:", cutoffDate);

      const updatedAttendanceData = attendanceData.map((record) => ({
        ...record,
        overtimeHours: selectedEmployees.includes(record.ecode)
          ? Math.min(record.overtimeHours, Number(maxOvertime)) // ✅ Apply max OT limit
          : 0, // Remove OT if not selected
      }));

      // Step 2: Send only selected employees along with the filtered attendance data
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payslip/generate`,
        {
          cutoffDate: cutoffDate.trim(),
          selectedEmployees, // List of employees approved for overtime
          attendanceData: updatedAttendanceData, // Ensure overtime is only applied to selected ones
          maxOvertime: Number(maxOvertime), // ✅ Include max OT in request
        }
      );

      console.log("✅ Payroll response:", response.data);

      if (response.data.success && Array.isArray(response.data.payslips)) {
        if (!response.data.payslips.length) {
          console.log("🚫 No payslips generated, opening modal.");
          setNoAttendanceModalOpen(true);
        } else {
          setPayslips(response.data.payslips);
          setMessage("✅ Payroll successfully generated!");
          setShow(false); // ✅ Closes modal after approval
        }
      } else {
        setMessage(
          `❌ Failed to generate payroll: ${
            response.data.message || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("❌ Full error response:", error.response?.data || error);
      setMessage(
        `❌ ${
          error.response?.data?.message ||
          "An error occurred while generating payroll."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalModal = (message) => {
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
  };

  const handleReleaseRequest = async () => {
    if (!payslips.length) {
      return;
    }

    setSending(true);
    setMessage("");

    try {
      // Get requester (you might use the logged-in user)

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payslip/request-release`,
        {
          requestedBy,
        }
      );

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

  const handleDownloadExcel = () => {
    if (!payslips || payslips.length === 0) {
      return;
    }

    try {
      // Convert payslip data to worksheet format
      const worksheet = XLSX.utils.json_to_sheet(
        payslips.map((payslip) => ({
          "Employee ID": payslip.ecode || "N/A",
          "Employee Name": payslip.name || "Unknown",
          Email: payslip.email || "Unknown",
          "Basic Pay": `₱${(payslip.basicPay || 0).toLocaleString()}`,
          "Gross Salary": `₱${(payslip.gross_pay || 0).toLocaleString()}`,
          Deductions: `₱${(payslip.totalDeductions || 0).toLocaleString()}`,
          "Net Salary": `₱${(payslip.netPay || 0).toLocaleString()}`,
        }))
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll");

      // Generate file name with cutoff date
      const fileName = `Payroll_${cutoffDate || "NoDate"}.xlsx`;

      // Download the file
      XLSX.writeFile(workbook, fileName);
      console.log("✅ Excel file downloaded successfully!");
    } catch (error) {
      console.error("❌ Error downloading Excel:", error);
    }
  };

  const handleDeletePayroll = async () => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/payslip`);
      if (response.data.success) {
        setPayslips([]);
      }
      fetchPayslips();
    } catch (error) {
      console.error("Error deleting payroll:", error);
    } finally {
      setShowConfirmModal(false); // Close modal after action
    }
  };

  const selectAll = () => {
    setSelectedOvertime(filteredEmployees.map((employee) => employee.ecode));
  };

  const deselectAll = () => {
    setSelectedOvertime([]);
  };

  // Define table columns
  const columns = [
    {
      name: "Employee ID",
      selector: (row) => row.ecode || "N/A",
      sortable: true,
      width: "120px",
    },
    {
      name: "Employee Name",
      selector: (row) => row.name || "Unknown",
      sortable: true,
      width: "200px",
    },
    {
      name: "Email",
      selector: (row) => row.email || "Unknown",
      sortable: true,
      width: "220px",
    },
    {
      name: "Basic Pay",
      selector: (row) => `₱${(row.basicPay || 0).toLocaleString()}`,
      sortable: true,
      width: "120px",
    },
    {
      name: "Gross Salary",
      selector: (row) => `₱${(row.gross_pay || 0).toLocaleString()}`,
      sortable: true,
      width: "140px",
    },
    {
      name: "Deductions",
      selector: (row) => `₱${(row.totalDeductions || 0).toLocaleString()}`,
      sortable: true,
      width: "140px",
    },
    {
      name: "Net Salary",
      selector: (row) => `₱${(row.netPay || 0).toLocaleString()}`,
      sortable: true,
      width: "140px",
    },
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
    <div className="fixed top-0 right-0 bottom-0 min-h-screen w-[calc(100%-16rem)] bg-neutralSilver p-6 pt-16">
      <div className="flex flex-col h-full">
        {/* Confirm Deletion Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-11/12 sm:w-96 md:w-[28rem] lg:w-[30rem] relative">
              <h3 className="text-lg font-semibold mb-2">Confirm Deletion</h3>
              <p className="text-justify">
                Are you sure you want to delete generated payroll?
              </p>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-2 py-1 h-10 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeletePayroll}
                  className="px-2 py-1 h-10 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: "Payroll", href: "" },
            {
              label: "Payroll Information",
              href: "/admin-dashboard/employees",
            },
            { label: "Payroll Generator", href: "/admin-dashboard/employees" },
          ]}
        />

        {/* Main Layout */}
        <div className="flex  flex-wrap gap-4 -mt-1 flex-grow overflow-hidden">
          {/* Left Section */}
          <div className="w-full lg:w-[70%]  h-full bg-white rounded gap-2 shadow-sm p-3">
            <label className="block text-sm font-medium text-gray-700">
              Cutoff Date:
            </label>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mt-2 gap-3">
              {/* Cutoff Input */}
              <div className="w-full lg:w-auto flex-1">
                <input
                  type="text"
                  value={cutoffDate}
                  readOnly
                  className="p-2 border h-8 rounded w-full bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap lg:flex-nowrap w-full lg:w-auto">
                <button
                  onClick={handleCreatePayroll}
                  className={`px-2 py-1 rounded w-full lg:w-36 h-8 text-white ${
                    cutoffDate
                      ? "bg-brandPrimary hover:bg-neutralDGray"
                      : "bg-neutralGray cursor-not-allowed opacity-50"
                  }`}
                  disabled={loading || !cutoffDate}
                >
                  {loading ? "Generating..." : "Create Payroll"}
                </button>
                <button
                  onClick={() =>
                    navigate("/admin-dashboard/attendance-computation")
                  }
                  className="px-4 py-1 rounded w-full lg:w-32 h-8 bg-brandPrimary text-white hover:bg-neutralDGray"
                >
                  Attendance
                </button>
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="px-4 py-1 rounded w-full lg:w-32 h-8 bg-brandPrimary text-white hover:bg-neutralDGray"
                >
                  Delete
                </button>
              </div>
            </div>

            {message && (
              <p className="mt-4 text-center text-green-600">{message}</p>
            )}

            {/* Payroll Details */}
            <div className="flex flex-col rounded-lg mt-3  h-full max-h-[80vh] min-h-[28rem]">
              <div className="flex flex-col flex-1 rounded-lg overflow-hidden">
                <h4 className="text-lg text-neutralDGray font-semibold px-2 py-1 bg-gray-200 mb-3 rounded">
                  Payroll Details
                </h4>

                {/* Top Controls */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                  {/* Export Buttons */}
                  <div className="inline-flex border border-neutralDGray rounded h-8">
                    <button
                      onClick={handleDownloadExcel}
                      className="px-3 w-20 h-full border-r hover:bg-neutralSilver transition-all duration-300 border-neutralDGray rounded-l flex items-center justify-center"
                    >
                      <FaPrint title="Print" className="text-neutralDGray" />
                    </button>
                    <button
                      onClick={handleDownloadExcel}
                      className="px-3 w-20 h-full border-r hover:bg-neutralSilver transition-all duration-300 border-neutralDGray flex items-center justify-center"
                    >
                      <FaRegFileExcel
                        title="Export to Excel"
                        className="text-neutralDGray"
                      />
                    </button>
                    <button
                      onClick={handleDownloadExcel}
                      className="px-3 w-20 h-full hover:bg-neutralSilver transition-all duration-300 rounded-r flex items-center justify-center"
                    >
                      <FaRegFilePdf
                        title="Export to PDF"
                        className="text-neutralDGray"
                      />
                    </button>
                  </div>

                  {/* Search */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Search Employee"
                      onChange={handleFilter}
                      className="px-2 py-0.5 border rounded"
                    />
                    <FaSearch className="text-neutralDGray" />
                  </div>
                </div>

                <hr className="my-3" />

                {/* Table Section - Modified */}
                {/* Table Section with both horizontal and vertical scrolling */}
                <div className="flex-grow overflow-hidden flex flex-col">
                  <div className="h-[63vh] w-full overflow-y-auto overflow-x-auto bg-white">
                    {loading ? (
                      <p className="mt-6 text-center text-gray-300">
                        Loading payslips...
                      </p>
                    ) : payslips.length > 0 ? (
                      <div className="min-w-full inline-block">
                        <DataTable
                          columns={columns}
                          className="w-full -mt-3 text-sm"
                          data={payslips}
                          highlightOnHover
                          striped
                        />
                      </div>
                    ) : (
                      <p className="mt-6 text-center text-gray-300">
                        No payslip records available.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Section */}
          <div className="w-full lg:w-[28%]">
            <CustomCalendar onDateChange={setCutoffDate} />
          </div>
        </div>

        {/* Modals */}
        <PayslipModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          employeeId={selectedEmployee}
        />
        <NoAttendanceModal
          isOpen={noAttendanceModalOpen}
          onClose={() => setNoAttendanceModalOpen(false)}
        />

        {/* Overtime Approval Modal */}
        <Modal show={show} onHide={handleClose} centered size="lg" scrollable>
          <Modal.Header closeButton>
            <Modal.Title>Overtime Approval Sheet</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="flex flex-col">
              <div className="w-full max-w-3xl bg-white p-6 border border-gray-300 rounded-md shadow-md min-h-[500px]">
                {filteredEmployeesOvertime.length > 0 ? (
                  <>
                    <div className="flex justify-between mb-3">
                      <div className="flex rounded items-center">
                        <input
                          type="text"
                          placeholder="Search employee by name or ID"
                          value={searchTerm}
                          className="px-2 w-80 text-base font-normal rounded py-0.5 border"
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FaSearch className="ml-[-20px] text-neutralDGray" />
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="px-2 py-1 border h-8 w-36 text-sm text-neutralDGray rounded hover:bg-green-500 hover:text-white"
                          onClick={() =>
                            setSelectedOvertime(
                              filteredEmployeesOvertime.map((e) => e.ecode)
                            )
                          }
                        >
                          Select All
                        </button>
                        <button
                          className="px-2 text-sm py-1 border h-8 w-36 text-neutralDGray rounded hover:bg-red-500 hover:text-white"
                          onClick={() => setSelectedOvertime([])}
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Approved Overtime (hrs) per Employee:
                    </label>
                    <input
                      type="number"
                      className="w-full mb-3 px-2 py-1 border rounded"
                      placeholder="Enter approved overtime"
                      value={maxOvertime}
                      onChange={(e) => setMaxOvertime(e.target.value)}
                    />

                    <h5 className="text-neutralDGray mt-2">
                      List of Employees
                    </h5>
                    <ul className="list-none pl-0">
                      {filteredEmployeesOvertime.map((employee) => (
                        <li
                          key={employee.ecode}
                          className="flex items-center gap-2 text-sm mb-2"
                        >
                          <input
                            type="checkbox"
                            className="w-3 h-3 rounded-sm"
                            checked={selectedOvertime.includes(employee.ecode)}
                            onChange={() =>
                              handleCheckboxChange(employee.ecode)
                            }
                          />
                          {employee.name} ({employee.ecode})
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-center text-gray-500">
                    {searchTerm
                      ? "No employees found matching your search."
                      : "No employees available."}
                  </p>
                )}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button
              className="px-2 py-1 h-10 bg-brandPrimary text-white rounded hover:bg-neutralDGray"
              onClick={() => {
                proceedWithPayroll(selectedOvertime, maxOvertime);
                handleClose();
              }}
            >
              Approve Overtime
            </button>
            <button
              className="px-2 py-1 h-10 bg-neutralGray text-white rounded hover:bg-neutralDGray"
              onClick={handleClose}
            >
              Close
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default PayrollSummary;
