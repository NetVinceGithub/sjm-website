// Corrected Attendance Controller - Fixed data extraction and validation
import Attendance from "../models/Attendance.js";
import moment from "moment";
import AttendanceSummary from "../models/AttendanceSummary.js";
import AttendanceHistory from "../models/AttendanceHistory.js";
import multer from 'multer';
import XLSX from 'xlsx';

// Configure multer for file upload handling
const storage = multer.memoryStorage();
export const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'), false);
    }
  }
});

const excelSerialToDate = (serial) => {
  const excelEpoch = new Date(1899, 11, 30);
  if (serial < 60) serial -= 1;
  return moment(excelEpoch).add(serial, "days").format("YYYY-MM-DD");
};

const parseTimeToHHMMSS = (timeValue) => {
  if (timeValue == null || timeValue === '' || timeValue === 'null') return null;

  if (typeof timeValue === 'number') {
    const totalSeconds = Math.round(24 * 60 * 60 * timeValue);
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  const m = moment(timeValue, ['HH:mm:ss', 'HH:mm', 'H:mm', 'h:mm A'], true);
  return m.isValid() ? m.format('HH:mm:ss') : null;
};

// FIXED: Enhanced file upload handler
export const uploadAttendanceFile = async (req, res) => {
  try {
    console.log('=== FILE UPLOAD DEBUG ===');

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(worksheet);

    const formattedData = rows
      .map((row, index) => {
        // Convert Date
        const dateRaw = row.Date || row.date || '';
        let date = '';
        if (!isNaN(dateRaw) && Number(dateRaw) > 0) {
          date = excelSerialToDate(Number(dateRaw));
        } else {
          date = moment(dateRaw).isValid() ? moment(dateRaw).format('YYYY-MM-DD') : null;
        }

        const ecode = String(row.Name || row.name || '').trim();
        
        // FIXED: Consistent field name handling
        const onDuty = parseTimeToHHMMSS(
          row['ON Duty'] || row['on duty'] || row['onDuty'] || row['On Duty']
        );
        const offDuty = parseTimeToHHMMSS(
          row['OFF Duty'] || row['off duty'] || row['offDuty'] || row['Off Duty']
        );

        const record = {
          ecode,
          date,
          onDuty,
          offDuty,
          workHours: 0,
          status: 'absent',
          shift: 'Unknown',
          attendanceValue: 0,
          isLate: false,
          lateMinutes: 0,
          isHoliday: Boolean(row.Holiday || row.holiday || false),
          isRestDay: Boolean(row.RestDay || row.restDay || row['Rest Day'] || false),
          
          // Initialize payroll fields
          regularHours: 0,
          overtimeHours: 0,
          nightDifferentialHours: 0,
          holidayHours: 0,
          holidayOvertimeHours: 0,
          restDayHours: 0,
          restDayOvertimeHours: 0,
          undertimeHours: 0,
          undertimeMinutes: 0,
          expectedHours: 8,
          ea_txndte: date
        };

        return record;
      })
      .filter(record => record.date && record.ecode);

    if (formattedData.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No valid records found in the uploaded file' 
      });
    }

    // Use transaction for better error handling
    const transaction = await Attendance.sequelize.transaction();
    
    try {
      const result = await Attendance.bulkCreate(formattedData, {
        validate: true,
        returning: true,
        ignoreDuplicates: true,
        updateOnDuplicate: ['onDuty', 'offDuty', 'isHoliday', 'isRestDay', 'updated_at'],
        transaction
      });

      await transaction.commit();
      
      res.status(200).json({ 
        success: true, 
        message: `Attendance data uploaded successfully. ${result.length} records processed.`,
        details: {
          recordsProcessed: result.length,
          totalUploaded: formattedData.length
        }
      });

    } catch (bulkError) {
      await transaction.rollback();
      
      // Fallback to individual insertion
      let successCount = 0;
      const errors = [];

      for (const record of formattedData) {
        try {
          await Attendance.upsert(record);
          successCount++;
        } catch (error) {
          errors.push({
            record: { ecode: record.ecode, date: record.date },
            error: error.message
          });
        }
      }

      res.status(200).json({ 
        success: successCount > 0, 
        message: `Upload completed. ${successCount} records processed successfully.`,
        details: {
          recordsProcessed: successCount,
          recordsFailed: errors.length,
          errors: errors.slice(0, 5)
        }
      });
    }

  } catch (err) {
    console.error('Error in uploadAttendanceFile:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing attendance file',
      error: err.message 
    });
  }
};

