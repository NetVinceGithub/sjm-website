// Optimized Attendance.jsx - Auto-detect schedule without custom option

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import Breadcrumb from "../dashboard/Breadcrumb";
import DataTable from "react-data-table-component";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { BsFilter } from "react-icons/bs";
import Tooltip from "@mui/material/Tooltip";
import { toast } from "react-toastify";
import FilterComponent from "../modals/FilterComponent";

const Attendance = () => {
  // State variables
  const [attendanceData, setAttendanceData] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [filterComponentModal, setFilterComponentModal] = useState(false);

  // Optimized schedule options - removed custom schedule
  const scheduleOptions = [
    { value: "8-17", label: "Day Shift (8:00 - 17:00)", start: 8, end: 17 },
    {
      value: "17-21",
      label: "Evening Shift (17:00 - 21:00)",
      start: 17,
      end: 21,
    },
    { value: "21-6", label: "Night Shift (21:00 - 06:00)", start: 21, end: 6 },
    { value: "9-18", label: "Regular Hours (9:00 - 18:00)", start: 9, end: 18 },
  ];

  // Optimized shift detection with fallback logic
  const determineShift = (onDutyTime) => {
    if (!onDutyTime) return "Unknown";

    const [hours, minutes] = onDutyTime.split(":").map(Number);
    const onDutyHour = hours + minutes / 60;

    // Create an array to store potential matches with their proximity scores
    const matches = [];

    for (const schedule of scheduleOptions) {
      let proximity = 0;
      let isMatch = false;

      if (schedule.value === "21-6") {
        // Night shift spans midnight (21:00 to 06:00)
        if (onDutyHour >= 21 || onDutyHour <= 6) {
          isMatch = true;
          // Calculate proximity to shift start
          if (onDutyHour >= 21) {
            proximity = Math.abs(onDutyHour - 21);
          } else {
            // For early morning (0-6), calculate distance from 21:00 previous day
            proximity = Math.abs(onDutyHour + 24 - 21);
          }
        }
      } else {
        // Regular shifts (don't span midnight)
        if (onDutyHour >= schedule.start && onDutyHour < schedule.end) {
          isMatch = true;
          proximity = Math.abs(onDutyHour - schedule.start);
        }
      }

      if (isMatch) {
        matches.push({ schedule, proximity });
      }
    }

    // If we have matches, return the one with the smallest proximity (closest to shift start)
    if (matches.length > 0) {
      matches.sort((a, b) => a.proximity - b.proximity);
      return matches[0].schedule.label;
    }

    // Fallback logic: find the closest shift even if not within exact bounds
    let closestShift = scheduleOptions[0];
    let minDistance = Infinity;

    for (const schedule of scheduleOptions) {
      let distance;

      if (schedule.value === "21-6") {
        // Special handling for night shift
        const distanceToStart =
          onDutyHour >= 21
            ? Math.abs(onDutyHour - 21)
            : Math.abs(onDutyHour + 24 - 21);
        const distanceToEnd =
          onDutyHour <= 6
            ? Math.abs(onDutyHour - 6)
            : Math.abs(onDutyHour - 6 - 24);
        distance = Math.min(distanceToStart, distanceToEnd);
      } else {
        // Calculate distance to start and end of shift
        const distanceToStart = Math.abs(onDutyHour - schedule.start);
        const distanceToEnd = Math.abs(onDutyHour - schedule.end);
        distance = Math.min(distanceToStart, distanceToEnd);
      }

      if (distance < minDistance) {
        minDistance = distance;
        closestShift = schedule;
      }
    }

    return closestShift.label;
  };

  // Helper function to get shift badge color
  const getShiftBadgeColor = (shift) => {
    if (shift.includes("Day Shift")) return "bg-blue-100 text-blue-800";
    if (shift.includes("Evening Shift")) return "bg-orange-100 text-orange-800";
    if (shift.includes("Night Shift")) return "bg-purple-100 text-purple-800";
    if (shift.includes("Regular Hours")) return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };

  // Helper function to convert Excel time decimals to HH:MM format
  const convertExcelTimeToString = (excelTime) => {
    if (!excelTime || excelTime === "" || isNaN(excelTime)) {
      return null;
    }

    // Convert decimal to total minutes in a day (no rounding)
    const totalMinutes = Number(excelTime) * 24 * 60;

    // Calculate hours and minutes (using floor to avoid rounding)
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);

    // Format as HH:MM
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  // Optimized lateness detection based on detected shift
  const isLate = (onDutyTime, detectedShift) => {
    if (!onDutyTime || !detectedShift) return false;

    const [hours, minutes] = onDutyTime.split(":").map(Number);
    const onDutyMinutes = hours * 60 + minutes;

    // Find the corresponding schedule for the detected shift
    const schedule = scheduleOptions.find((s) =>
      detectedShift.includes(s.label.split(" (")[0])
    );
    if (!schedule) return false;

    let shiftStartMinutes;
    if (schedule.value === "21-6") {
      // Night shift: late if after 21:30 or before 5:30 (considering some flexibility)
      shiftStartMinutes = 21 * 60 + 30; // 21:30
      return onDutyMinutes > shiftStartMinutes && onDutyMinutes < 23 * 60; // Late if between 21:30-23:00
    } else {
      // Regular shifts: late if 30 minutes after start time
      shiftStartMinutes = schedule.start * 60 + 30;
      return onDutyMinutes > shiftStartMinutes;
    }
  };

  // Optimized late minutes calculation
  const calculateLateMinutes = (onDutyTime, detectedShift) => {
    if (!onDutyTime || !detectedShift) return 0;

    const [hours, minutes] = onDutyTime.split(":").map(Number);
    const onDutyMinutes = hours * 60 + minutes;

    // Find the corresponding schedule for the detected shift
    const schedule = scheduleOptions.find((s) =>
      detectedShift.includes(s.label.split(" (")[0])
    );
    if (!schedule) return 0;

    let shiftStartMinutes;
    if (schedule.value === "21-6") {
      // Night shift: calculate lateness from 21:00
      shiftStartMinutes = 21 * 60;
      if (onDutyMinutes >= shiftStartMinutes && onDutyMinutes < 23 * 60) {
        return Math.max(0, onDutyMinutes - shiftStartMinutes);
      }
      return 0;
    } else {
      // Regular shifts: calculate lateness from shift start
      shiftStartMinutes = schedule.start * 60;
      return Math.max(0, onDutyMinutes - shiftStartMinutes);
    }
  };

  // Helper function to format minutes to hours and minutes
  const formatMinutesToHoursMinutes = (totalMinutes) => {
    if (totalMinutes === 0) return "0m";

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);

    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  // Column definitions for attendance table - matching backend fields
  const attendanceColumns = [
    {
      name: "E-Code",
      selector: (row) => row.ecode,
      sortable: true,
      width: "100px",
    },
    {
      name: "Date",
      selector: (row) => new Date(row.date).toLocaleDateString(),
      sortable: true,
      width: "100px",
    },
    {
      name: "On Duty",
      selector: (row) => row.onDuty || "N/A",
      width: "80px",
    },
    {
      name: "Off Duty",
      selector: (row) => row.offDuty || "N/A",
      width: "80px",
    },
    {
      name: "Shift",
      selector: (row) => row.shift || "Unknown",
      width: "120px",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs ${getShiftBadgeColor(
            row.shift || "Unknown"
          )}`}
        >
          {(row.shift || "Unknown").split(" (")[0]}
        </span>
      ),
    },
    {
      name: "Status",
      selector: (row) => row.status,
      width: "100px",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            row.status === "present"
              ? "bg-green-100 text-green-800"
              : row.status === "absent"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
    {
      name: "Tardiness (Minutes)",
      selector: (row) => row.lateMinutes,
      width: "137px",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            row.lateMinutes > 0
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {row.lateMinutes > 0 ? `${row.lateMinutes}m` : "0m"}
        </span>
      ),
    },
  ];

  // Updated summary columns - removed custom/other column
  const summaryColumns = [
    {
      name: "E-Code",
      selector: (row) => row.ecode,
      sortable: true,
      width: "90px",
    },
    {
      name: "Total Days",
      selector: (row) => row.totalDays,
      width: "100px",
    },
    {
      name: "Present",
      selector: (row) => row.presentDays,
      width: "90px",
    },
    {
      name: "Absent",
      selector: (row) => row.absentDays,
      width: "80px",
    },
    {
      name: "Day Shift",
      selector: (row) => row.dayShiftDays || 0,
      width: "100px",
      cell: (row) => (
        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
          {row.dayShiftDays || 0}
        </span>
      ),
    },
    {
      name: "Evening Shift",
      selector: (row) => row.eveningShiftDays || 0,
      width: "120px",
      cell: (row) => (
        <span className="px-2 py-1 rounded text-xs bg-orange-100 text-orange-800">
          {row.eveningShiftDays || 0}
        </span>
      ),
    },
    {
      name: "Night Shift",
      selector: (row) => row.nightShiftDays || 0,
      width: "110px",
      cell: (row) => (
        <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
          {row.nightShiftDays || 0}
        </span>
      ),
    },
    {
      name: "Regular Hours",
      selector: (row) => row.regularHoursDays || 0,
      width: "110px",
      cell: (row) => (
        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
          {row.regularHoursDays || 0}
        </span>
      ),
    },
    {
      name: "Tardiness",
      selector: (row) => formatMinutesToHoursMinutes(row.totalLateMinutes),
      width: "110px",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            row.totalLateMinutes > 0
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {formatMinutesToHoursMinutes(row.totalLateMinutes)}
        </span>
      ),
    },
    {
      name: "Attendance %",
      selector: (row) =>
        `${
          row.totalDays > 0
            ? ((row.presentDays / row.totalDays) * 100).toFixed(1)
            : "0.0"
        }%`,
      width: "120px",
    },
  ];

  // Handle file upload and preview
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file.name);

      // Preview the Excel data
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Process data to match backend expectations
          const processedData = jsonData
            .map((row, index) => {
              // Convert date if it's an Excel serial number
              let formattedDate = "";
              const dateRaw = row.Date || row.date || "";

              if (!isNaN(dateRaw) && Number(dateRaw) > 0) {
                // Excel serial date conversion
                const excelDate = new Date(
                  (Number(dateRaw) - 25569) * 86400 * 1000
                );
                formattedDate = excelDate.toISOString().split("T")[0];
              } else if (dateRaw) {
                // Try to parse as regular date
                const parsedDate = new Date(dateRaw);
                if (!isNaN(parsedDate)) {
                  formattedDate = parsedDate.toISOString().split("T")[0];
                }
              }

              const ecode = String(row.Name || row.name || "").trim();

              // Convert Excel time decimals to HH:MM format
              const onDutyRaw =
                row["ON Duty"] || row["on duty"] || row["onDuty"] || null;
              const offDutyRaw =
                row["OFF Duty"] || row["off duty"] || row["offDuty"] || null;

              const onDuty = convertExcelTimeToString(onDutyRaw);
              const offDuty = convertExcelTimeToString(offDutyRaw);

              // Determine shift based on on-duty time
              const shift = determineShift(onDuty);

              // Updated status logic: if Off Duty is null/N/A, mark as absent
              const status = !offDuty ? "absent" : "present";

              // Check if employee is late using optimized detection
              const late = status === "present" ? isLate(onDuty, shift) : false;

              // Calculate late minutes using optimized calculation
              const lateMinutes =
                status === "present" ? calculateLateMinutes(onDuty, shift) : 0;

              return {
                id: index + 1,
                ecode,
                date: formattedDate,
                onDuty,
                offDuty,
                shift,
                status,
                isLate: late,
                lateMinutes: lateMinutes,
              };
            })
            .filter((record) => record.date && record.ecode); // Filter out invalid records

          setAttendanceData(processedData);
          generateSummary(processedData);
        } catch (error) {
          console.error("Error reading file:", error);
          toast.error("Error reading Excel file. Please check the format.");
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Generate summary data from attendance - updated to remove custom shift tracking
  const generateSummary = (data) => {
    const summary = {};

    data.forEach((record) => {
      const ecode = record.ecode;
      if (!summary[ecode]) {
        summary[ecode] = {
          ecode: ecode,
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
          lateDays: 0,
          totalLateMinutes: 0,
          dayShiftDays: 0,
          eveningShiftDays: 0,
          nightShiftDays: 0,
          regularHoursDays: 0,
        };
      }

      summary[ecode].totalDays++;

      if (record.status === "present") {
        summary[ecode].presentDays++;

        // Count shift-specific days based on the shift type
        if (record.shift) {
          if (record.shift.includes("Day Shift")) {
            summary[ecode].dayShiftDays++;
          } else if (record.shift.includes("Evening Shift")) {
            summary[ecode].eveningShiftDays++;
          } else if (record.shift.includes("Night Shift")) {
            summary[ecode].nightShiftDays++;
          } else if (record.shift.includes("Regular Hours")) {
            summary[ecode].regularHoursDays++;
          }
          // Removed custom shift handling - all shifts should now be properly detected
        }

        // Count late days and accumulate late minutes only for present employees
        if (record.isLate) {
          summary[ecode].lateDays++;
        }
        // Add late minutes to total (even if 0)
        summary[ecode].totalLateMinutes += record.lateMinutes || 0;
      } else if (record.status === "absent") {
        summary[ecode].absentDays++;
      }
    });

    // Find the highest total days value
    const maxTotalDays = Math.max(
      ...Object.values(summary).map((emp) => emp.totalDays)
    );

    // Update all employees to have the same total days and recalculate absent days
    Object.values(summary).forEach((emp) => {
      emp.totalDays = maxTotalDays;
      emp.absentDays = maxTotalDays - emp.presentDays;
    });

    setSummaryData(Object.values(summary));
  };

  // Handle form submission and save summary
  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    const fileInput = document.querySelector('input[type="file"]');
    const file = fileInput.files[0];

    if (!file) {
      toast.error("No file selected");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Upload attendance Excel file to backend
      const formData = new FormData();
      formData.append("attendanceFile", file);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/attendance/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Attendance data saved successfully!");

        // Step 2: Send comprehensive attendance summary to /add-attendance-summary
        const summaryPayload = summaryData.map((row) => ({
          ecode: row.ecode,
          presentDays: row.presentDays,
          totalDays: row.totalDays,
          absentDays: row.absentDays,
          lateDays: row.lateDays,
          totalLateMinutes: row.totalLateMinutes,
          dayShiftDays: row.dayShiftDays,
          eveningShiftDays: row.eveningShiftDays,
          nightShiftDays: row.nightShiftDays,
          regularHoursDays: row.regularHoursDays,
        }));

        const summaryResponse = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/api/attendance/add-attendance-summary`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ summaryData: summaryPayload }),
          }
        );

        const summaryResult = await summaryResponse.json();

        if (summaryResponse.ok) {
          toast.success(
            `Summary saved successfully! Created: ${summaryResult.created}, Updated: ${summaryResult.updated}`
          );
          setShowModal(true);
          fetchAttendanceData();
        } else {
          toast.error("Failed to save attendance summary");
          console.error(summaryResult.message);
        }
      } else {
        toast.error(result.message || "Failed to save attendance data");
        if (result.details?.errors) {
          result.details.errors.forEach((error) =>
            toast.error(`${error.record?.ecode}: ${error.error}`)
          );
        }
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("An error occurred while saving attendance.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance data from API
  const fetchAttendanceData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/attendance/get-attendance`
      );
      if (!response.ok) throw new Error("Failed to fetch attendance data");

      const data = await response.json();
      if (data.success) {
        // Process fetched data to match frontend expectations
        const processedData = data.data.map((record) => {
          // Determine shift based on on-duty time
          const shift = determineShift(record.onDuty);
          // Updated status logic: if Off Duty is null/N/A, mark as absent
          const status = !record.offDuty ? "absent" : "present";
          // Check if employee is late using optimized detection
          const late = !record.offDuty ? false : isLate(record.onDuty, shift);
          // Calculate late minutes using optimized calculation
          const lateMinutes = !record.offDuty
            ? 0
            : calculateLateMinutes(record.onDuty, shift);

          return {
            ...record,
            shift,
            status,
            isLate: late,
            lateMinutes,
          };
        });

        setAttendanceData(processedData);
        generateSummary(processedData);
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      toast.error("Failed to fetch attendance data");
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchAttendanceData();
  }, []);

  return (
    <div className=" right-0 bottom-0  min-h-screen w-full bg-neutralSilver p-3 pt-16">
      <div className="">
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
              <Modal.Title as="h6" className="text-base text-green-500">
                Success!
              </Modal.Title>
            </Modal.Header>
            <Modal.Body as="h6" className="text-sm p-2 text-justify ml-2 -mb-0">
              Attendance saved successfully!
            </Modal.Body>
            <Modal.Footer>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 w-24 h-8 text-sm border flex justify-center items-center text-center text-neutralDGray rounded-lg hover:bg-red-400 hover:text-white transition-all"
              >
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
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm text-neutralDGray ">
              Upload Attendance File
            </h2>
            <Tooltip title="Add Attendance Filter" arrow>
              <button className="px-4 text-xs h-8 w-fit  border hover:bg-green-400 hover:text-white text-neutralDGray rounded-md cursor-pointer">
                <BsFilter
                  className="text-lg"
                  onClick={() => setFilterComponentModal(true)}
                />
              </button>
            </Tooltip>
          </div>
          <div className="flex items-center justify-between border border-neutralDGray rounded-md p-2 bg-slate-50">
            <label className="px-4 text-xs py-2 border hover:bg-green-400 hover:text-white text-neutralDGray rounded-md cursor-pointer">
              Upload File
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <span className="text-xs text-neutralDGray">
              {selectedFile || "No file selected"}
            </span>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 text-xs py-2 h-auto border hover:bg-green-400 hover:text-white text-neutralDGray cursor-pointer rounded-md disabled:bg-gray-400"
            >
              {loading ? "Saving..." : "Save Attendance"}
            </button>
          </div>
        </div>

        <div className="grid mt-3 grid-cols-2 gap-3">
          {/* Attendance Table */}
          <div className="overflow-auto h-full rounded border bg-white shadow-sm p-2">
            <h2 className="text-sm italic text-neutralDGray mb-2">
              Detailed Attendance
            </h2>
            {attendanceData.length > 0 ? (
              <DataTable
                columns={attendanceColumns}
                data={attendanceData}
                highlightOnHover
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[10, 25, 50]}
              />
            ) : (
              <p className="text-center text-xs italic text-gray-500">
                No attendance data available. Upload a file to see data.
              </p>
            )}
          </div>

          {/* Summary Table */}
          <div className="overflow-auto h-full rounded border bg-white shadow-sm p-2">
            <h2 className="text-sm italic text-neutralDGray mb-2">
              Attendance Summary
            </h2>
            {summaryData.length > 0 ? (
              <DataTable
                columns={summaryColumns}
                data={summaryData}
                pagination
                highlightOnHover
                paginationPerPage={10}
                paginationRowsPerPageOptions={[10, 25, 50]}
              />
            ) : (
              <p className="text-center text-xs italic text-gray-500">
                No summary data available. Upload a file to see summary.
              </p>
            )}
          </div>
        </div>
      </div>
      <FilterComponent
        show={filterComponentModal}
        onClose={() => setFilterComponentModal(false)}
      />
    </div>
  );
};

export default Attendance;
