import express from 'express';
import { addHoliday, getHolidays, deleteHoliday } from '../controllers/holidayController.js'; // ✅ Import delete function

const router = express.Router();

router.get("/", getHolidays);  
router.post("/add", addHoliday);
router.delete("/delete/:id", deleteHoliday); // ✅ Delete route

export default router;
