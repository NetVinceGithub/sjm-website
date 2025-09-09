// Enhanced Attendance.jsx - With Philippine Payroll Classifications and Night Differential

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

  // Enhanced time calculation functions for Philippine payroll
  const isTimeInRange = (time, startHour, endHour) => {
    const [hours, minutes] = time.split(":").map(Number);
    const timeInMinutes = hours * 60 + minutes;
    const startMinutes = startHour * 60;
    const endMinutes = endHour * 60;

    if (endHour < startHour) {
      // Overnight range
      return timeInMinutes >= startMinutes || timeInMinutes <= endMinutes;
    } else {
      // Same day range
      return timeInMinutes >= startMinutes && timeInMinutes <= endMinutes;
    }
  };

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

    const nightStartMinutes = NIGHT_SHIFT_START * 60; // 22:00 = 1320 minutes
    const nightEndMinutes = NIGHT_SHIFT_END * 60;     // 06:00 = 360 minutes
    const nextDayNightEndMinutes = nightEndMinutes + 24 * 60; // 06:00 next day = 1800 minutes

    let nightHours = 0;

    // Calculate night differential hours worked between 10 PM and 6 AM
    if (offDutyMinutes <= 24 * 60) {
      // Same day shift
      if (onDutyMinutes >= nightStartMinutes) {
        // Started during night hours (after 10 PM)
        nightHours = Math.min(offDutyMinutes, 24 * 60) - onDutyMinutes;
      } else if (offDutyMinutes > nightStartMinutes) {
        // Ended during night hours
        nightHours = Math.min(offDutyMinutes, 24 * 60) - nightStartMinutes;
      }
    } else {
      // Overnight shift
      // Night hours from start until midnight
      if (onDutyMinutes >= nightStartMinutes) {
        nightHours += 24 * 60 - onDutyMinutes;
      } else {
        nightHours += 24 * 60 - nightStartMinutes;
      }

      // Night hours from midnight until 6 AM next day
      if (offDutyMinutes <= nextDayNightEndMinutes) {
        nightHours += offDutyMinutes - 24 * 60;
      } else {
        nightHours += nightEndMinutes;
      }
    }

    return Math.max(0, nightHours / 60); // Convert to hours
  };

  const calculateWorkHoursBreakdown = (onDutyTime, offDutyTime, isHoliday = false, isRestDay = false) => {
    if (!onDutyTime || !offDutyTime) {
      return {
        totalHours: 0,
        regularHours: 0,
        overtimeHours: 0,
        nightDifferentialHours: 0,
        holidayHours: 0,
        holidayOvertimeHours: 0,
        restDayHours: 0,
        restDayOvertimeHours: 0,
      };
    }

    const [onHours, onMinutes] = onDutyTime.split(":").map(Number);
    const [offHours, offMinutes] = offDutyTime.split(":").map(Number);

    const onDutyMinutes = onHours * 60 + onMinutes;
    let offDutyMinutes = offHours * 60 + offMinutes;

    // Handle overnight shifts
    if (offDutyMinutes < onDutyMinutes) {
      offDutyMinutes += 24 * 60;
    }

    const totalMinutes = offDutyMinutes - onDutyMinutes;
    const totalHours = totalMinutes / 60;

    // Calculate night differential hours
    const nightDifferentialHours = calculateNightDifferentialHours(onDutyTime, offDutyTime);

    // Calculate base hours (total hours minus night differential to avoid double counting)
    const baseHours = totalHours - nightDifferentialHours;

    let breakdown = {
      totalHours: totalHours,
      regularHours: 0,
      overtimeHours: 0,
      nightDifferentialHours: nightDifferentialHours,
      holidayHours: 0,
      holidayOvertimeHours: 0,
      restDayHours: 0,
      restDayOvertimeHours: 0,
    };

    // Only calculate regular/overtime hours if employee worked (has valid times)
    if (totalHours > 0) {
      if (isHoliday) {
        // Holiday work
        if (baseHours <= REGULAR_HOURS_LIMIT) {
          breakdown.holidayHours = baseHours;
        } else {
          breakdown.holidayHours = REGULAR_HOURS_LIMIT;
          breakdown.holidayOvertimeHours = baseHours - REGULAR_HOURS_LIMIT;
        }
      } else if (isRestDay) {
        // Rest day work
        if (baseHours <= REGULAR_HOURS_LIMIT) {
          breakdown.restDayHours = baseHours;
        } else {
          breakdown.restDayHours = REGULAR_HOURS_LIMIT;
          breakdown.restDayOvertimeHours = baseHours - REGULAR_HOURS_LIMIT;
        }
      } else {
        // Regular work day - only if employee actually worked
        if (baseHours <= REGULAR_HOURS_LIMIT) {
          breakdown.regularHours = baseHours;
        } else {
          breakdown.regularHours = REGULAR_HOURS_LIMIT;
          breakdown.overtimeHours = baseHours - REGULAR_HOURS_LIMIT;
        }
      }
    }

    return breakdown;
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

  // Enhanced status determination with schedule validation
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

  // Update the determineShiftFromSchedules function to be more strict about time ranges
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
      let tolerance = 1; // Reduced tolerance to 1 hour for stricter matching

      console.log(
        `\nChecking schedule: ${schedule.label} (${schedule.start}-${schedule.end})`
      );

      if (schedule.end < schedule.start) {
        // Overnight shift (like 21-6)
        console.log("Processing overnight shift...");
        // For night shift, check if clock-in is within the night shift hours
        if (onDutyHour >= schedule.start - tolerance || onDutyHour <= schedule.end + tolerance) {
          isWithinRange = true;
          console.log("Within overnight shift range");
        }
      } else {
        // Regular shift (like 8-17 or 17-21)
        console.log("Processing regular shift...");
        // For day/evening shifts, check if clock-in is within the shift hours
        if (onDutyHour >= schedule.start - tolerance && onDutyHour <= schedule.end + tolerance) {
          isWithinRange = true;
          console.log("Within regular shift range");
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


  const shouldProcessAttendanceRecordStrict = (onDutyTime, offDutyTime, selectedScheduleList) => {
    // Validate input times
    if (!validateTimeFormat(onDutyTime) || !validateTimeFormat(offDutyTime)) {
      console.log("Invalid time format detected");
      return false;
    }

    if (selectedScheduleList.length === 0) {
      console.log("No schedules selected");
      return false;
    }

    // Check if times make logical sense
    const onDutyMinutes = timeToMinutes(onDutyTime);
    const offDutyMinutes = timeToMinutes(offDutyTime);
    
    // Handle overnight shifts
    let workMinutes = offDutyMinutes - onDutyMinutes;
    if (workMinutes < 0) {
      workMinutes += 24 * 60; // Add 24 hours for overnight
    }

    // Reject unreasonable work durations (less than 30 minutes or more than 16 hours)
    if (workMinutes < 30 || workMinutes > 16 * 60) {
      console.log(`Unreasonable work duration: ${workMinutes} minutes`);
      return false;
    }

    return determineShiftFromSchedulesStrict(onDutyTime, selectedScheduleList) !== "No Schedule Match";
  };



    const timeToMinutes = (timeString) => {
    if (!validateTimeFormat(timeString)) return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // 6. STRICTER Late Calculation with Validation
  const calculateLateMinutesStrict = (onDutyTime, detectedShift, selectedScheduleList) => {
    if (!validateTimeFormat(onDutyTime) || !detectedShift || selectedScheduleList.length === 0) {
      return 0;
    }

    // Don't calculate late minutes for invalid shifts
    if (detectedShift === "No Schedule Match" || detectedShift === "Unknown") {
      return 0;
    }

    // Find exact matching schedule
    const matchingSchedule = selectedScheduleList.find(schedule => 
      detectedShift.includes(schedule.label)
    );

    if (!matchingSchedule) {
      console.log("No matching schedule found for late calculation");
      return 0;
    }

    const onDutyMinutes = timeToMinutes(onDutyTime);
    const shiftStartMinutes = matchingSchedule.start * 60;

    let lateMinutes = 0;

    if (matchingSchedule.end < matchingSchedule.start) {
      // Overnight shift
      if (onDutyMinutes >= shiftStartMinutes) {
        // Clocked in on the same day as shift start
        lateMinutes = onDutyMinutes - shiftStartMinutes;
      } else if (onDutyMinutes <= matchingSchedule.end * 60) {
        // Clocked in the next day (within shift end time)
        lateMinutes = 0; // On time for overnight shift
      } else {
        // Clocked in late the next day
        lateMinutes = onDutyMinutes - (matchingSchedule.end * 60);
      }
    } else {
      // Regular shift
      lateMinutes = Math.max(0, onDutyMinutes - shiftStartMinutes);
    }

    return Math.max(0, lateMinutes);
  };

  // 7. STRICTER Attendance Status Calculation
  const calculateAttendanceStatusStrict = (onDutyTime, offDutyTime, detectedShift) => {
    // Validate times first
    if (!validateTimeFormat(onDutyTime) || !validateTimeFormat(offDutyTime)) {
      console.log("Invalid time format, marking as absent");
      return "absent";
    }

    // If no valid schedule match, mark as absent
    if (!detectedShift || detectedShift === "No Schedule Match" || detectedShift === "Unknown") {
      console.log("No valid schedule match, marking as absent");
      return "absent";
    }

    const workHours = calculateWorkHours(onDutyTime, offDutyTime);

    // STRICTER thresholds:
    // - Less than 2 hours: absent
    // - 2-6 hours: half-day
    // - More than 6 hours: present
    if (workHours < 2) {
      return "absent";
    } else if (workHours < 6) {
      return "half-day";
    } else {
      return "present";
    }
  };



  const handleFileUploadStrict = (event) => {
  const file = event.target.files[0];
  if (!file) return;

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

      console.log("Processing with STRICT validation...");

      const processedData = jsonData
        .map((row, index) => {
          console.log(`\n=== STRICT Processing Row ${index + 1} ===`);

          // Date processing (unchanged)
          let formattedDate = "";
          const dateRaw = row.Date || row.date || "";
          // ... date processing logic ...

          const ecode = String(row.Name || row.name || "").trim();
          if (!ecode) {
            console.log("No employee code, skipping row");
            return null;
          }

          // STRICT time conversion and validation
          const onDutyRaw = row["ON Duty"] || row["on duty"] || row["onDuty"] || null;
          const offDutyRaw = row["OFF Duty"] || row["off duty"] || row["offDuty"] || null;

          const onDuty = convertExcelTimeToString(onDutyRaw);
          const offDuty = convertExcelTimeToString(offDutyRaw);

          // STRICT validation - reject invalid times
          if (onDuty && !validateTimeFormat(onDuty)) {
            console.log(`Invalid on-duty time format: ${onDuty}, skipping`);
            return null;
          }
          if (offDuty && !validateTimeFormat(offDuty)) {
            console.log(`Invalid off-duty time format: ${offDuty}, skipping`);
            return null;
          }

          // Only process if we have valid times or if completely absent
          if (onDuty && offDuty && !shouldProcessAttendanceRecordStrict(onDuty, offDuty, currentActiveSchedules)) {
            console.log("Record doesn't match any selected schedule strictly, skipping");
            return null;
          }

          // Continue with processing using strict functions
          const workHours = calculateWorkHours(onDuty, offDuty);
          const hoursBreakdown = calculateWorkHoursBreakdown(onDuty, offDuty, row.Holiday, row.RestDay);
          const shift = determineShiftFromSchedulesStrict(onDuty, currentActiveSchedules);
          const status = calculateAttendanceStatusStrict(onDuty, offDuty, shift);
          const lateMinutes = calculateLateMinutesStrict(onDuty, shift, currentActiveSchedules);

          const processedRecord = {
            id: index + 1,
            ecode,
            date: formattedDate,
            onDuty,
            offDuty,
            workHours,
            hoursBreakdown,
            attendanceValue: status === "absent" ? 0 : status === "half-day" ? 0.5 : 1,
            shift,
            status,
            isLate: lateMinutes > 0,
            lateMinutes,
            isHoliday: Boolean(row.Holiday || row.holiday),
            isRestDay: Boolean(row.RestDay || row.restDay || row["Rest Day"]),
          };

          console.log("STRICT processed record:", processedRecord);
          return processedRecord;
        })
        .filter(record => record !== null); // Remove invalid records

      console.log(`STRICT processing complete: ${processedData.length} valid records from ${jsonData.length} total`);
      
      setAttendanceData(processedData);
      generateSummary(processedData);
      
    } catch (error) {
      console.error("Error in strict file processing:", error);
      toast.error("Error reading Excel file with strict validation. Please check the format.");
    }
  };
  reader.readAsArrayBuffer(file);
};









  // Add a new function to check if attendance record should be processed based on selected schedules
  const shouldProcessAttendanceRecord = (onDutyTime, offDutyTime, selectedScheduleList) => {
    if (!onDutyTime || !offDutyTime || selectedScheduleList.length === 0) {
      return false;
    }

    const [hours, minutes] = onDutyTime.split(":").map(Number);
    const onDutyHour = hours + minutes / 60;

    // Check if the clock-in time falls within any of the selected schedule ranges
    for (const schedule of selectedScheduleList) {
      let tolerance = 1; // 1-hour tolerance

      if (schedule.end < schedule.start) {
        // Overnight shift (like 21-6)
        if (onDutyHour >= schedule.start - tolerance || onDutyHour <= schedule.end + tolerance) {
          return true;
        }
      } else {
        // Regular shift (like 8-17 or 17-21)
        if (onDutyHour >= schedule.start - tolerance && onDutyHour <= schedule.end + tolerance) {
          return true;
        }
      }
    }

    return false;
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

    const numericValue = Number(excelTime);
    
    // Validate Excel time range (0-1 for valid time values)
    if (numericValue < 0 || numericValue >= 1) {
      console.warn(`Invalid Excel time value: ${excelTime}`);
      return null;
    }

    // Convert decimal to total minutes with higher precision
    const totalMinutes = Math.round(numericValue * 24 * 60);

    // Calculate hours and minutes
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;

    // Validate time ranges
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      console.warn(`Calculated invalid time: ${hours}:${minutes} from ${excelTime}`);
      return null;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };



  const determineShiftFromSchedulesStrict = (onDutyTime, selectedScheduleList) => {
    if (!onDutyTime || !validateTimeFormat(onDutyTime) || selectedScheduleList.length === 0) {
      console.log(`Invalid input - onDuty: ${onDutyTime}, schedules: ${selectedScheduleList.length}`);
      return "No Schedule Match";
    }

    const [hours, minutes] = onDutyTime.split(":").map(Number);
    const onDutyHour = hours + minutes / 60;

    console.log(`\n=== STRICT Shift Detection ===`);
    console.log("On duty time:", onDutyTime);
    console.log("On duty hour (decimal):", onDutyHour);

    // REDUCED tolerance to 30 minutes (0.5 hours) for stricter matching
    const STRICT_TOLERANCE = 0.5;
    const matchingSchedules = [];

    for (const schedule of selectedScheduleList) {
      let isWithinRange = false;
      const scheduleStart = schedule.start;
      const scheduleEnd = schedule.end;

      console.log(`Checking schedule: ${schedule.label} (${scheduleStart}-${scheduleEnd})`);

      if (scheduleEnd < scheduleStart) {
        // Overnight shift (e.g., 21-6)
        console.log("Processing overnight shift...");
        
        // For overnight shifts, be strict about timing
        // Either within evening portion (start - tolerance to 24:00)
        // Or within morning portion (0:00 to end + tolerance)
        const eveningStart = scheduleStart - STRICT_TOLERANCE;
        const morningEnd = scheduleEnd + STRICT_TOLERANCE;
        
        if (onDutyHour >= eveningStart || onDutyHour <= morningEnd) {
          isWithinRange = true;
          console.log("Within STRICT overnight shift range");
        }
      } else {
        // Regular shift (e.g., 8-17, 17-21)
        console.log("Processing regular shift...");
        
        const shiftStart = scheduleStart - STRICT_TOLERANCE;
        const shiftEnd = scheduleStart + STRICT_TOLERANCE; // Only allow clock-in near start time
        
        if (onDutyHour >= shiftStart && onDutyHour <= shiftEnd) {
          isWithinRange = true;
          console.log("Within STRICT regular shift range");
        }
      }

      if (isWithinRange) {
        // Additional validation: calculate distance from ideal start time
        let distance;
        if (scheduleEnd < scheduleStart && onDutyHour <= scheduleEnd) {
          // Night shift, clocked in during morning portion
          distance = Math.abs(onDutyHour + 24 - scheduleStart);
        } else {
          distance = Math.abs(onDutyHour - scheduleStart);
        }
        
        matchingSchedules.push({ ...schedule, distance });
      }
    }

    console.log("Matching schedules:", matchingSchedules.map(s => `${s.label} (distance: ${s.distance?.toFixed(2)})`));

    if (matchingSchedules.length === 0) {
      console.log("NO STRICT MATCH found for clock-in time:", onDutyTime);
      return "No Schedule Match";
    }

    // Choose the schedule with minimum distance from start time
    const bestMatch = matchingSchedules.reduce((best, current) => 
      current.distance < best.distance ? current : best
    );

    console.log("Final selected shift:", bestMatch.label, "Distance:", bestMatch.distance?.toFixed(2));
    console.log("=== End STRICT Shift Detection ===\n");

    return bestMatch.label;
  };






  const validateTimeFormat = (timeString) => {
    if (!timeString || typeof timeString !== 'string') {
      return false;
    }

    // Strict HH:MM format check
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(timeString)) {
      return false;
    }

    const [hours, minutes] = timeString.split(':').map(Number);
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
  };




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

  // Enhanced column definitions with payroll breakdown
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
    // In the attendanceColumns array, update these two columns:
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

  // Enhanced summary columns with payroll breakdown
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

  const getActiveSchedules = () => {
    return selectedSchedules; // Just return selectedSchedules directly
  };

  // Enhanced file upload with payroll classifications
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

          // Process the Excel data with enhanced payroll calculations
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

              // Check for holiday and rest day flags (if available in Excel)
              const isHoliday = Boolean(row.Holiday || row.holiday || false);
              const isRestDay = Boolean(row.RestDay || row.restDay || row["Rest Day"] || false);

              // Calculate work hours
              const workHours = calculateWorkHours(onDuty, offDuty);

              // Calculate detailed hours breakdown for payroll
              const hoursBreakdown = calculateWorkHoursBreakdown(onDuty, offDuty, isHoliday, isRestDay);

              // Determine shift first, then use it for attendance calculation
              const shift = determineShiftFromSchedules(
                onDuty,
                currentActiveSchedules
              );

              // Calculate attendance value with schedule validation
              const attendanceValue = calculateAttendanceValue(
                onDuty,
                offDuty,
                shift
              );

              // Enhanced status logic with schedule validation
              const status = calculateAttendanceStatus(onDuty, offDuty, shift);

              // Calculate late minutes only if valid schedule match
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
                    hoursBreakdown,
                    attendanceValue,
                    shift,
                    status,
                    isLate: late,
                    lateMinutes: lateMinutes,
                    isHoliday,
                    isRestDay,
                  };

                  console.log("Final processed record:", processedRecord);
                  return processedRecord;
                })
                .filter((record) => {
                  const isValid = record.date && record.ecode;
                  
                  // Additional filter: only include records that match selected schedules
                  const matchesSelectedSchedules = shouldProcessAttendanceRecord(
                    record.onDuty, 
                    record.offDuty, 
                    currentActiveSchedules
                  );
                  
                  if (!isValid) {
                    console.log("Filtered out invalid record:", record);
                  } else if (!matchesSelectedSchedules && record.onDuty && record.offDuty) {
                    console.log("Filtered out record - doesn't match selected schedules:", record);
                  }
                  
                  return isValid && (matchesSelectedSchedules || (!record.onDuty || !record.offDuty));
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

  // Enhanced summary generation with payroll breakdown
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
          dayShiftDays: 0,
          eveningShiftDays: 0,
          nightShiftDays: 0,
          totalWorkHours: 0,
          // Enhanced payroll tracking
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

      // Add work hours
      summary[ecode].totalWorkHours += record.workHours || 0;

      // Add attendance value (0.5 for half-day, 1 for full day, 0 for absent)
      summary[ecode].presentDays += record.attendanceValue || 0;

      // Count half days
      if (record.status === "half-day") {
        summary[ecode].halfDays++;
      }

      // Add payroll hours breakdown
      if (record.hoursBreakdown) {
        summary[ecode].totalRegularHours += record.hoursBreakdown.regularHours || 0;
        summary[ecode].totalOvertimeHours += record.hoursBreakdown.overtimeHours || 0;
        summary[ecode].totalNightDifferentialHours += record.hoursBreakdown.nightDifferentialHours || 0;
        summary[ecode].totalHolidayHours += record.hoursBreakdown.holidayHours || 0;
        summary[ecode].totalHolidayOvertimeHours += record.hoursBreakdown.holidayOvertimeHours || 0;
        summary[ecode].totalRestDayHours += record.hoursBreakdown.restDayHours || 0;
        summary[ecode].totalRestDayOvertimeHours += record.hoursBreakdown.restDayOvertimeHours || 0;
      }

      // Count shift-specific days using attendance value
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

      // Count late days and accumulate late minutes only for present/half-day employees
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
        totalRegularHours: summary[ecode].totalRegularHours,
        totalOvertimeHours: summary[ecode].totalOvertimeHours,
        totalNightDifferentialHours: summary[ecode].totalNightDifferentialHours,
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
    console.log("\n=== Final Summary Array ===");
    console.log(finalSummary);
    console.log("=== End generateSummary Debug ===");

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

        // Recalculate hours breakdown
        const hoursBreakdown = calculateWorkHoursBreakdown(
          record.onDuty,
          record.offDuty,
          record.isHoliday,
          record.isRestDay
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

        // Step 2: Send enhanced attendance summary with payroll breakdown
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
          // Enhanced payroll data
          totalRegularHours: row.totalRegularHours || 0,
          totalOvertimeHours: row.totalOvertimeHours || 0,
          totalNightDifferentialHours: row.totalNightDifferentialHours || 0,
          totalHolidayHours: row.totalHolidayHours || 0,
          totalHolidayOvertimeHours: row.totalHolidayOvertimeHours || 0,
          totalRestDayHours: row.totalRestDayHours || 0,
          totalRestDayOvertimeHours: row.totalRestDayOvertimeHours || 0,
        }));

        console.log("Sending enhanced summary payload:", summaryPayload);

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
              Attendance with payroll breakdown saved successfully!
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
              Upload Attendance File (with Philippine Payroll Classifications)
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
          {/* Enhanced Attendance Table with Payroll Details */}
          <div className="overflow-auto h-full rounded border bg-white shadow-sm p-2">
            <h2 className="text-sm italic text-neutralDGray mb-2">
              Detailed Attendance with Payroll Classifications
            </h2>
            <div className="text-xs text-gray-600 mb-2 p-2 bg-blue-50 rounded">
              <strong>Philippine Labor Standards:</strong>
              <div>• Regular Hours: Up to 8 hours per day</div>
              <div>• Overtime: Hours beyond 8 hours</div>
              <div>• Night Differential: 10% for work between 10PM-6AM</div>
              <div>• Holiday/Rest Day rates apply as per labor code</div>
            </div>
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
                No attendance data available. Upload a file to see payroll breakdown.
              </p>
            )}
          </div>

          {/* Enhanced Summary Table with Payroll Totals */}
          <div className="overflow-auto h-full rounded border bg-white shadow-sm p-2">
            <h2 className="text-sm italic text-neutralDGray mb-2">
              Payroll Summary (Philippine Standards)
            </h2>
            <div className="text-xs text-gray-600 mb-2 p-2 bg-green-50 rounded">
              <strong>Summary includes:</strong> Regular hours, Overtime, Night differential, Holiday work, Rest day work
            </div>
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
                No payroll summary available. Upload a file to see detailed breakdown.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;