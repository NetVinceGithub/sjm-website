import express from 'express';
import { addHoliday, getHolidays, deleteHoliday, getHolidayRates, setHolidayRates } from '../controllers/holidayController.js';

const router = express.Router();

router.get("/", getHolidays);
router.post("/add", addHoliday);
router.delete("/delete/:id", deleteHoliday);

// New routes for holiday rates
router.get("/holiday-rates", getHolidayRates);
router.post("/holiday-rates", setHolidayRates);

export default router;