// FIXED: Corrected saveAttendance with proper data extraction
export const saveAttendance = async (req, res) => {
  try {
    console.log("=== SAVE ATTENDANCE DEBUG ===");

    const attendanceRecords = req.body.attendanceData;

    if (!attendanceRecords || !Array.isArray(attendanceRecords)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid data format. Expecting an array in attendanceData field." 
      });
    }

    console.log("Sample record received:", JSON.stringify(attendanceRecords[0], null, 2));

    const formattedRecords = [];
    const errorDetails = [];

    for (let i = 0; i < attendanceRecords.length; i++) {
      const record = attendanceRecords[i];
      
      try {
        // Handle date field
        let formattedDate = record.date || record.ea_txndte;
        
        if (!formattedDate) {
          errorDetails.push({
            record: { ecode: record.ecode },
            error: "Missing date field"
          });
          continue;
        }

        if (!isNaN(formattedDate) && Number(formattedDate) > 0) {
          formattedDate = excelSerialToDate(Number(formattedDate));
        } else {
          const parsedDate = moment(formattedDate, ["DD-MMM-YY", "YYYY-MM-DD", "MM/DD/YYYY"], true);
          if (!parsedDate.isValid()) {
            errorDetails.push({
              record: { ecode: record.ecode },
              error: `Invalid date format: ${formattedDate}`
            });
            continue;
          }
          formattedDate = parsedDate.format("YYYY-MM-DD");
        }

        // FIXED: Proper extraction of hoursBreakdown
        const hoursBreakdown = record.hoursBreakdown || {};
        
        // Validate that we have breakdown data
        const hasBreakdownData = hoursBreakdown && typeof hoursBreakdown === 'object';
        
        if (!hasBreakdownData) {
          console.warn(`No hoursBreakdown data for ${record.ecode} on ${formattedDate}`);
        }

        const formattedRecord = {
          ecode: String(record.ecode || '').trim(),
          date: formattedDate,
          onDuty: record.onDuty || null,
          offDuty: record.offDuty || null,
          workHours: Number(record.workHours) || 0,
          status: record.status || 'absent',
          shift: record.shift || 'Unknown',
          attendanceValue: Number(record.attendanceValue) || 0,
          isLate: Boolean(record.isLate),
          lateMinutes: Number(record.lateMinutes) || 0,
          isHoliday: Boolean(record.isHoliday),
          isRestDay: Boolean(record.isRestDay),
          
          // FIXED: Safe extraction with fallbacks
          regularHours: hasBreakdownData ? (Number(hoursBreakdown.regularHours) || 0) : 0,
          overtimeHours: hasBreakdownData ? (Number(hoursBreakdown.overtimeHours) || 0) : 0,
          nightDifferentialHours: hasBreakdownData ? (Number(hoursBreakdown.nightDifferentialHours) || 0) : 0,
          holidayHours: hasBreakdownData ? (Number(hoursBreakdown.holidayHours) || 0) : 0,
          holidayOvertimeHours: hasBreakdownData ? (Number(hoursBreakdown.holidayOvertimeHours) || 0) : 0,
          restDayHours: hasBreakdownData ? (Number(hoursBreakdown.restDayHours) || 0) : 0,
          restDayOvertimeHours: hasBreakdownData ? (Number(hoursBreakdown.restDayOvertimeHours) || 0) : 0,
          
          // FIXED: Proper undertime extraction
          undertimeHours: hasBreakdownData ? (Number(hoursBreakdown.undertimeHours) || 0) : 0,
          undertimeMinutes: hasBreakdownData ? (Number(hoursBreakdown.undertimeMinutes) || 0) : 0,
          expectedHours: hasBreakdownData ? (Number(hoursBreakdown.expectedHours) || 8) : 8,
          
          ea_txndte: formattedDate
        };

        if (!formattedRecord.ecode) {
          errorDetails.push({
            record: record,
            error: "Missing employee code (ecode)"
          });
          continue;
        }

        formattedRecords.push(formattedRecord);
      } catch (error) {
        errorDetails.push({
          record: { ecode: record.ecode },
          error: error.message
        });
      }
    }

    if (formattedRecords.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid records to process",
        details: { errors: errorDetails }
      });
    }

    console.log("Sample processed record:", JSON.stringify(formattedRecords[0], null, 2));

    // FIXED: Use transaction for data consistency
    const transaction = await Attendance.sequelize.transaction();
    
    try {
      let attendanceUpsertCount = 0;
      let historyInsertCount = 0;

      // Process attendance records with upsert
      for (const record of formattedRecords) {
        try {
          const [instance, created] = await Attendance.upsert(record, {
            returning: true,
            transaction
          });
          attendanceUpsertCount++;
        } catch (attendanceError) {
          console.error(`Failed to upsert attendance for ${record.ecode}:`, attendanceError.message);
          errorDetails.push({
            record: { ecode: record.ecode, date: record.date },
            error: attendanceError.message
          });
        }
      }

      // Insert into AttendanceHistory
      try {
        const historyResult = await AttendanceHistory.bulkCreate(formattedRecords, { 
          validate: true,
          returning: true,
          transaction
        });
        historyInsertCount = historyResult.length;
      } catch (historyError) {
        console.error("AttendanceHistory ERROR:", historyError.message);
        // Don't fail the entire transaction for history errors
      }

      await transaction.commit();

      res.status(201).json({
        success: true,
        message: "Enhanced attendance data with payroll breakdown saved successfully",
        processed: attendanceUpsertCount,
        historySaved: historyInsertCount,
        totalRecords: formattedRecords.length,
        errors: errorDetails.length > 0 ? errorDetails : undefined
      });

    } catch (transactionError) {
      await transaction.rollback();
      throw transactionError;
    }

  } catch (error) {
    console.error("General error in saveAttendance:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// FIXED: Enhanced saveAttendanceSummary with proper validation
export const saveAttendanceSummary = async (req, res) => {
  try {
    console.log("=== SAVE ATTENDANCE SUMMARY DEBUG ===");

    const attendanceSummaryRecords = req.body.summaryData;

    if (!attendanceSummaryRecords || !Array.isArray(attendanceSummaryRecords)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid data format. Expecting an array in summaryData field." 
      });
    }

    // Validate required fields
    for (let i = 0; i < attendanceSummaryRecords.length; i++) {
      const record = attendanceSummaryRecords[i];
      if (!record.ecode) {
        return res.status(400).json({
          success: false,
          message: `Record at index ${i} is missing required field: ecode`
        });
      }
    }

    console.log("Sample summary record:", JSON.stringify(attendanceSummaryRecords[0], null, 2));

    const formattedData = attendanceSummaryRecords.map(record => {
      const attendanceRate = record.totalDays > 0 ? 
        (record.presentDays / record.totalDays) * 100 : 0;

      return {
        ecode: String(record.ecode).trim(),
        
        // Basic attendance tracking
        presentDays: Number(record.presentDays) || 0,
        totalDays: Number(record.totalDays) || 0,
        absentDays: Number(record.absentDays) || 0,
        halfDays: Number(record.halfDays) || 0,
        
        // Tardiness tracking
        lateDays: Number(record.lateDays) || 0,
        totalLateMinutes: Number(record.totalLateMinutes) || 0,
        
        // FIXED: Proper undertime tracking
        totalUndertimeMinutes: Number(record.totalUndertimeMinutes) || 0,
        
        // Shift tracking
        dayShiftDays: Number(record.dayShiftDays) || 0,
        eveningShiftDays: Number(record.eveningShiftDays) || 0,
        nightShiftDays: Number(record.nightShiftDays) || 0,
        
        // Work hours
        totalWorkHours: Number(record.totalWorkHours) || 0,
        
        // FIXED: Enhanced payroll breakdown with validation
        totalRegularHours: Number(record.totalRegularHours) || 0,
        totalOvertimeHours: Number(record.totalOvertimeHours) || 0,
        totalNightDifferentialHours: Number(record.totalNightDifferentialHours) || 0,
        totalHolidayHours: Number(record.totalHolidayHours) || 0,
        totalHolidayOvertimeHours: Number(record.totalHolidayOvertimeHours) || 0,
        totalRestDayHours: Number(record.totalRestDayHours) || 0,
        totalRestDayOvertimeHours: Number(record.totalRestDayOvertimeHours) || 0,
        
        // Legacy fields
        regularHoursDays: Number(record.regularHoursDays) || 0,
        attendanceRate: Number(attendanceRate.toFixed(2)) || 0,
      };
    });

    // FIXED: Use transaction for data consistency
    const transaction = await AttendanceSummary.sequelize.transaction();
    
    try {
      let createdCount = 0;
      let updatedCount = 0;
      const errors = [];

      for (const record of formattedData) {
        try {
          const [instance, created] = await AttendanceSummary.upsert(record, {
            returning: true,
            transaction
          });
          
          if (created) {
            createdCount++;
          } else {
            updatedCount++;
          }
          
        } catch (error) {
          console.error(`Error processing summary for ecode ${record.ecode}:`, error.message);
          errors.push({
            ecode: record.ecode,
            error: error.message
          });
        }
      }

      if (errors.length > 0 && (createdCount + updatedCount) === 0) {
        await transaction.rollback();
        return res.status(500).json({
          success: false,
          message: "Failed to process any summary records",
          details: { errors }
        });
      }

      await transaction.commit();

      res.status(201).json({
        success: true,
        message: "Enhanced attendance summary with payroll breakdown and undertime tracking saved successfully",
        created: createdCount,
        updated: updatedCount,
        total: createdCount + updatedCount,
        errors: errors.length > 0 ? errors.slice(0, 5) : undefined
      });

    } catch (transactionError) {
      await transaction.rollback();
      throw transactionError;
    }

  } catch (error) {
    console.error("Error saving enhanced attendance summary:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get functions remain the same but with better error handling
export const getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findAll({
      order: [['date', 'DESC'], ['ecode', 'ASC']]
    });
    res.status(200).json({ success: true, attendance });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching attendance data",
      error: error.message 
    });
  }
};

