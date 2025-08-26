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
import ScheduleSelectionModal from "./ScheduleSelectionModal";

const Attendance = () => {
  // State variables
  const [attendanceData, setAttendanceData] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const defaultScheduleOptions = [
    {
      id: 1,
      value: "8-17",
      label: "Day Shift (8AM-5PM)",
      start: 8,
      end: 17,
      isDefault: true,
    },
    {
      id: 2,
      value: "17-21",
      label: "Evening Shift (5PM-9PM)",
      start: 17,
      end: 21,
      isDefault: true,
    },
    {
      id: 3,
      value: "21-6",
      label: "Night Shift (9PM-6AM)",
      start: 21,
      end: 6,
      isDefault: true,
    },
  ];

  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [allSchedules, setAllSchedules] = useState(defaultScheduleOptions);
  
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };


  const calculateWorkHours = (onDutyTime, offDutyTime) => {
    if (!onDutyTime || !offDutyTime) return 0;

    const [onHours, onMinutes] = onDutyTime.split(":").map(Number);
    const [offHours, offMinutes] = offDutyTime.split(":").map(Number);

    const onDutyMinutes = onHours * 60 + onMinutes;
    let offDutyMinutes = offHours * 60 + offMinutes;

    if (offDutyMinutes < onDutyMinutes) {
      offDutyMinutes += 24 * 60;
    }

    const workMinutes = offDutyMinutes - onDutyMinutes;
    return workMinutes / 60; // Convert to hours
  };

  const calculateAttendanceValue = (onDutyTime, offDutyTime, detectedShift) => {
    if (!offDutyTime) return 0; // Absent - no off duty time

    // If no valid schedule match, mark as absent
    if (
      !detectedShift ||
      detectedShift === "No Schedule Match" ||
      detectedShift === "Unknown"
    ) {
      console.log("No valid schedule match, marking as absent");
      return 0;
    }

    const workHours = calculateWorkHours(onDutyTime, offDutyTime);

    // If worked less than 4 hours, consider as half day
    if (workHours < 4) {
      return 0.5;
    }

    return 1; // Full day
  };

  // FIXED: Enhanced status determination with schedule validation
  const calculateAttendanceStatus = (
    onDutyTime,
    offDutyTime,
    detectedShift
  ) => {
    if (!offDutyTime) {
      return "absent";
    }

    // If no valid schedule match, mark as absent
    if (
      !detectedShift ||
      detectedShift === "No Schedule Match" ||
      detectedShift === "Unknown"
    ) {
      console.log(
        "No valid schedule match, marking as absent due to schedule mismatch"
      );
      return "absent";
    }

    const workHours = calculateWorkHours(onDutyTime, offDutyTime);

    if (workHours < 4) {
      return "half-day";
    }

    return "present";
  };

  // Optimized shift detection with fallback logic

  // FIXED: determineShiftFromSchedules function with proper validation
  const determineShiftFromSchedules = (onDutyTime, selectedScheduleList) => {
    if (!onDutyTime || selectedScheduleList.length === 0)
      return "No Schedule Match";

    const [hours, minutes] = onDutyTime.split(":").map(Number);
    const onDutyHour = hours + minutes / 60;

    console.log(`\n=== Shift Detection Debug ===`);
    console.log("On duty time:", onDutyTime);
    console.log("On duty hour (decimal):", onDutyHour);
    console.log(
      "Available schedules:",
      selectedScheduleList.map((s) => `${s.label} (${s.start}-${s.end})`)
    );

    // Find schedules where the employee clock-in time falls within the shift range
    const matchingSchedules = [];

    for (const schedule of selectedScheduleList) {
      let isWithinRange = false;
      let tolerance = 2; // 2-hour tolerance for shift start time

      console.log(
        `\nChecking schedule: ${schedule.label} (${schedule.start}-${schedule.end})`
      );

      if (schedule.end < schedule.start) {
        // Overnight shift (like 21-6)
        console.log("Processing overnight shift...");
        // Check if clock-in time is within shift start range (with tolerance)
        if (
          onDutyHour >= schedule.start - tolerance ||
          onDutyHour <= schedule.end
        ) {
          isWithinRange = true;
          console.log("Within overnight shift range");
        }
      } else {
        // Regular shift (like 8-17 or 17-21)
        console.log("Processing regular shift...");
        // Check if clock-in time is within shift start range (with tolerance)
        if (
          onDutyHour >= schedule.start - tolerance &&
          onDutyHour <= schedule.start + tolerance
        ) {
          isWithinRange = true;
          console.log("Within regular shift start range");
        }
      }

      if (isWithinRange) {
        matchingSchedules.push(schedule);
      }
    }

    console.log(
      "Matching schedules:",
      matchingSchedules.map((s) => s.label)
    );

    // If no matching schedule found, return "No Schedule Match"
    if (matchingSchedules.length === 0) {
      console.log("No matching schedule found for clock-in time:", onDutyTime);
      console.log("=== End Shift Detection Debug ===\n");
      return "No Schedule Match";
    }

    // If multiple matches, choose the closest one to clock-in time
    let bestMatch = matchingSchedules[0];
    if (matchingSchedules.length > 1) {
      let minDistance = Math.abs(onDutyHour - bestMatch.start);
      for (const schedule of matchingSchedules) {
        const distance = Math.abs(onDutyHour - schedule.start);
        if (distance < minDistance) {
          minDistance = distance;
          bestMatch = schedule;
        }
      }
    }

    console.log("Final selected shift:", bestMatch.label);
    console.log("=== End Shift Detection Debug ===\n");

    return bestMatch.label;
  };

  // Also, let's add a simplified version for testing
  const determineShiftSimple = (onDutyTime, selectedScheduleList) => {
    if (!onDutyTime || selectedScheduleList.length === 0) return "Unknown";

    const [hours, minutes] = onDutyTime.split(":").map(Number);
    const onDutyHour = hours + minutes / 60;

    // For each schedule, check if the time falls within it
    for (const schedule of selectedScheduleList) {
      if (schedule.end < schedule.start) {
        // Overnight shift
        if (onDutyHour >= schedule.start || onDutyHour <= schedule.end) {
          return schedule.label;
        }
      } else {
        // Regular shift
        if (onDutyHour >= schedule.start && onDutyHour <= schedule.end) {
          return schedule.label;
        }
      }
    }

    // If no exact match, find the closest one
    let bestMatch = null;
    let minDistance = Infinity;

    for (const schedule of selectedScheduleList) {
      let distance;
      if (schedule.end < schedule.start) {
        // Overnight shift distance calculation
        if (onDutyHour >= schedule.start) {
          distance = onDutyHour - schedule.start;
        } else if (onDutyHour <= schedule.end) {
          distance = schedule.start - onDutyHour;
        } else {
          distance = Math.min(
            schedule.start - onDutyHour,
            onDutyHour - schedule.end
          );
        }
      } else {
        // Regular shift distance calculation
        distance = Math.min(
          Math.abs(onDutyHour - schedule.start),
          Math.abs(onDutyHour - schedule.end)
        );
      }

      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = schedule;
      }
    }

    return bestMatch ? bestMatch.label : "Unknown";
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

  const calculateLateMinutesWithSelectedSchedules = (
    onDutyTime,
    detectedShift,
    selectedScheduleList
  ) => {
    if (!onDutyTime || !detectedShift || selectedScheduleList.length === 0)
      return 0;

    // Find the matching schedule
    const matchingSchedule = selectedScheduleList.find(
      (schedule) =>
        detectedShift.includes(schedule.label) ||
        schedule.label.includes(detectedShift.split(" ")[0])
    );

    if (!matchingSchedule) return 0;

    const [hours, minutes] = onDutyTime.split(":").map(Number);
    const onDutyMinutes = hours * 60 + minutes;
    const shiftStartMinutes = matchingSchedule.start * 60;

    if (
      matchingSchedule.value === "21-6" ||
      matchingSchedule.end < matchingSchedule.start
    ) {
      // Night shift or overnight shift
      if (onDutyMinutes >= shiftStartMinutes) {
        return Math.max(0, onDutyMinutes - shiftStartMinutes);
      } else if (onDutyMinutes <= matchingSchedule.end * 60) {
        return 0; // On time for night shift
      } else {
        return onDutyMinutes + (24 * 60 - shiftStartMinutes);
      }
    } else {
      // Regular shifts
      return Math.max(0, onDutyMinutes - shiftStartMinutes);
    }
  };

  // 4. ADD these new functions for schedule management

  const addNewSchedule = () => {
    if (!newSchedule.label || !newSchedule.start || !newSchedule.end) {
      toast.error("Please fill in all schedule fields");
      return;
    }

    const startHour = parseInt(newSchedule.start);
    const endHour = parseInt(newSchedule.end);

    if (startHour < 0 || startHour > 23 || endHour < 0 || endHour > 23) {
      toast.error("Hours must be between 0 and 23");
      return;
    }

    const newId = Math.max(...scheduleOptions.map((s) => s.id)) + 1;
    const scheduleValue = `${startHour}-${endHour}`;

    const newScheduleOption = {
      id: newId,
      value: scheduleValue,
      label: newSchedule.label,
      start: startHour,
      end: endHour,
      isDefault: false,
    };

    setScheduleOptions([...scheduleOptions, newScheduleOption]);
    setNewSchedule({ label: "", start: "", end: "" });
    toast.success("Schedule added successfully");
  };

  const removeSchedule = (scheduleId) => {
    const scheduleToRemove = scheduleOptions.find((s) => s.id === scheduleId);
    if (scheduleToRemove?.isDefault) {
      toast.error("Cannot remove default schedules");
      return;
    }

    setScheduleOptions(scheduleOptions.filter((s) => s.id !== scheduleId));
    setSelectedSchedules(selectedSchedules.filter((s) => s.id !== scheduleId));
    toast.success("Schedule removed successfully");
  };

  const toggleScheduleSelection = (schedule) => {
    const isSelected = selectedSchedules.some((s) => s.id === schedule.id);
    if (isSelected) {
      setSelectedSchedules(
        selectedSchedules.filter((s) => s.id !== schedule.id)
      );
    } else {
      setSelectedSchedules([...selectedSchedules, schedule]);
    }
  };

  // Optimized lateness detection based on detected shift
  // 4. REPLACE the isLate function (if you're still using it)
  const isLate = (onDutyTime, detectedShift) => {
    if (!onDutyTime || !detectedShift) return false;

    const lateMinutes = calculateLateMinutesWithSelectedSchedules(
      onDutyTime,
      detectedShift,
      getActiveSchedules()
    );

    // Consider late if more than 0 minutes after shift start
    return lateMinutes > 0;
  };

  // Debug version of formatMinutesToHoursMinutes function
  const formatMinutesToHoursMinutes = (totalMinutes) => {
    console.log("=== formatMinutesToHoursMinutes Debug ===");
    console.log("Input totalMinutes:", totalMinutes);

    if (totalMinutes === 0) {
      console.log("Returning: 0m");
      return "0m";
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);

    console.log("Calculated hours:", hours);
    console.log("Calculated minutes:", minutes);

    let result;
    if (hours === 0) {
      result = `${minutes}m`;
    } else if (minutes === 0) {
      result = `${hours}h`;
    } else {
      result = `${hours}h ${minutes}m`;
    }

    console.log("Final formatted result:", result);
    console.log("=== End formatMinutesToHoursMinutes Debug ===");

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

  const handleScheduleConfirm = (selectedScheduleList) => {
    console.log("Schedule confirm called with:", selectedScheduleList);
    setSelectedSchedules(selectedScheduleList);
    setShowScheduleModal(false);

    // Refresh attendance data with new schedules if data exists
    if (attendanceData.length > 0) {
      refreshAttendanceDataWithNewSchedules();
    }

    toast.success(`${selectedScheduleList.length} schedules selected`);
  };

  const WarningModal = () => (
    <Modal
      show={showWarningModal}
      onHide={() => setShowWarningModal(false)}
      backdrop="static"
      keyboard={false}
      centered
      size="md"
    >
      <Modal.Header className="py-3 px-4 border-b">
        <Modal.Title
          as="h6"
          className="text-base text-orange-600 flex items-center gap-2"
        >
          Oops!
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-3">
        <p className="text-sm text-neutralDGray text-center flex items-center justify-center">
          Include attendance filter or select schedule first before uploading
          attendance file.
        </p>
      </Modal.Body>
      <Modal.Footer className="p-3">
        <button
          onClick={() => {
            setShowWarningModal(false);
            setShowScheduleModal(true);
          }}
          className="px-4 py-2 h-10 border text-neutralDGray hover:bg-green-400 hover:text-white rounded text-xs transition-all"
        >
          Select Schedules
        </button>
        <button
          onClick={() => setShowWarningModal(false)}
          className="px-4 py-2 h-10 border text-neutralDGray hover:bg-red-400 hover:text-white rounded text-xs transition-all"
        >
          Cancel
        </button>
      </Modal.Footer>
    </Modal>
  );

  useEffect(() => {
    // Only refresh if we have existing attendance data and schedules have changed
    if (attendanceData.length > 0 && selectedSchedules.length > 0) {
      console.log("Schedules changed, refreshing data...");
      refreshAttendanceDataWithNewSchedules();
    }
  }, [selectedSchedules]); // This will trigger when selectedSchedules changes

  const isLateWithSchedule = (onDutyTime, schedule) => {
    if (!onDutyTime || !schedule) return false;

    const [hours, minutes] = onDutyTime.split(":").map(Number);
    const onDutyMinutes = hours * 60 + minutes;
    const shiftStartMinutes = schedule.start * 60;

    if (schedule.value === "21-6") {
      // Night shift: late if arriving after 21:00 on same day
      if (onDutyMinutes >= shiftStartMinutes) {
        return onDutyMinutes > shiftStartMinutes;
      } else if (onDutyMinutes <= 6 * 60) {
        // Next day arrival (00:00 to 06:00) - on time for night shift
        return false;
      } else {
        // Arrival between 06:01-20:59 - very late
        return true;
      }
    } else {
      // Regular shifts
      return onDutyMinutes > shiftStartMinutes;
    }
  };

  const calculateLateMinutesWithSchedule = (onDutyTime, schedule) => {
    if (!onDutyTime || !schedule) return 0;

    const [hours, minutes] = onDutyTime.split(":").map(Number);
    const onDutyMinutes = hours * 60 + minutes;
    const shiftStartMinutes = schedule.start * 60;

    if (schedule.value === "21-6") {
      // Night shift
      if (onDutyMinutes >= shiftStartMinutes) {
        return Math.max(0, onDutyMinutes - shiftStartMinutes);
      } else if (onDutyMinutes <= 6 * 60) {
        // Next day arrival (00:00 to 06:00) - on time
        return 0;
      } else {
        // Very late - calculate from previous day's shift start
        return onDutyMinutes + (24 * 60 - shiftStartMinutes);
      }
    } else {
      // Regular shifts
      return Math.max(0, onDutyMinutes - shiftStartMinutes);
    }
  };

  const getActiveSchedules = () => {
    return selectedSchedules; // Just return selectedSchedules directly
  };

  // FIXED: handleFileUpload function with proper schedule validation
  // FIXED: Complete handleFileUpload function
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file.name);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Get current active schedules - don't default to defaultScheduleOptions
          const currentActiveSchedules =
            selectedSchedules.length > 0 ? selectedSchedules : []; // ← Changed: no default fallback

          console.log(
            "Active schedules for processing:",
            currentActiveSchedules
          );

          // Check if we have schedules selected
          if (currentActiveSchedules.length === 0) {
            toast.error(
              "Please select schedules first before uploading attendance file"
            );
            setSelectedFile(null);
            event.target.value = ""; // Clear the file input
            return;
          }

          // Process the Excel data
          const processedData = jsonData
            .map((row, index) => {
              console.log(`\n=== Processing Excel Row ${index + 1} ===`);
              console.log("Raw row data:", row);

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

              // Calculate work hours
              const workHours = calculateWorkHours(onDuty, offDuty);

              // FIXED: Determine shift first, then use it for attendance calculation
              const shift = determineShiftFromSchedules(
                onDuty,
                currentActiveSchedules
              );

              // FIXED: Calculate attendance value with schedule validation
              const attendanceValue = calculateAttendanceValue(
                onDuty,
                offDuty,
                shift
              );

              // FIXED: Enhanced status logic with schedule validation
              const status = calculateAttendanceStatus(onDuty, offDuty, shift);

              // FIXED: Calculate late minutes only if valid schedule match
              const lateMinutes =
                status !== "absent" && shift !== "No Schedule Match"
                  ? calculateLateMinutesWithSelectedSchedules(
                      onDuty,
                      shift,
                      currentActiveSchedules
                    )
                  : 0;

              // Check if late
              const late = lateMinutes > 0;

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

              console.log("Final processed record:", processedRecord);
              return processedRecord;
            })
            .filter((record) => {
              const isValid = record.date && record.ecode;
              if (!isValid) {
                console.log("Filtered out invalid record:", record);
              }
              return isValid;
            });

          console.log("Setting processed data:", processedData);
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

  const generateSummary = (data) => {
    console.log("=== generateSummary Debug ===");
    console.log("Total records:", data.length);
    console.log("Sample records:", data.slice(0, 3));

    const summary = {};

    data.forEach((record, index) => {
      console.log(`\n--- Processing record ${index + 1} ---`);
      console.log("Record:", {
        ecode: record.ecode,
        status: record.status,
        attendanceValue: record.attendanceValue,
        shift: record.shift,
        lateMinutes: record.lateMinutes,
        isLate: record.isLate,
      });

      const ecode = record.ecode;

      if (!summary[ecode]) {
        summary[ecode] = {
          ecode: ecode,
          totalDays: 0,
          presentDays: 0,
          halfDays: 0,
          absentDays: 0,
          lateDays: 0,
          totalLateMinutes: 0,
          dayShiftDays: 0,
          eveningShiftDays: 0,
          nightShiftDays: 0,
          totalWorkHours: 0,
        };
        console.log("Created new summary for:", ecode);
      }

      // Count total days
      summary[ecode].totalDays++;

      // Add work hours
      summary[ecode].totalWorkHours += record.workHours || 0;

      // FIXED: Add attendance value (0.5 for half-day, 1 for full day, 0 for absent)
      summary[ecode].presentDays += record.attendanceValue || 0;

      // Count half days
      if (record.status === "half-day") {
        summary[ecode].halfDays++;
      }

      // FIXED: Count shift-specific days using attendance value
      if (record.attendanceValue > 0 && record.shift) {
        const shiftValue = record.attendanceValue; // Use the actual attendance value

        if (
          record.shift.includes("Day Shift") ||
          record.shift.includes("Day")
        ) {
          summary[ecode].dayShiftDays += shiftValue;
        } else if (
          record.shift.includes("Evening Shift") ||
          record.shift.includes("Evening")
        ) {
          summary[ecode].eveningShiftDays += shiftValue;
        } else if (
          record.shift.includes("Night Shift") ||
          record.shift.includes("Night")
        ) {
          summary[ecode].nightShiftDays += shiftValue;
        }
      }

      // FIXED: Count late days and accumulate late minutes only for present/half-day employees
      if (record.status !== "absent") {
        if (record.isLate || record.lateMinutes > 0) {
          summary[ecode].lateDays++;
        }
        // Add late minutes to total
        summary[ecode].totalLateMinutes += record.lateMinutes || 0;
      }

      console.log(`Updated summary for ${ecode}:`, {
        totalDays: summary[ecode].totalDays,
        presentDays: summary[ecode].presentDays,
        halfDays: summary[ecode].halfDays,
        totalLateMinutes: summary[ecode].totalLateMinutes,
        dayShiftDays: summary[ecode].dayShiftDays,
        eveningShiftDays: summary[ecode].eveningShiftDays,
        nightShiftDays: summary[ecode].nightShiftDays,
      });
    });

    // Calculate absent days for each employee
    Object.values(summary).forEach((emp) => {
      emp.absentDays = emp.totalDays - emp.presentDays;

      console.log(`\nFinal summary for ${emp.ecode}:`);
      console.log("- Total days:", emp.totalDays);
      console.log("- Present days:", emp.presentDays);
      console.log("- Half days:", emp.halfDays);
      console.log("- Absent days:", emp.absentDays);
      console.log("- Late days:", emp.lateDays);
      console.log("- Total late minutes:", emp.totalLateMinutes);
      console.log("- Day shift days:", emp.dayShiftDays);
      console.log("- Evening shift days:", emp.eveningShiftDays);
      console.log("- Night shift days:", emp.nightShiftDays);
    });

    const finalSummary = Object.values(summary);
    console.log("\n=== Final Summary Array ===");
    console.log(finalSummary);
    console.log("=== End generateSummary Debug ===");

    setSummaryData(finalSummary);
  };

  // FIXED: refreshAttendanceDataWithNewSchedules function
  const refreshAttendanceDataWithNewSchedules = () => {
    if (attendanceData.length > 0) {
      console.log("Refreshing attendance data with new schedules...");

      // Get current active schedules
      const currentActiveSchedules =
        selectedSchedules.length > 0 ? selectedSchedules : [];

      // Reprocess existing attendance data with new schedules
      const reprocessedData = attendanceData.map((record) => {
        // Recalculate shift based on new schedules
        const shift = determineShiftFromSchedules(
          record.onDuty,
          currentActiveSchedules
        );

        // Recalculate attendance value with schedule validation
        const attendanceValue = calculateAttendanceValue(
          record.onDuty,
          record.offDuty,
          shift
        );

        // Recalculate status with schedule validation
        const status = calculateAttendanceStatus(
          record.onDuty,
          record.offDuty,
          shift
        );

        // Recalculate late minutes with new schedules
        const lateMinutes =
          status !== "absent" && shift !== "No Schedule Match"
            ? calculateLateMinutesWithSelectedSchedules(
                record.onDuty,
                shift,
                currentActiveSchedules
              )
            : 0;

        const late = lateMinutes > 0;

        return {
          ...record,
          shift,
          attendanceValue,
          status,
          lateMinutes,
          isLate: late,
        };
      });

      console.log("Reprocessed data with new schedules:", reprocessedData);
      setAttendanceData(reprocessedData);
      generateSummary(reprocessedData);
    }
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

      if (selectedSchedules.length === 0) {
        toast.error("Please select schedules first");
        return;
      }

      setLoading(true);

      try {
        // Get authentication token
        const token = localStorage.getItem("token");
        
        if (!token) {
          toast.error("Authentication token not found. Please log in again.");
          return;
        }

        // Step 1: Upload attendance Excel file to backend
        const formData = new FormData();
        formData.append("attendanceFile", file);

        console.log("Uploading file to:", `${import.meta.env.VITE_API_URL}/api/attendance/upload`);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/attendance/upload`,
          {
            method: "POST",
            headers: {
              'Authorization': `Bearer ${token}`,
              // Don't set Content-Type for FormData, let browser set it with boundary
            },
            body: formData,
          }
        );

        console.log("Upload response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Upload failed:", errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Upload result:", result);

        if (result.success) {
          toast.success("Attendance data uploaded successfully!");

          // Step 2: Send comprehensive attendance summary to /add-attendance-summary
          const summaryPayload = summaryData.map((row) => ({
            ecode: row.ecode,
            presentDays: row.presentDays,
            halfDays: row.halfDays,
            totalDays: row.totalDays,
            absentDays: row.absentDays,
            lateDays: row.lateDays || 0,
            totalLateMinutes: row.totalLateMinutes || 0,
            dayShiftDays: row.dayShiftDays || 0,
            eveningShiftDays: row.eveningShiftDays || 0,
            nightShiftDays: row.nightShiftDays || 0,
            totalWorkHours: row.totalWorkHours || 0,
          }));

          console.log("Sending summary payload:", summaryPayload);

          const summaryResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/api/attendance/add-attendance-summary`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({ summaryData: summaryPayload }),
            }
          );

          console.log("Summary response status:", summaryResponse.status);

          if (!summaryResponse.ok) {
            const errorText = await summaryResponse.text();
            console.error("Summary save failed:", errorText);
            throw new Error(`Summary save failed! status: ${summaryResponse.status}`);
          }

          const summaryResult = await summaryResponse.json();
          console.log("Summary result:", summaryResult);

          if (summaryResult.success) {
            toast.success(
              `Summary saved successfully! Created: ${summaryResult.created}, Updated: ${summaryResult.updated}`
            );
            setShowModal(true);
            
            // Clear the form
            setSelectedFile(null);
            setAttendanceData([]);
            setSummaryData([]);
            fileInput.value = "";
            
            // Optionally fetch updated data
            // fetchAttendanceData();
          } else {
            toast.error(summaryResult.message || "Failed to save attendance summary");
            console.error("Summary save error:", summaryResult);
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
        
        // More specific error messages
        if (error.message.includes('401')) {
          toast.error("Authentication failed. Please log in again.");
          // Optionally redirect to login
          // navigate('/login');
        } else if (error.message.includes('413')) {
          toast.error("File too large. Please use a smaller file.");
        } else if (error.message.includes('422')) {
          toast.error("Invalid file format. Please use .xlsx or .xls files.");
        } else if (error.message.includes('500')) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error("An error occurred while saving attendance: " + error.message);
        }
      } finally {
        setLoading(false);
      }
    };

  const handleUploadClick = () => {
    if (selectedSchedules.length === 0) {
      setShowWarningModal(true);
      return;
    }
    // Trigger file input click
    document.querySelector('input[type="file"]').click();
  };

  // FIXED: fetchAttendanceData function
  const fetchAttendanceData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/attendance/get-attendance`
      );
      if (!response.ok) throw new Error("Failed to fetch attendance data");

      const data = await response.json();
      if (data.success) {
        // Get current active schedules - don't default to defaultScheduleOptions
        const currentActiveSchedules =
          selectedSchedules.length > 0 ? selectedSchedules : []; // ← Changed: no default fallback

        console.log(
          "Active schedules for fetched data processing:",
          currentActiveSchedules
        );
        // ... rest of the function remains the same
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
            { label: "Attendance" },
            { label: "Add Attendance", href: "/admin-dashboard/attendance" },
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
            <div className="flex items-center gap-2">
              {selectedSchedules.length > 0 && (
                <div className="flex items-center border rounded p-1 gap-2">
                  <span className="text-xs text-green-600">
                    Active Schedules:
                  </span>
                  <div className="flex gap-1">
                    {selectedSchedules.slice(0, 2).map((schedule, index) => (
                      <span
                        key={schedule.id}
                        className="px-2 py-1 bg-green-100 h-6 flex justify-center items-center text-green-800 rounded text-xs"
                      >
                        {schedule.label}
                      </span>
                    ))}
                    {selectedSchedules.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{selectedSchedules.length - 2} more
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="text-xs border text-neutralDGray w-fit h-6 flex items-center justify-center p-2 rounded hover:bg-blue-400 hover:text-white transition-all duration-300"
                  >
                    Manage
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between border border-neutralDGray rounded-md p-2 bg-slate-50">
            <div className="flex items-center gap-3">
              <button
                onClick={handleUploadClick}
                className="px-4 text-xs py-2 h-8 border hover:bg-green-400 hover:text-white text-neutralDGray rounded-md cursor-pointer"
              >
                Upload File
              </button>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <span className="text-xs text-neutralDGray">
              {selectedFile || "No file selected"}
            </span>
            <button
              onClick={handleSubmit}
              disabled={loading || selectedSchedules.length === 0}
              className={`px-4 text-xs py-2 h-auto border rounded-md cursor-pointer transition-all ${
                loading || selectedSchedules.length === 0
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "hover:bg-green-400 hover:text-white text-neutralDGray"
              }`}
            >
              {loading ? "Saving..." : "Save Attendance"}
            </button>
          </div>
        </div>
        <ScheduleSelectionModal
          show={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          schedules={allSchedules}
          defaultSelected={selectedSchedules} // Use selectedSchedules instead of activeSchedules
          onAddSchedule={(schedule) =>
            setAllSchedules((prev) => [...prev, schedule])
          }
          onRemoveSchedule={(id) => {
            setAllSchedules((prev) => prev.filter((s) => s.id !== id));
            // Also remove from selected if it was selected
            setSelectedSchedules((prev) => prev.filter((s) => s.id !== id));
          }}
          onConfirm={handleScheduleConfirm} // Make sure this is called correctly
        />
        <WarningModal />

        <div className="grid mt-2 grid-cols-2 gap-2">
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
                dense
                paginationPerPage={15}
                fixedHeader
                fixedHeaderScrollHeight="500px"
                paginationRowsPerPageOptions={[15, 25, 50]}
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
                dense
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
    </div>
  );
};

export default Attendance;