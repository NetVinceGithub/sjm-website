import Attendance from "../models/Attendance.js";
import moment from "moment";
import AttendanceSummary from "../models/AttendanceSummary.js";
import AttendanceHistory from "../models/AttendanceHistory.js";

import multer from 'multer';
import XLSX from 'xlsx';



const excelSerialToDate = (serial) => {
  const excelEpoch = new Date(1899, 11, 30);
  if (serial < 60) serial -= 1;
  return moment(excelEpoch).add(serial, "days").format("YYYY-MM-DD");
};

const parseTimeToHHMMSS = (timeValue) => {
  // Null or empty check
  if (timeValue == null || timeValue === '' || timeValue === 'null') return null;

  // Handle Excel numeric time (e.g., 0.333333 for 08:00 AM)
  if (typeof timeValue === 'number') {
    const totalSeconds = Math.round(24 * 60 * 60 * timeValue);
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  // Handle common string formats
  const m = moment(timeValue, ['HH:mm:ss', 'HH:mm', 'H:mm', 'h:mm A'], true);
  return m.isValid() ? m.format('HH:mm:ss') : null;
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

    console.log('Raw Excel rows sample:', rows.slice(0, 2));

    const formattedData = rows
      .map(row => {
        // Convert Date
        const dateRaw = row.Date || row.date || '';
        let date = '';
        if (!isNaN(dateRaw) && Number(dateRaw) > 0) {
          date = excelSerialToDate(Number(dateRaw));
        } else {
          date = moment(dateRaw).isValid() ? moment(dateRaw).format('YYYY-MM-DD') : null;
        }

        const ecode = String(row.Name || row.name || '').trim();

        // Handle duty time split
        const dutyTimeRaw = row['Duty time'] || row['duty time'] || '';
        let dutyStart = null, dutyEnd = null;
        if (dutyTimeRaw && dutyTimeRaw.includes(' - ')) {
          const [startRaw, endRaw] = dutyTimeRaw.split(' - ').map(str => str.trim());
          dutyStart = parseTimeToHHMMSS(startRaw);
          dutyEnd = parseTimeToHHMMSS(endRaw);
        }

        // Parse times
        const punchIn = parseTimeToHHMMSS(row['Punch In'] || row['punch in']);
        const punchOut = parseTimeToHHMMSS(row['Punch Out'] || row['punch out']);
        const workTime = parseTimeToHHMMSS(row['Work time'] || row['work time']);
        const lateTime = parseTimeToHHMMSS(row['Late']);
        const overtime = parseTimeToHHMMSS(row['Overtime']);
        const absentTime = parseTimeToHHMMSS(row['Absent time']);

        const isAbsent = !punchIn && !punchOut;
        const status = isAbsent ? 'absent' : 'present';

        return {
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
          ecode
        };
      })
      .filter(record => record.date && record.ecode); // Only filter out completely invalid records

    console.log('Formatted attendance data sample:', formattedData.slice(0, 3));
    console.log('Total records to insert:', formattedData.length);

    if (formattedData.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No valid records found in the uploaded file' 
      });
    }

    // Insert all data into both tables
    try {
      // Insert into Attendance table
      const result1 = await Attendance.bulkCreate(formattedData, {
        validate: true,
        returning: true
      });
      console.log('✅ Attendance bulk create successful. Inserted records:', result1.length);

      // Insert into AttendanceHistory table
      const result2 = await AttendanceHistory.bulkCreate(formattedData, {
        validate: true,
        returning: true
      });
      console.log('✅ AttendanceHistory bulk create successful. Inserted records:', result2.length);

      // Verify insertion
      const totalRecordsInDB = await Attendance.count();
      const totalHistoryRecordsInDB = await AttendanceHistory.count();
      console.log('Total records in Attendance table:', totalRecordsInDB);
      console.log('Total records in AttendanceHistory table:', totalHistoryRecordsInDB);

      res.status(200).json({ 
        success: true, 
        message: `All attendance data uploaded successfully. ${result1.length} records inserted into both tables.`,
        details: {
          recordsInserted: result1.length,
          totalInAttendance: totalRecordsInDB,
          totalInHistory: totalHistoryRecordsInDB
        }
      });

    } catch (bulkError) {
      console.error('Bulk create error:', bulkError);
      
      // If bulk create fails, try individual inserts for both tables
      console.log('Attempting individual record insertion...');
      
      let successCountAttendance = 0;
      let successCountHistory = 0;
      let errorCount = 0;
      const errors = [];

      for (const record of formattedData) {
        try {
          // Insert into Attendance
          await Attendance.create(record);
          successCountAttendance++;
          
          // Insert into AttendanceHistory
          await AttendanceHistory.create(record);
          successCountHistory++;
        } catch (error) {
          errorCount++;
          errors.push({
            record: record,
            error: error.message
          });
          console.error(`Failed to insert record for ${record.ecode} on ${record.date}:`, error.message);
        }
      }

      console.log(`Individual insertion complete. Attendance Success: ${successCountAttendance}, History Success: ${successCountHistory}, Errors: ${errorCount}`);

      if (errors.length > 0) {
        console.log('First few errors:', errors.slice(0, 3));
      }

      const totalRecordsInDB = await Attendance.count();
      const totalHistoryRecordsInDB = await AttendanceHistory.count();

      res.status(200).json({ 
        success: true, 
        message: `Attendance upload completed. ${successCountAttendance} records inserted into Attendance, ${successCountHistory} into History.`,
        details: {
          attendanceRecordsInserted: successCountAttendance,
          historyRecordsInserted: successCountHistory,
          recordsFailed: errorCount,
          totalInAttendance: totalRecordsInDB,
          totalInHistory: totalHistoryRecordsInDB,
          errors: errorCount > 0 ? errors.slice(0, 5) : []
        }
      });
    }

  } catch (err) {
    console.error('Error saving attendance:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error saving attendance data',
      error: err.message 
    });
  }
};

