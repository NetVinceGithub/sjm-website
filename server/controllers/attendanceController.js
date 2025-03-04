import Attendance from "../models/Attendance.js";
import moment from "moment";
import AttendanceSummary from "../models/AttendanceSummary.js";

export const saveAttendance = async (req, res) => {
  try {
    console.log("Received attendance data:", req.body); // Debugging

    const attendanceRecords = req.body.attendanceData;

    if (!attendanceRecords || !Array.isArray(attendanceRecords)) {
      return res.status(400).json({ message: "Invalid data format. Expecting an array." });
    }

    // Convert date format before inserting
    const formattedRecords = attendanceRecords.map(record => ({
      ...record,
      ea_txndte: moment(record.ea_txndte, ["DD-MMM-YY", "YYYY-MM-DD"]).format("YYYY-MM-DD") // Convert date
    }));

    // Bulk insert using Sequelize
    const result = await Attendance.bulkCreate(formattedRecords);

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