export const getAttendanceHistory = async (req, res) => {
  try {
    const attendance = await AttendanceHistory.findAll({
      order: [['created_at', 'DESC']]
    });
    res.status(200).json({ success: true, attendance });
  } catch (error) {
    console.error("Error fetching attendance history:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching attendance history",
      error: error.message 
    });
  }
};

export const getAttendanceSummary = async (req, res) => {
  try {
    const summary = await AttendanceSummary.findAll({
      order: [['ecode', 'ASC']]
    });
    res.status(200).json({ success: true, summary });
  } catch (error) {
    console.error("Error fetching attendance summary:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching attendance summary",
      error: error.message 
    });
  }
};

export const deleteAllAttendance = async (req, res) => {
  try {
    const transaction = await Attendance.sequelize.transaction();
    
    try {
      const attendanceDeleted = await Attendance.destroy({ 
        where: {}, 
        truncate: true, 
        transaction 
      });
      const historyDeleted = await AttendanceHistory.destroy({ 
        where: {}, 
        truncate: true, 
        transaction 
      });
      const summaryDeleted = await AttendanceSummary.destroy({ 
        where: {}, 
        truncate: true, 
        transaction 
      });

      await transaction.commit();

      res.status(200).json({ 
        success: true,
        message: "All enhanced attendance records deleted successfully",
        details: {
          attendanceRecords: attendanceDeleted,
          historyRecords: historyDeleted,
          summaryRecords: summaryDeleted
        }
      });
    } catch (deleteError) {
      await transaction.rollback();
      throw deleteError;
    }
  } catch (error) {
    console.error("Error deleting all attendance records:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};