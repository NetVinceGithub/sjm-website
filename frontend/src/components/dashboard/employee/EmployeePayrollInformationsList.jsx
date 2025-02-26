import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
import axios from "axios";
import { EmployeeButtons } from "../../../utils/EmployeeHelper";
import { FaSearch, FaSyncAlt } from "react-icons/fa";
import { PayrollButtons } from "../../../utils/PayrollHelper";

const EmployeePayrollInformationsList = () => {
  const [payrollInformations, setPayrollInformations] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchPayrollInformations();
  }, []);

  const fetchPayrollInformations = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/employee/payroll-informations");
      if (response.data.success) {
        console.log(response.data);
        setPayrollInformations(response.data.payrollInformations);
        setFilteredEmployees(response.data.payrollInformations);
      }
    } catch (error) {
      console.error("Error fetching payroll-informations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const records = payrollInformations.filter((emp) =>
      emp.name.toLowerCase().includes(searchTerm)
    );
    setFilteredEmployees(records);
  };
  

  return (
    <div className="p-6">
      <h6 className="mt-1">
        <span className="text-green-500 font-bold">Employee Payroll Informations</span> / Employee Data
      </h6>
      <div className="mt-4 bg-white p-4 rounded-lg shadow">
        <h3 className="text-2xl mt-2 font-bold text-center">MANAGE PAYROLL INFORMATION</h3>

        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search by Name"
              onChange={handleFilter}
              className="px-4 py-0.5 border"
            />
            <FaSearch className="ml-[-20px] text-gray-500" />
          </div>
          

        </div>

        {/* Containing the table list */}
        <div className="mt-6 overflow-x-auto">
        <DataTable
          columns={[
            { name: "Ecode", selector: (row) => row.ecode, sortable: true },
            { name: "Name", selector: (row) => row.name, sortable: true },
            { name: "Daily Rate", selector: (row) => row.daily_rate, sortable: true },
            { name: "Holiday Pay", selector: (row) => row.holiday_pay || "0", sortable: true },
            { name: "Night Differential", selector: (row) => row.night_differential || "0", sortable: true },
            { name: "Allowance", selector: (row) => row.allowance || "0", sortable: true },
            { name: "Tax", selector: (row) => row.tax_deduction || "0", sortable: true },
            { name: "SSS", selector: (row) => row.sss_contribution || "0", sortable: true },
            { name: "Pagibig", selector: (row) => row.pagibig_contribution || "0", sortable: true },
            { name: "Phil Health", selector: (row) => row.philhealth_contribution || "0", sortable: true },
            { name: "Loan", selector: (row) => row.loan || "0", sortable: true },
            { name: "Options", cell: (row) => <PayrollButtons Id={row.employeeId || row.id} refreshData={fetchPayrollInformations} /> }
          ]}
          data={filteredEmployees}
          pagination
          progressPending={loading}
        />

        </div>
      </div>
    </div>

  );
};

export default EmployeePayrollInformationsList;
