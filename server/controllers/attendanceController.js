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

        // Get ecode from Name column
        const ecode = String(row.Name || row.name || '').trim();

        // Get onDuty and offDuty times directly from columns
        const onDuty = parseTimeToHHMMSS(row['ON Duty'] || row['on duty'] || row['onDuty']);
        const offDuty = parseTimeToHHMMSS(row['OFF Duty'] || row['off duty'] || row['offDuty']);

        // Determine status based on offDuty
        let status = 'absent';
        if (offDuty && offDuty !== 'N/A' && offDuty.trim() !== '') {
          status = 'present';
        }

        // Return object matching the Attendance model structure
        return {
          ecode,        // from Name column
          date,         // formatted date
          onDuty,       // from ON Duty column
          offDuty,      // from OFF Duty column
          status        // present or absent based on offDuty
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

    // Prepare data for Attendance table
    const attendanceData = formattedData.map(record => ({
      ecode: record.ecode,
      date: record.date,
      onDuty: record.onDuty,
      offDuty: record.offDuty,
      status: record.status
    }));

    // Insert data into Attendance table only
    try {
      // Insert into Attendance table
      const result = await Attendance.bulkCreate(attendanceData, {
        validate: true,
        returning: true
      });
      console.log('✅ Attendance bulk create successful. Inserted records:', result.length);

      // Verify insertion
      const totalRecordsInDB = await Attendance.count();
      console.log('Total records in Attendance table:', totalRecordsInDB);

      res.status(200).json({ 
        success: true, 
        message: `Attendance data uploaded successfully. ${result.length} records inserted.`,
        details: {
          recordsInserted: result.length,
          totalInAttendance: totalRecordsInDB
        }
      });

    } catch (bulkError) {
      console.error('Bulk create error:', bulkError);
      
      // If bulk create fails, try individual inserts
      console.log('Attempting individual record insertion...');
      
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const record of attendanceData) {
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
          totalInAttendance: totalRecordsInDB,
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
    console.log("Received attendance summary data: it oyung save attendance sumary", req.body);

    const attendanceSummaryRecords = req.body.summaryData;

    if (!attendanceSummaryRecords || !Array.isArray(attendanceSummaryRecords)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid data format. Expecting an array in summaryData field." 
      });
    }

    // Validate that each record has required fields
    for (let i = 0; i < attendanceSummaryRecords.length; i++) {
      const record = attendanceSummaryRecords[i];
      if (!record.ecode) {
        return res.status(400).json({
          success: false,
          message: `Record at index ${i} is missing required field: ecode`
        });
      }
    }

    // Format data to match the model fields
    const formattedData = attendanceSummaryRecords.map(record => {
      const attendanceRate = record.totalDays > 0 ? 
        (record.presentDays / record.totalDays) * 100 : 0;

      return {
        ecode: String(record.ecode).trim(),
        presentDays: Number(record.presentDays) || 0,
        totalDays: Number(record.totalDays) || 0,
        absentDays: Number(record.absentDays) || 0,
        lateDays: Number(record.lateDays) || 0,
        totalLateMinutes: Number(record.totalLateMinutes) || 0,
        dayShiftDays: Number(record.dayShiftDays) || 0,
        eveningShiftDays: Number(record.eveningShiftDays) || 0,
        nightShiftDays: Number(record.nightShiftDays) || 0,
        regularHoursDays: Number(record.regularHoursDays) || 0,
        attendanceRate: Number(attendanceRate.toFixed(2)) || 0,
      };
    });

    // Use upsert to handle existing records
    const results = [];
    let createdCount = 0;
    let updatedCount = 0;

    for (const record of formattedData) {
      try {
        const [instance, created] = await AttendanceSummary.upsert(record, {
          returning: true
        });
        
        if (created) {
          createdCount++;
        } else {
          updatedCount++;
        }
        
        results.push({ instance, created });
      } catch (error) {
        console.error(`Error processing record for ecode ${record.ecode}:`, error);
        return res.status(500).json({
          success: false,
          message: `Error processing record for ecode ${record.ecode}: ${error.message}`
        });
      }
    }

    res.status(201).json({
      success: true,
      message: "Attendance Summary data saved successfully",
      created: createdCount,
      updated: updatedCount,
      total: results.length,
      data: results.map(r => r.instance)
    });

  } catch (error) {
    console.error("Error saving attendance summary:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
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
