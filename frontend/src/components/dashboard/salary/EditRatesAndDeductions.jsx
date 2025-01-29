import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditRatesAndDeductions = () => {
  const { id } = useParams(); // Get the rate ID from the URL
  const navigate = useNavigate();

  const [rates, setRates] = useState({
    dailyRate: "",
    basicPay: "",
    hourlyRate: "",
    otRateRegular: "",
    otRateRestday: "",
    otRateSpecialHoliday: "",
    otRateSpecialHolidayRestday: "",
    otRateRegularHoliday: "",
    otRateRegularHolidayRestday: "",
    specialHolidayRate: "",
    regularHolidayRate: "",
    specialHolidayOtRate: "",
    regularHolidayOtRate: "",
    ndRate: "",
    sss: "",
    phic: "",
    hdmf: "",
    hmo: "",
    tardiness: "",
  });

  // Fetch the rate data by ID
  useEffect(() => {
    console.log("Fetching rate for ID:", id); // Debugging
  
    const fetchRate = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/rates/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
  
        console.log("API Response:", response.data); // Log response
  
        if (response.data.success) {
          setRates(response.data.rate);
        } else {
          console.error("Failed to fetch rates. Response:", response.data);
        }
      } catch (error) {
        console.error("Error fetching rates:", error.response?.data || error.message);
      }
    };
  
    fetchRate();
  }, [id]);
  
  
  

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRates((prevRates) => ({
      ...prevRates,
      [name]: value,
    }));
  };

  // Submit updated rates
  const handleSubmit = async (e) => {
    e.preventDefault();
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
        navigate("/rates"); // Redirect after successful update
      } else {
        alert("Failed to update rates.");
      }
    } catch (error) {
      console.error("Error updating rates:", error);
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
                type="text"
                step="0.01"
                name={key}
                value={rates[key] || ""}
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
