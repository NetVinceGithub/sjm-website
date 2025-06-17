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
import { toast } from "react-toastify";
import { useAuth } from "../../../context/authContext";

const PayrollSummary = () => {
  const { user } = useAuth();
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
  const [employees, setEmployeeList] = useState([]);
  const [selectedOvertime, setSelectedOvertime] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [individualOvertime, setIndividualOvertime] = useState({});
  const [payrollType, setPayrollType] = useState("biweekly"); // Default to bi-weekly
  const [filteredEmployeesOvertime, setFilteredEmployeesOvertime] = useState(
    []
  );
  const [maxOvertime, setMaxOvertime] = useState("");

  const navigate = useNavigate();

  // Fixed function to filter employees based on search term
  const filterEmployeesBySearch = (employeeList = filteredEmployees) => {
    console.log("🔍 Filtering employees by search term:", searchTerm);
    console.log("📋 Employee list to filter:", employeeList.length);

    if (!searchTerm.trim()) {
      setFilteredEmployeesOvertime(employeeList);
    } else {
      const filtered = employeeList.filter(
        (employee) =>
          employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.ecode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployeesOvertime(filtered);
      console.log("✅ Filtered employees by search:", filtered.length);
    }
  };

  // Effect for search term filtering
  useEffect(() => {
    console.log("🔄 Search term changed, filtering employees");
    if (filteredEmployees.length > 0) {
      filterEmployeesBySearch(filteredEmployees);
    }
  }, [searchTerm]); // Only depend on searchTerm

  // Fixed effect for modal opening and employee pre-selection
  useEffect(() => {
    const setupModalData = async () => {
      if (!show) return; // Only run when modal is open

      console.log("🚀 Setting up modal data...");
      console.log("👥 Current employees count:", employees.length);

      try {
        // First, let's show all active employees (don't filter by attendance yet)
        const activeEmployees = employees.filter(
          (employee) => employee.status !== "Inactive"
        );

        console.log("👥 Active employees:", activeEmployees.length);

        // Try to fetch attendance data for additional filtering (optional)
        try {
          console.log("📩 Fetching attendance data...");
          const attendanceResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/attendance/get-attendance`
          );

          const attendanceData = attendanceResponse.data.attendance || [];
          console.log("📊 Attendance Data:", attendanceData.length, "records");

          if (attendanceData.length > 0) {
            const validEcodes = new Set(
              attendanceData.map((record) => record.ecode)
            );
            console.log(
              "✅ Valid employee codes from attendance:",
              validEcodes.size
            );

            // Filter employees who have attendance records
            const filtered = activeEmployees.filter((employee) =>
              validEcodes.has(employee.ecode)
            );

            console.log(
              "👥 Employees with attendance records:",
              filtered.length
            );

            if (filtered.length > 0) {
              setFilteredEmployees(filtered);
              setFilteredEmployeesOvertime(filtered);
            } else {
              // If no employees have attendance, show all active employees
              console.log(
                "⚠️ No employees with attendance found, showing all active employees"
              );
              setFilteredEmployees(activeEmployees);
              setFilteredEmployeesOvertime(activeEmployees);
            }
          } else {
            // If no attendance data, show all active employees
            console.log(
              "⚠️ No attendance data found, showing all active employees"
            );
            setFilteredEmployees(activeEmployees);
            setFilteredEmployeesOvertime(activeEmployees);
          }
        } catch (attendanceError) {
          console.log(
            "⚠️ Could not fetch attendance data, showing all active employees"
          );
          console.error("Attendance fetch error:", attendanceError);
          setFilteredEmployees(activeEmployees);
          setFilteredEmployeesOvertime(activeEmployees);
        }

        // Use the final filtered list for pre-selection
        const finalEmployeeList = activeEmployees; // Start with active employees as minimum

        // Pre-select all employees' ecode by default when the modal opens
        const allEcodes = finalEmployeeList.map((employee) => employee.ecode);
        setSelectedOvertime(allEcodes);

        // Initialize individual overtime values with default maxOvertime
        const initialOvertime = {};
        allEcodes.forEach((ecode) => {
          initialOvertime[ecode] = maxOvertime || "0";
        });
        setIndividualOvertime(initialOvertime);

        console.log("✅ Pre-selected employees:", allEcodes.length);
        console.log("✅ Employee ecodes:", allEcodes);
      } catch (error) {
        console.error(
          "❌ Error setting up modal data:",
          error.response?.data || error
        );
        setMessage("Error loading employee data for overtime approval");

        // Fallback: show all employees even if there's an error
        const fallbackEmployees = employees.filter(
          (employee) => employee.status !== "Inactive"
        );
        if (fallbackEmployees.length > 0) {
          setFilteredEmployees(fallbackEmployees);
          setFilteredEmployeesOvertime(fallbackEmployees);
          const fallbackEcodes = fallbackEmployees.map((emp) => emp.ecode);
          setSelectedOvertime(fallbackEcodes);
        }
      }
    };

    setupModalData();
  }, [show, employees, maxOvertime]); // FIXED: Removed filteredEmployees from dependencies

  useEffect(() => {
    console.log("📋 Filtered employees updated:", filteredEmployees.length);
    if (filteredEmployees.length > 0 && !searchTerm.trim()) {
      setFilteredEmployeesOvertime(filteredEmployees);
    }
  }, [filteredEmployees]);

  // Debug effect
  useEffect(() => {
    console.log("🔍 State Debug:", {
      show,
      employeesCount: employees.length,
      filteredEmployeesCount: filteredEmployees.length,
      filteredEmployeesOvertimeCount: filteredEmployeesOvertime.length,
      searchTerm,
      selectedOvertimeCount: selectedOvertime.length,
    });
  }, [
    show,
    employees,
    filteredEmployees,
    filteredEmployeesOvertime,
    searchTerm,
    selectedOvertime,
  ]);

  const handleOpenModal = (employeeId) => {
    setSelectedEmployee(employeeId);
    setModalOpen(true);
  };

  const handleCheckboxChange = (ecode) => {
    setSelectedOvertime((prevSelected) => {
      const isCurrentlySelected = prevSelected.includes(ecode);

      if (isCurrentlySelected) {
        // Remove from selection and clear their overtime value
        setIndividualOvertime((prev) => {
          const updated = { ...prev };
          delete updated[ecode];
          return updated;
        });
        return prevSelected.filter((id) => id !== ecode);
      } else {
        // Add to selection and set default overtime value
        setIndividualOvertime((prev) => ({
          ...prev,
          [ecode]: maxOvertime || "0",
        }));
        return [...prevSelected, ecode];
      }
    });
  };

  const fetchPayslips = async () => {
    try {
      setLoading(true); // Ensure loading state is set
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/payslip`
      );
      setPayslips([...response.data]); // Force a new reference to trigger re-render
    } catch (error) {
      console.error("Error fetching payslips:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleCreatePayroll = async () => {
    try {
      console.log("🚀 handleCreatePayroll called");
      console.log("📅 cutoffDate:", cutoffDate);

      // Validate cutoff date
      if (!cutoffDate) {
        setMessage("Please select a cutoff date before creating payroll.");
        return;
      }

      console.log("✅ Cutoff date validation passed, proceeding to load employee data");

      setLoading(true);
      setMessage("Loading employee data...");

      // Fetch all required data
      const [employeeResponse, attendanceResponse, holidaysResponse] =
        await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/employee`),
          axios.get(
            `${import.meta.env.VITE_API_URL}/api/attendance/get-attendance`
          ),
          axios.get(`${import.meta.env.VITE_API_URL}/api/holidays`),
        ]);

      const employeeData = employeeResponse.data.employees || [];
      const attendanceData = attendanceResponse.data.attendance || [];
      const holidaysData = holidaysResponse.data.holidays || [];

      console.log("📊 Loaded data:", {
        employees: employeeData.length,
        attendance: attendanceData.length,
        holidays: holidaysData.length,
      });

      // Validate we have employee data
      if (!employeeData.length) {
        setMessage(
          "No employee data found. Please check your employee records."
        );
        setLoading(false);
        return;
      }

      // Set up employees list for modal
      setEmployeeList(employeeData);

      setLoading(false);
      setMessage(
        "Please configure overtime hours for employees in the Overtime Approval Sheet."
      );

      // Show overtime modal
      setShow(true);

      console.log(
        "📊 Overtime modal opened for employee overtime configuration"
      );
    } catch (error) {
      console.error("❌ Error loading employee data:", error);
      setMessage(
        `Failed to load employee data: ${
          error.response?.data?.message || error.message
        }`
      );
      setLoading(false);
    }
  };

  // Simplified button validation - only check cutoff date
  const isCreateButtonDisabled = () => {
    const hasCutoff = Boolean(cutoffDate);
    const isLoading = loading;

    return isLoading || !hasCutoff;
  };

  const proceedWithPayroll = async (selectedEmployees) => {
    // Validate cutoff date
    if (!cutoffDate) {
      setMessage("Please select a cutoff date before generating payroll.");
      return;
    }

    // Additional validation: ensure selected employees
    if (!selectedEmployees || selectedEmployees.length === 0) {
      setMessage(
        "Please select at least one employee before generating payroll."
      );
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

      // Apply individual overtime values for each employee
      const updatedAttendanceData = attendanceData.map((record) => {
        const employeeOvertime = selectedEmployees.includes(record.ecode)
          ? Number(individualOvertime[record.ecode] || 0)
          : 0;

        return {
          ...record,
          overtimeHours: Math.min(record.overtimeHours, employeeOvertime),
        };
      });

      // Send request with individual overtime data
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payslip/generate`,
        {
          cutoffDate: cutoffDate.trim(),
          selectedEmployees,
          attendanceData: updatedAttendanceData,
          individualOvertime,
          requestedBy: user.name,
        }
      );

      console.log("✅ Payroll response:", response.data);

      if (response.data.success && Array.isArray(response.data.payslips)) {
        if (!response.data.payslips.length) {
          console.log("🚫 No payslips generated, opening modal.");
          setNoAttendanceModalOpen(true);
        } else {
          setPayslips(response.data.payslips);
          toast.success(
            <div style={{ fontSize: "0.9rem" }}>
              Payroll successfully generated for {selectedEmployees.length} employee(s).
            </div>,
            {
              autoClose: 3000,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              closeButton: false,
              position: "top-right",
            }
          );
          setShow(false);
        }
      } else {
        toast.error(
          <div style={{ fontSize: "0.9rem" }}>
            Failed to generate payroll:{" "}
            {response?.data?.message || "Unknown error"}
          </div>,
          {
            autoClose: 3000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            closeButton: false,
            position: "top-right",
          }
        );
      }
    } catch (error) {
      console.error("❌ Full error response:", error.response?.data || error);
      toast.error(
        <div style={{ fontSize: "0.9rem" }}>
          {error?.response?.data?.message ||
            "An error occurred while generating payroll."}
        </div>,
        {
          autoClose: 3000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          closeButton: false,
          position: "top-right",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShow(false);
    // Reset states when closing modal
    setFilteredEmployees([]);
    setFilteredEmployeesOvertime([]);
    setSelectedOvertime([]);
    setIndividualOvertime({});
    setSearchTerm("");
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
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/payslip`
      );
      if (response.data.success) {
        setPayslips([]);
      }
      fetchPayslips();
    } catch (error) {
      console.error("Error deleting payroll:", error);
    } finally {
      setShowConfirmModal(false);
    }
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
      name: "Total Deductions",
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

  const columns1 = [
    {
      name: "",
      cell: (row) => (
        <input
          type="checkbox"
          className="w-3 h-3 rounded-sm accent-teal-500"
          checked={selectedOvertime.includes(row.ecode)}
          onChange={() => handleCheckboxChange(row.ecode)}
        />
      ),
      width: "60px",
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Employee Code",
      selector: (row) => row.ecode,
      sortable: true,
    },
    {
      name: "Approved Overtime (hrs)",
      cell: (row) => (
        <input
          type="number"
          min="0"
          step="0.5"
          className="w-20 px-2 py-1 mt-1 mb-1 h-8 text-xs border rounded"
          value={
            selectedOvertime.includes(row.ecode)
              ? individualOvertime[row.ecode] || "0"
              : "0"
          }
          disabled={!selectedOvertime.includes(row.ecode)}
          onChange={(e) => {
            if (selectedOvertime.includes(row.ecode)) {
              setIndividualOvertime((prev) => ({
                ...prev,
                [row.ecode]: e.target.value,
              }));
            }
          }}
          placeholder="0"
        />
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "150px",
    },
  ];
  return (
    <div className=" right-0 bottom-0  min-h-screen w-full bg-neutralSilver p-3 pt-16">
      <div className="flex flex-col h-[calc(100vh-90px)]">
        {/* Confirm Deletion Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-11/12 sm:w-96 md:w-[28rem] lg:w-[30rem] relative">
              <h3 className="text-base mb-2 text-red-500">Confirm Deletion</h3>
              <p className="text-justify text-sm">
                Are you sure you want to delete generated payroll?
              </p>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 w-24 h-8 border flex justify-center items-center text-center text-neutralDGray rounded-lg hover:bg-red-400 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeletePayroll}
                  className="px-4 py-2 w-24 h-8 border flex justify-center items-center text-center  text-neutralDGray rounded-lg hover:bg-green-400 hover:text-white transition-all"
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
        <div className="flex  flex-wrap gap-4 -mt-2 flex-grow overflow-hidden">
          {/* Left Section */}
          <div className="w-full lg:w-[70%]  h-full bg-white border-gray-900 rounded gap-2 border shadow-sm p-3">
            <div className="flex justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Cutoff Date:
              </label>



              {/* Radio Button Section */}
              <div className="flex gap-6 mb-4 justify-end">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="payrollType"
                    id="weekly"
                    value="weekly"
                    checked={payrollType === "weekly"}
                    onChange={(e) => setPayrollType(e.target.value)}
                    className="mr-2"
                  />
                  <label htmlFor="weekly" className="text-sm text-gray-700">
                    Weekly
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="payrollType"
                    id="biweekly"
                    value="biweekly"
                    checked={payrollType === "biweekly"}
                    onChange={(e) => setPayrollType(e.target.value)}
                    className="mr-2"
                  />
                  <label htmlFor="biweekly" className="text-sm text-gray-700">
                    Bi-Weekly
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between -mt-1 gap-3">
              {/* Cutoff Input */}
              <div className="w-full lg:w-auto flex-1">
                <input
                  type="text"
                  value={cutoffDate}
                  onChange={
                    payrollType === "weekly"
                      ? (e) => setCutoffDate(e.target.value)
                      : undefined
                  }
                  readOnly={payrollType !== "weekly"}
                  className={`p-2 border h-8 rounded w-full ${
                    payrollType === "weekly"
                      ? "bg-white cursor-text"
                      : "bg-gray-100 cursor-not-allowed"
                  }`}
                  placeholder={
                    payrollType === "weekly"
                      ? "Enter payroll date"
                      : "Select date from calendar"
                  }
                />
              </div>

              {/* Action Buttons - UPDATED WITH SCHEDULE VALIDATION */}
              <div className="flex gap-2 flex-wrap lg:flex-nowrap w-full lg:w-auto">
                <button
                  onClick={handleCreatePayroll}
                  className={`px-2 py-1 text-sm border rounded w-full lg:w-36 h-8 text-neutralDGray ${
                    cutoffDate
                      ? "hover:bg-green-400 hover:text-white"
                      : "bg-neutralGray cursor-not-allowed opacity-50"
                  }`}
                  disabled={isCreateButtonDisabled()}
                  title={
                    !cutoffDate
                      ? "Please select at least one schedule from Filters"
                      : `Create payroll for selected schedule(s)`
                  }
                >
                  {loading ? "Generating..." : "Create Payroll"}
                </button>
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="px-4 py-1 rounded w-full lg:w-32 h-8 border text-sm text-neutralDGray hover:bg-red-400 hover:text-white"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Enhanced Message Display */}
            {message && (
              <div
                className={`mt-4 p-3 rounded-lg text-center text-sm ${
                  message.includes("successfully") ||
                  message.includes("Payroll created")
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : message.includes("Please select") ||
                      message.includes("No")
                    ? "bg-orange-50 text-orange-700 border border-orange-200"
                    : message.includes("Failed") || message.includes("error")
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                {message}
              </div>
            )}



            {/* Payroll Details */}
            <div className="flex flex-col rounded-lg mt-3  h-full max-h-[80vh] min-h-[28rem]">
              <div className="flex flex-col flex-1 rounded-lg overflow-hidden">
                <h4 className="text-base italic text-neutralDGray font-semibold px-2 py-1 bg-gray-200 mb-3 rounded">
                  Payroll Details
                </h4>

                {/* Top Controls */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                  {/* Export Buttons */}
                  <div className="inline-flex border border-neutralDGray rounded h-8">
                    <button
                      onClick={handleDownloadExcel}
                      className="px-3 w-20 h-full text-[13px] border-r hover:bg-neutralSilver transition-all duration-300 border-neutralDGray rounded-l flex items-center justify-center"
                    >
                      <FaPrint title="Print" className="text-neutralDGray" />
                    </button>
                    <button
                      onClick={handleDownloadExcel}
                      className="px-3 w-20 h-full text-[13px]  border-r hover:bg-neutralSilver transition-all duration-300 border-neutralDGray flex items-center justify-center"
                    >
                      <FaRegFileExcel
                        title="Export to Excel"
                        className="text-neutralDGray"
                      />
                    </button>
                    <button
                      onClick={handleDownloadExcel}
                      className="px-3 w-20 text-[13px] h-full hover:bg-neutralSilver transition-all duration-300 rounded-r flex items-center justify-center"
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
                      className="px-2 py-0.5 border h-8 text-xs w-64 rounded"
                    />
                    <FaSearch className="text-neutralDGray" />
                  </div>
                </div>

                <hr className="my-3" />

                {/* Table Section - Modified */}
                {/* Table Section with both horizontal and vertical scrolling */}
                <div className="h-[calc(100vh-350px)] w-full bg-white">
                  {loading ? (
                    <p className="mt-6 text-center text-gray-300">
                      Loading payslips...
                    </p>
                  ) : payslips.length > 0 ? (
                    <div className="inline-block w-full overflow-auto">
                      {" "}
                      {/* or larger width */}
                      <DataTable
                        columns={columns}
                        className="w-full -mt-3 text-sm"
                        data={payslips}
                        pagination
                        highlightOnHover
                        striped
                      />
                    </div>
                  ) : (
                    <div className="mt-6 text-center">
                     
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Section */}
          <div className="w-full lg:w-[28%]">
            <CustomCalendar
              onDateChange={setCutoffDate}
              payrollType={payrollType}
            />
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

        {/* <FilterComponent
          show={filterComponentModal}
          onClose={() => setFilterComponentModal(false)}
          onSchedulesSelected={handleSchedulesSelected}
          onRemoveSchedule={handleRemoveSchedule}
        /> */}

        {/* Overtime Approval Modal */}
        <Modal show={show} onHide={handleClose} centered size="lg" scrollable>
          <Modal.Header className="py-2 px-3 text-[12px]" closeButton>
            <Modal.Title as="h6" className="text-lg">
              Overtime Approval Sheet
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="flex flex-col">
              <div className="w-full max-w-3xl bg-white p-6 border border-gray-300 rounded-md shadow-md min-h-[500px]">
                {/* Add debug info in development */}
                {/* <DebugInfo /> */}

                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <p>Loading employees...</p>
                  </div>
                ) : filteredEmployeesOvertime.length > 0 ? (
                  <>
                    <div className="flex rounded justify-end items-center -mt-2">
                      <input
                        type="text"
                        placeholder="Search employee by name or ID"
                        value={searchTerm}
                        className="px-2 h-8 w-80 text-sm font-normal rounded py-0.5 border"
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <FaSearch className="ml-[-20px] text-neutralDGray" />
                    </div>

                    <label className="block text-xs font-medium text-gray-500 mb-2">
                      Set Default Overtime (hrs) for All Selected Employees:
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="number"
                        className="flex-1 h-8 text-sm px-2 py-1 border rounded"
                        placeholder="Enter default overtime hours"
                        value={maxOvertime}
                        onChange={(e) => setMaxOvertime(e.target.value)}
                      />
                      <button
                        type="button"
                        className="px-3 py-1 h-8 text-xs border rounded text-neutralDGray hover:bg-green-400 hover:text-white"
                        onClick={() => {
                          const defaultValue = maxOvertime || "0";
                          const newIndividualOvertime = {
                            ...individualOvertime,
                          };
                          selectedOvertime.forEach((ecode) => {
                            newIndividualOvertime[ecode] = defaultValue;
                          });
                          setIndividualOvertime(newIndividualOvertime);
                        }}
                      >
                        Apply to Selected
                      </button>
                    </div>

                    <p className="text-xs text-red-300 text-center italic">
                      **Note: You can batch edit or you can edit overtime
                      individually.**
                    </p>

                    <div className="border border-neutralDGray rounded p-2 overflow-auto">
                      <div className="flex justify-between mb-3">
                        <div>
                          <h5 className="text-neutralDGray text-base italic">
                            List of Employees (
                            {filteredEmployeesOvertime.length})
                          </h5>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="px-2 py-1 text-xs border h-8 w-36 text-neutralDGray rounded hover:bg-green-400 hover:text-white"
                            onClick={() =>
                              setSelectedOvertime(
                                filteredEmployeesOvertime.map((e) => e.ecode)
                              )
                            }
                          >
                            Select All
                          </button>
                          <button
                            className="px-2 text-xs py-1 border h-8 w-36 text-neutralDGray rounded hover:bg-red-400 hover:text-white"
                            onClick={() => setSelectedOvertime([])}
                          >
                            Deselect All
                          </button>
                        </div>
                      </div>

                      <DataTable
                        columns={columns1}
                        data={filteredEmployeesOvertime}
                        dense
                        pagination
                        highlightOnHover
                        selectableRows={false}
                        noHeader
                        noDataComponent={
                          <div className="p-4 text-center">
                            <p className="text-gray-500">
                              {searchTerm
                                ? `No employees found matching "${searchTerm}"`
                                : "No employees with attendance records found"}
                            </p>
                          </div>
                        }
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64">
                    <p className="text-center text-gray-500 mb-4">
                      {employees.length === 0
                        ? "No employees found in the system"
                        : filteredEmployees.length === 0
                        ? "No employees with attendance records found"
                        : searchTerm
                        ? `No employees found matching "${searchTerm}"`
                        : "No employees available for overtime approval"}
                    </p>
                    {employees.length === 0 && (
                      <button
                        className="px-4 py-2 text-sm border rounded text-neutralDGray hover:bg-blue-400 hover:text-white"
                        onClick={() => {
                          setShow(false);
                          navigate("/admin-dashboard/employees");
                        }}
                      >
                        Go to Employee Management
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button
              className="px-4 py-2 text-sm h-8 border flex justify-center items-center text-center text-neutralDGray rounded-lg hover:bg-green-400 hover:text-white transition-all"
              onClick={() => {
                proceedWithPayroll(selectedOvertime); // Remove maxOvertime parameter
                handleClose();
              }}
            >
              Approve Overtime
            </button>
            <button
              className="px-4 py-2 text-sm h-8 border flex justify-center items-center text-center text-neutralDGray rounded-lg hover:bg-red-400 hover:text-white transition-all"
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
