import Attendance from "../models/Attendance.js";
import moment from "moment";
import AttendanceSummary from "../models/AttendanceSummary.js";
import AttendanceHistory from "../models/AttendanceHistory.js";


// Function to convert Excel serial date to YYYY-MM-DD format
const excelSerialToDate = (serial) => {
  const excelEpoch = new Date(1899, 11, 30); // Excel starts counting from this date
  return moment(excelEpoch).add(serial, "days").format("YYYY-MM-DD"); // Convert to readable format
};

export const saveAttendance = async (req, res) => {
  try {
    console.log("Received attendance data:", req.body);

    const attendanceRecords = req.body.attendanceData;

    if (!attendanceRecords || !Array.isArray(attendanceRecords)) {
      return res.status(400).json({ message: "Invalid data format. Expecting an array." });
    }

    const formattedRecords = attendanceRecords.map(record => {
      if (record.ea_txndte) {
        let formattedDate = record.ea_txndte;

        // Check if the date is an Excel serial number (a number)
        if (!isNaN(formattedDate) && Number(formattedDate) > 30000) { 
          formattedDate = excelSerialToDate(Number(formattedDate)); // Convert from Excel format
        } else {
          const parsedDate = moment(formattedDate, ["DD-MMM-YY", "YYYY-MM-DD"], true);
          if (!parsedDate.isValid()) {
            console.error(`Invalid date format: ${formattedDate}`);
            throw new Error(`Invalid date format: ${formattedDate}. Expected format: DD-MMM-YY or YYYY-MM-DD.`);
          }
          formattedDate = parsedDate.format("YYYY-MM-DD"); // Convert to MySQL format
        }

        record.ea_txndte = formattedDate; // Replace with corrected date
      }
      return record;
    });

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

    // Ensure required fields are included
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

    // Bulk insert using Sequelize
    const result = await AttendanceSummary.bulkCreate(formattedData, {
      updateOnDuplicate: ["totalTardiness", "totalHours", "totalOvertime", "daysPresent", "holidayCount", "regularDays", "totalHolidayHours", "totalRegularHours"]
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
    res.status(200).json({attendance});
  } catch (error) {
    res.status(500).json({success: false, error: "error in attendancController"});
  }
}
export const getAttendanceHistory = async (req, res) => {
  try {
    const attendance = await AttendanceHistory.findAll();
    res.status(200).json({attendance});
  } catch (error) {
    res.status(500).json({success: false, error: "error in attendancController"});
  }
}

export const getAttendanceSummary = async (req, res) => {
  try {
    const summary = await AttendanceSummary.findAll()
    res.status(200).json({summary});
  } catch (error) {
    res.status(500).json({success: false, error:"error in attendancecontroller"})
  }
 }

 export const deleteAllAttendance = async (req, res) => {
  try {
    // Delete all records from Attendance and AttendanceHistory
    await Attendance.destroy({ where: {}, truncate: true });
    await AttendanceSummary.destroy({ where: {}, truncate: true });

    res.status(200).json({ message: "All attendance records deleted successfully" });
  } catch (error) {
    console.error("Error deleting all attendance records:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
