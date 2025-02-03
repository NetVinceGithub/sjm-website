import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import axios from "axios";
import { RatesAndDeductionsButtons } from "../../../utils/RatesAndDeductionsHelper";

const RatesDashboard = () => {
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
            _id: rate._id, 
            dailyRate: parseFloat(rate.dailyRate.$numberDecimal) || 0,
            basicPay: parseFloat(rate.basicPay.$numberDecimal) || 0,
            hourlyRate: parseFloat(rate.hourlyRate.$numberDecimal) || 0,
            otRateRegular: parseFloat(rate.otRateRegular.$numberDecimal) || 0,
            otRateSpecialHoliday: parseFloat(rate.otRateSpecialHoliday.$numberDecimal) || 0,
            otRateRegularHoliday: parseFloat(rate.otRateRegularHoliday.$numberDecimal) || 0,
            specialHolidayRate: parseFloat(rate.specialHolidayRate.$numberDecimal) || 0,
            regularHolidayRate: parseFloat(rate.regularHolidayRate.$numberDecimal) || 0,
            specialHolidayOtRate: parseFloat(rate.specialHolidayOtRate.$numberDecimal) || 0,
            regularHolidayOtRate: parseFloat(rate.regularHolidayOtRate.$numberDecimal) || 0,
            ndRate: parseFloat(rate.ndRate.$numberDecimal) || 0,
            sss: parseFloat(rate.sss.$numberDecimal) || 0,
            phic: parseFloat(rate.phic.$numberDecimal) || 0,
            hdmf: parseFloat(rate.hdmf.$numberDecimal) || 0,
            hmo: parseFloat(rate.hmo.$numberDecimal) || 0,
            tardiness: parseFloat(rate.tardiness.$numberDecimal) || 0,
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
    {
      name: "Action",
      cell: (row) => <RatesAndDeductionsButtons Id={row._id} />,
      ignoreRowClick: true,
      Overflow: true,
    }
  ];

  return (
    <div>
      <h1>Payroll Dashboard / System Data</h1>
      <div className="text-center">
        <h3 className="text-2xl font-bold">Manage Payroll Data</h3>
      </div>
      
      <div className="mt-6 flex justify-between">
        <div className="w-1/2 pr-4">
          <DataTable columns={leftColumns} data={rates} pagination />
        </div>
        <div className="w-1/2 pl-4">
          <DataTable columns={rightColumns} data={rates} pagination />
        </div>
      </div>

      {/* Government Mandatory Benefits Section */}
      <div className="mt-6">
        <h3 className="text-lg font-bold">Gov't Mandatory Benefits</h3>
        <table className="border-collapse border w-full mt-2">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">SSS</th>
              <th className="border px-4 py-2">PHIC</th>
              <th className="border px-4 py-2">HDMF</th>
              <th className="border px-4 py-2">HMO</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((rate) => (
              <tr key={rate._id}>
                <td className="border px-4 py-2">{rate.sss.toFixed(2)}</td>
                <td className="border px-4 py-2">{rate.phic.toFixed(2)}</td>
                <td className="border px-4 py-2">{rate.hdmf.toFixed(2)}</td>
                <td className="border px-4 py-2">{rate.hmo.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-bold">Allowance</h3>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-bold">Loan</h3>
      </div>
    </div>
  );
};

export default RatesDashboard;
