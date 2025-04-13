import express from 'express';
import { addHoliday, getHolidays, deleteHoliday } from '../controllers/holidayController.js';

const router = express.Router();

router.get("/", getHolidays);
router.post("/add", addHoliday);
router.delete("/delete/:id", deleteHoliday);

export default router;
