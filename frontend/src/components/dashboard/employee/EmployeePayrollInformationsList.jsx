import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
import axios from "axios";
import { EmployeeButtons } from "../../../utils/EmployeeHelper";
import { FaSearch, FaSyncAlt, } from "react-icons/fa";
import { PayrollButtons } from "../../../utils/PayrollHelper";
import Breadcrumb from "../dashboard/Breadcrumb";
import { Modal, Button } from "react-bootstrap";
import { FaRegPenToSquare, FaXmark, FaRegFileExcel, FaRegFilePdf } from "react-icons/fa6";

const EmployeePayrollInformationsList = () => {
  const [payrollInformations, setPayrollInformations] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    fetchPayrollInformations();
  }, []);

  const fetchPayrollInformations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/employee/payroll-informations`);
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

  const handleSync = async () => {
    setSyncing(true);
    try {
      // Add your sync logic here if needed
      await fetchPayrollInformations();
    } catch (error) {
      console.error("Error syncing data:", error);
    } finally {
      setSyncing(false);
    }
  };

  const bulkEdit = () => {
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
  };

  const handleExportExcel = () => {
    // Implement Excel export functionality
    console.log("Export to Excel");
  };

  const handleExportPDF = () => {
    // Implement PDF export functionality
    console.log("Export to PDF");
  };

  const customStyles = {
    table: {
      style: {
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
        fontWeight: "bold",
        justifyContent: "center",
        display: "flex",
        alignItems: "center",
      },
    },
    cells: {
      style: {
        padding: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
    },
  };

  const columns = [
    {
      name: "Ecode",
      selector: (row) => row.ecode,
      sortable: true,
      center: true
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      center: true,
      width: "200px"
    },
    {
      name: "Position",
      selector: (row) => row.designation,
      sortable: true,
      center: true
    },
    {
      name: "Daily Rate",
      selector: (row) => `₱${parseFloat(row.daily_rate || 0).toLocaleString()}`,
      sortable: true,
      center: true,
      width: "120px"
    },
    {
      name: "Holiday Pay",
      selector: (row) => `₱${parseFloat(row.holiday_pay || 0).toLocaleString()}`,
      sortable: true,
      center: true,
      width: "150px"
    },
    {
      name: "Night Differential",
      selector: (row) => `₱${parseFloat(row.night_differential || 0).toLocaleString()}`,
      sortable: true,
      center: true,
      width: "200px"
    },
    {
      name: "Allowance",
      selector: (row) => `₱${parseFloat(row.allowance || 0).toLocaleString()}`,
      sortable: true,
      center: true,
      width: "120px"
    },
    {
      name: "Tax",
      selector: (row) => `₱${parseFloat(row.tax_deduction || 0).toLocaleString()}`,
      sortable: true,
      center: true
    },
    {
      name: "SSS",
      selector: (row) => `₱${parseFloat(row.sss_contribution || 0).toLocaleString()}`,
      sortable: true,
      center: true
    },
    {
      name: "Pagibig",
      selector: (row) => `₱${parseFloat(row.pagibig_contribution || 0).toLocaleString()}`,
      sortable: true,
      center: true
    },
    {
      name: "PhilHealth",
      selector: (row) => `₱${parseFloat(row.philhealth_contribution || 0).toLocaleString()}`,
      sortable: true,
      center: true,
      width: "120px"
    },
    {
      name: "Loan",
      selector: (row) => `₱${parseFloat(row.loan || 0).toLocaleString()}`,
      sortable: true,
      center: true
    },
    {
      name: "Options",
      cell: (row) => (
        <div className="flex justify-center items-center sticky-options">
          <PayrollButtons
            Id={row.employeeId || row.id}
            employee={row}
            refreshData={fetchPayrollInformations}
          />
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "100px",
      center: true,
      right: true
    }
  ];

  return (
    <div className="fixed top-0 right-0 bottom-0 min-h-screen w-[calc(100%-16rem)] bg-neutralSilver p-6 pt-16">
      <div className="h-[calc(100vh-80px)]">
        <Breadcrumb
          items={[
            { label: "Payroll", href: "" },
            { label: "Payroll Information", href: "/admin-dashboard/employees" },
          ]}
        />
        <div className="-mt-2 bg-white p-3 py-3 rounded-lg shadow">
          <div className="flex items-center justify-between">
            {/* Button Group */}
            <div className="inline-flex border border-neutralDGray rounded h-8">
              <button
                onClick={bulkEdit}
                className="px-3 w-20 h-full border-r hover:bg-neutralSilver transition-all duration-300 border-neutralDGray rounded-l flex items-center justify-center"
              >
                <FaRegPenToSquare title="Bulk Edit" className="text-neutralDGray transition-all duration-300" />
              </button>

              <button
                onClick={handleExportPDF}
                className="px-3 w-20 h-full hover:bg-neutralSilver transition-all duration-300 rounded-r flex items-center justify-center"
              >
                <FaRegFileExcel title="Export to PDF" className="text-neutralDGray" />
              </button>
            </div>

            {/* Search & Sync Section */}
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

          {/* Table Container */}
          <div className="mt-4 overflow-x-auto">
            <div className="w-full">
              <div className="max-h-[35rem] overflow-y-auto text-neutralDGray border rounded-md">
                <div>
                  <style jsx>{`
                  .sticky-actions {
                    position: sticky !important;
                    right: 0 !important;
                    background: white !important;
                    z-index: 10 ;
                    box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
                  }
                  
                  /* Override react-data-table-component styles for sticky column */
                  .rdt_TableCol:last-child {
                    position: sticky !important;
                    right: 0 !important;
                    background: white !important;
                    z-index: 10;
                    box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
                  }
                  
                  .rdt_TableHeadRow .rdt_TableCol:last-child {
                    position: sticky !important;
                    right: 0 !important;
                    background: white !important;
                    z-index: 11 ;
                    box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
                  }
                  
                  .rdt_TableRow .rdt_TableCell:last-child {
                    position: sticky !important;
                    right: 0 !important;
                    background: white !important;
                    z-index: 10 !important;
                    box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
                  }
                `}</style>
                  <DataTable
                    customStyles={customStyles}
                    columns={columns}
                    data={filteredEmployees}
                    progressPending={loading}
                    progressComponent={
                      <div className="flex justify-center items-center gap-2 py-4 text-gray-600 text-sm">
                        <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-500"></span>
                        Loading data...
                      </div>
                    }
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[10, 20, 30, 50]}
                    highlightOnHover
                    pointerOnHover
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Modal show={show} onHide={handleClose} centered size="lg" scrollable>
          <Modal.Header className="py-2 px-3 text-[12px]" closeButton>
            <Modal.Title as="h6" className="text-lg">Payroll Information Edit</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="flex flex-col">
              <div className="w-full max-w-3xl bg-white p-6 border border-gray-300 rounded-md shadow-md min-h-[500px]">
                <div className="flex rounded justify-end items-center -mt-2">
                  <input
                    type="text"
                    placeholder="Search employee by name or ID"
                    className="px-2 h-8 w-80 text-sm font-normal rounded py-0.5 border"
                  />
                  <FaSearch className="ml-[-20px] text-neutralDGray" />
                </div>

                <label className="block text-xs font-medium text-gray-500 mb-2">
                  Apply changes to field:
                    </label>
                <div className="flex gap-2 mb-3">
                  <select className="rounded border-gray-300 w-1/2 h-8 text-xs" name="info_fields" id="info_fields">
                    <option className="text-gray-300" value="default">Select Information Field</option>
                    <option className="text-center" value="loan" disabled>---- Employee Pay ----</option>
                    <option value="daily_rate">Daily Rate</option>
                    <option value="holiday_pay">Holiday Pay</option>
                    <option value="night_diff">Night Differential</option>
                    <option value="allowance">Allowance</option>
                    <option value="loan">Overtime Pay</option>
                    <option value="loan">Tardiness</option>
                    <option value="adjustments">Adjustments</option>
                    <option className="text-center" value="loan" disabled>---- Mandatory Benefits ----</option>
                    <option value="tax">Tax</option>
                    <option value="sss">SSS</option>
                    <option value="pagibig">Pag-IBIG</option>
                    <option value="philhealth">PhilHealth</option>
                    <option value="loan">SSS Loan</option>
                    <option value="loan">Pag-IBIG Loan</option>
                  </select>
                  <input className="h-8 border-gray-300 w-1/2 text-xs rounded" placeholder="Enter value" type="number" name="" id=""/>
                  <button
                    type="button"
                    className="px-3 py-1 h-8 text-xs border rounded text-neutralDGray hover:bg-green-400 hover:text-white"
                  >
                    Apply to Selected
                      </button>
                </div>
                <p className="text-xs text-red-300 text-center italic">**Note: You can batch edit or you can edit information indivually.**</p>
                <div className="border border-neutralDGray rounded p-2  overflow-auto">
                  <div className="flex justify-between mb-3 ">
                    <div>
                      <h5 className="text-neutralDGray text-sm italic">
                        List of Employees
                          </h5>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="px-2 py-1 text-xs border h-8 w-36 text-neutralDGray rounded hover:bg-green-400 hover:text-white"
                      >
                        Select All
                        </button>
                      <button
                        className="px-2 text-xs py-1 border h-8 w-36 text-neutralDGray rounded hover:bg-red-400 hover:text-white"
                      >
                        Deselect All
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button
              className="px-4 py-2 text-sm h-8 border flex justify-center items-center text-center text-neutralDGray rounded-lg hover:bg-green-400 hover:text-white transition-all"
              onClick={() => {// Remove maxOvertime parameter
                handleClose();
              }}
            >
              Request Changes
            </button>
            <button
              className="px-4 py-2 text-sm h-8 border flex justify-center items-center text-center text-neutralDGray rounded-lg hover:bg-red-400 hover:text-white transition-all"
              onClick={handleClose}
            >
              Close
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default EmployeePayrollInformationsList;