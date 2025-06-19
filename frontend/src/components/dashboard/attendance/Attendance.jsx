// Enhanced Attendance.jsx - With Half-Day Logic for <4 hours worked

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
  ];

  // Helper function to calculate work duration in hours
  const calculateWorkHours = (onDutyTime, offDutyTime) => {
    if (!onDutyTime || !offDutyTime) return 0;

    const [onHours, onMinutes] = onDutyTime.split(":").map(Number);
    const [offHours, offMinutes] = offDutyTime.split(":").map(Number);

    const onDutyMinutes = onHours * 60 + onMinutes;
    let offDutyMinutes = offHours * 60 + offMinutes;

    // Handle overnight shifts (e.g., night shift ending next day)
    if (offDutyMinutes < onDutyMinutes) {
      offDutyMinutes += 24 * 60; // Add 24 hours for next day
    }

    const workMinutes = offDutyMinutes - onDutyMinutes;
    return workMinutes / 60; // Convert to hours
  };

  // Helper function to determine attendance value (1 for full day, 0.5 for half day)
  const calculateAttendanceValue = (onDutyTime, offDutyTime) => {
    if (!offDutyTime) return 0; // Absent

    const workHours = calculateWorkHours(onDutyTime, offDutyTime);

    // If worked less than 4 hours, consider as half day
    if (workHours < 4) {
      return 0.5;
    }

    return 1; // Full day
  };

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

  // Updated sections of your Attendance component with fixed tardiness calculation

  // REPLACE your existing calculateLateMinutes function with this:
  const calculateLateMinutes = (onDutyTime, detectedShift) => {
    console.log('=== calculateLateMinutes Debug ===');
    console.log('onDutyTime:', onDutyTime);
    console.log('detectedShift:', detectedShift);

    if (!onDutyTime || !detectedShift) {
      console.log('Missing onDutyTime or detectedShift, returning 0');
      return 0;
    }

    const [hours, minutes] = onDutyTime.split(":").map(Number);
    const onDutyMinutes = hours * 60 + minutes;
    
    console.log('Parsed time - hours:', hours, 'minutes:', minutes);
    console.log('onDutyMinutes:', onDutyMinutes);

    // Find the corresponding schedule for the detected shift
    const schedule = scheduleOptions.find((s) =>
      detectedShift.includes(s.label.split(" (")[0])
    );
    
    console.log('Found schedule:', schedule);
    
    if (!schedule) {
      console.log('No schedule found, returning 0');
      return 0;
    }

    let lateMinutes = 0;
    
    if (schedule.value === "21-6") {
      // Night shift: calculate lateness from 21:00
      const shiftStartMinutes = 21 * 60; // 21:00 = 1260 minutes
      console.log('Night shift - shiftStartMinutes:', shiftStartMinutes);
      
      if (onDutyMinutes >= shiftStartMinutes) {
        // Same day arrival after 21:00
        lateMinutes = Math.max(0, onDutyMinutes - shiftStartMinutes);
      } else if (onDutyMinutes <= 6 * 60) {
        // Next day arrival (00:00 to 06:00) - they're on time for night shift
        lateMinutes = 0;
      } else {
        // Arrival between 06:01-20:59 - very late
        lateMinutes = onDutyMinutes + (24 * 60 - shiftStartMinutes);
      }
      
      console.log('Night shift calculation - lateMinutes:', lateMinutes);
    } else {
      // Regular shifts: calculate lateness from shift start
      const shiftStartMinutes = schedule.start * 60;
      console.log('Regular shift - shiftStartMinutes:', shiftStartMinutes);
      
      // This is the key fix - ensure we're calculating correctly
      lateMinutes = Math.max(0, onDutyMinutes - shiftStartMinutes);
      console.log('Regular shift calculation - lateMinutes:', lateMinutes);
    }

    console.log('Final lateMinutes:', lateMinutes);
    console.log('=== End Debug ===');
    
    return lateMinutes;
  };


    // Optimized lateness detection based on detected shift
    // REPLACE your existing isLate function with this:
    const isLate = (onDutyTime, detectedShift) => {
      if (!onDutyTime || !detectedShift) return false;

      const lateMinutes = calculateLateMinutes(onDutyTime, detectedShift);
      
      // Consider late if more than 0 minutes after shift start
      return lateMinutes > 0;
    };

  // Debug version of formatMinutesToHoursMinutes function
  const formatMinutesToHoursMinutes = (totalMinutes) => {
    console.log('=== formatMinutesToHoursMinutes Debug ===');
    console.log('Input totalMinutes:', totalMinutes);
    
    if (totalMinutes === 0) {
      console.log('Returning: 0m');
      return "0m";
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    
    console.log('Calculated hours:', hours);
    console.log('Calculated minutes:', minutes);

    let result;
    if (hours === 0) {
      result = `${minutes}m`;
    } else if (minutes === 0) {
      result = `${hours}h`;
    } else {
      result = `${hours}h ${minutes}m`;
    }
    
    console.log('Final formatted result:', result);
    console.log('=== End formatMinutesToHoursMinutes Debug ===');
    
    return result;
  };

  // Column definitions for attendance table - enhanced with work hours and attendance value

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
      name: "Work Hours",
      selector: (row) => row.workHours?.toFixed(1) || "0.0",
      width: "100px",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            row.workHours < 4
              ? "bg-yellow-100 text-yellow-800"
              : row.workHours >= 8
              ? "bg-green-100 text-green-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {row.workHours?.toFixed(1) || "0.0"}h
        </span>
      ),
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
              : row.status === "half-day"
              ? "bg-yellow-100 text-yellow-800"
              : row.status === "absent"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.status === "half-day"
            ? "Half Day"
            : row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
    {
      name: "Attendance Value",
      selector: (row) => row.attendanceValue,
      width: "130px",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            row.attendanceValue === 1
              ? "bg-green-100 text-green-800"
              : row.attendanceValue === 0.5
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.attendanceValue}
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

  // Updated summary columns - enhanced with half-day tracking
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
      selector: (row) => row.presentDays?.toFixed(1) || "0.0",
      width: "90px",
      cell: (row) => (
        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
          {row.presentDays?.toFixed(1) || "0.0"}
        </span>
      ),
    },
    {
      name: "Half Days",
      selector: (row) => row.halfDays || 0,
      width: "90px",
      cell: (row) => (
        <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
          {row.halfDays || 0}
        </span>
      ),
    },
    {
      name: "Absent",
      selector: (row) => row.absentDays?.toFixed(1) || "0.0",
      width: "80px",
      cell: (row) => (
        <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
          {row.absentDays?.toFixed(1) || "0.0"}
        </span>
      ),
    },
    {
      name: "Day Shift",
      selector: (row) => row.dayShiftDays?.toFixed(1) || "0.0",
      width: "100px",
      cell: (row) => (
        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
          {row.dayShiftDays?.toFixed(1) || "0.0"}
        </span>
      ),
    },
    {
      name: "Evening Shift",
      selector: (row) => row.eveningShiftDays?.toFixed(1) || "0.0",
      width: "120px",
      cell: (row) => (
        <span className="px-2 py-1 rounded text-xs bg-orange-100 text-orange-800">
          {row.eveningShiftDays?.toFixed(1) || "0.0"}
        </span>
      ),
    },
    {
      name: "Night Shift",
      selector: (row) => row.nightShiftDays?.toFixed(1) || "0.0",
      width: "110px",
      cell: (row) => (
        <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
          {row.nightShiftDays?.toFixed(1) || "0.0"}
        </span>
      ),
    },
    {
      name: "Tardiness (h:m)",
      selector: (row) => formatMinutesToHoursMinutes(row.totalLateMinutes),
      width: "120px",
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
          // Debug version of the data processing part in handleFileUpload
          // Replace the processedData mapping section with this:

          const processedData = jsonData
            .map((row, index) => {
              console.log(`\n=== Processing Excel Row ${index + 1} ===`);
              console.log('Raw row data:', row);
              
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
              console.log('Employee code:', ecode);
              console.log('Date:', formattedDate);

              // Convert Excel time decimals to HH:MM format
              const onDutyRaw =
                row["ON Duty"] || row["on duty"] || row["onDuty"] || null;
              const offDutyRaw =
                row["OFF Duty"] || row["off duty"] || row["offDuty"] || null;

              console.log('Raw on duty time:', onDutyRaw);
              console.log('Raw off duty time:', offDutyRaw);

              const onDuty = convertExcelTimeToString(onDutyRaw);
              const offDuty = convertExcelTimeToString(offDutyRaw);


              // Calculate work hours
              const workHours = calculateWorkHours(onDuty, offDuty);

              // Calculate attendance value (1 for full day, 0.5 for half day, 0 for absent)
              const attendanceValue = calculateAttendanceValue(onDuty, offDuty);


              // Determine shift based on on-duty time
              const shift = determineShift(onDuty);
              console.log('Determined shift:', shift);


              // Enhanced status logic with half-day detection
              let status;
              if (!offDuty) {
                status = "absent";
              } else if (workHours < 4) {
                status = "half-day";
              } else {
                status = "present";
              }

              // Check if employee is late using optimized detection
              const late = status !== "absent" ? isLate(onDuty, shift) : false;

              // Calculate late minutes using optimized calculation
              const lateMinutes =
                status !== "absent" ? calculateLateMinutes(onDuty, shift) : 0;


              const processedRecord = {
                id: index + 1,
                ecode,
                date: formattedDate,
                onDuty,
                offDuty,
                workHours,
                attendanceValue,
                shift,
                status,
                isLate: late,
                lateMinutes: lateMinutes,
              };
              
              console.log('Final processed record:', processedRecord);
              console.log('=== End Row Processing ===\n');
              
              return processedRecord;
            })
            .filter((record) => {
              const isValid = record.date && record.ecode;
              if (!isValid) {
                console.log('Filtered out invalid record:', record);
              }
              return isValid;
            });

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


  // Generate summary data from attendance - enhanced with half-day tracking

  const generateSummary = (data) => {
    console.log('=== generateSummary Debug ===');
    console.log('Total records:', data.length);
    
    const summary = {};

    data.forEach((record, index) => {
      console.log(`\n--- Processing record ${index + 1} ---`);
      console.log('Record:', record);
      
      const ecode = record.ecode;
      console.log('Employee code:', ecode);
      
      if (!summary[ecode]) {
        summary[ecode] = {
          ecode: ecode,
          totalDays: 0,
          presentDays: 0,
          halfDays: 0,
          absentDays: 0,
          lateDays: 0,
          totalLateMinutes: 0, // This will store the raw minutes (e.g., 144)
          dayShiftDays: 0,
          eveningShiftDays: 0,
          nightShiftDays: 0,
          totalWorkHours: 0,
        };
        console.log('Created new summary for:', ecode);
      }

      summary[ecode].totalDays++;

      summary[ecode].totalWorkHours += record.workHours || 0;

      // Add attendance value instead of just counting days
      summary[ecode].presentDays += record.attendanceValue || 0;

      if (record.status === "half-day") {
        summary[ecode].halfDays++;
      } else if (record.status === "absent") {
        // Absent days calculation will be done at the end
      }

      // Count shift-specific days with attendance value
      if (record.attendanceValue > 0 && record.shift) {
        if (record.shift.includes("Day Shift")) {
          summary[ecode].dayShiftDays += record.attendanceValue;
        } else if (record.shift.includes("Evening Shift")) {
          summary[ecode].eveningShiftDays += record.attendanceValue;
        } else if (record.shift.includes("Night Shift")) {
          summary[ecode].nightShiftDays += record.attendanceValue;

        }
      }


      // Count late days and accumulate late minutes only for present/half-day employees
      if (record.status !== "absent") {
        if (record.isLate) {

          summary[ecode].lateDays++;
          console.log('Late days for', ecode, ':', summary[ecode].lateDays);
        }

        // Add late minutes to total (even if 0)
        summary[ecode].totalLateMinutes += record.lateMinutes || 0;

      }
    });

    // Find the highest total days value
    const maxTotalDays = Math.max(
      ...Object.values(summary).map((emp) => emp.totalDays)
    );
    console.log('\nMax total days:', maxTotalDays);

    // Update all employees to have the same total days and calculate absent days
    Object.values(summary).forEach((emp) => {
      const oldTotalDays = emp.totalDays;
      const oldAbsentDays = emp.absentDays;
      
      emp.totalDays = maxTotalDays;
      emp.absentDays = maxTotalDays - emp.presentDays;
      
      console.log(`\nFinal summary for ${emp.ecode}:`);
      console.log('- Total days:', oldTotalDays, '->', emp.totalDays);
      console.log('- Absent days:', oldAbsentDays, '->', emp.absentDays);
      console.log('- Total late minutes (RAW):', emp.totalLateMinutes); // This should be 144
    });

    console.log('\n=== Final Summary ===');
    console.log(Object.values(summary));
    console.log('=== End generateSummary Debug ===');

    setSummaryData(Object.values(summary));
  };


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
          halfDays: row.halfDays,
          totalDays: row.totalDays,
          absentDays: row.absentDays,
          lateDays: row.lateDays,
          totalLateMinutes: row.totalLateMinutes,
          dayShiftDays: row.dayShiftDays,
          eveningShiftDays: row.eveningShiftDays,
          nightShiftDays: row.nightShiftDays,
          totalWorkHours: row.totalWorkHours,
        }));

        const summaryResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/attendance/add-attendance-summary`,
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
          // Calculate work hours
          const workHours = calculateWorkHours(record.onDuty, record.offDuty);

          // Calculate attendance value
          const attendanceValue = calculateAttendanceValue(
            record.onDuty,
            record.offDuty
          );

          // Determine shift based on on-duty time
          const shift = determineShift(record.onDuty);

          // Enhanced status logic with half-day detection
          let status;
          if (!record.offDuty) {
            status = "absent";
          } else if (workHours < 4) {
            status = "half-day";
          } else {
            status = "present";
          }

          // Check if employee is late using optimized detection
          const late =
            status !== "absent" ? isLate(record.onDuty, shift) : false;

          // Calculate late minutes using optimized calculation
          const lateMinutes =
            status !== "absent"
              ? calculateLateMinutes(record.onDuty, shift)
              : 0;

          return {
            ...record,
            workHours,
            attendanceValue,
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
