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
import CalendarOverview from "./CalendarOverview";
import { format } from "date-fns";


const Overview = () => {
  const [payslips, setPayslips] = useState([]);
  const [cutoffDate, setCutoffDate] = useState("");
  const [employees, setEmployees] = useState([]); // will fetch the active employees
  const [newNote, setNewNote] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [holidaySummary, setHolidaySummary] = useState([]);

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/payslip`);
        // Ensure we always set an array
        setPayslips(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching payslips:", error);
        setPayslips([]); // Set empty array on error
      }
    };

    fetchPayslips();
  }, []);

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
        setEmployees([]); // Set empty array on error
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
        setHolidaySummary([]); // Set empty array on error
      }
    };
    fetchHolidays();
  }, []);


  // Utility to generate payroll cutoffs
  const getPayrollCutoffs = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed

    const firstCutoff = {
      start: new Date(year, month, 1),
      end: new Date(year, month, 15),
      release: new Date(year, month, 20),
      status: "1st cutoff",
      badge: "bg-yellow-100 text-yellow-600",
    };

    const secondCutoff = {
      start: new Date(year, month, 16),
      end: new Date(year, month + 1, 0), // Last day of the current month
      release: new Date(year, month + 1, 5),
      status: "2nd cutoff",
      badge: "bg-blue-100 text-blue-600",
    };

    return [firstCutoff, secondCutoff];
  };

  const payrollCutoffs = getPayrollCutoffs();



  // Defensive assignment - ensure payslips is always an array
  const safePayslips = Array.isArray(payslips) ? payslips : [];

  const totalGrossSalary = safePayslips.reduce(
    (acc, p) => acc + (p.gross_pay || 0),
    0
  );
  const totalBenefits = safePayslips.reduce(
    (acc, p) => acc + (p.allowance || 0),
    0
  );
  const totalPayroll = safePayslips.reduce(
    (acc, p) => acc + (p.netPay || 0),
    0
  );


  const handleCreatePayroll = async () => {
    if (!cutoffDate) {
      alert("Please select a cutoff date!");
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
        error.response ?.data ?.message ||
          "An error occurred while generating payroll."
        }`
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

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const validNotes = notes.filter((note) => {
    if (!note.createdAt) return true;
    return new Date(note.createdAt) >= sevenDaysAgo;
  });

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
    <div className="fixed top-0 right-0 bottom-0 w-[calc(100%-16rem)] bg-neutralSilver p-6 pt-16">
      <div className="flex flex-col h-[calc(100vh-80px)] overflow-auto">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "" },
            { label: "Overview", href: "" },
          ]}
        />

        {/* Summary Cards - Using safePayslips consistently */}
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
                className="w-full sm:w-1/2 h-60"
              />

              <div className="relative bg-white border w-full sm:w-1/2 border-neutralDGray shadow-sm rounded p-2 lg:p-3 h-full">
                <h6 className="text-neutralDGray text-sm mb-1">Notes:</h6>

                {/* Scrollable Notes List */}
                <div className="overflow-y-auto h-64 pr-2">
                  <ul className="space-y-2 text-[12px] text-gray-700">
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

                {/* Input and Buttons - Fixed at bottom */}
                <div className="absolute bottom-0 left-3 right-3">
                  {showTitleInput && (
                    <div className="mb-1">
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Note title"
                        className="w-full h-8 border border-gray-300 px-2 rounded mb-1 text-[12px]"
                      />
                    </div>
                  )}
                  <div className="flex flex-col h-10 sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder={
                        editingIndex >= 0 ? "Edit note..." : "Add a new note..."
                      }
                      className="flex-1 border border-gray-300 w-[50%] px-2 h-8 rounded text-[12px]"
                    />
                    {editingIndex >= 0 ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="bg-brandPrimary h-8 w-[20%] text-white text-center py-2 rounded hover:bg-neutralDGray text-[12px]"
                        >
                          Update
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-300 h-8 w-[20%] text-gray-700 text-center py-2 rounded hover:bg-gray-400 text-[12px]"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                        <button
                          onClick={handleAddNote}
                          className="bg-brandPrimary h-8 w-[20%] py-2 rounded hover:bg-neutralDGray text-white text-[12px] flex items-center justify-center"
                        >
                          {showTitleInput ? "Save" : "Add"}
                        </button>

                      )}
                  </div>
                  <p className="italic text-[10px] text-neutralGray text-center">
                    *Newly added notes will automatically disappear after 7
                    days.*
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
                    <p className="text-md text-neutralDGray">
                      {toProperCase(employee.name)}
                    </p>
                    <p className="text-xs -mt-5 text-gray-500">
                      {toProperCase(employee.positiontitle)}
                    </p>
                    <p
                      className={`text-xs font-medium -mt-3 mb-2 px-2 rounded-full w-fit ${
                        employee.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : employee.status === "On Leave"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                    >
                      {employee.status}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex-none mt-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search Employee"
                    className="px-3 w-full py-1 pr-8 text-sm border rounded"
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
              <ul className="text-sm">
                {payrollCutoffs.map((cutoff, idx) => (
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
              <h6 className="text-sm text-neutralDGray mb-2">
                Top 3 Earners
              </h6>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[1, 2, 3].map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center border justify-center bg-gradient-to-b from-[#9D426E] via-[#80B646] to-[#4191D6] rounded-lg p-[0.7rem]"
                  >
                    <div className="w-16 h-14 lg:w-16 lg:h-16 rounded-full mb-2 border-4 border-white bg-gray-200"></div>
                    <p className="font-semibold text-white text-sm text-center">
                      Employee {i + 1}
                    </p>
                    <p className="font-medium text-white text-xs">
                      ₱{1_000_000 - i * 100_000}
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
              <ul className="space-y-2 text-sm">
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
                    <span className="bg-green-100 text-green-600 text-xs px-3 py-1 rounded-full">
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