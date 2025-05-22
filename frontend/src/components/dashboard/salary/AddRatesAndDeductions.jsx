import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddRatesAndDeductions = ({ employeeId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    dailyRate: 0,
    basicPay: 0,
    hourlyRate: 0,
    otRateRegular: 0,
    otRateSpecialHoliday: 0,
    otRateRegularHoliday: 0,
    specialHolidayRate: 0,
    regularHolidayRate: 0, 
    specialHolidayOtRate: 0,
    regularHolidayOtRate: 0,
    ndRate: 0,
    sss: 0,
    phic: 0, 
    hdmf: 0,
    hmo: 0,
    tardiness: 0,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    const rateData = {
      dailyRate: parseFloat(formData.dailyRate),
      basicPay: parseFloat(formData.basicPay),
      hourlyRate: parseFloat(formData.hourlyRate),
      otRateRegular: parseFloat(formData.otRateRegular),
      otRateSpecialHoliday: parseFloat(formData.otRateSpecialHoliday),
      otRateRegularHoliday: parseFloat(formData.otRateRegularHoliday),
      specialHolidayRate: parseFloat(formData.specialHolidayRate),
      regularHolidayRate: parseFloat(formData.regularHolidayRate),
      specialHolidayOtRate: parseFloat(formData.specialHolidayOtRate),
      regularHolidayOtRate: parseFloat(formData.regularHolidayOtRate),
      ndRate: parseFloat(formData.ndRate),
      sss: parseFloat(formData.sss),
      phic: parseFloat(formData.phic),
      hdmf: parseFloat(formData.hdmf),
      hmo: parseFloat(formData.hmo),
      tardiness: parseFloat(formData.tardiness),
    };

    try {
      const response = await axios.post('${import.meta.env.VITE_API_URL}/api/rates/add', rateData);
      console.log('Rate added successfully:', response.data);
    } catch (error) {
      console.error('Error adding rate:', error.response?.data || error.message);
    }
  };

  return (
    <div className='max-w-4x1 mx-auto mt-10 bg-white p-8 rounded-md shadow-md'>
      <h2 className='text-2x1 font-bold mb-6'>Add Rate</h2>
      <form onSubmit={handleSubmit}>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>

          {/* Daily Rate */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              Daily Rate
            </label>
            <input
              type="text"
              step="0.01"
              name="dailyRate"
              onChange={handleChange}
              placeholder='Daily Rate'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Basic Pay */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              Basic Pay
            </label>
            <input
              type="text"
              step="0.01"
              name="basicPay"
              onChange={handleChange}
              placeholder='Basic Pay'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Hourly Rate */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              Hourly Rate
            </label>
            <input
              type="text"
              step="0.01"
              name="hourlyRate"
              onChange={handleChange}
              placeholder='Hourly Rate'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* OT Rate Regular */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              OT Rate Regular
            </label>
            <input
              type="text"
              step="0.01"
              name="otRateRegular"
              onChange={handleChange}
              placeholder='OT Rate Regular'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* OT Rate Special Holiday */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              OT Rate Special Holiday
            </label>
            <input
              type="text"
              step="0.01"
              name="otRateSpecialHoliday"
              onChange={handleChange}
              placeholder='OT Rate Special Holiday'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* OT Rate Regular Holiday */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              OT Rate Regular Holiday
            </label>
            <input
              type="text"
              step="0.01"
              name="otRateRegularHoliday"
              onChange={handleChange} 
              placeholder='OT Rate Regular Holiday'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Special Holiday Rate */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              Special Holiday Rate
            </label>
            <input
              type="text"
              step="0.01"
              name="specialHolidayRate"
              onChange={handleChange}
              placeholder='Special Holiday Rate'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Regular Holiday Rate */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              Regular Holiday Rate
            </label>
            <input
              type="text"
              step="0.01"
              name="regularHolidayRate"
              onChange={handleChange}
              placeholder='Regular Holiday Rate'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Special Holiday OT Rate */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              Special Holiday OT Rate
            </label>
            <input
              type="text"
              step="0.01"
              name="specialHolidayOtRate"
              onChange={handleChange}
              placeholder='Special Holiday OT Rate'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Regular Holiday OT Rate */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              Regular Holiday OT Rate
            </label>
            <input
              type="text"
              step="0.01"
              name="regularHolidayOtRate"
              onChange={handleChange}
              placeholder='Regular Holiday OT Rate'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* ND Rate */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              ND Rate
            </label>
            <input
              type="text"
              step="0.01"
              name="ndRate"
              onChange={handleChange}
              placeholder='ND Rate'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* SSS */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              SSS
            </label>
            <input
              type="text"
              step="0.01"
              name="sss"
              onChange={handleChange}
              placeholder='SSS'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* PHIC */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              PHIC
            </label>
            <input
              type="text"
              step="0.01"
              name="phic"
              onChange={handleChange}
              placeholder='PHIC'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* HDMF */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              HDMF
            </label>
            <input
              type="text"
              step="0.01"
              name="hdmf"
              onChange={handleChange}
              placeholder='HDMF'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* HMO */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              HMO
            </label>
            <input
              type="text"
              step="0.01"
              name="hmo"
              onChange={handleChange}
              placeholder='HMO'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Tardiness */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              Tardiness
            </label>
            <input
              type="text"
              step="0.01"
              name="tardiness"
              onChange={handleChange}
              placeholder='Tardiness'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className='w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4'
        >
          Add Rate
        </button>
      </form>
    </div>
  );
};

export default AddRatesAndDeductions;
