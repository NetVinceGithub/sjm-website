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

    // Insert all data without checking for duplicates
    try {
      const result = await Attendance.bulkCreate(formattedData, {
        // Remove ignoreDuplicates and updateOnDuplicate options
        // This will insert all records, including duplicates
        validate: true,
        returning: true
      });

      console.log('Bulk create successful. Inserted records:', result.length);

      // Verify insertion
      const totalRecordsInDB = await Attendance.count();
      console.log('Total records in database after insert:', totalRecordsInDB);

      res.status(200).json({ 
        success: true, 
        message: `All attendance data uploaded successfully. ${result.length} records inserted.`,
        details: {
          recordsInserted: result.length,
          totalInDatabase: totalRecordsInDB
        }
      });

    } catch (bulkError) {
      console.error('Bulk create error:', bulkError);
      
      // If bulk create fails, try individual inserts
      console.log('Attempting individual record insertion...');
      
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const record of formattedData) {
        try {
          await Attendance.create(record);
          successCount++;
        } catch (error) {
          errorCount++;
          errors.push({
            record: record,
            error: error.message
          });
          console.error(`Failed to insert record for ${record.ecode} on ${record.date}:`, error.message);
        }
      }

      console.log(`Individual insertion complete. Success: ${successCount}, Errors: ${errorCount}`);

      if (errors.length > 0) {
        console.log('First few errors:', errors.slice(0, 3));
      }

      const totalRecordsInDB = await Attendance.count();

      res.status(200).json({ 
        success: true, 
        message: `Attendance upload completed. ${successCount} records inserted successfully.`,
        details: {
          recordsInserted: successCount,
          recordsFailed: errorCount,
          totalInDatabase: totalRecordsInDB,
          errors: errorCount > 0 ? errors.slice(0, 5) : [] // Return first 5 errors
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
