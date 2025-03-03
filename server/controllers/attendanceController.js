import Attendance from "../models/Attendance.js";
// Insert Attendance Data
export const insertAttendance = async (req, res) => {
  try {
    const attendanceRecords = req.body;

    if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    console.log("Received Data:", attendanceRecords); // Debugging log

    await Attendance.bulkCreate(attendanceRecords);

    res.status(201).json({ message: "Attendance data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ message: "Error inserting data", error: error.message });
  }
};


// Get All Attendance Records
export const getAttendance = async (req, res) => {
  try {
    const records = await Attendance.findAll();
    res.json(records);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ message: "Error fetching attendance data" });
  }
};
