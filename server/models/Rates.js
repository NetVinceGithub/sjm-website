import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const rateSchema = new Schema({

  dailyRate: { type: Number, required: true },
  basicPay: { type: Number, required: true },
  hourlyRate: { type: Number, required: true },
  otRateRegular: { type: Number, required: true },
  otRateSpecialHoliday: { type: Number, required: true },
  otRateRegularHoliday: { type: Number, required: true },
  specialHolidayRate: { type: Number, required: true },
  regularHolidayRate: { type: Number, required: true },
  specialHolidayOtRate: { type: Number, required: true },
  regularHolidayOtRate: { type: Number, required: true },
  ndRate: { type: Number, required: true },
  tardiness: { type: Number, required: true },
}, { timestamps: true });

const Rate = mongoose.model('Rate', rateSchema);
export default Rate;
