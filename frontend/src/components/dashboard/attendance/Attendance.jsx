// Enhanced Attendance.jsx - Added undertime calculation based on shift schedules

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

  // Philippine Labor Law Constants
  const REGULAR_HOURS_LIMIT = 8;
  const NIGHT_SHIFT_START = 22; // 10:00 PM
  const NIGHT_SHIFT_END = 6;    // 6:00 AM
  const NIGHT_DIFFERENTIAL_RATE = 0.10; // 10% night differential

  const defaultScheduleOptions = [
    {
      id: 1,
      value: "8-17",
      label: "Day Shift (8AM-5PM)",
      start: 8,
      end: 17,
      expectedHours: 8, // Expected work hours for this shift
      isDefault: true,
    },
    {
      id: 2,
      value: "17-21",
      label: "Evening Shift (5PM-9PM)",
      start: 17,
      end: 21,
      expectedHours: 4, // 4-hour shift
      isDefault: true,
    },
    {
      id: 3,
      value: "21-6",
      label: "Night Shift (9PM-6AM)",
      start: 21,
      end: 6,
      expectedHours: 8, // 8-hour overnight shift (21:00 to 06:00 = 9 hours - 1 hour break = 8 hours)
      isDefault: true,
    },
  ];

  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [allSchedules, setAllSchedules] = useState(defaultScheduleOptions);

  // 1. Fix the getExpectedHoursForShift function - it's not matching shifts properly
  const getExpectedHoursForShift = (detectedShift, scheduleList) => {
    if (!detectedShift || detectedShift === "No Schedule Match" || detectedShift === "Unknown") {
      return 8; // Default to 8 hours if no shift detected
    }

    // Better matching logic - look for exact schedule match
    const matchingSchedule = scheduleList.find((schedule) => {
      // Direct match
      if (detectedShift === schedule.label) return true;
      
      // Partial match - check if shift contains schedule label parts
      if (detectedShift.includes("Day") && schedule.label.includes("Day")) return true;
      if (detectedShift.includes("Evening") && schedule.label.includes("Evening")) return true;
      if (detectedShift.includes("Night") && schedule.label.includes("Night")) return true;
      
      // Check time range match (e.g., "8-17" matches "Day Shift (8AM-5PM)")
      if (schedule.value && detectedShift.includes(schedule.value)) return true;
      
      return false;
    });

    console.log(`Shift: ${detectedShift}, Matching Schedule:`, matchingSchedule);
    return matchingSchedule ? matchingSchedule.expectedHours : 8;
  };


  // 2. Fix the calculateUndertimeMinutes function - simplify and debug
  const calculateUndertimeMinutes = (onDutyTime, offDutyTime, detectedShift, scheduleList) => {
    console.log("=== UNDERTIME CALCULATION DEBUG ===");
    console.log("Input params:", { onDutyTime, offDutyTime, detectedShift });
    
    if (!onDutyTime || !offDutyTime) {
      console.log("Missing time data, returning 0");
      return 0;
    }

    if (!detectedShift || detectedShift === "No Schedule Match" || detectedShift === "Unknown") {
      console.log("No valid shift detected, returning 0");
      return 0;
    }

    // Get expected hours for this shift
    const expectedHours = getExpectedHoursForShift(detectedShift, scheduleList);
    const expectedMinutes = expectedHours * 60;
    console.log(`Expected: ${expectedHours}h (${expectedMinutes}min)`);

    // Calculate actual work time
    const [onHours, onMinutes] = onDutyTime.split(":").map(Number);
    const [offHours, offMinutes] = offDutyTime.split(":").map(Number);

    const onDutyMinutes = onHours * 60 + onMinutes;
    let offDutyMinutes = offHours * 60 + offMinutes;

    // Handle overnight shifts
    if (offDutyMinutes < onDutyMinutes) {
      offDutyMinutes += 24 * 60;
    }

    let actualWorkMinutes = offDutyMinutes - onDutyMinutes;
    console.log(`Raw work time: ${actualWorkMinutes}min`);
    
    // Deduct break time for shifts longer than 6 hours
    const BREAK_TIME_MINUTES = 60;
    const BREAK_THRESHOLD_MINUTES = 360; // 6 hours
    
    if (actualWorkMinutes > BREAK_THRESHOLD_MINUTES) {
      actualWorkMinutes = actualWorkMinutes - BREAK_TIME_MINUTES;
      console.log(`After break deduction: ${actualWorkMinutes}min`);
    }

    // Calculate undertime
    const undertimeMinutes = Math.max(0, expectedMinutes - actualWorkMinutes);
    console.log(`Final undertime: ${undertimeMinutes}min`);
    console.log("=== END UNDERTIME DEBUG ===");
    
    return undertimeMinutes;
  };

  // Core calculation functions
  const calculateNightDifferentialHours = (onDutyTime, offDutyTime) => {
    if (!onDutyTime || !offDutyTime) return 0;

    const [onHours, onMinutes] = onDutyTime.split(":").map(Number);
    const [offHours, offMinutes] = offDutyTime.split(":").map(Number);

    let onDutyMinutes = onHours * 60 + onMinutes;
    let offDutyMinutes = offHours * 60 + offMinutes;

    // Handle overnight shifts
    if (offDutyMinutes < onDutyMinutes) {
      offDutyMinutes += 24 * 60;
    }

    const nightStartMinutes = NIGHT_SHIFT_START * 60;
    const nightEndMinutes = NIGHT_SHIFT_END * 60;
    const nextDayNightEndMinutes = nightEndMinutes + 24 * 60;

    let nightHours = 0;

    if (offDutyMinutes <= 24 * 60) {
      // Same day shift
      if (onDutyMinutes >= nightStartMinutes) {
        nightHours = Math.min(offDutyMinutes, 24 * 60) - onDutyMinutes;
      } else if (offDutyMinutes > nightStartMinutes) {
        nightHours = Math.min(offDutyMinutes, 24 * 60) - nightStartMinutes;
      }
    } else {
      // Overnight shift
      if (onDutyMinutes >= nightStartMinutes) {
        nightHours += 24 * 60 - onDutyMinutes;
      } else {
        nightHours += 24 * 60 - nightStartMinutes;
      }

      if (offDutyMinutes <= nextDayNightEndMinutes) {
        nightHours += offDutyMinutes - 24 * 60;
      } else {
        nightHours += nightEndMinutes;
      }
    }

    return Math.max(0, nightHours / 60);
  };

  // Helper function to convert minutes to hours and minutes object
  const minutesToHoursMinutes = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes, totalMinutes };
  };

  // Helper function to convert hours/minutes back to decimal for display
  const hoursMinutesToDecimal = (hours, minutes) => {
    return hours + (minutes / 60);
  };

  // 3. Fix the calculateWorkHoursBreakdown function - ensure it properly calls undertime calculation
  const calculateWorkHoursBreakdown = (onDutyTime, offDutyTime, isHoliday = false, isRestDay = false, detectedShift = null, scheduleList = []) => {
    if (!onDutyTime || !offDutyTime) {
      return {
        totalMinutes: 0,
        totalHours: 0,
        regularMinutes: 0,
        regularHours: 0,
        overtimeMinutes: 0,
        overtimeHours: 0,
        nightDifferentialMinutes: 0,
        nightDifferentialHours: 0,
        holidayMinutes: 0,
        holidayHours: 0,
        holidayOvertimeMinutes: 0,
        holidayOvertimeHours: 0,
        restDayMinutes: 0,
        restDayHours: 0,
        restDayOvertimeMinutes: 0,
        restDayOvertimeHours: 0,
        undertimeMinutes: 0,
        undertimeHours: 0,
        expectedHours: 0,
      };
    }

    const [onHours, onMinutes] = onDutyTime.split(":").map(Number);
    const [offHours, offMinutes] = offDutyTime.split(":").map(Number);

    const onDutyMinutes = onHours * 60 + onMinutes;
    let offDutyMinutes = offHours * 60 + offMinutes;

    if (offDutyMinutes < onDutyMinutes) {
      offDutyMinutes += 24 * 60;
    }

    let totalMinutes = offDutyMinutes - onDutyMinutes;
    
    // Deduct 1-hour (60 minutes) break for shifts longer than 6 hours (360 minutes)
    const BREAK_TIME_MINUTES = 60;
    const BREAK_THRESHOLD_MINUTES = 360; // 6 hours
    
    if (totalMinutes > BREAK_THRESHOLD_MINUTES) {
      totalMinutes = totalMinutes - BREAK_TIME_MINUTES;
    }

    // Calculate night differential in minutes (precise)
    const nightDifferentialMinutes = calculateNightDifferentialMinutes(onDutyTime, offDutyTime);
    
    // Get expected hours for shift
    const expectedHours = getExpectedHoursForShift(detectedShift, scheduleList);
    
    // FIXED: Use the dedicated undertime calculation function
    const undertimeMinutes = calculateUndertimeMinutes(onDutyTime, offDutyTime, detectedShift, scheduleList);
    
    // Base working minutes (for regular/overtime calculation)
    let baseMinutes = Math.max(0, totalMinutes);
    
    const REGULAR_HOURS_LIMIT_MINUTES = 8 * 60; // 480 minutes = 8 hours

    let breakdown = {
      totalMinutes: Math.max(0, totalMinutes),
      totalHours: hoursMinutesToDecimal(Math.floor(totalMinutes / 60), totalMinutes % 60),
      regularMinutes: 0,
      regularHours: 0,
      overtimeMinutes: 0,
      overtimeHours: 0,
      nightDifferentialMinutes: nightDifferentialMinutes,
      nightDifferentialHours: hoursMinutesToDecimal(Math.floor(nightDifferentialMinutes / 60), nightDifferentialMinutes % 60),
      holidayMinutes: 0,
      holidayHours: 0,
      holidayOvertimeMinutes: 0,
      holidayOvertimeHours: 0,
      restDayMinutes: 0,
      restDayHours: 0,
      restDayOvertimeMinutes: 0,
      restDayOvertimeHours: 0,
      undertimeMinutes: undertimeMinutes, // FIXED: Use calculated undertime
      undertimeHours: hoursMinutesToDecimal(Math.floor(undertimeMinutes / 60), undertimeMinutes % 60),
      expectedHours: expectedHours,
    };

    // Rest of the breakdown logic for regular/overtime/holiday/rest day calculations...
    if (totalMinutes > 0) {
      if (isHoliday) {
        if (baseMinutes <= REGULAR_HOURS_LIMIT_MINUTES) {
          breakdown.holidayMinutes = baseMinutes;
          breakdown.holidayHours = hoursMinutesToDecimal(Math.floor(baseMinutes / 60), baseMinutes % 60);
        } else {
          breakdown.holidayMinutes = REGULAR_HOURS_LIMIT_MINUTES;
          breakdown.holidayHours = 8;
          breakdown.holidayOvertimeMinutes = baseMinutes - REGULAR_HOURS_LIMIT_MINUTES;
          breakdown.holidayOvertimeHours = hoursMinutesToDecimal(
            Math.floor((baseMinutes - REGULAR_HOURS_LIMIT_MINUTES) / 60), 
            (baseMinutes - REGULAR_HOURS_LIMIT_MINUTES) % 60
          );
        }
      } else if (isRestDay) {
        if (baseMinutes <= REGULAR_HOURS_LIMIT_MINUTES) {
          breakdown.restDayMinutes = baseMinutes;
          breakdown.restDayHours = hoursMinutesToDecimal(Math.floor(baseMinutes / 60), baseMinutes % 60);
        } else {
          breakdown.restDayMinutes = REGULAR_HOURS_LIMIT_MINUTES;
          breakdown.restDayHours = 8;
          breakdown.restDayOvertimeMinutes = baseMinutes - REGULAR_HOURS_LIMIT_MINUTES;
          breakdown.restDayOvertimeHours = hoursMinutesToDecimal(
            Math.floor((baseMinutes - REGULAR_HOURS_LIMIT_MINUTES) / 60), 
            (baseMinutes - REGULAR_HOURS_LIMIT_MINUTES) % 60
          );
        }
      } else {
        // Regular working day
        if (baseMinutes <= REGULAR_HOURS_LIMIT_MINUTES) {
          breakdown.regularMinutes = baseMinutes;
          breakdown.regularHours = hoursMinutesToDecimal(Math.floor(baseMinutes / 60), baseMinutes % 60);
        } else {
          breakdown.regularMinutes = REGULAR_HOURS_LIMIT_MINUTES;
          breakdown.regularHours = 8;
          breakdown.overtimeMinutes = baseMinutes - REGULAR_HOURS_LIMIT_MINUTES;
          breakdown.overtimeHours = hoursMinutesToDecimal(
            Math.floor((baseMinutes - REGULAR_HOURS_LIMIT_MINUTES) / 60), 
            (baseMinutes - REGULAR_HOURS_LIMIT_MINUTES) % 60
          );
        }
      }
    }

    console.log("Final breakdown with undertime:", breakdown);
    return breakdown;
  };


  


  // Precise night differential calculation in minutes
  const calculateNightDifferentialMinutes = (onDutyTime, offDutyTime) => {
    if (!onDutyTime || !offDutyTime) return 0;

    const [onHours, onMinutes] = onDutyTime.split(":").map(Number);
    const [offHours, offMinutes] = offDutyTime.split(":").map(Number);

    let onDutyMinutes = onHours * 60 + onMinutes;
    let offDutyMinutes = offHours * 60 + offMinutes;

    // Handle overnight shifts
    if (offDutyMinutes < onDutyMinutes) {
      offDutyMinutes += 24 * 60;
    }

    const nightStartMinutes = 22 * 60; // 10:00 PM
    const nightEndMinutes = 6 * 60;    // 6:00 AM
    const nextDayNightEndMinutes = nightEndMinutes + 24 * 60;

    let nightMinutes = 0;

    if (offDutyMinutes <= 24 * 60) {
      // Same day shift
      if (onDutyMinutes >= nightStartMinutes) {
        nightMinutes = Math.min(offDutyMinutes, 24 * 60) - onDutyMinutes;
      } else if (offDutyMinutes > nightStartMinutes) {
        nightMinutes = Math.min(offDutyMinutes, 24 * 60) - nightStartMinutes;
      }
    } else {
      // Overnight shift
      if (onDutyMinutes >= nightStartMinutes) {
        nightMinutes += 24 * 60 - onDutyMinutes;
      } else {
        nightMinutes += 24 * 60 - nightStartMinutes;
      }

      if (offDutyMinutes <= nextDayNightEndMinutes) {
        nightMinutes += offDutyMinutes - 24 * 60;
      } else {
        nightMinutes += nightEndMinutes;
      }
    }

    return Math.max(0, nightMinutes);
  };

  // Updated attendance status calculation using precise minutes
  const calculateAttendanceStatus = (onDutyTime, offDutyTime, detectedShift) => {
    if (!offDutyTime) {
      return "absent";
    }

    if (!detectedShift || detectedShift === "No Schedule Match" || detectedShift === "Unknown") {
      return "absent";
    }

    const breakdown = calculateWorkHoursBreakdown(onDutyTime, offDutyTime, false, false, detectedShift, selectedSchedules);
    const regularMinutes = breakdown.regularMinutes;

    if (regularMinutes >= 480) { // 8 hours = 480 minutes
      return "present";
    } else if (regularMinutes >= 240) { // 4 hours = 240 minutes
      return "half-day";
    }

    return "absent";
  };

  // Updated attendance value calculation using precise minutes
  const calculateAttendanceValue = (onDutyTime, offDutyTime, detectedShift) => {
    if (!offDutyTime) return 0;

    if (!detectedShift || detectedShift === "No Schedule Match" || detectedShift === "Unknown") {
      return 0;
    }

    const breakdown = calculateWorkHoursBreakdown(onDutyTime, offDutyTime, false, false, detectedShift, selectedSchedules);
    const regularMinutes = breakdown.regularMinutes;

    // Half-day if regular minutes >= 240 (4 hours), full day if >= 480 (8 hours)
    if (regularMinutes >= 480) {
      return 1; // Full day
    } else if (regularMinutes >= 240) {
      return 0.5; // Half day
    }

    return 0; // Absent (less than 4 hours)
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
    return workMinutes / 60;
  };

  const determineShiftFromSchedules = (onDutyTime, selectedScheduleList) => {
    if (!onDutyTime || selectedScheduleList.length === 0) return "No Schedule Match";

    const [hours, minutes] = onDutyTime.split(":").map(Number);
    const onDutyHour = hours + minutes / 60;

    const matchingSchedules = [];

    for (const schedule of selectedScheduleList) {
      let isWithinRange = false;
      let tolerance = 1;

      if (schedule.end < schedule.start) {
        // Overnight shift
        if (onDutyHour >= schedule.start - tolerance || onDutyHour <= schedule.end + tolerance) {
          isWithinRange = true;
        }
      } else {
        // Regular shift
        if (onDutyHour >= schedule.start - tolerance && onDutyHour <= schedule.end + tolerance) {
          isWithinRange = true;
        }
      }

      if (isWithinRange) {
        matchingSchedules.push(schedule);
      }
    }

    if (matchingSchedules.length === 0) {
      return "No Schedule Match";
    }

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

    return bestMatch.label;
  };

  const getShiftBadgeColor = (shift) => {
    if (shift.includes("Day Shift")) return "bg-blue-100 text-blue-800";
    if (shift.includes("Evening Shift")) return "bg-orange-100 text-orange-800";
    if (shift.includes("Night Shift")) return "bg-purple-100 text-purple-800";
    return "bg-gray-100 text-gray-800";
  };

  const convertExcelTimeToString = (excelTime) => {
    if (!excelTime || excelTime === "" || isNaN(excelTime)) {
      return null;
    }

    const numericValue = Number(excelTime);
    
    if (numericValue < 0 || numericValue >= 1) {
      return null;
    }

    const totalMinutes = Math.round(numericValue * 24 * 60);
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  const calculateLateMinutesWithSelectedSchedules = (onDutyTime, detectedShift, selectedScheduleList) => {
    if (!onDutyTime || !detectedShift || selectedScheduleList.length === 0) return 0;

    const matchingSchedule = selectedScheduleList.find(
      (schedule) => detectedShift.includes(schedule.label) || schedule.label.includes(detectedShift.split(" ")[0])
    );

    if (!matchingSchedule) return 0;

    const [hours, minutes] = onDutyTime.split(":").map(Number);
    const onDutyMinutes = hours * 60 + minutes;
    const shiftStartMinutes = matchingSchedule.start * 60;

    if (matchingSchedule.value === "21-6" || matchingSchedule.end < matchingSchedule.start) {
      if (onDutyMinutes >= shiftStartMinutes) {
        return Math.max(0, onDutyMinutes - shiftStartMinutes);
      } else if (onDutyMinutes <= matchingSchedule.end * 60) {
        return 0;
      } else {
        return onDutyMinutes + (24 * 60 - shiftStartMinutes);
      }
    } else {
      return Math.max(0, onDutyMinutes - shiftStartMinutes);
    }
  };

  const formatMinutesToHoursMinutes = (totalMinutes) => {
    if (totalMinutes === 0) {
      return "0m";
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);

    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  };

  // Enhanced column definitions with payroll breakdown and undertime
  const attendanceColumns = [
    {
      name: "E-Code",
      selector: (row) => row.ecode,
      sortable: true,
      width: "90px",
    },
    {
      name: "Date",
      selector: (row) => new Date(row.date).toLocaleDateString(),
      sortable: true,
      width: "90px",
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
      name: "Total Hours",
      selector: (row) => row.workHours?.toFixed(1) || "0.0",
      width: "90px",
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
      name: "Expected Hours",
      selector: (row) => row.hoursBreakdown?.expectedHours || "8.0",
      width: "100px",
      cell: (row) => (
        <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
          {row.hoursBreakdown?.expectedHours || "8.0"}h
        </span>
      ),
    },
    {
      name: "Regular Hours",
      selector: (row) => row.hoursBreakdown?.regularHours?.toFixed(1) || "0.0",
      width: "100px",
      cell: (row) => (
        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
          {(row.status === "absent" ? "0.0" : row.hoursBreakdown?.regularHours?.toFixed(1)) || "0.0"}h
        </span>
      ),
    },
    {
      name: "OT Hours",
      selector: (row) => row.hoursBreakdown?.overtimeHours?.toFixed(1) || "0.0",
      width: "85px",
      cell: (row) => (
        <span className="px-2 py-1 rounded text-xs bg-orange-100 text-orange-800">
          {(row.status === "absent" ? "0.0" : row.hoursBreakdown?.overtimeHours?.toFixed(1)) || "0.0"}h
        </span>
      ),
    },
    {
      name: "Undertime",
      selector: (row) => row.hoursBreakdown?.undertimeHours?.toFixed(1) || "0.0",
      width: "90px",
      cell: (row) => (
        <span className={`px-2 py-1 rounded text-xs ${
          row.hoursBreakdown?.undertimeHours > 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
        }`}>
          {row.hoursBreakdown?.undertimeHours?.toFixed(1) || "0.0"}h
        </span>
      ),
    },
    {
      name: "Night Diff",
      selector: (row) => row.hoursBreakdown?.nightDifferentialHours?.toFixed(1) || "0.0",
      width: "85px",
      cell: (row) => (
        <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
          {row.hoursBreakdown?.nightDifferentialHours?.toFixed(1) || "0.0"}h
        </span>
      ),
    },
    {
      name: "Holiday Hours",
      selector: (row) => row.hoursBreakdown?.holidayHours?.toFixed(1) || "0.0",
      width: "100px",
      cell: (row) => (
        <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
          {row.hoursBreakdown?.holidayHours?.toFixed(1) || "0.0"}h
        </span>
      ),
    },
    {
      name: "Shift",
      selector: (row) => row.shift || "Unknown",
      width: "120px",
      cell: (row) => (
        <span className={`px-2 py-1 rounded text-xs ${getShiftBadgeColor(row.shift || "Unknown")}`}>
          {(row.shift || "Unknown").split(" (")[0]}
        </span>
      ),
    },
    {
      name: "Status",
      selector: (row) => row.status,
      width: "90px",
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
      name: "Late (min)",
      selector: (row) => row.lateMinutes,
      width: "80px",
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

  // Enhanced summary columns with payroll breakdown and undertime
  const summaryColumns = [
    {
      name: "E-Code",
      selector: (row) => row.ecode,
      sortable: true,
      width: "80px",
    },
    {
      name: "Total Days",
      selector: (row) => row.totalDays,
      width: "90px",
    },
    {
      name: "Present",
      selector: (row) => row.presentDays?.toFixed(1) || "0.0",
      width: "80px",
      cell: (row) => (
        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
          {row.presentDays?.toFixed(1) || "0.0"}
        </span>
      ),
    },
    {
      name: "Regular Hours",
      selector: (row) => row.totalRegularHours?.toFixed(1) || "0.0",
      width: "110px",
      cell: (row) => (
        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
          {row.totalRegularHours?.toFixed(1) || "0.0"}h
        </span>
      ),
    },
    {
      name: "OT Hours",
      selector: (row) => row.totalOvertimeHours?.toFixed(1) || "0.0",
      width: "90px",
      cell: (row) => (
        <span className="px-2 py-1 rounded text-xs bg-orange-100 text-orange-800">
          {row.totalOvertimeHours?.toFixed(1) || "0.0"}h
        </span>
      ),
    },
    {
      name: "Undertime (h:m)",
      selector: (row) => formatMinutesToHoursMinutes(row.totalUndertimeMinutes),
      width: "110px",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            row.totalUndertimeMinutes > 0
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {formatMinutesToHoursMinutes(row.totalUndertimeMinutes)}
        </span>
      ),
    },
    {
      name: "Night Diff Hours",
      selector: (row) => row.totalNightDifferentialHours?.toFixed(1) || "0.0",
      width: "125px",
      cell: (row) => (
        <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
          {row.totalNightDifferentialHours?.toFixed(1) || "0.0"}h
        </span>
      ),
    },
    {
      name: "Holiday Hours",
      selector: (row) => row.totalHolidayHours?.toFixed(1) || "0.0",
      width: "105px",
      cell: (row) => (
        <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
          {row.totalHolidayHours?.toFixed(1) || "0.0"}h
        </span>
      ),
    },
    {
      name: "Rest Day Hours",
      selector: (row) => row.totalRestDayHours?.toFixed(1) || "0.0",
      width: "115px",
      cell: (row) => (
        <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
          {row.totalRestDayHours?.toFixed(1) || "0.0"}h
        </span>
      ),
    },
    {
      name: "Late (h:m)",
      selector: (row) => formatMinutesToHoursMinutes(row.totalLateMinutes),
      width: "90px",
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
      width: "100px",
    },
  ];

  const handleScheduleConfirm = (selectedScheduleList) => {
    setSelectedSchedules(selectedScheduleList);
    setShowScheduleModal(false);

    if (attendanceData.length > 0) {
      refreshAttendanceDataWithNewSchedules();
    }

    toast.success(`${selectedScheduleList.length} schedules selected`);
  };

  const WarningModal = () => (
    <Modal show={showWarningModal} onHide={() => setShowWarningModal(false)} backdrop="static" keyboard={false} centered size="md">
      <Modal.Header className="py-3 px-4 border-b">
        <Modal.Title as="h6" className="text-base text-orange-600 flex items-center gap-2">
          Oops!
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-3">
        <p className="text-sm text-neutralDGray text-center flex items-center justify-center">
          Include attendance filter or select schedule first before uploading attendance file.
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
    if (attendanceData.length > 0 && selectedSchedules.length > 0) {
      refreshAttendanceDataWithNewSchedules();
    }
  }, [selectedSchedules]);

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

          const currentActiveSchedules = selectedSchedules.length > 0 ? selectedSchedules : [];

          if (currentActiveSchedules.length === 0) {
            toast.error("Please select schedules first before uploading attendance file");
            setSelectedFile(null);
            event.target.value = "";
            return;
          }

          const processedData = jsonData.map((row, index) => {
            let formattedDate = "";
            const dateRaw = row.Date || row.date || "";

            if (!isNaN(dateRaw) && Number(dateRaw) > 0) {
              const excelDate = new Date((Number(dateRaw) - 25569) * 86400 * 1000);
              formattedDate = excelDate.toISOString().split("T")[0];
            } else if (dateRaw) {
              const parsedDate = new Date(dateRaw);
              if (!isNaN(parsedDate)) {
                formattedDate = parsedDate.toISOString().split("T")[0];
              }
            }

            const ecode = String(row.Name || row.name || "").trim();

            const onDutyRaw = row["ON Duty"] || row["on duty"] || row["onDuty"] || null;
            const offDutyRaw = row["OFF Duty"] || row["off duty"] || row["offDuty"] || null;

            const onDuty = convertExcelTimeToString(onDutyRaw);
            const offDuty = convertExcelTimeToString(offDutyRaw);

            const isHoliday = Boolean(row.Holiday || row.holiday || false);
            const isRestDay = Boolean(row.RestDay || row.restDay || row["Rest Day"] || false);

            const workHours = calculateWorkHours(onDuty, offDuty);
            const shift = determineShiftFromSchedules(onDuty, currentActiveSchedules);
            const hoursBreakdown = calculateWorkHoursBreakdown(onDuty, offDuty, isHoliday, isRestDay, shift, currentActiveSchedules);
            const attendanceValue = calculateAttendanceValue(onDuty, offDuty, shift);
            const status = calculateAttendanceStatus(onDuty, offDuty, shift);
            const lateMinutes = status !== "absent" && shift !== "No Schedule Match" 
              ? calculateLateMinutesWithSelectedSchedules(onDuty, shift, currentActiveSchedules) 
              : 0;
            const late = lateMinutes > 0;

            const processedRecord = {
              id: index + 1,
              ecode,
              date: formattedDate,
              onDuty,
              offDuty,
              workHours,
              hoursBreakdown,
              attendanceValue,
              shift,
              status,
              isLate: late,
              lateMinutes: lateMinutes,
              isHoliday,
              isRestDay,
            };

            return processedRecord;
          }).filter((record) => {
            return record.date && record.ecode;
          });

          setAttendanceData(processedData);
          generateSummary(processedData);
        } catch (error) {
          toast.error("Error reading Excel file. Please check the format.");
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Enhanced summary generation that includes undertime tracking
  const generateSummary = (data) => {
    console.log("=== generateSummary Debug (With Undertime) ===");
    console.log("Total records:", data.length);

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
        hoursBreakdown: record.hoursBreakdown,
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
          totalUndertimeMinutes: 0, // New field for undertime tracking
          dayShiftDays: 0,
          eveningShiftDays: 0,
          nightShiftDays: 0,
          totalWorkHours: 0,
          // Payroll tracking (only for non-absent days)
          totalRegularHours: 0,
          totalOvertimeHours: 0,
          totalNightDifferentialHours: 0,
          totalHolidayHours: 0,
          totalHolidayOvertimeHours: 0,
          totalRestDayHours: 0,
          totalRestDayOvertimeHours: 0,
        };
        console.log("Created new summary for:", ecode);
      }

      // Count total days
      summary[ecode].totalDays++;

      // Only add payroll hours for non-absent employees
      if (record.status !== "absent") {
        // Add work hours
        summary[ecode].totalWorkHours += record.workHours || 0;
        
        // Add attendance value (0.5 for half-day, 1 for full day)
        summary[ecode].presentDays += record.attendanceValue || 0;

        // Count half days
        if (record.status === "half-day") {
          summary[ecode].halfDays++;
        }

        // Add payroll hours breakdown (only for non-absent)
        if (record.hoursBreakdown) {
          summary[ecode].totalRegularHours += record.hoursBreakdown.regularHours || 0;
          summary[ecode].totalOvertimeHours += record.hoursBreakdown.overtimeHours || 0;
          summary[ecode].totalNightDifferentialHours += record.hoursBreakdown.nightDifferentialHours || 0;
          summary[ecode].totalHolidayHours += record.hoursBreakdown.holidayHours || 0;
          summary[ecode].totalHolidayOvertimeHours += record.hoursBreakdown.holidayOvertimeHours || 0;
          summary[ecode].totalRestDayHours += record.hoursBreakdown.restDayHours || 0;
          summary[ecode].totalRestDayOvertimeHours += record.hoursBreakdown.restDayOvertimeHours || 0;
          
          // Add undertime tracking
          summary[ecode].totalUndertimeMinutes += record.hoursBreakdown.undertimeMinutes || 0;
        }

        // Count shift-specific days using attendance value
        if (record.attendanceValue > 0 && record.shift) {
          const shiftValue = record.attendanceValue;

          if (record.shift.includes("Day Shift") || record.shift.includes("Day")) {
            summary[ecode].dayShiftDays += shiftValue;
          } else if (record.shift.includes("Evening Shift") || record.shift.includes("Evening")) {
            summary[ecode].eveningShiftDays += shiftValue;
          } else if (record.shift.includes("Night Shift") || record.shift.includes("Night")) {
            summary[ecode].nightShiftDays += shiftValue;
          }
        }

        // Count late days and accumulate late minutes only for present/half-day employees
        if (record.isLate || record.lateMinutes > 0) {
          summary[ecode].lateDays++;
        }
        // Add late minutes to total
        summary[ecode].totalLateMinutes += record.lateMinutes || 0;
      } else {
        // For absent employees, still track undertime based on expected hours
        if (record.hoursBreakdown && record.hoursBreakdown.expectedHours > 0) {
          const expectedMinutes = record.hoursBreakdown.expectedHours * 60;
          summary[ecode].totalUndertimeMinutes += expectedMinutes;
        }
      }

      console.log(`Updated summary for ${ecode}:`, {
        totalDays: summary[ecode].totalDays,
        presentDays: summary[ecode].presentDays,
        halfDays: summary[ecode].halfDays,
        totalLateMinutes: summary[ecode].totalLateMinutes,
        totalUndertimeMinutes: summary[ecode].totalUndertimeMinutes,
        totalRegularHours: summary[ecode].totalRegularHours,
        totalOvertimeHours: summary[ecode].totalOvertimeHours,
        status: record.status
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
      console.log("- Total undertime minutes:", emp.totalUndertimeMinutes);
      console.log("- Total regular hours:", emp.totalRegularHours);
      console.log("- Total overtime hours:", emp.totalOvertimeHours);
      console.log("- Total night differential hours:", emp.totalNightDifferentialHours);
      console.log("- Total holiday hours:", emp.totalHolidayHours);
      console.log("- Total rest day hours:", emp.totalRestDayHours);
      console.log("- Day shift days:", emp.dayShiftDays);
      console.log("- Evening shift days:", emp.eveningShiftDays);
      console.log("- Night shift days:", emp.nightShiftDays);
    });

    const finalSummary = Object.values(summary);
    console.log("\n=== Final Summary Array (With Undertime) ===");
    console.log(finalSummary);
    console.log("=== End generateSummary Debug (With Undertime) ===");

    setSummaryData(finalSummary);
  };

  // Refresh attendance data with new schedules
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

        // Recalculate hours breakdown with undertime
        const hoursBreakdown = calculateWorkHoursBreakdown(
          record.onDuty,
          record.offDuty,
          record.isHoliday,
          record.isRestDay,
          shift,
          currentActiveSchedules
        );

        return {
          ...record,
          shift,
          attendanceValue,
          status,
          lateMinutes,
          isLate: late,
          hoursBreakdown,
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

        // Step 2: Send enhanced attendance summary with payroll breakdown and undertime
        const summaryPayload = summaryData.map((row) => ({
          ecode: row.ecode,
          presentDays: row.presentDays,
          halfDays: row.halfDays,
          totalDays: row.totalDays,
          absentDays: row.absentDays,
          lateDays: row.lateDays || 0,
          totalLateMinutes: row.totalLateMinutes || 0,
          totalUndertimeMinutes: row.totalUndertimeMinutes || 0, // Include undertime
          dayShiftDays: row.dayShiftDays || 0,
          eveningShiftDays: row.eveningShiftDays || 0,
          nightShiftDays: row.nightShiftDays || 0,
          totalWorkHours: row.totalWorkHours || 0,
          // Enhanced payroll data
          totalRegularHours: row.totalRegularHours || 0,
          totalOvertimeHours: row.totalOvertimeHours || 0,
          totalNightDifferentialHours: row.totalNightDifferentialHours || 0,
          totalHolidayHours: row.totalHolidayHours || 0,
          totalHolidayOvertimeHours: row.totalHolidayOvertimeHours || 0,
          totalRestDayHours: row.totalRestDayHours || 0,
          totalRestDayOvertimeHours: row.totalRestDayOvertimeHours || 0,
        }));

        console.log("Sending enhanced summary payload with undertime:", summaryPayload);

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

  // Fetch attendance data function
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
    <div className="right-0 bottom-0 min-h-screen w-full bg-neutralSilver p-3 pt-16">
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
              Attendance with payroll breakdown and undertime tracking saved successfully!
            </Modal.Body>
            <Modal.Footer>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 w-24 h-8 text-sm border flex justify-center items-center text-center text-neutralDGray rounded-lg hover:bg-red-400 hover:text-white transition-all"
              >
                Close
              </button>
              <button
                onClick={() => navigate("/admin-dashboard/payroll-generator")}
                className="px-4 py-2 w-36 h-8 border flex justify-center text-sm items-center text-center text-neutralDGray rounded-lg hover:bg-green-400 hover:text-white transition-all"
              >
                Create Payroll
              </button>
            </Modal.Footer>
          </Modal>
        </div>

        <div className="p-2 -mt-3 rounded border bg-white shadow-sm border-neutralDGray">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm text-neutralDGray">
              Upload Attendance File (with Philippine Payroll Classifications & Undertime Tracking)
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
          defaultSelected={selectedSchedules}
          onAddSchedule={(schedule) =>
            setAllSchedules((prev) => [...prev, schedule])
          }
          onRemoveSchedule={(id) => {
            setAllSchedules((prev) => prev.filter((s) => s.id !== id));
            setSelectedSchedules((prev) => prev.filter((s) => s.id !== id));
          }}
          onConfirm={handleScheduleConfirm}
        />

        <WarningModal />

        <div className="grid mt-2 grid-cols-2 gap-2">
          {/* Enhanced Attendance Table with Payroll Details and Undertime */}
          <div className="overflow-auto h-full rounded border bg-white shadow-sm p-2">
            <h2 className="text-sm italic text-neutralDGray mb-2">
              Detailed Attendance with Payroll Classifications & Undertime Tracking
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
                No attendance data available. Upload a file to see payroll breakdown with undertime tracking.
              </p>
            )}
          </div>

          {/* Enhanced Summary Table with Payroll Totals and Undertime */}
          <div className="overflow-auto h-full rounded border bg-white shadow-sm p-2">
            <h2 className="text-sm italic text-neutralDGray mb-2">
              Payroll Summary with Undertime Tracking
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
                No payroll summary available. Upload a file to see detailed breakdown with undertime calculations.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;