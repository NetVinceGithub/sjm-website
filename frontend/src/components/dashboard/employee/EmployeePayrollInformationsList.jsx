import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
import axios from "axios";
import { EmployeeButtons } from "../../../utils/EmployeeHelper";
import { FaSearch, FaSyncAlt } from "react-icons/fa";
import { PayrollButtons } from "../../../utils/PayrollHelper";
import Breadcrumb from "../dashboard/Breadcrumb";
import { Modal, Button } from "react-bootstrap";
import {
  FaRegPenToSquare,
  FaXmark,
  FaRegFileExcel,
  FaRegFilePdf,
} from "react-icons/fa6";
import { useAuth } from "../../../context/authContext";

const EmployeePayrollInformationsList = () => {
  const {user} = useAuth() 
  const [payrollInformations, setPayrollInformations] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [show, setShow] = useState(false);
  
  // Bulk edit states
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [bulkEditField, setBulkEditField] = useState('default');
  const [bulkEditValue, setBulkEditValue] = useState('');
  const [bulkEditReason, setBulkEditReason] = useState(''); // Added reason field
  const [bulkSearchTerm, setBulkSearchTerm] = useState('');
  const [filteredBulkEmployees, setFilteredBulkEmployees] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // Added loading state

  // Mock current user - replace with actual user context/auth
  const currentUser = "Admin User"; // Replace this with actual user from context/auth

  useEffect(() => {
    fetchPayrollInformations();
  }, []);

  useEffect(() => {
    // Filter employees for bulk edit modal
    const filtered = payrollInformations.filter((emp) =>
      emp.name.toLowerCase().includes(bulkSearchTerm.toLowerCase()) ||
      emp.ecode.toLowerCase().includes(bulkSearchTerm.toLowerCase())
    );
    setFilteredBulkEmployees(filtered);
  }, [bulkSearchTerm, payrollInformations]);

  const fetchPayrollInformations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/employee/payroll-informations`);
      if (response.data.success) {
        console.log(response.data);
        setPayrollInformations(response.data.payrollInformations);
        setFilteredEmployees(response.data.payrollInformations);
        setFilteredBulkEmployees(response.data.payrollInformations);
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
      emp.name.toLowerCase().includes(searchTerm) ||
      emp.ecode.toLowerCase().includes(searchTerm)
    );
    setFilteredEmployees(records);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetchPayrollInformations();
    } catch (error) {
      console.error("Error syncing data:", error);
    } finally {
      setSyncing(false);
    }
  };

  const bulkEdit = () => {
    setShow(true);
    setSelectedEmployees([]);
    setBulkEditField('default');
    setBulkEditValue('');
    setBulkEditReason(''); // Reset reason
    setBulkSearchTerm('');
  };

  const handleClose = () => {
    setShow(false);
    setSelectedEmployees([]);
    setBulkEditField('default');
    setBulkEditValue('');
    setBulkEditReason(''); // Reset reason
    setBulkSearchTerm('');
  };

  const handleExportExcel = () => {
    // Create CSV data
    const headers = [
      'Employee Code', 'Name', 'Position', 'Daily Rate', 'Holiday Pay', 
      'Night Differential', 'Allowance', 'Tax', 'SSS', 'Pagibig', 'PhilHealth', 'Loan'
    ];
    
    const csvData = filteredEmployees.map(emp => [
      emp.ecode,
      emp.name,
      emp.positiontitle || emp.designation,
      emp.daily_rate || 0,
      emp.holiday_pay || 0,
      emp.night_differential || 0,
      emp.allowance || 0,
      emp.tax_deduction || 0,
      emp.sss_contribution || 0,
      emp.pagibig_contribution || 0,
      emp.philhealth_contribution || 0,
      emp.loan || 0
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payroll_information.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    // Simple PDF export using window.print
    const printWindow = window.open('', '_blank');
    const tableHTML = `
      <html>
        <head>
          <title>Payroll Information</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2>Payroll Information Report</h2>
          <table>
            <thead>
              <tr>
                <th>Employee Code</th>
                <th>Name</th>
                <th>Position</th>
                <th>Daily Rate</th>
                <th>Holiday Pay</th>
                <th>Night Differential</th>
                <th>Allowance</th>
                <th>Tax</th>
                <th>SSS</th>
                <th>Pagibig</th>
                <th>PhilHealth</th>
                <th>Loan</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEmployees.map(emp => `
                <tr>
                  <td>${emp.ecode}</td>
                  <td>${emp.name}</td>
                  <td>${emp.positiontitle || emp.designation}</td>
                  <td>₱${parseFloat(emp.daily_rate || 0).toLocaleString()}</td>
                  <td>₱${parseFloat(emp.holiday_pay || 0).toLocaleString()}</td>
                  <td>₱${parseFloat(emp.night_differential || 0).toLocaleString()}</td>
                  <td>₱${parseFloat(emp.allowance || 0).toLocaleString()}</td>
                  <td>₱${parseFloat(emp.tax_deduction || 0).toLocaleString()}</td>
                  <td>₱${parseFloat(emp.sss_contribution || 0).toLocaleString()}</td>
                  <td>₱${parseFloat(emp.pagibig_contribution || 0).toLocaleString()}</td>
                  <td>₱${parseFloat(emp.philhealth_contribution || 0).toLocaleString()}</td>
                  <td>₱${parseFloat(emp.loan || 0).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    printWindow.document.write(tableHTML);
    printWindow.document.close();
    printWindow.print();
  };

  // Bulk edit functions
  const handleEmployeeSelect = (employeeId, isSelected) => {
    if (isSelected) {
      setSelectedEmployees(prev => [...prev, employeeId]);
    } else {
      setSelectedEmployees(prev => prev.filter(id => id !== employeeId));
    }
  };

  const handleSelectAll = () => {
    const allIds = filteredBulkEmployees.map(emp => emp.employee_id);
    setSelectedEmployees(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedEmployees([]);
  };

  const handleApplyBulkEdit = async () => {
    if (bulkEditField === 'default' || !bulkEditValue || selectedEmployees.length === 0) {
      alert('Please select a field, enter a value, and select at least one employee.');
      return;
    }

    setIsSubmitting(true);
      try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/employee/bulk-payroll-change-requests`, {
        employee_ids: selectedEmployees,
        field: bulkEditField,
        value: bulkEditValue,
        reason: bulkEditReason || `Bulk update: ${bulkEditField.replace(/_/g, ' ')} to ${bulkEditValue}`,
        requested_by: user.name
      });

      if (response.data.success) {
        const { summary } = response.data;
        let message = `Successfully submitted ${summary.successful} change requests`;
        
        if (summary.failed > 0) {
          message += ` (${summary.failed} failed)`;
        }
        
        if (response.data.notifications_sent && response.data.notifications_sent.length > 0) {
          message += `\nNotifications sent to ${response.data.notifications_sent.length} approver(s)`;
        }
        
        alert(message);
        handleClose();
        
        // Optionally refresh the data
        await fetchPayrollInformations();
      } else {
        alert('Error: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error submitting bulk changes:', error);
      let errorMessage = 'Error submitting bulk changes. Please try again.';
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestChanges = async () => {
    // This function is now replaced by handleApplyBulkEdit
    // But keeping it for backward compatibility or if you want separate functionality
    await handleApplyBulkEdit();
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
      selector: (row) => row.positiontitle || row.designation,
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
            Id={row.employee_id || row.id}
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
                title="Bulk Edit"
              >
                <FaRegPenToSquare className="text-neutralDGray transition-all duration-300" />
              </button>

              <button
                onClick={handleExportExcel}
                className="px-3 w-20 h-full border-r hover:bg-neutralSilver transition-all duration-300 border-neutralDGray flex items-center justify-center"
                title="Export to Excel"
              >
                <FaRegFileExcel className="text-neutralDGray" />
              </button>

              <button
                onClick={handleExportPDF}
                className="px-3 w-20 h-full hover:bg-neutralSilver transition-all duration-300 rounded-r flex items-center justify-center"
                title="Export to PDF"
              >
                <FaRegFilePdf className="text-neutralDGray" />
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
              
              <button
                onClick={handleSync}
                disabled={syncing}
                className="px-3 py-0.5 border rounded hover:bg-neutralSilver transition-all duration-300 disabled:opacity-50"
                title="Sync Data"
              >
                <FaSyncAlt className={`text-neutralDGray ${syncing ? 'animate-spin' : ''}`} />
              </button>
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
        
        {/* Bulk Edit Modal */}
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
                    value={bulkSearchTerm}
                    onChange={(e) => setBulkSearchTerm(e.target.value)}
                    className="px-2 h-8 w-80 text-sm font-normal rounded py-0.5 border"
                  />
                  <FaSearch className="ml-[-20px] text-neutralDGray" />
                </div>

                <label className="block text-xs font-medium text-gray-500 mb-2 mt-4">
                  Apply changes to field:
                </label>
                <div className="flex gap-2 mb-3">
                  <select 
                    className="rounded border-gray-300 w-1/2 h-8 text-xs" 
                    name="info_fields" 
                    id="info_fields"
                    value={bulkEditField}
                    onChange={(e) => setBulkEditField(e.target.value)}
                  >
                    <option className="text-gray-300" value="default">Select Information Field</option>
                    <option className="text-center" value="" disabled>---- Employee Pay ----</option>
                    <option value="daily_rate">Daily Rate</option>
                    <option value="holiday_pay">Holiday Pay</option>
                    <option value="night_differential">Night Differential</option>
                    <option value="allowance">Allowance</option>
                    <option value="overtime_pay">Overtime Pay</option>
                    <option value="tardiness">Tardiness</option>
                    <option value="adjustment">Adjustments</option>
                    <option className="text-center" value="" disabled>---- Mandatory Benefits ----</option>
                    <option value="tax_deduction">Tax</option>
                    <option value="sss_contribution">SSS</option>
                    <option value="pagibig_contribution">Pag-IBIG</option>
                    <option value="philhealth_contribution">PhilHealth</option>
                    <option value="loan">Loan</option>
                  </select>
                  <input 
                    className="h-8 border-gray-300 w-1/2 text-xs rounded" 
                    placeholder="Enter value" 
                    type="number" 
                    value={bulkEditValue}
                    onChange={(e) => setBulkEditValue(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleApplyBulkEdit}
                    disabled={isSubmitting}
                    className="px-3 py-1 h-8 text-xs border rounded text-neutralDGray hover:bg-green-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Apply to Selected'}
                  </button>
                </div>

                {/* Added Reason Field */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Reason for change (optional):
                  </label>
                  <textarea
                    className="w-full h-16 text-xs border border-gray-300 rounded px-2 py-1 resize-none"
                    placeholder="Enter reason for this bulk change..."
                    value={bulkEditReason}
                    onChange={(e) => setBulkEditReason(e.target.value)}
                  />
                </div>

                <p className="text-xs text-red-300 text-center italic">**Note: Changes will be submitted as requests for approval.**</p>
                
                <div className="border border-neutralDGray rounded p-2 overflow-auto mt-4">
                  <div className="flex justify-between mb-3">
                    <div>
                      <h5 className="text-neutralDGray text-sm italic">
                        List of Employees ({selectedEmployees.length} selected)
                      </h5>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSelectAll}
                        className="px-2 py-1 text-xs border h-8 w-36 text-neutralDGray rounded hover:bg-green-400 hover:text-white"
                      >
                        Select All
                      </button>
                      <button
                        onClick={handleDeselectAll}
                        className="px-2 text-xs py-1 border h-8 w-36 text-neutralDGray rounded hover:bg-red-400 hover:text-white"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>
                  
                  {/* Employee List */}
                  <div className="max-h-64 overflow-y-auto">
                    {filteredBulkEmployees.map((employee) => (
                      <div key={employee.employee_id} className="flex items-center p-2 border-b hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(employee.employee_id)}
                          onChange={(e) => handleEmployeeSelect(employee.employee_id, e.target.checked)}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{employee.name}</div>
                          <div className="text-xs text-gray-500">{employee.ecode} - {employee.positiontitle || employee.designation}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button
              className="px-4 py-2 text-sm h-8 border flex justify-center items-center text-center text-neutralDGray rounded-lg hover:bg-green-400 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleApplyBulkEdit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting Requests...' : 'Submit Change Requests'}
            </button>
            <button
              className="px-4 py-2 text-sm h-8 border flex justify-center items-center text-center text-neutralDGray rounded-lg hover:bg-red-400 hover:text-white transition-all"
              onClick={handleClose}
              disabled={isSubmitting}
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