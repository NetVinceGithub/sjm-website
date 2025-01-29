import mongoose from 'mongoose';
import { Schema, Types } from 'mongoose';

const earningsSchema = new Schema({
  dailyRate: { type: Types.Decimal128, required: true },
  basicPay: { type: Types.Decimal128, required: true },
  hourlyRate: { type: Types.Decimal128, required: true },
  otRateRegular: { type: Types.Decimal128, required: true },
  otRateSpecialHoliday: { type: Types.Decimal128, required: true },
  otRateRegularHoliday: { type: Types.Decimal128, required: true },
  specialHolidayRate: { type: Types.Decimal128, required: true },
  regularHolidayRate: { type: Types.Decimal128, required: true },
  specialHolidayOtRate: { type: Types.Decimal128, required: true },
  regularHolidayOtRate: { type: Types.Decimal128, required: true },
  ndRate: { type: Types.Decimal128, required: true },
  tardiness: { type: Types.Decimal128, required: true },
}, { timestamps: true });

const Earnings = mongoose.model('Earnings', earningsSchema);
export default Earnings;
