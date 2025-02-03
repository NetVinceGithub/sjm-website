import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditRatesAndDeductions = () => {
  const { id } = useParams(); // Get the rate ID from the URL
  const navigate = useNavigate();

  const [rates, setRates] = useState({
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

  // Fetch the rate data by ID
  useEffect(() => {
    console.log("Fetching rate for ID:", id);

    const fetchRate = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/rates/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        console.log("API Response:", response.data);

        if (response.data.success) {
          const rateData = response.data.rate;

          const formattedRates = Object.keys(rates).reduce((acc, key) => {
            const value = rateData[key]?.$numberDecimal
              ? parseFloat(rateData[key].$numberDecimal)
              : rateData[key] || 0; // ✅ Ensures zero is accepted
            acc[key] = isNaN(value) ? 0 : value;
            return acc;
          }, {});

          setRates(formattedRates);
        } else {
          console.error("Failed to fetch rates. Response:", response.data);
        }
      } catch (error) {
        console.error("Error fetching rates:", error.response?.data || error.message);
      }
    };

    fetchRate();
  }, [id]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    const numValue = value === "" ? 0 : parseFloat(value) || 0; // ✅ Keeps zero if user inputs 0

    setRates((prevRates) => ({
      ...prevRates,
      [name]: numValue,
    }));
  };

  // Submit updated rates
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting data:", rates);

    try {
      const response = await axios.put(
        `http://localhost:5000/api/rates/${id}`,
        rates,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        alert("Rates updated successfully.");
        navigate("/admin-dashboard/rates-data-dashboard");
      } else {
        alert("Failed to update rates.");
      }
    } catch (error) {
      console.error("Error updating rates:", error.response?.data || error.message);
      alert("An error occurred while updating rates.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md">
      <h2 className="text-2xl font-bold mb-6">Edit Rate</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(rates).map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </label>
              <input
                type="number"
                step="0.01"
                name={key}
                value={rates[key]}
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md"
        >
          Edit Rate
        </button>
      </form>
    </div>
  );
};

export default EditRatesAndDeductions;
