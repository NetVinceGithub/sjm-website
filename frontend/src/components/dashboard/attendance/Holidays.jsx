import React, { useState, useEffect } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarStyles.css"; // Add custom styling here
import Breadcrumb from "../dashboard/Breadcrumb";
import DataTable from "react-data-table-component";

const Holidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedHoliday, setSelectedHoliday] = useState("");

  // Added state for holiday rates modal and rates data
  const [showRateModal, setShowRateModal] = useState(false);
  const [holidayRates, setHolidayRates] = useState({
    regular: 0,
    special: 0,
    specialNonWorking: 0,
  });
  const [loadingRates, setLoadingRates] = useState(false);

  useEffect(() => {
    fetchHolidays();
    fetchHolidayRates();
  }, []);

  const fetchHolidays = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/holidays`);
      setHolidays(response.data.holidays || []);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      setHolidays([]);
    }
  };

  const addHoliday = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/holidays/add`, {
        name,
        date,
        type,
      });
      fetchHolidays();
      setName("");
      setDate("");
      setType("");
    } catch (error) {
      console.error("Error adding holiday:", error);
    }
  };

  const columns = [
    {
      name: "Date",
      selector: (row) => row.date,
      sortable: true,
    },
    {
      name: "Holiday Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Type",
      selector: (row) => row.type,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <button
          onClick={() => deleteHoliday(row.id)}
          className="bg-red-500/40 text-white h-10 w-18 py-1 px-3 rounded-lg hover:bg-red-600 transition duration-200"
        >
          Delete
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  const deleteHoliday = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/holidays/delete/${id}`);
      fetchHolidays();
    } catch (error) {
      console.error("Error deleting holiday:", error);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const holiday = holidays.find(
      (h) => new Date(h.date).toDateString() === date.toDateString()
    );
    setSelectedHoliday(
      holiday ? `${holiday.name} (${holiday.type})` : "No holiday"
    );
  };

  const tileClassName = ({ date }) => {
    const holiday = holidays.find(
      (h) => new Date(h.date).toDateString() === date.toDateString()
    );
    if (holiday) {
      switch (holiday.type) {
        case "Regular":
          return "holiday-regular";
        case "Special":
          return "holiday-special";
        case "Special Non-Working":
          return "holiday-special-non-working";
        default:
          return "";
      }
    }
    return "";
  };

  // --- NEW FUNCTIONS AND HANDLERS FOR HOLIDAY RATE MODAL ---

  // Fetch current holiday rates from backend or use defaults
  const fetchHolidayRates = async () => {
    setLoadingRates(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/holidays/holiday-rates`);
      if (res.data && res.data.rates) {
        setHolidayRates({
          regular: res.data.rates.regular ?? 1,
          special: res.data.rates.special ?? 1,
          specialNonWorking: res.data.rates.specialNonWorking ?? 1,
        });
      } else {
        setHolidayRates({ regular: 1, special: 1, specialNonWorking: 1 });
      }
    } catch (err) {
      console.error("Failed to load holiday rates, using defaults", err);
      setHolidayRates({ regular: 1, special: 1, specialNonWorking: 1 });
    } finally {
      setLoadingRates(false);
    }
  };

  // Open modal and fetch current rates
  const openRateModal = () => {
    fetchHolidayRates();
    setShowRateModal(true);
  };

  // Close modal
  const closeRateModal = () => {
    setShowRateModal(false);
  };

  // Handle input changes inside modal
  const handleRateChange = (e) => {
    const { name, value } = e.target;
    setHolidayRates((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  // Save holiday rates to backend
  const saveHolidayRates = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/holidays/holiday-rates`, holidayRates);
      alert("Holiday rates saved successfully!");
      closeRateModal();
    } catch (error) {
      console.error("Error saving holiday rates:", error);
      alert("Failed to save holiday rates.");
    }
  };

  return (
    <div className="fixed top-0 right-0 bottom-0 min-h-screen w-[calc(100%-16rem)] bg-neutralSilver p-6 pt-16">
      <div className="h-[calc(100vh-150px)]">
        {/* ... Breadcrumb and layout code unchanged */}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Calendar on the left */}
          <div className="lg:w-1/2">
            <Calendar
              onClickDay={handleDateClick}
              tileClassName={tileClassName}
              className="custom-calendar"
            />
          </div>

          {/* Add Holiday Form on the right */}
          <div className="lg:w-1/2 bg-white p-3 rounded-lg">
            <h3 className="text-lg mb-4 text-neutralDGray">Add Holiday</h3>
            <div className="flex flex-col gap-3 -mt-3">
              {/* inputs unchanged */}
              <input
                type="text"
                placeholder="Holiday Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="p-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="p-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Type</option>
                <option value="Regular">Regular Holiday</option>
                <option value="Special">Special Holiday</option>
                <option value="Special Non-Working">
                  Special Non-Working Holiday
                </option>
              </select>

              <div className="flex items-center gap-4">
                <button
                  onClick={addHoliday}
                  className="p-2 text-sm h-10 w-32 text-neutralDGray border hover:text-white hover:bg-green-400 rounded flex items-center justify-center"
                >
                  Add Holiday
                </button>

                {/* Show rates next to Add Holiday button */}
                <div className="text-sm text-neutralDGray">
                  <div>Rates:</div>
                  <div>
                    Regular: <strong>{holidayRates.regular}</strong>
                  </div>
                  <div>
                    Special: <strong>{holidayRates.special}</strong>
                  </div>
                  <div> 
                    Special Non-Working:{" "}
                    <strong>{holidayRates.specialNonWorking}</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  // your modal open logic here
                }}
                className="p-2 mt-3 text-sm h-10 w-32 text-neutralDGray border hover:text-white hover:bg-green-400 rounded flex items-center justify-center"
              >
                Edit Holiday Rate
              </button>
            </div>
          </div>
        </div>

        {/* List Holidays unchanged */}
        <div className="bg-white p-1 mt-6 rounded-lg">
          <div className="mt-6 text-sm italic">
            <DataTable
              columns={columns}
              data={holidays}
              noDataComponent="No holidays available."
              pagination
              paginationRowsPerPageOptions={[10, 15, 20, 30]}
              dense
              highlightOnHover
              striped
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Holidays;
