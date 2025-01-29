import React, { useEffect, useState } from 'react';
import { FaUsers, FaBuilding, FaMoneyBillWave, FaCashRegister, FaHandHoldingUsd, FaChartPie } from 'react-icons/fa';
import { Link } from 'react-router-dom'; // Ensure you have this import
import SummaryCard from './SummaryCard';
import axios from 'axios';

const PayrollSummary = () => {
  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold">Payroll Dashboard Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <SummaryCard icon={<FaCashRegister />} text="Total Payroll" number={13} color="bg-[#88B9D3]" />
        <SummaryCard icon={<FaHandHoldingUsd />} text="Gross Salary" number={5} color="bg-[#B9DD8B]" />
        <SummaryCard icon={<FaChartPie />} text="Total Employee Benefits" number="$654" color="bg-[#D18AA6]" />
        <SummaryCard icon={<FaUsers />} text="Total Headcount" number={0} color="bg-[#95B375]" />
      </div>

      {/* Button Section */}
      <div className="flex space-x-4 mt-6">
        <Link
          to="/admin-dashboard/create-request"
          className="px-4 py-2 bg-teal-600 rounded text-white hover:bg-teal-700"
        >
          Create Request
        </Link>
        <Link
          to="/admin-dashboard/create-payroll"
          className="px-4 py-2 bg-teal-600 rounded text-white hover:bg-teal-700"
        >
          Create Payroll
        </Link>
      </div>
    </div>
  );
};

export default PayrollSummary;
