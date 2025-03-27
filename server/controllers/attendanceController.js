import Attendance from "../models/Attendance.js";
import moment from "moment";
import AttendanceSummary from "../models/AttendanceSummary.js";
import AttendanceHistory from "../models/AttendanceHistory.js";


export const saveAttendance = async (req, res) => {
  try {
    console.log("Received attendance data:", req.body);

    const attendanceRecords = req.body.attendanceData;

    if (!attendanceRecords || !Array.isArray(attendanceRecords)) {
      return res.status(400).json({ message: "Invalid data format. Expecting an array." });
    }

    const formattedRecords = attendanceRecords.map(record => {
      if (record.ea_txndte) {
        const formattedDate = moment(record.ea_txndte, ["DD-MMM-YY", "YYYY-MM-DD"], true);
        if (!formattedDate.isValid()) {
          console.error(`Invalid date format: ${record.ea_txndte}`);
          throw new Error(`Invalid date format: ${record.ea_txndte}. Expected format: DD-MMM-YY or YYYY-MM-DD.`);
        }
        record.ea_txndte = formattedDate.format("YYYY-MM-DD"); // Convert to MySQL format
      }
      return record;
    });

    const result1 = await Attendance.bulkCreate(formattedRecords, { validate: true });
    const result2 = await AttendanceHistory.bulkCreate(formattedRecords, { validate: true });

    res.status(201).json({
      message: "Attendance data saved successfully",
      insertedRows: result1.length,
      insertedRows: result2.length,
    });

  } catch (error) {
    console.error("Error saving attendance:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const saveAttendanceSummary = async (req, res) => {
  try {
    console.log("Received attendance summary data:", req.body);

    const attendanceSummaryRecords = req.body.summaryData; // ✅ Correct variable name

    if (!attendanceSummaryRecords || !Array.isArray(attendanceSummaryRecords)) {
      return res.status(400).json({ message: "Invalid data format. Expecting an array." });
    }

    // Ensure `daysPresent` is included in each record
    const formattedData = attendanceSummaryRecords.map(record => ({
      ecode: record.ecode,
      totalTardiness: record.totalTardiness,
      totalHours: record.totalHours,
      totalOvertime: record.totalOvertime,
      daysPresent: record.daysPresent, // ✅ Store days present
    }));

    // Bulk insert using Sequelize
    const result = await AttendanceSummary.bulkCreate(formattedData);

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
