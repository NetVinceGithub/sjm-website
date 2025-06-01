import Attendance from "../models/Attendance.js";
import moment from "moment";
import AttendanceSummary from "../models/AttendanceSummary.js";
import AttendanceHistory from "../models/AttendanceHistory.js";

import multer from 'multer';
import XLSX from 'xlsx';

// Function to convert Excel serial date to YYYY-MM-DD format
const excelSerialToDate = (serial) => {
  const excelEpoch = new Date(1899, 11, 30); // Excel epoch start
  // Excel incorrectly treats 1900 as leap year; serial numbers < 60 need adjustment if you want precision
  if (serial < 60) serial -= 1; // Fix for Excel leap year bug
  return moment(excelEpoch).add(serial, "days").format("YYYY-MM-DD");
};

export const uploadAttendanceFile = async (req, res) => {
  try {
    console.log('REQ.FILE:', req.file);

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(worksheet);

    const formattedData = rows.map(row => {
      // Convert Date - handle Excel serial number or date string
      const dateRaw = row.Date || row.date || '';
      let date = '';
      if (!isNaN(dateRaw) && Number(dateRaw) > 0) {
        date = excelSerialToDate(Number(dateRaw));
      } else {
        date = moment(dateRaw).isValid() ? moment(dateRaw).format('YYYY-MM-DD') : null;
      }

      const employeeName = row.Name || row.name || '';

      // Handle duty time split
      const dutyTimeRaw = row['Duty time'] || row['duty time'] || '';
      let dutyStart = null, dutyEnd = null;
      if (dutyTimeRaw.includes(' - ')) {
        const [startRaw, endRaw] = dutyTimeRaw.split(' - ').map(str => str.trim());
        dutyStart = moment(startRaw, 'HH:mm', true).isValid() ? startRaw : null;
        dutyEnd = moment(endRaw, 'HH:mm', true).isValid() ? endRaw : null;
      }

      // Parse Punch In and Punch Out
      const parseTime = (timeStr) => {
        if (!timeStr) return null;
        const m = moment(timeStr, ['HH:mm:ss', 'HH:mm'], true);
        return m.isValid() ? m.format('HH:mm:ss') : null;
      };

      const punchIn = parseTime(row['Punch In'] || row['punch in'] || null);
      const punchOut = parseTime(row['Punch Out'] || row['punch out'] || null);
      const workTime = row['Work time'] || row['work time'] || null;
      const lateTime = row['Late'] || null;
      const overtime = row['Overtime'] || null;
      const absentTime = row['Absent time'] || null;

      const isAbsent = !punchIn && !punchOut;
      const status = isAbsent ? 'absent' : 'present';
      const remarks = row['Remarks'] || null;

      return {
        employeeName,
        date,
        dutyStart,
        dutyEnd,
        punchIn,
        punchOut,
        workTime,
        lateTime,
        overtime,
        absentTime,
        isAbsent,
        status,
        remarks
      };
    });

    console.log('Formatted attendance data:', formattedData);

    // IMPORTANT: Make sure your model has unique constraints to support ignoreDuplicates.
    try {
      const result = await Attendance.bulkCreate(formattedData, {
        ignoreDuplicates: true
      });
      console.log('Bulk create result:', result);
    } catch (e) {
      console.error('Bulk create error:', e);
      throw e;
    }


    res.status(200).json({ success: true, message: 'Attendance uploaded successfully' });

  } catch (err) {
    console.error('Error saving attendance:', err);
    res.status(500).json({ success: false, message: 'Error saving attendance data' });
  }
};

export const saveAttendance = async (req, res) => {
  try {
    console.log("Received attendance data:", req.body);

    const attendanceRecords = req.body.attendanceData;

    if (!attendanceRecords || !Array.isArray(attendanceRecords)) {
      return res.status(400).json({ message: "Invalid data format. Expecting an array." });
    }

    // Validate and format attendance records
    const formattedRecords = [];
    for (const record of attendanceRecords) {
      if (record.ea_txndte) {
        let formattedDate = record.ea_txndte;

        // Check if date is Excel serial number (number > 0)
        if (!isNaN(formattedDate) && Number(formattedDate) > 0) {
          formattedDate = excelSerialToDate(Number(formattedDate));
        } else {
          // Try multiple formats, allow fallback
          const parsedDate = moment(formattedDate, ["DD-MMM-YY", "YYYY-MM-DD", "MM/DD/YYYY"], true);
          if (!parsedDate.isValid()) {
            return res.status(400).json({ message: `Invalid date format: ${formattedDate}. Expected format: DD-MMM-YY or YYYY-MM-DD.` });
          }
          formattedDate = parsedDate.format("YYYY-MM-DD");
        }

        // Clone and update record
        const formattedRecord = { ...record, ea_txndte: formattedDate };
        formattedRecords.push(formattedRecord);
      } else {
        return res.status(400).json({ message: "Missing date field (ea_txndte) in one or more records." });
      }
    }

    // Bulk insert into Attendance and AttendanceHistory tables
    const result1 = await Attendance.bulkCreate(formattedRecords, { validate: true });
    const result2 = await AttendanceHistory.bulkCreate(formattedRecords, { validate: true });

    res.status(201).json({
      message: "Attendance data saved successfully",
      insertedRowsAttendance: result1.length,
      insertedRowsHistory: result2.length,
    });

  } catch (error) {
    console.error("Error saving attendance:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const saveAttendanceSummary = async (req, res) => {
  try {
    console.log("Received attendance summary data:", req.body);

    const attendanceSummaryRecords = req.body.summaryData;

    if (!attendanceSummaryRecords || !Array.isArray(attendanceSummaryRecords)) {
      return res.status(400).json({ message: "Invalid data format. Expecting an array." });
    }

    const formattedData = attendanceSummaryRecords.map(record => ({
      ecode: record.ecode,
      totalTardiness: record.totalTardiness,
      totalHours: record.totalHours,
      totalOvertime: record.totalOvertime,
      holidayCount: record.holidayCount,
      regularDays: record.daysPresent - record.holidayCount,
      daysPresent: record.daysPresent,
      totalHolidayHours: record.totalHolidayHours,
      totalRegularHours: record.totalRegularHours,
    }));

    const result = await AttendanceSummary.bulkCreate(formattedData, {
      updateOnDuplicate: [
        "totalTardiness", "totalHours", "totalOvertime", "daysPresent", 
        "holidayCount", "regularDays", "totalHolidayHours", "totalRegularHours"
      ]
    });

    res.status(201).json({
      message: "Attendance Summary data saved successfully",
      insertedRows: result.length,
    });

  } catch (error) {
    console.error("Error saving attendance summary:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findAll();
    res.status(200).json({ attendance });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error in attendanceController" });
  }
};

export const getAttendanceHistory = async (req, res) => {
  try {
    const attendance = await AttendanceHistory.findAll();
    res.status(200).json({ attendance });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error in attendanceController" });
  }
};

export const getAttendanceSummary = async (req, res) => {
  try {
    const summary = await AttendanceSummary.findAll();
    res.status(200).json({ summary });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error in attendanceController" });
  }
};

export const deleteAllAttendance = async (req, res) => {
  try {
    // Delete all records from Attendance, AttendanceHistory and AttendanceSummary
    await Attendance.destroy({ where: {}, truncate: true });
    await AttendanceHistory.destroy({ where: {}, truncate: true });
    await AttendanceSummary.destroy({ where: {}, truncate: true });

    res.status(200).json({ message: "All attendance records deleted successfully" });
  } catch (error) {
    console.error("Error deleting all attendance records:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
