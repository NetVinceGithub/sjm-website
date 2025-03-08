import Attendance from "../models/Attendance.js";
import moment from "moment";
import AttendanceSummary from "../models/AttendanceSummary.js";


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

    const result = await Attendance.bulkCreate(formattedRecords, { validate: true });

    res.status(201).json({
      message: "Attendance data saved successfully",
      insertedRows: result.length,
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

    // Bulk insert using Sequelize
    const result = await AttendanceSummary.bulkCreate(attendanceSummaryRecords);

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