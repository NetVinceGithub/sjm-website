import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import axios from "axios";

const PayrollDashboard = () => {
  const [rates, setRates] = useState([]);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/rates", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.data.success) {
          const data = response.data.rates.map((rate) => ({
            dailyRate: rate.dailyRate,
            basicPay: rate.basicPay,
            hourlyRate: rate.hourlyRate,
            otRateRegular: rate.otRateRegular,
            otRateSpecialHoliday: rate.otRateSpecialHoliday,
            otRateRegularHoliday: rate.otRateRegularHoliday,
            specialHolidayRate: rate.specialHolidayRate,
            regularHolidayRate: rate.regularHolidayRate,
            specialHolidayOtRate: rate.specialHolidayOtRate,
            regularHolidayOtRate: rate.regularHolidayOtRate,
            ndRate: rate.ndRate,
            tardiness: rate.tardiness,
          }));

          setRates(data);
        }
      } catch (error) {
        console.error("Error fetching rates:", error);
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      }
    };

    fetchRates();
  }, []);

  // Split the columns into two parts
  const leftColumns = [
    { name: "Daily Rate", selector: (row) => row.dailyRate, width: "90px" },
    { name: "Basic Pay", selector: (row) => row.basicPay, width: "70px" },
    { name: "Hourly Rate", selector: (row) => row.hourlyRate, width: "70px" },
    {
      name: "Ot Rate Regular",
      selector: (row) => row.otRateRegular,
      sortable: true,
      width: "100px",
    },
    {
      name: "Ot Rate Special Holiday",
      selector: (row) => row.otRateSpecialHoliday,
      width: "120px",
    },
    {
      name: "Ot Rate Regular Holiday",
      selector: (row) => row.otRateRegularHoliday,
      width: "90px",
    },
  ];

  const rightColumns = [
    {
      name: "Special Holiday Rate",
      selector: (row) => row.specialHolidayRate,
      width: "70px",
    },
    {
      name: "Regular Holiday Rate",
      selector: (row) => row.regularHolidayRate,
      width: "70px",
    },
    {
      name: "Special Holiday Ot Rate",
      selector: (row) => row.specialHolidayOtRate,
      sortable: true,
      width: "100px",
    },
    {
      name: "Regular Holiday Ot Rate",
      selector: (row) => row.regularHolidayOtRate,
      width: "120px",
    },
    {
      name: "ND Rate",
      selector: (row) => row.ndRate,
      sortable: true,
      width: "100px",
    },
    { name: "Tardiness", selector: (row) => row.tardiness, width: "120px" },
  ];

  return (
    <div>
      <h1>Payroll Dashboard / System Data</h1>
      <div className="text-center">
        <h3 className="text-2xl font-bold">Manage Payroll Data</h3>
      </div>
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search by Name"
          className="px-4 py-0.5 border"
        />
        <Link
          to="/admin-dashboard/add-employee"
          className="px-4 py-1 bg-teal-600 rounded text-white"
        >
          Add New Employee
        </Link>
      </div>
      <div className="mt-6 flex justify-between">
        {/* Left Table */}
        <div className="w-1/2 pr-4">
          <DataTable
            columns={leftColumns} // Left side columns
            data={rates} // Pass rates data
            pagination
          />
        </div>

        {/* Right Table */}
        <div className="w-1/2 pl-4">
          <DataTable
            columns={rightColumns} // Right side columns
            data={rates} // Pass rates data
            pagination
          />
        </div>
      </div>

      <div>Gov't Mandatory Benefits</div>
      <div>Allowance</div>
      <div>Loan</div>
    </div>
  );
};

export default PayrollDashboard;
