import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { isWithinInterval, isSameDay, isAfter } from "date-fns";
import { Plus, Check } from "lucide-react";
import {
  FaUsers,
  FaMoneyBillTrendUp,
  FaSackDollar,
  FaCodiepie,
  FaFilter,
  FaPlus,
} from "react-icons/fa6";
import { FaArrowRotateRight, FaXmark } from "react-icons/fa6";
import axios from "axios";
import SummaryCard from "./SummaryCard";
import Breadcrumb from "./Breadcrumb";
import { FaSearch, FaSyncAlt } from "react-icons/fa";
import PayrollLineChart from "./PayrollLineChart";
import CalendarOverview from "./CalendarOverview";
import { format } from "date-fns";
import defaultProfile from "../../../assets/default-profile.png";

const Overview = () => {
  const [payslips, setPayslips] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [filteredPayslips, setFilteredPayslips] = useState([]);
  const [cutoffDate, setCutoffDate] = useState("");
  const [employees, setEmployees] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [holidaySummary, setHolidaySummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Helper function to determine payroll status
  const getPayrollStatus = (cutoff, currentDate) => {
    const { start, end, release } = cutoff;

    if (isSameDay(currentDate, release)) {
      return {
        status: "Released",
        badge: "bg-green-100 text-green-800",
      };
    }

    if (isWithinInterval(currentDate, { start, end })) {
      return {
        status: "Ongoing",
        badge: "bg-yellow-100 text-yellow-800",
      };
    }

    if (isAfter(currentDate, release)) {
      return {
        status: "Released",
        badge: "bg-green-100 text-green-800",
      };
    }

    return {
      status: "Pending",
      badge: "bg-gray-100 text-gray-800",
    };
  };

  // Utility to generate payroll cutoffs
  const getPayrollCutoffs = (filterMonth, filterYear) => {
    const now = new Date();
    const targetYear = filterYear ? parseInt(filterYear) : now.getFullYear();
    const targetMonth = filterMonth
      ? parseInt(filterMonth) - 1
      : now.getMonth();

    const firstCutoff = {
      start: new Date(targetYear, targetMonth, 1),
      end: new Date(targetYear, targetMonth, 15),
      release: new Date(targetYear, targetMonth, 20),
    };

    const secondCutoff = {
      start: new Date(targetYear, targetMonth, 16),
      end: new Date(targetYear, targetMonth + 1, 0),
      release: new Date(targetYear, targetMonth + 1, 5),
    };

    return [firstCutoff, secondCutoff];
  };

  const applyFilters = (payslipsData, filterMonth, filterYear) => {
    if (!filterMonth && !filterYear) {
      return payslipsData;
    }

    return payslipsData.filter((payslip) => {
      let payslipDate;

      // Handle your cutoffDate format: "June 1-15, 2025"
      if (payslip.cutoffDate) {
        const cutoffDateStr = payslip.cutoffDate;
        // Extract year from the end
        const yearMatch = cutoffDateStr.match(/(\d{4})$/);
        // Extract month name from the beginning
        const monthMatch = cutoffDateStr.match(/^([A-Za-z]+)/);

        if (yearMatch && monthMatch) {
          const year = parseInt(yearMatch[1]);
          const monthName = monthMatch[1];
          const monthNumber = new Date(`${monthName} 1, 2000`).getMonth() + 1;
          payslipDate = new Date(year, monthNumber - 1, 1);
        }
      }
      // Fallback to date field if cutoffDate parsing fails
      else if (payslip.date) {
        payslipDate = new Date(payslip.date);
      } else {
        return false;
      }

      const matchesMonth =
        !filterMonth || payslipDate.getMonth() + 1 === parseInt(filterMonth);
      const matchesYear =
        !filterYear || payslipDate.getFullYear() === parseInt(filterYear);

      return matchesMonth && matchesYear;
    });
  };
  const handleConfirm = () => {
    const filtered = applyFilters(payslips, month, year);
    setFilteredPayslips(filtered);

    setShowFilterModal(false);

    const filterText = [];
    if (month)
      filterText.push(
        `Month: ${new Date(2000, month - 1).toLocaleString("default", {
          month: "long",
        })}`
      );
    if (year) filterText.push(`Year: ${year}`);

    if (filterText.length > 0) {
      toast.success(
        `Filters applied: ${filterText.join(", ")}. Found ${
          filtered.length
        } payslips.`,
        {
          position: "top-right",
          autoClose: 3000,
          closeButton: false,
          closeOnClick: true,
        }
      );
    }
  };

  const clearFilters = () => {
    setMonth("");
    setYear("");
    setFilteredPayslips(payslips);
    setShowFilterModal(false);
    toast.warning("Filters cleared", {
      position: "top-right",
      autoClose: 2000,
      closeButton: false,
      closeOnClick: true,
    });
  };

  // All useEffect hooks at the component level
  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/payslip`
        );
        const payslipsData = Array.isArray(response.data) ? response.data : [];
        setPayslips(payslipsData);

        // Apply current filters to new data if filters are active
        if (month || year) {
          const filtered = applyFilters(payslipsData, month, year);
          setFilteredPayslips(filtered);
        } else {
          setFilteredPayslips(payslipsData);
        }
      } catch (error) {
        console.error("Error fetching payslips:", error);
        setPayslips([]);
        setFilteredPayslips([]);
      }
    };

    fetchPayslips();
  }, []);

  useEffect(() => {
    if (month || year) {
      const filtered = applyFilters(payslips, month, year);
      setFilteredPayslips(filtered);
    } else {
      setFilteredPayslips(payslips);
    }
  }, [month, year, payslips, employees]);

  useEffect(() => {
    const checkUserRole = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("cannot find token");
        return;
      }

      try {
        const userResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/current`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const currentUserRole = userResponse.data.user.role;
        setUserRole(currentUserRole);
        if (currentUserRole === "approver") {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Error checking authorization:", error);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/employee/status`
        );
        console.log(response.data);
        const employeeData = Array.isArray(response.data) ? response.data : [];
        setEmployees(employeeData);
        setFilteredEmployees(employeeData); // Add this line
      } catch (error) {
        console.log("Error fetching active employees", error);
        setEmployees([]);
        setFilteredEmployees([]); // Add this line
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/holidays`
        );
        console.log(response.data);
        setHolidaySummary(
          Array.isArray(response.data.holidays) ? response.data.holidays : []
        );
      } catch (error) {
        console.error(error);
        setHolidaySummary([]);
      }
    };
    fetchHolidays();
  }, []);

  // Get processed payroll cutoffs
  const payrollCutoffs = getPayrollCutoffs();
  const currentDate = new Date();
  const processedCutoffs = payrollCutoffs.map((cutoff) => {
    const statusInfo = getPayrollStatus(cutoff, currentDate);
    return {
      ...cutoff,
      status: statusInfo.status,
      badge: statusInfo.badge,
    };
  });

  const displayPayslips = month || year ? filteredPayslips : payslips;
  const safePayslips = Array.isArray(displayPayslips) ? displayPayslips : [];

  const displayEmployees = employees;
  const safeEmployees = Array.isArray(displayEmployees) ? displayEmployees : [];

  const handleCreatePayroll = async () => {
    if (!cutoffDate) {
      toast.info(
        <div style={{ fontSize: "0.9rem" }}>Please select a cutoff date.</div>,
        {
          autoClose: 3000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          position: "top-right",
        }
      );
      return;
    }

    try {
      setMessage("");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payslip/generate`,
        { cutoffDate }
      );

      if (response.data.success && Array.isArray(response.data.payslips)) {
        setPayslips(response.data.payslips);
        setFilteredPayslips(response.data.payslips);
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

  const parseCutoffDate = (cutoffDate) => {
    const [month, day, year] = cutoffDate.split("/");
    return {
      month: parseInt(month),
      year: parseInt(year),
      day: parseInt(day),
    };
  };

  // Filter function
  const filterPayslips = (payslipData, filterMonth, filterYear) => {
    if (!filterMonth && !filterYear) {
      return payslipData; // No filters applied, return all data
    }

    return payslipData.filter((payslip) => {
      const { month: payslipMonth, year: payslipYear } = parseCutoffDate(
        payslip.cutoffDate
      );

      // Check month filter
      const monthMatches =
        !filterMonth || payslipMonth === parseInt(filterMonth);

      // Check year filter
      const yearMatches = !filterYear || payslipYear === parseInt(filterYear);

      return monthMatches && yearMatches;
    });
  };

  // Fetch payslips function (modify your existing fetch function)
  const fetchPayslips = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/payslip/history`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setPayslips(response.data.payslips);
        setFilteredPayslips(response.data.payslips); // Initially show all
      }
    } catch (error) {
      console.error("Error fetching payslips:", error);
    }
  };

  function toProperCase(str) {
    // Handle null, undefined, or non-string values
    if (!str || typeof str !== "string") {
      return "";
    }

    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  const [notes, setNotes] = useState([
    {
      title: "PhilHealth",
      content:
        "5% of basic salary, split equally between employer and employee.",
    },
    {
      title: "SSS",
      content:
        "15% of monthly salary credit, shared by employer (9.5%) and employee (4.5%).",
    },
    {
      title: "Pag-IBIG",
      content:
        "2% of salary for both employer and employee for salaries over P1,500.",
    },
  ]);

  useEffect(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));

    const filtered = notes.filter((note) => {
      if (!note.createdAt) return true;
      return new Date(note.createdAt) >= sevenDaysAgo;
    });

    setNotes(filtered);
  }, []);

  const handleAddNote = () => {
    if (!showTitleInput) {
      setShowTitleInput(true);
      return;
    }

    if (newTitle.trim() && newNote.trim()) {
      setNotes([
        ...notes,
        {
          title: newTitle,
          content: newNote,
          createdAt: new Date().toISOString(),
        },
      ]);
      setNewNote("");
      setNewTitle("");
      setShowTitleInput(false);
    }
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    setNewTitle(notes[index].title);
    setNewNote(notes[index].content);
    setShowTitleInput(true);
  };

  const saveEdit = () => {
    if (editingIndex >= 0 && newTitle.trim() && newNote.trim()) {
      const updatedNotes = [...notes];
      updatedNotes[editingIndex] = {
        ...updatedNotes[editingIndex],
        title: newTitle,
        content: newNote,
      };
      setNotes(updatedNotes);
      cancelEdit();
    }
  };

  const cancelEdit = () => {
    setEditingIndex(-1);
    setNewTitle("");
    setNewNote("");
    setShowTitleInput(false);
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

  const searchFilteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) {
      return employees; // Use the state variable instead of safeEmployees
    }

    return employees.filter(
      // Use the state variable instead of safeEmployees
      (employee) =>
        employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.positiontitle
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        employee.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employmentstatus
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]); // Update dependency

  return (
    <div className=" right-0 bottom-0  min-h-screen w-full bg-neutralSilver p-3 pt-16">
      <div>
        <div className="flex justify-between">
          <Breadcrumb
            items={[
              { label: "Dashboard" },
              { label: "Overview", href: "/admin-dashboard/overview" },
            ]}
          />
          <div className="flex flex-row gap-2">
            {/* Display filter status */}
            {(month || year) && (
              <div className="mb-3 px-2 h-8 text-neutralDGray/60 border flex justify-center items-center text-xs rounded-lg">
                <div className="flex items-center justify-between w-full">
                  <span>
                    Active filters:{" "}
                    {month &&
                      `Month: ${new Date(2000, month - 1).toLocaleString(
                        "default",
                        { month: "long" }
                      )}`}
                    {month && year && ", "}
                    {year && `Year: ${year}`}
                  </span>
                  <div className="w-px h-4 bg-neutralDGray mx-2"></div>
                  <button onClick={clearFilters} className="px-2 w-fit h-8">
                    Clear filters
                  </button>
                </div>
              </div>
            )}
            <div
              className="mb-3 px-2 w-fit h-8 border flex justify-center items-center text-xs text-center text-neutralDGray/60 rounded-lg hover:bg-gray-200 transition-all cursor-pointer"
              onClick={() => setShowFilterModal(true)}
            >
              <FaFilter className="mr-2" /> Filter Options
            </div>
          </div>

          {showFilterModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-3 rounded-lg shadow-2xl w-11/12 sm:w-96 md:w-[28rem] lg:w-[30rem] relative">
                <h3 className="text-base mb-2 text-neutralDGray">
                  Filter Options
                </h3>

                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-xs text-neutralDGray mb-1">
                      Month
                    </label>
                    <select
                      className="w-full p-2 border text-xs border-gray-300 rounded-md"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                    >
                      <option value="">Select month</option>
                      {[
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                      ].map((monthName, index) => (
                        <option key={index} value={index + 1}>
                          {monthName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-xs text-neutralDGray mb-1">
                      Year
                    </label>
                    <select
                      className="w-full p-2 border text-xs border-gray-300 rounded-md"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    >
                      <option value="">Select year</option>
                      {Array.from(
                        { length: 10 },
                        (_, i) => new Date().getFullYear() - i
                      ).map((yearOption) => (
                        <option key={yearOption} value={yearOption}>
                          {yearOption}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 text-xs mt-4">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 w-20 h-8 border flex justify-center items-center text-center text-neutralDGray rounded-lg hover:bg-gray-100 transition-all"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className="px-4 py-2 w-20 h-8 border flex justify-center items-center text-center text-neutralDGray rounded-lg hover:bg-red-400 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="px-4 py-2 w-20 h-8 border flex justify-center items-center text-center text-neutralDGray rounded-lg hover:bg-green-400 hover:text-white transition-all"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 mt-3">
          <SummaryCard
            icon={<FaMoneyBillTrendUp />}
            title="Total Payroll"
            number={`₱${safePayslips
              .reduce((acc, p) => acc + parseFloat(p.netPay || 0), 0)
              .toLocaleString()}`}
            color="bg-[#2A9D8F]"
          />
          <SummaryCard
            icon={<FaSackDollar />}
            title="Gross Salary"
            number={`₱${safePayslips
              .reduce((acc, p) => acc + parseFloat(p.gross_pay || 0), 0)
              .toLocaleString()}`}
            color="bg-[#654597]"
          />
          <SummaryCard
            icon={<FaCodiepie />}
            title="Total Employee Benefits"
            number={`₱${safePayslips
              .reduce((acc, p) => acc + parseFloat(p.allowance || 0), 0)
              .toLocaleString()}`}
            color="bg-[#84C318]"
          />
          <SummaryCard
            icon={<FaUsers />}
            title="Total Headcount"
            number={safeEmployees.length} // Changed from safePayslips.length
            color="bg-[#E76F51]"
          />
        </div>

        {/* Main Layout Grid */}
        <div className="min-h-screen bg-gray-50 w-full pt-2">
          <div className="grid grid-cols-4 grid-rows-7 gap-2 h-screen w-full mx-auto">
            {/* Div1: Chart - spans 2 columns, 3 rows */}
            <div className="col-span-2 row-span-3 bg-white rounded-lg shadow-md border border-neutralDGray">
              <PayrollLineChart
                payslips={safePayslips}
                className="w-full h-full"
              />
            </div>

            {/* Div2: Calendar - spans 1 column, 4 rows, starts at row 4 */}
            <div className="row-span-4 col-start-1 row-start-4 bg-white rounded-lg shadow-md border border-neutralDGray">
              <CalendarOverview
                onDateChange={setCutoffDate}
                className="w-full h-full"
              />
            </div>

            {/* Div3: Notes - spans 1 column, 4 rows, starts at row 4 */}
            <div className="row-span-4 col-start-2 row-start-4 relative bg-white border border-neutralDGray shadow-md rounded-lg p-3">
              <h6 className="text-neutralDGray text-sm mb-3">Notes:</h6>

              <div className="overflow-y-auto pr-2 pb-24 max-h-72 custom-scroll">
                <ul className="space-y-2 text-[12px] -ml-5 text-gray-700">
                  {notes.map((note, index) => (
                    <li
                      key={index}
                      onClick={() => startEditing(index)}
                      className="cursor-pointer hover:bg-gray-50 p-1 rounded"
                    >
                      <strong className="text-neutralDGray">
                        {note.title}
                      </strong>{" "}
                      - {note.content}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="absolute bottom-3 left-3 right-3 bg-white">
                {showTitleInput && (
                  <div className="mb-1">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Note title"
                      className="w-full h-8 border border-gray-300 px-2 rounded mb-1 text-xs"
                    />
                  </div>
                )}
                <div className="flex flex-row space-y-2 sm:space-y-0 gap-1 mb-1">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder={
                      editingIndex >= 0 ? "Edit note..." : "Add a new note..."
                    }
                    className="flex-1 border w-16 border-gray-300 px-2 h-8 rounded text-xs"
                  />
                  {editingIndex >= 0 ? (
                    <>
                      <button
                        onClick={saveEdit}
                        title="Update"
                        className="bg-brandPrimary flex justify-center items-center h-8 w-8 p-2 text-white rounded hover:bg-neutralDGray text-[12px]"
                      >
                        <FaArrowRotateRight />
                      </button>
                      <button
                        onClick={cancelEdit}
                        title="Cancel"
                        className="bg-gray-300 flex justify-center items-center h-8 p-2 w-8 text-gray-700 rounded hover:bg-gray-400 text-[12px]"
                      >
                        <FaXmark />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleAddNote}
                      className="bg-brandPrimary h-8 w-8 p-1.5 text-white rounded hover:bg-neutralDGray text-[12px] flex items-center justify-center"
                    >
                      {showTitleInput ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
                <p className="italic text-[10px] text-neutralGray -mb-1 text-center">
                  *Newly added notes will automatically disappear after 7 days.*
                </p>
              </div>
            </div>

            {/* Div4: Employee Status - spans 1 column, 7 rows, starts at column 3 */}
            <div className="row-span-7 col-start-3 row-start-1 bg-white relative border border-neutralDGray rounded-lg shadow-md p-3 flex flex-col">
              <div className="flex-none">
                <div className="flex justify-left items-center gap-6 mb-2">
                  <h6 className="text-neutralDGray text-sm">Employee Status</h6>
                </div>
                <hr className="-mt-1 mb-2" />
              </div>

              <div className="flex-1 overflow-auto">
                {searchFilteredEmployees.length > 0 ? (
                  searchFilteredEmployees.map((employee, index) => (
                    <div key={index} className="border-b">
                      <p className="text-sm mt-0.5 text-neutralDGray">
                        {toProperCase(employee.name)}
                      </p>
                      <p className="text-xs -mt-5 italic text-gray-500">
                        {toProperCase(employee.positiontitle)}
                      </p>
                      <p
                        className={`text-xs font-medium -mt-3 mb-2 px-2 rounded-full w-fit
                    ${
                      employee.employmentstatus === "RESIGNED"
                        ? "bg-yellow-100 text-yellow-700"
                        : (employee.status || "").toLowerCase() === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                      >
                        {employee.employmentstatus === "RESIGNED"
                          ? `${employee.employmentstatus.charAt(
                              0
                            )}${employee.employmentstatus
                              .slice(1)
                              .toLowerCase()}`
                          : employee.status || "Unknown"}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No employees found</p>
                    <p className="text-xs">Try adjusting your search term</p>
                  </div>
                )}
              </div>

              <div className="flex-none mt-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search Employee"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 w-full py-1 pr-8 h-8 flex items-center text-xs border rounded"
                  />
                  <FaSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-neutralDGray" />
                </div>
              </div>
            </div>

            {/* Div5: Cutoff Status - spans 1 column, 2 rows, starts at column 4 */}
            <div className="row-span-2 col-start-4 row-start-1 bg-white rounded-lg shadow-md p-2 border border-neutralDGray">
              <h6 className="text-sm text-neutralDGray mb-3">
                Payroll Cutoff Status
              </h6>
              <ul className="text-xs">
                {processedCutoffs.map((cutoff, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between mr-8 items-center"
                  >
                    <div>
                      <p className="font-medium text-gray-700">
                        {format(cutoff.start, "MMMM d")}–
                        {format(cutoff.end, "d, yyyy")}
                      </p>
                      <p className="text-xs -mt-3 text-gray-500">
                        Releases: {format(cutoff.release, "MMMM d, yyyy")}
                      </p>
                    </div>
                    <span
                      className={`${cutoff.badge} text-xs px-3 py-1 rounded-full`}
                    >
                      {cutoff.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Div6: Top Earners - spans 1 column, 2 rows, starts at column 4, row 3 */}
            <div className="row-span-2 col-start-4 row-start-3 bg-white rounded-lg shadow-md p-2 border border-neutralDGray">
              <h6 className="text-sm text-neutralDGray mb-2">Top 3 Earners</h6>
              <div className="grid grid-cols-1 gap-2">
                {safePayslips
                  .sort(
                    (a, b) =>
                      parseFloat(b.netPay || 0) - parseFloat(a.netPay || 0)
                  )
                  .slice(0, 3)
                  .map((payslip, i) => (
                    <div
                      key={i}
                      className="flex h-16 items-center border justify-between bg-gradient-to-r from-[#9D426E] via-[#80B646] to-[#4191D6] rounded-lg p-2"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={`${import.meta.env.VITE_API_URL}/uploads/${
                            payslip.profileImage
                          }`}
                          alt="Profile"
                          className="w-8 h-8 rounded-full border-2 border-white object-cover bg-gray-200"
                          onError={(e) => (e.target.src = defaultProfile)}
                        />
                        <div>
                          <p className="font-semibold mt-3 text-white flex items-center text-sm">
                            {payslip.name || "N/A"}
                          </p>
                          <p className="font-medium -mt-3 text-white text-xs">
                            ₱{parseFloat(payslip.netPay || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-2xl text-white drop-shadow-[0_0_8px_white]">
                        {["🏅", "🥈", "🥉"][i]}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Div7: Holiday - spans 1 column, 2 rows, starts at column 4, row 5 */}
            <div className="row-span-2 col-start-4 row-start-5 bg-white rounded-lg shadow-md p-2 border border-neutralDGray">
              <h6 className="text-sm text-neutralDGray mb-3">
                Holiday Summary
              </h6>
              <ul className="space-y-2 text-xs">
                {holidaySummary.map((holiday, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-700">
                        {holiday.date}
                      </p>
                      <p className="text-xs -mt-3 text-gray-500">
                        {holiday.name}
                      </p>
                    </div>
                    <span
                      className={`
                    text-xs px-2 py-1 mr-8 rounded-full
                    ${
                      holiday.type === "Regular"
                        ? "bg-red-100 text-red-600"
                        : ""
                    }
                    ${
                      holiday.type === "Special Non-Working"
                        ? "bg-orange-100 text-orange-600"
                        : ""
                    }
                    ${
                      holiday.type === "Special"
                        ? "bg-green-100 text-green-600"
                        : ""
                    }
                  `}
                    >
                      {holiday.type}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Overview;
