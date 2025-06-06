import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { notifyPayrollRequests } from '../../../utils/toastHelpers';
import { notifyChangeRequests } from '../../../utils/toastHelper2';
import { toast } from 'react-toastify';
import { isWithinInterval, isSameDay, isAfter } from 'date-fns';
import {
  FaUsers,
  FaCashRegister,
  FaHandHoldingUsd,
  FaChartPie,
  FaFilter,
  FaPlus
} from "react-icons/fa";
import { FaArrowRotateRight, FaXmark } from "react-icons/fa6"
import axios from "axios";
import { Link } from "react-router-dom";
import SummaryCard from "./SummaryCard";
import Breadcrumb from "./Breadcrumb";
import CustomCalendar from "./CustomCalendar";
import { FaSearch, FaSyncAlt } from "react-icons/fa";
import PayrollLineChart from "./PayrollLineChart";
import { LineChart } from "recharts";
import CalendarOverview from "./CalendarOverview";
import { format } from "date-fns";

const Overview = () => {
  const [payslips, setPayslips] = useState([]);
  const [filteredPayslips, setFilteredPayslips] = useState([]);
  const [cutoffDate, setCutoffDate] = useState("");
  const [employees, setEmployees] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [holidaySummary, setHolidaySummary] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [changesRequests, setChangesRequests] = useState([]);
  const [loadingChanges, setLoadingChanges] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Helper function to determine payroll status
  const getPayrollStatus = (cutoff, currentDate) => {
    const { start, end, release } = cutoff;

    if (isSameDay(currentDate, release)) {
      return {
        status: 'Released',
        badge: 'bg-green-100 text-green-800'
      };
    }

    if (isWithinInterval(currentDate, { start, end })) {
      return {
        status: 'Ongoing',
        badge: 'bg-yellow-100 text-yellow-800'
      };
    }

    if (isAfter(currentDate, release)) {
      return {
        status: 'Released',
        badge: 'bg-green-100 text-green-800'
      };
    }

    return {
      status: 'Pending',
      badge: 'bg-gray-100 text-gray-800'
    };
  };

  // Utility to generate payroll cutoffs
  const getPayrollCutoffs = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const firstCutoff = {
      start: new Date(year, month, 1),
      end: new Date(year, month, 15),
      release: new Date(year, month, 20),
    };

    const secondCutoff = {
      start: new Date(year, month, 16),
      end: new Date(year, month + 1, 0),
      release: new Date(year, month + 1, 5),
    };

    return [firstCutoff, secondCutoff];
  };

  // Filter function to apply month/year filters
  const applyFilters = (payslipsData, filterMonth, filterYear) => {
    if (!filterMonth && !filterYear) {
      return payslipsData;
    }

    return payslipsData.filter(payslip => {
      // Assuming payslip has a date field (adjust field name as needed)
      const payslipDate = new Date(payslip.cutoff_date || payslip.date || payslip.created_at);

      const matchesMonth = !filterMonth || (payslipDate.getMonth() + 1) === parseInt(filterMonth);
      const matchesYear = !filterYear || payslipDate.getFullYear() === parseInt(filterYear);

      return matchesMonth && matchesYear;
    });
  };

  const handleConfirm = () => {
    const filtered = applyFilters(payslips, month, year);
    setFilteredPayslips(filtered);
    setShowFilterModal(false);

    // Show toast notification about applied filters
    const filterText = [];
    if (month) filterText.push(`Month: ${new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}`);
    if (year) filterText.push(`Year: ${year}`);

    if (filterText.length > 0) {
      toast.success(`Filters applied: ${filterText.join(', ')}`, {
        position: "top-right",
        autoClose: 3000,
        closeButton: false,
        closeOnClick: true,
      });
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

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/payslip`);
      console.log(response.data);
      setRequests(response.data);
      notifyPayrollRequests(response.data);
    } catch (error) {
      console.error("Error fetching payroll requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChangeRequests = async () => {
    try {
      setLoadingChanges(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/employee/payroll-change-requests`
      );
      console.log("Change requests response:", response.data);

      if (response.data.success) {
        const filteredRequests = (response.data.data || []).filter(
          (req) => !["approved", "rejected"].includes(req.status.toLowerCase())
        );
        setChangesRequests(filteredRequests);
        notifyChangeRequests(filteredRequests);
      } else {
        console.error("Failed to fetch change requests:", response.data);
        setChangesRequests([]);
      }
    } catch (error) {
      console.error("Error fetching change requests:", error);
      setChangesRequests([]);
    } finally {
      setLoadingChanges(false);
    }
  };

  // All useEffect hooks at the component level
  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/payslip`);
        const payslipsData = Array.isArray(response.data) ? response.data : [];
        setPayslips(payslipsData);
        setFilteredPayslips(payslipsData); // Initialize filtered payslips
      } catch (error) {
        console.error("Error fetching payslips:", error);
        setPayslips([]);
        setFilteredPayslips([]);
      }
    };

    fetchChangeRequests();
    fetchRequests();
    fetchPayslips();
  }, []);

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
    if (isAuthorized && Array.isArray(changesRequests)) {
      notifyChangeRequests(changesRequests);
    }
  }, [isAuthorized, changesRequests]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/employee/status`
        );
        console.log(response.data);
        setEmployees(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.log("Error fetching active employees", error);
        setEmployees([]);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/holidays`);
        console.log(response.data);
        setHolidaySummary(Array.isArray(response.data.holidays) ? response.data.holidays : []);
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
  const processedCutoffs = payrollCutoffs.map(cutoff => {
    const statusInfo = getPayrollStatus(cutoff, currentDate);
    return {
      ...cutoff,
      status: statusInfo.status,
      badge: statusInfo.badge
    };
  });

  // Use filtered payslips for all calculations
  const displayPayslips = filteredPayslips.length > 0 ? filteredPayslips : payslips;
  const safePayslips = Array.isArray(displayPayslips) ? displayPayslips : [];

  const handleCreatePayroll = async () => {
    if (!cutoffDate) {
      toast.info(
        <div style={{ fontSize: '0.9rem' }}>
          Please select a cutoff date.
        </div>,
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
          `❌ Failed to generate payroll: ${response.data.message || "Unknown error"}`
        );
      }
    } catch (error) {
      setMessage(
        `❌ ${error.response?.data?.message || "An error occurred while generating payroll."}`
      );
    }
  };

  const handleReleaseRequest = async () => {
    if (!safePayslips.length) {
      alert("No payslips available!");
      return;
    }

    setSending(true);
    setMessage("");
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payslip/request-release`,
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

  function toProperCase(str) {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  const [notes, setNotes] = useState([
    {
      title: "PhilHealth",
      content: "5% of basic salary, split equally between employer and employee.",
    },
    {
      title: "SSS",
      content: "15% of monthly salary credit, shared by employer (9.5%) and employee (4.5%).",
    },
    {
      title: "Pag-IBIG",
      content: "2% of salary for both employer and employee for salaries over P1,500.",
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
            className={`w-3 h-3 rounded-full ${row.status.toLowerCase() === "active"
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
    <div className="fixed top-0 right-0 bottom-0 w-[calc(100%-16rem)] bg-neutralSilver p-6 pt-16">
      <div className="flex flex-col h-[calc(100vh-80px)] overflow-auto">
        <div className="flex justify-between">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "" },
              { label: "Overview", href: "" },
            ]}
          />
          <div className="flex flex-row gap-2">
            {/* Display filter status */}
            {(month || year) && (
              <div className="mb-3 px-2 h-8 text-neutralDGray/60 border flex justify-center items-center text-xs rounded-lg">
                <div className="flex items-center justify-between w-full">
                  <span>
                    Active filters: {month && `Month: ${new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}`}
                    {month && year && ', '}
                    {year && `Year: ${year}`}
                  </span>
                  <div className="w-px h-4 bg-neutralDGray mx-2"></div>
                  <button
                    onClick={clearFilters}
                    className="px-2 w-fit h-8"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            )}
            <div
              className="mb-3 px-2 w-fit h-8 border flex justify-center items-center text-xs text-center text-neutralDGray/60 rounded-lg hover:bg-gray-200 transition-all cursor-pointer"
              onClick={() => setShowFilterModal(true)}>
              <FaFilter className="mr-2" /> Filter Options
            </div>
          </div>


          {showFilterModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-2xl w-11/12 sm:w-96 md:w-[28rem] lg:w-[30rem] relative">
                <h3 className="text-base mb-2 text-neutralDGray">Filter Options</h3>

                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-sm text-neutralDGray mb-1">Month</label>
                    <select
                      className="w-full border px-3 py-2 rounded-md text-sm text-neutralDGray"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                    >
                      <option value="">Select month</option>
                      {[
                        "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                      ].map((monthName, index) => (
                        <option key={index} value={index + 1}>{monthName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm text-neutralDGray mb-1">Year</label>
                    <select
                      className="w-full border px-3 py-2 rounded-md text-sm text-neutralDGray"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    >
                      <option value="">Select year</option>
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((yearOption) => (
                        <option key={yearOption} value={yearOption}>{yearOption}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-3">
          <SummaryCard
            icon={<FaCashRegister />}
            title="Total Payroll"
            number={`₱${safePayslips
              .reduce((acc, p) => acc + parseFloat(p.netPay || 0), 0)
              .toLocaleString()}`}
            color="bg-blue-400"
          />
          <SummaryCard
            icon={<FaHandHoldingUsd />}
            title="Gross Salary"
            number={`₱${safePayslips
              .reduce((acc, p) => acc + parseFloat(p.gross_pay || 0), 0)
              .toLocaleString()}`}
            color="bg-green-400"
          />
          <SummaryCard
            icon={<FaChartPie />}
            title="Total Employee Benefits"
            number={`₱${safePayslips
              .reduce((acc, p) => acc + parseFloat(p.allowance || 0), 0)
              .toLocaleString()}`}
            color="bg-pink-400"
          />
          <SummaryCard
            icon={<FaUsers />}
            title="Total Headcount"
            number={safePayslips.length}
            color="bg-yellow-400"
          />
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 laptop:grid-cols-12 gap-3 mt-3 flex-1 ">
          {/* Left - Chart + Notes */}
          <div className="laptop:col-span-5 flex flex-col gap-3">
            <PayrollLineChart
              payslips={safePayslips}
              className="border border-neutralDGray"
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <CalendarOverview
                onDateChange={setCutoffDate}
                className="w-1/2 h-60"
              />

              <div className="relative bg-white border w-1/2 border-neutralDGray shadow-sm rounded p-2 lg:p-3 min-h-[260px]">
                <h6 className="text-neutralDGray text-sm mb-1">Notes:</h6>

                <div className="overflow-y-auto pr-2 pb-24 max-h-72">
                  <ul className="space-y-2 text-[12px] -ml-5 text-gray-700">
                    {notes.map((note, index) => (
                      <li
                        key={index}
                        onClick={() => startEditing(index)}
                        className="cursor-pointer hover:bg-gray-50 p-1 rounded"
                      >
                        <strong className="text-neutralDGray">{note.title}</strong> - {note.content}
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
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-1">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder={editingIndex >= 0 ? "Edit note..." : "Add a new note..."}
                      className="flex-1 border border-gray-300 px-2 h-8 rounded text-xs"
                    />
                    {editingIndex >= 0 ? (
                      <>
                        <button
                          onClick={saveEdit}
                          title="Update"
                          className="bg-brandPrimary h-8 w-fit p-2 text-white rounded hover:bg-neutralDGray text-[12px]"
                        >
                          <FaArrowRotateRight />
                        </button>
                        <button
                          onClick={cancelEdit}
                          title="Cancel"
                          className="bg-gray-300 h-8 p-2 w-fit text-gray-700 rounded hover:bg-gray-400 text-[12px]"
                        >
                          <FaXmark />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleAddNote}
                        className="bg-brandPrimary h-8 px-3 text-white rounded hover:bg-neutralDGray text-[12px] flex items-center justify-center"
                      >
                        {showTitleInput ? "Save" : "Add"}
                      </button>
                    )}
                  </div>
                  <p className="italic text-[10px] text-neutralGray -mb-1 text-center">
                    *Newly added notes will automatically disappear after 7 days.*
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Employee Status */}
          <div className="laptop:col-span-3 overflow-hidden">
            <div className="bg-white relative border border-neutralDGray rounded shadow-sm p-2 lg:p-3 h-full flex flex-col">
              <div className="flex-none">
                <div className="flex justify-left items-center gap-6 mb-2">
                  <h6 className="text-neutralDGray text-sm">
                    Employee Status
                  </h6>
                </div>
                <hr className="-mt-1 mb-2" />
              </div>
              <div className="flex-1 overflow-auto">
                {employees.map((employee, index) => (
                  <div key={index} className="border-b">
                    <p className="text-sm mt-0.5 text-neutralDGray">
                      {toProperCase(employee.name)}
                    </p>
                    <p className="text-xs -mt-5 italic text-gray-500">
                      {toProperCase(employee.positiontitle)}
                    </p>
                    <p
                      className={`text-xs font-medium -mt-3 mb-2 px-2 rounded-full w-fit
                        ${employee.employmentstatus === "RESIGNED"
                          ? "bg-yellow-100 text-yellow-700"
                          : employee.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                    >
                      {employee.employmentstatus === "RESIGNED"
                        ? `${employee.employmentstatus.charAt(0)}${employee.employmentstatus.slice(1).toLowerCase()}`
                        : employee.status}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex-none mt-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search Employee"
                    className="px-3 w-full py-1 pr-8 text-xs border rounded"
                  />
                  <FaSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-neutralDGray" />
                </div>
              </div>
            </div>
          </div>

          {/* Right - Payroll Status, Top Earners, Holidays */}
          <div className="laptop:col-span-4 flex flex-col gap-3 overflow-auto">
            <div className="bg-white rounded shadow-sm p-2 lg:p-3 border border-neutralDGray">
              <h6 className="text-sm text-neutralDGray mb-3">
                Payroll Cutoff Status
              </h6>
              <ul className="text-xs">
                {processedCutoffs.map((cutoff, idx) => (
                  <li key={idx} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-700">
                        {format(cutoff.start, "MMMM d")}–{format(cutoff.end, "d, yyyy")}
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

            <div className="bg-white rounded shadow-sm p-2 lg:p-3 border border-neutralDGray">
              <h6 className="text-sm text-neutralDGray mb-2">Top 3 Earners</h6>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {safePayslips
                  .sort((a, b) => parseFloat(b.netPay || 0) - parseFloat(a.netPay || 0))
                  .slice(0, 3)
                  .map((payslip, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center border justify-center bg-gradient-to-b from-[#9D426E] via-[#80B646] to-[#4191D6] rounded-lg p-[0.7rem]"
                    >
                      <div className="w-16 h-14 lg:w-16 lg:h-16 rounded-full mb-2 border-4 border-white bg-gray-200"></div>
                      <p className="font-semibold text-white text-sm text-center">
                        {payslip.name || 'N/A'}
                      </p>
                      <p className="font-medium text-white text-xs">
                        ₱{parseFloat(payslip.netPay || 0).toLocaleString()}
                      </p>
                      <span className="text-xl text-white mt-1">
                        {["🏅", "🥈", "🥉"][i]}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-white rounded shadow-sm p-2 lg:p-3 border border-neutralDGray">
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
                        text-xs px-3 py-1 rounded-full
                        ${holiday.type === "Regular" ? "bg-red-100 text-red-600" : ""}
                        ${holiday.type === "Special Non-Working" ? "bg-orange-100 text-orange-600" : ""}
                        ${holiday.type === "Special" ? "bg-green-100 text-green-600" : ""}
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
    </div >
  );
};
export default Overview;