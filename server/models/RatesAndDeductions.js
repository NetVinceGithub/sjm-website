import mongoose from 'mongoose';
import { Schema, Types } from 'mongoose';

const ratesAndDeductionsSchema = new Schema({
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
  sss: { type: Types.Decimal128, required: true },
  phic: { type: Types.Decimal128, required: true },
  hdmf: { type: Types.Decimal128, required: true },
  hmo: { type: Types.Decimal128, required: true },
  tardiness: { type: Types.Decimal128, required: true },
}, { timestamps: true });

const RatesAndDeductions = mongoose.model('RatesAndDeductions', ratesAndDeductionsSchema);
export default RatesAndDeductions;