export const saveAttendance = async (req, res) => {
  try {
    console.log("Received attendance data:", req.body);

    const attendanceRecords = req.body.attendanceData;

    if (!attendanceRecords || !Array.isArray(attendanceRecords)) {
      return res.status(400).json({ message: "Invalid data format. Expecting an array." });
    }

    // Your existing formatting logic...
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

        // Clone and update record - EXACTLY as you had it
        const formattedRecord = { ...record, ea_txndte: formattedDate };
        formattedRecords.push(formattedRecord);
      } else {
        return res.status(400).json({ message: "Missing date field (ea_txndte) in one or more records." });
      }
    }

    console.log("=== DEBUGGING INFO ===");
    console.log("Sample formatted record:", JSON.stringify(formattedRecords[0], null, 2));
    console.log("Total records:", formattedRecords.length);
    
    // Test AttendanceHistory model directly
    console.log("Testing AttendanceHistory model...");
    console.log("AttendanceHistory table name:", AttendanceHistory.tableName);
    console.log("AttendanceHistory attributes:", Object.keys(AttendanceHistory.rawAttributes));

    // Insert into Attendance table
    const result1 = await Attendance.bulkCreate(formattedRecords, { validate: true });
    console.log("✅ Attendance records inserted:", result1.length);

    // Insert into AttendanceHistory table with detailed logging
    console.log("Attempting AttendanceHistory insertion...");
    
    try {
      const result2 = await AttendanceHistory.bulkCreate(formattedRecords, { 
        validate: true,
        returning: true,
        ignoreDuplicates: false
      });
      console.log("✅ AttendanceHistory records inserted:", result2.length);
      console.log("Sample inserted record:", result2[0] ? result2[0].toJSON() : "No records returned");
      
      res.status(201).json({
        message: "Attendance data saved successfully",
        insertedRowsAttendance: result1.length,
        insertedRowsHistory: result2.length,
      });
    } catch (historyError) {
      console.error("❌ AttendanceHistory ERROR:");
      console.error("Error name:", historyError.name);
      console.error("Error message:", historyError.message);
      console.error("Error stack:", historyError.stack);
      
      if (historyError.errors) {
        console.error("Validation errors:", historyError.errors);
      }
      
      // Return the error details
      res.status(500).json({
        message: "AttendanceHistory insertion failed",
        error: historyError.message,
        errorName: historyError.name,
        insertedRowsAttendance: result1.length,
        insertedRowsHistory: 0
      });
    }

  } catch (error) {
    console.error("General error:", error);
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
