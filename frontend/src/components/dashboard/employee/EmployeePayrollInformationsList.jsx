import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
import axios from "axios";
import { EmployeeButtons } from "../../../utils/EmployeeHelper";
import { FaSearch, FaSyncAlt } from "react-icons/fa";
import { PayrollButtons } from "../../../utils/PayrollHelper";
import Breadcrumb from "../dashboard/Breadcrumb";
import { FaPrint, FaRegFileExcel, FaRegFilePdf } from "react-icons/fa6";

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

  const customStyles = {
    table: {
      style: {
        justifyContent: "center",
        textAlign: "center",
        fontWeight: "bold",
        backgroundColor: "#fff",
        width: "100%",
        margin: "0 auto",
      },
    },
    headCells: {
      style: {
        backgroundColor: "#fff",
        color: "#333",
        textAlign: "center",
        fontWeight: "bold",
        justifyContent: "center", // Centers content horizontally
        display: "flex", // Required for justifyContent to work
        alignItems: "center", // Centers content vertically
      },
    },
    cells: {
      style: {
        padding: "8px",
        textAlign: "center", // Centers text
        justifyContent: "center", // Centers content horizontally
        display: "flex", // Needed for flex properties to work
        alignItems: "center", // Centers content vertically
      },
    },
  };

  return (
    <div className="fixed p-6 pt-16">
      <Breadcrumb
        items={[
          { label: "Payroll", href: "" },
          { label: "Payroll Information", href: "/admin-dashboard/employees" },
        ]}
      />
      <div className="-mt-2 bg-white p-3 py-3 rounded-lg shadow">
        <div className="flex items-center justify-between">
          {/* Button Group - Centered Vertically */}
          <div className="inline-flex border border-neutralDGray rounded h-8">
            <button className="px-3 w-20 h-full border-r hover:bg-neutralSilver transition-all duration-300 border-neutralDGray rounded-l flex items-center justify-center">
              <FaPrint title="Print" className="text-neutralDGray] transition-all duration-300" />
            </button>
  
            <button className="px-3 w-20 h-full border-r hover:bg-neutralSilver transition-all duration-300 border-neutralDGray flex items-center justify-center">
              <FaRegFileExcel title="Export to Excel" className=" text-neutralDGray" />
            </button>
            <button className="px-3 w-20 h-full hover:bg-neutralSilver transition-all duration-300 rounded-r flex items-center justify-center">
              <FaRegFilePdf title="Export to PDF" className=" text-neutralDGray" />
            </button>
          </div>
  
          {/* Search & Sync Section - Aligned with Buttons */}
          <div className="flex items-center gap-3">
            <div className="flex rounded items-center">
              <input
                type="text"
                placeholder="Search Employee"
                onChange={handleFilter}
                className="px-2 rounded py-0.5 border"
              />
              <FaSearch className="ml-[-20px] text-neutralDGray" />
            </div>
          </div>
        </div>

        {/* Containing the table list */}
        <div className="mt-4 overflow-x-auto">
          <div className="w-full max-w-[75rem]">
            {/* Scrollable Table Wrapper */}
            <div className="max-h-[35rem] overflow-y-auto text-neutralDGray border rounded-md">
              <DataTable
                customStyles={customStyles}
                columns={[
                  { name: "Ecode", selector: (row) => row.ecode, sortable: true, center:true },
                  { name: "Name", selector: (row) => row.name, sortable: true, center:true, width: "200px" },
                  { name: "Daily Rate", selector: (row) => row.daily_rate, sortable: true, center:true, width:"120px" },
                  { name: "Holiday Pay", selector: (row) => row.holiday_pay || "0", sortable: true, center:true, width: "150px" },
                  { name: "Night Differential", selector: (row) => row.night_differential || "0", sortable: true, center:true, width:"200px" },
                  { name: "Allowance", selector: (row) => row.allowance || "0", sortable: true, center:true, width:"120px" },
                  { name: "Tax", selector: (row) => row.tax_deduction || "0", sortable: true, center:true },
                  { name: "SSS", selector: (row) => row.sss_contribution || "0", sortable: true, center:true },
                  { name: "Pagibig", selector: (row) => row.pagibig_contribution || "0", sortable: true, center:true },
                  { name: "PhilHealth", selector: (row) => row.philhealth_contribution || "0", sortable: true, center:true, width:"120px" },
                  { name: "Loan", selector: (row) => row.loan || "0", sortable: true, center:true },
                  { name: "Options", cell: (row) => <PayrollButtons Id={row.employeeId || row.id} refreshData={fetchPayrollInformations} /> }
                ]}
                data={filteredEmployees}
                pagination
                progressPending={loading}
              />
            </div>
          </div>
        </div>

      </div>
    </div>

  );
};

export default EmployeePayrollInformationsList;
