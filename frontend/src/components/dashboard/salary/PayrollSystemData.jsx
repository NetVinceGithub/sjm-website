import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PayrollSystemData = ({ employeeId }) => {
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
     
      dailyRate: formData.dailyRate,
      basicPay: formData.basicPay,
      hourlyRate: formData.hourlyRate,
      otRateRegular: formData.otRateRegular,
      otRateSpecialHoliday: formData.otRateSpecialHoliday,
      otRateRegularHoliday: formData.otRateRegularHoliday,
      specialHolidayRate: formData.specialHolidayRate,
      regularHolidayRate: formData.regularHolidayRate,
      specialHolidayOtRate: formData.specialHolidayOtRate,
      regularHolidayOtRate: formData.regularHolidayOtRate,
      ndRate: formData.ndRate,
      tardiness: formData.tardiness,
    };
  
    try {
      const response = await axios.post('http://localhost:5000/api/rates/add', rateData);
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
              type="number"
              name="dailyRate"
              onChange={handleChange}
              placeholder='Name'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Basic Pay*/}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              Basic Pay
            </label>
            <input
              type="number"
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
              type="number"
              name="hourlyRate"
              onChange={handleChange}
              placeholder='Hourly Rate'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Ot Rate Regular */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              Input
            </label>
            <input
              type="number"
              name="otRateRegular"
              onChange={handleChange}
              placeholder='Ot Rate Regular'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Ot Rate Special Holiday */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              Ot Rate Special Holiday
            </label>
            <input
              type="number"
              name="otRateSpecialHoliday"
              onChange={handleChange}
              placeholder='Ot Rate Special Holiday'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Ot Rate Regular Holiday */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
            Ot Rate Regular Holiday
            </label>
            <input
              type="number"
              name="otRateRegularHoliday"
              onChange={handleChange}
              placeholder='Ot Rate Regular Holiday'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Special Holiday Ot Rate */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
            Special Holiday Rate
            </label>
            <input
              type="number"
              name="specialHolidayRate"
              onChange={handleChange}
              placeholder='Special Holiday Rate'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Regualr Holiday Rate*/}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
            Regualr Holiday Rate
            </label>
            <input
              type="number"
              name="regularHolidayRate"
              onChange={handleChange}
              placeholder='Regualr Holiday Rate'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Special Holiday Ot Rate */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
            Special Holiday Ot Rate
            </label>
            <input
              type="number"
              name="specialHolidayOtRate"
              onChange={handleChange}
              placeholder='Special Holiday Ot Rate'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Regular Holiday Ot Rate*/}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
            Regular Holiday Ot Rate
            </label>
            <input
              type="number"
              name="regularHolidayOtRate"
              onChange={handleChange}
              placeholder='Regular Holiday Ot Rate'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* ndRate */}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
              ND Rate
            </label>
            <input
              type="number"
              name="ndRate"
              onChange={handleChange}
              placeholder='ND Rate'
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
            />
          </div>

          {/* Tardiness*/}
          <div>
            <label className='block text-sm font-medium text-grey-700'>
            Tardiness
            </label>
            <input
              type="number"
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

export default PayrollSystemData;
