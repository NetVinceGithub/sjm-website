import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import Breadcrumb from "../dashboard/Breadcrumb";
import DataTable from "react-data-table-component";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const navigate = useNavigate();

  const requiredColumns = [
    "ecode",
    "ea_txndte",
    "schedin",
    "schedout",
    "timein",
    "timeout2",
  ];

  console.log("attendance for summary", summaryData);
  // Fetch holidays from API when component mounts
  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/holidays`);
      if (!response.ok) throw new Error("Failed to fetch holidays");
      const data = await response.json();

      // Extract holidays from the API response
      if (data && data.success && Array.isArray(data.holidays)) {
        setHolidays(data.holidays);
        console.log("Fetched holidays:", data.holidays);
      } else {
        console.warn("Unexpected holiday data format:", data);
        setHolidays([]);
      }
    } catch (error) {
      console.error("Error fetching holidays:", error);
      setHolidays([]);
    }
  };

  // Function to standardize date formats for comparison
  const standardizeDate = (dateStr) => {
    try {
      // Handle "16-Sep-24" format from Excel
      if (dateStr.includes("-") && dateStr.length <= 9) {
        const parts = dateStr.split("-");
        if (parts.length === 3) {
          const day = parts[0];
          const month = parts[1];
          let year = parts[2];

          // Convert month abbreviation to month number
          const monthMap = {
            Jan: "01",
            Feb: "02",
            Mar: "03",
            Apr: "04",
            May: "05",
            Jun: "06",
            Jul: "07",
            Aug: "08",
            Sep: "09",
            Oct: "10",
            Nov: "11",
            Dec: "12",
          };

          // Add 20 prefix if it's a 2-digit year
          if (year.length === 2) {
            year = "20" + year;
          }

          // Create standardized YYYY-MM-DD format
          return `${year}-${monthMap[month]}-${day.padStart(2, "0")}`;
        }
      }

      // For YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
      }

      // For any other format, try to convert to YYYY-MM-DD
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
      }

      return dateStr; // Return original if can't parse
    } catch (error) {
      console.error("Error standardizing date:", error, dateStr);
      return dateStr;
    }
  };

  // Function to check if a date is a holiday
  const isHoliday = (dateStr) => {
    if (!Array.isArray(holidays) || holidays.length === 0) {
      return false;
    }

    try {
      // Standardize the input date format
      const standardizedDate = standardizeDate(dateStr);
      console.log(`Checking ${dateStr} (standardized: ${standardizedDate})`); // Debug log

      // Check if the date exists in any holiday entry
      return holidays.some((holiday) => {
        if (!holiday || !holiday.date) return false;

        // Extract and standardize the holiday date
        const holidayDateStandardized = standardizeDate(holiday.date);
        console.log(
          `Comparing with holiday ${holiday.name} on ${holiday.date} (standardized: ${holidayDateStandardized})`
        );

        return holidayDateStandardized === standardizedDate;
      });
    } catch (error) {
      console.error("Error checking holiday:", error);
      return false;
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file.name);
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (jsonData.length <= 1) {
        alert("The file is empty or improperly formatted.");
        return;
      }

      const headers = jsonData[0];
      const missingColumns = requiredColumns.filter(
        (col) => !headers.includes(col)
      );
      if (missingColumns.length > 0) {
        alert(`Missing columns: ${missingColumns.join(", ")}`);
        return;
      }

      const columnIndexes = requiredColumns.map((col) => headers.indexOf(col));

      let daysPresentCount = 0;
      let regularDaysCount = 0;
      let holidayDaysCount = 0;
      let totalHolidayHours = 0;
      let totalRegularHours = 0;

      const processedData = jsonData.slice(1).map((row) => {
        const rowData = columnIndexes.map((index) => row[index] || "");
        const [ecode, ea_txndte, schedin, schedout, timein, timeout2] = rowData;

        // Convert Excel serial date to readable date format
        const formattedEaTxndte = XLSX.utils.format_cell({
          t: "d",
          v: ea_txndte,
        });
        const formattedSchedin = XLSX.utils.format_cell({ t: "d", v: schedin });
        const formattedSchedout = XLSX.utils.format_cell({
          t: "d",
          v: schedout,
        });

        // Check if the date is a holiday
        const isHolidayDay = isHoliday(formattedEaTxndte);
        console.log(`Date ${formattedEaTxndte} is holiday: ${isHolidayDay}`); // Debug log

        // Calculate total hours worked
        const totalHours = parseFloat(computeTotalHours(timein, timeout2)) || 0;

        // Count attendance
        const isPresent = timein && timeout2; // Mark as present if there's a time-in and time-out
        if (isPresent) {
          daysPresentCount++;
          if (isHolidayDay) {
            holidayDaysCount++;
            totalHolidayHours += totalHours;
          } else {
            regularDaysCount++;
            totalRegularHours += totalHours;
          }
        }

        return {
          ecode,
          ea_txndte: formattedEaTxndte, // Store formatted date
          schedin: formattedSchedin, // Store formatted schedin time
          schedout: formattedSchedout, // Store formatted schedout time
          timein,
          timeout2,
          isHoliday: isHolidayDay,
          tardiness: isHolidayDay ? 0 : computeTardiness(schedin, timein),
          total_hours: totalHours,
          overtime: computeOvertime(schedout, timeout2),
          daysPresent: isPresent ? 1 : 0,
          regularDays: isHolidayDay ? 0 : isPresent ? 1 : 0,
          holidayDays: isHolidayDay ? (isPresent ? 1 : 0) : 0,
          holidayHours: isHolidayDay ? totalHours : 0,
          regularHours: isHolidayDay ? 0 : totalHours,
        };
      });

      setAttendanceData(processedData);
      generateSummary(processedData, {
        daysPresentCount,
        regularDaysCount,
        holidayDaysCount,
        totalHolidayHours,
        totalRegularHours,
      });
    };
  };

  const computeTardiness = (schedin, timein) => {
    if (!schedin || !timein) return 0;
    return Math.max(0, convertToMinutes(timein) - convertToMinutes(schedin));
  };

  const computeTotalHours = (timein, timeout2) => {
    if (!timein || !timeout2) return 0;
    const startTime = convertToMinutes(timein);
    const endTime = convertToMinutes(timeout2);
    return (
      (endTime >= startTime
        ? endTime - startTime
        : 1440 - startTime + endTime) / 60
    ).toFixed(2);
  };

  const computeOvertime = (schedout, timeout2) => {
    if (!schedout || !timeout2) return 0;
    const schedOutMinutes = convertToMinutes(schedout);
    const actualOutMinutes = convertToMinutes(timeout2);
    return actualOutMinutes > schedOutMinutes
      ? ((actualOutMinutes - schedOutMinutes) / 60).toFixed(2)
      : 0;
  };

  const convertToMinutes = (timeStr) => {
    if (!timeStr) return 0;

    let hours, minutes;

    if (timeStr.includes("AM") || timeStr.includes("PM")) {
      let [time, modifier] = timeStr.split(" ");
      [hours, minutes] = time.split(":").map(Number);

      if (modifier === "PM" && hours !== 12) {
        hours += 12;
      } else if (modifier === "AM" && hours === 12) {
        hours = 0;
      }
    } else {
      [hours, minutes] = timeStr.includes(":")
        ? timeStr.split(":").map(Number)
        : [Math.floor(timeStr / 100), timeStr % 100];
    }

    return hours * 60 + minutes;
  };

  const generateSummary = (data, counts) => {
    const summary = data.reduce((acc, row) => {
      const {
        ecode,
        ea_txndte,
        tardiness,
        total_hours,
        overtime,
        isHoliday,
        holidayHours,
        regularHours,
      } = row;

      if (!acc[ecode]) {
        acc[ecode] = {
          ecode,
          totalTardiness: 0,
          totalHours: 0,
          totalOvertime: 0,
          holidayCount: 0,
          regularDays: 0,
          totalHolidayHours: 0,
          totalRegularHours: 0,
          daysPresent: new Set(), // Use a Set to track unique dates
        };
      }

      acc[ecode].totalTardiness += tardiness;
      acc[ecode].totalHours += parseFloat(total_hours) || 0;
      acc[ecode].totalOvertime += parseFloat(overtime) || 0;

      if (isHoliday) {
        acc[ecode].holidayCount += 1;
        acc[ecode].totalHolidayHours += parseFloat(holidayHours) || 0;
      } else {
        acc[ecode].regularDays += 1;
        acc[ecode].totalRegularHours += parseFloat(regularHours) || 0;
      }

      acc[ecode].daysPresent.add(ea_txndte); // Add unique date

      return acc;
    }, {});

    // Convert values to 2 decimal places
    const formattedSummary = Object.values(summary).map((item) => ({
      ecode: item.ecode,
      totalTardiness: item.totalTardiness.toFixed(2),
      totalHours: item.totalHours.toFixed(2),
      totalOvertime: item.totalOvertime.toFixed(2),
      holidayCount: item.holidayCount,
      regularDays: item.regularDays,
      totalHolidayHours: item.totalHolidayHours.toFixed(2),
      totalRegularHours: item.totalRegularHours.toFixed(2),
      daysPresent: item.daysPresent.size, // Count unique dates
    }));

    setSummaryData(formattedSummary);
  };

  const handleSubmit = async () => {
    if (attendanceData.length === 0 || summaryData.length === 0) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/attendance/add-attendance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attendanceData }),
        }
      );

      if (!response.ok) throw new Error("Failed to save attendance");

      const summaryResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/attendance/add-attendance-summary`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ summaryData }),
        }
      );

      if (!summaryResponse.ok) throw new Error("Failed to save summary");
      setShowModal(true);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const attendanceColumns = [
    {
      name: "E-Code",
      selector: (row) => row.ecode,
      sortable: true,
      width: "100px",
      center: true,
    },
    {
      name: "Date",
      selector: (row) => row.ea_txndte,
      sortable: true,
      center: true,
    },
    {
      name: "Holiday",
      selector: (row) => (row.isHoliday ? "Yes" : "No"),
      sortable: true,
      width: "100px",
      center: true,
      conditionalCellStyles: [
        {
          when: (row) => row.isHoliday,
          style: { backgroundColor: "#e6f7ff", fontWeight: "bold" },
        },
      ],
    },
    {
      name: "Scheduled In",
      selector: (row) => row.schedin,
      sortable: true,
      width: "120px",
      center: true,
    },
    {
      name: "Scheduled Out",
      selector: (row) => row.schedout,
      sortable: true,
      width: "130px",
      center: true,
    },
    {
      name: "Time In",
      selector: (row) => row.timein,
      sortable: true,
      center: true,
    },
    {
      name: "Time Out",
      selector: (row) => row.timeout2,
      sortable: true,
      center: true,
    },
    {
      name: "Tardiness (mins)",
      selector: (row) => row.tardiness,
      sortable: true,
      width: "140px",
      center: true,
    },
    {
      name: "Total Hours Worked",
      selector: (row) => row.total_hours,
      sortable: true,
      width: "170px",
      center: true,
    },
    {
      name: "Overtime (hrs)",
      selector: (row) => row.overtime,
      sortable: true,
      width: "130px",
      center: true,
    },
  ];

  const summaryColumns = [
    {
      name: "E-Code",
      selector: (row) => row.ecode,
      sortable: true,
      width: "100px",
      center: true,
    },
    {
      name: "Days Present",
      selector: (row) => row.daysPresent,
      sortable: true,
      width: "120px",
      center: true,
    },
    {
      name: "Regular Days",
      selector: (row) => row.regularDays,
      sortable: true,
      width: "120px",
      center: true,
    },
    {
      name: "Holiday Days",
      selector: (row) => row.holidayCount,
      sortable: true,
      width: "120px",
      center: true,
    },
    {
      name: "Total Hours",
      selector: (row) => row.totalHours,
      sortable: true,
      width: "120px",
      center: true,
    },
    {
      name: "Regular Hours",
      selector: (row) => row.totalRegularHours,
      sortable: true,
      width: "130px",
      center: true,
    },
    {
      name: "Holiday Hours",
      selector: (row) => row.totalHolidayHours,
      sortable: true,
      width: "130px",
      center: true,
    },
    {
      name: "Total Tardiness (mins)",
      selector: (row) => row.totalTardiness,
      sortable: true,
      width: "170px",
      center: true,
    },
    {
      name: "Total Overtime (hrs)",
      selector: (row) => row.totalOvertime,
      sortable: true,
      width: "160px",
      center: true,
    },
  ];

  return (
    <div className="fixed top-0 right-0 bottom-0 min-h-screen w-[calc(100%-16rem)] bg-neutralSilver p-6 pt-16">
      <div >
        <Breadcrumb
          items={[
            { label: "Attendance", href: "" },
            { label: "Add Attendance", href: "/admin-dashboard/employees" },
          ]}
        />
        <div>
          <Modal
            show={showModal}
            onHide={() => setShowModal(false)}
            style={{ position: "fixed", top: "28%", left: "5%" }}
          >
            <Modal.Header className="py-2 px-3 text-sm">
              <Modal.Title as="h6" className="text-base text-green-500">Success!</Modal.Title>
            </Modal.Header>
            <Modal.Body as="h6" className="text-sm p-2 text-justify ml-2 -mb-0">Attendance saved successfully!</Modal.Body>
            <Modal.Footer>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 w-24 h-8 text-sm border flex justify-center items-center text-center text-neutralDGray rounded-lg hover:bg-red-400 hover:text-white transition-all">
                Close
              </button>
              <button
                onClick={() => navigate("/admin-dashboard/payroll-summary")}
                className="px-4 py-2 w-36 h-8 border flex justify-center text-sm items-center text-center text-neutralDGray rounded-lg hover:bg-green-400 hover:text-white transition-all"
              >
                Create Payroll
              </button>
            </Modal.Footer>
          </Modal>
        </div>

        <div className="p-2 -mt-3 rounded border bg-white shadow-sm border-neutralDGray">
          <h2 className="text-lg font-semibold text-neutralDGray mb-2">
            Upload Attendance File
          </h2>
          <div className="flex items-center justify-between border border-neutralDGray rounded-md p-2 bg-slate-50">
            <label className="px-4 py-2 bg-brandPrimary hover:bg-neutralDGray text-white rounded-md cursor-pointer">
              Upload File
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <span className="text-sm text-neutralDGray">
              {selectedFile || "No file selected"}
            </span>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 h-auto bg-brandPrimary hover:bg-neutralDGray cursor-pointer text-white rounded-md"
            >
              Save Attendance
            </button>
          </div>
        </div>
        <div className="grid mt-3 grid-cols-2 gap-3">
          {/* Attendance Table */}
          <div className="overflow-auto h-[458px] rounded border bg-white shadow-sm p-2">
            <h2 className="text-lg font-semibold text-neutralDGray mb-2">
              Detailed Attendance
            </h2>
            {attendanceData.length > 0 ? (
              <DataTable
                columns={attendanceColumns}
                data={attendanceData}
                highlightOnHover
              />
            ) : (
              <p className="text-center text-gray-500">
                No attendance data available.
              </p>
            )}
          </div>

          {/* Summary Table */}
          <div className="overflow-auto h-[458px] rounded border bg-white shadow-sm p-2">
            <h2 className="text-lg font-semibold text-neutralDGray mb-2">
              Attendance Summary
            </h2>
            {summaryData.length > 0 ? (
              <DataTable
                columns={summaryColumns}
                data={summaryData}
                pagination
                highlightOnHover
              />
            ) : (
              <p className="text-center text-gray-500">
                No summary data available.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
