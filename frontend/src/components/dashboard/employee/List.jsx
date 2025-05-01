import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import defaultProfile from "../../../../src/assets/default-profile.png"; // Adjust path as needed

// import { EmployeeButtons } from "../../../utils/EmployeeHelper";
import { FaSearch, FaSyncAlt, FaIdCard } from "react-icons/fa";
import EmployeeIDCard from "../EmployeeIDCard";
import Breadcrumb from "../dashboard/Breadcrumb";
import { FaPrint, FaRegFileExcel, FaRegFilePdf } from "react-icons/fa6";
import { FaEnvelope, FaMinusSquare } from "react-icons/fa";
import BlockEmployeeModal from "../modals/BlockEmployeeModal";
import UnBlockEmployeeModal from "../modals/UnblockEmployeeModal";

const List = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [employeeToToggle, setEmployeeToToggle] = useState(null);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isUnBlockModalOpen, setIsUnBlockModalOpen] = useState(false);
  const [employeeToBlock, setEmployeeToBlock] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/employee");
      if (response.data.success) {
        setEmployees(response.data.employees);
        setFilteredEmployees(response.data.employees);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const syncEmployees = async () => {
    setSyncing(true);
    try {
      await axios.get("http://localhost:5000/api/employee/import");
      fetchEmployees(); // Refresh the employee list after syncing
      setModalOpen(true);
    } catch (error) {
      console.error("❌ Error syncing employees:", error);
    } finally {
      setSyncing(false);
    }
  };

  const handleFilter = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const records = employees.filter((emp) =>
      emp.name.toLowerCase().includes(searchTerm)
    );
    setFilteredEmployees(records);
  };

  const openModal = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEmployeeId(null);
  };

  const confirmBlockEmployee = async () => {
    if (employeeToBlock) {
      try {
        await axios.put(
          `http://localhost:5000/api/employee/toggle-status/${employeeToBlock.id}`
        );

        // Update employee status in state
        setEmployees((prevEmployees) =>
          prevEmployees.map((emp) =>
            emp.id === employeeToBlock.id ? { ...emp, status: "Inactive" } : emp
          )
        );

        setFilteredEmployees((prevFiltered) =>
          prevFiltered.map((emp) =>
            emp.id === employeeToBlock.id ? { ...emp, status: "Inactive" } : emp
          )
        );

        setIsBlockModalOpen(false);
        setEmployeeToBlock(null);
      } catch (error) {
        console.error("Error blocking employee:", error);
        alert("⚠ Failed to block employee. Please try again.");
      }
    }
  };

  const confirmUnblockEmployee = async () => {
    if (employeeToBlock) {
      try {
        await axios.put(
          `http://localhost:5000/api/employee/toggle-status/${employeeToBlock.id}`
        );

        await fetchEmployees(); // Force refresh from the backend

        setIsUnBlockModalOpen(false);
        setEmployeeToBlock(null);
      } catch (error) {
        console.error("Error unblocking employee:", error);
        alert("⚠ Failed to unblock employee. Please try again.");
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const employee = employees.find((emp) => emp.id === id);

    if (!employee) return;

    if (currentStatus === "Inactive") {
      setEmployeeToBlock(employee);
      setIsUnBlockModalOpen(true); // Open Unblock Modal if the employee is inactive
    } else {
      setEmployeeToBlock(employee);
      setIsBlockModalOpen(true); // Open Block Modal if the employee is active
    }
  };

  const exportToExcel = () => {
    if (filteredEmployees.length === 0) {
      alert("⚠ No data available to export.");
      return;
    }

    // Define columns to exclude
    const excludedColumns = [
      "id",
      "sss",
      "tin",
      "philhealth",
      "pagibig",
      "contact_name",
      "contact_number",
      "contact_address",
      "profileImage",
      "esignature",
      "status",
    ]; // Add column keys you want to exclude

    // Filter out the excluded columns
    const modifiedData = filteredEmployees.map((employee) => {
      const filteredEmployee = { ...employee };
      excludedColumns.forEach((col) => delete filteredEmployee[col]); // Remove unwanted columns
      return filteredEmployee;
    });

    // Convert the modified data to a worksheet
    const ws = XLSX.utils.json_to_sheet(modifiedData);

    // Create a new workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");

    // Write the file and trigger download
    XLSX.writeFile(wb, "Employee_List.xlsx");
  };

  const exportToPDF = () => {
    if (filteredEmployees.length === 0) {
      alert("⚠ No data available to export.");
      return;
    }

    const doc = new jsPDF();
    doc.text("Employee Masterlist", 14, 15);

    const tableColumn = ["Ecode", "Name", "Position", "Department", "Status"];
    const tableRows = filteredEmployees.map((emp) => [
      emp.ecode,
      emp.name,
      emp.positiontitle,
      emp.department || "N/A",
      emp.status.toUpperCase(),
    ]);

    // Use autoTable function correctly
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("Employee_List.pdf");
  };

  const printTable = () => {
    window.print();
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
        justifyContent: "center", // Centers content horizontally
        display: "flex", // Required for justifyContent to work
        alignItems: "center", // Centers content vertically
      },
    },
    cells: {
      style: {
        padding: "8px",
        display: "flex", // Needed for flex properties to work
      },
    },
  };

  return (
    <div className="fixed top-0 right-0 bottom-0 min-h-screen w-[calc(100%-16rem)] bg-neutralSilver p-6 pt-16">
      <Breadcrumb
        items={[
          { label: "Employee", href: "" },
          { label: "Masterlist", href: "/admin-dashboard/employees" },
        ]}
      />
      <div className="bg-white w-full -mt-1 py-3 p-2 rounded-lg shadow">
        <div className="flex items-center justify-between">
          {/* Button Group - Centered Vertically */}
          <div className="inline-flex border border-neutralDGray rounded h-8">
            <button
              onClick={printTable} // Print the table
              className="px-3 w-20 h-full border-r hover:bg-neutralSilver transition-all duration-300 border-neutralDGray rounded-l flex items-center justify-center"
            >
              <FaPrint
                title="Print"
                className="text-neutralDGray] transition-all duration-300"
              />
            </button>

            <button
              onClick={exportToExcel} // Add the onClick event
              className="px-3 w-20 h-full border-r hover:bg-neutralSilver transition-all duration-300 border-neutralDGray flex items-center justify-center"
            >
              <FaRegFileExcel
                title="Export to Excel"
                className=" text-neutralDGray"
              />
            </button>

            <button
              onClick={exportToPDF} // Export as PDF
              className="px-3 w-20 h-full hover:bg-neutralSilver transition-all duration-300 rounded-r flex items-center justify-center"
            >
              <FaRegFilePdf
                title="Export to PDF"
                className=" text-neutralDGray"
              />
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
            <button
              onClick={syncEmployees}
              disabled={syncing}
              className="px-3 py-0.5 h-8 border text-neutralDGray hover:bg-brandPrimary hover:text-white rounded flex items-center space-x-2 disabled:opacity-50"
            >
              <FaSyncAlt className="w-4 h-4" />
              <span>{syncing ? "Syncing..." : "Sync Employees"}</span>
            </button>

            {modalOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                  <h2 className="text-xl font-bold text-green-600">
                    Sync Successful
                  </h2>
                  <p className="text-gray-700 mt-2">
                    Employees have been successfully synchronized.
                  </p>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Containing the table list */}
        <div className="mt-3 w-full overflow-x-auto">
          <div className="w-full flex">
            <div className="w-full">
              <div className="border rounded-md">
                <DataTable
                  customStyles={customStyles}
                  columns={[
                    {
                      name: "Image",
                      cell: (row) => (
                        <img
                          src={`http://localhost:5000/uploads/${row.profileImage}`}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => (e.target.src = defaultProfile)} // Fallback image
                        />
                      ),
                      width: "80px",
                      center: true,
                    },
                    {
                      name: "Ecode",
                      selector: (row) => row.ecode,
                      sortable: true,
                      width: "110px",
                    },
                    {
                      name: "Name",
                      selector: (row) => row.name,
                      sortable: true,
                      width: "200px",
                    },
                    {
                      name: "Position",
                      selector: (row) => row.positiontitle,
                      sortable: true,
                      width: "350px",
                    },
                    {
                      name: "Department",
                      selector: (row) => row.department || "N/A",
                      sortable: true,
                      width: "190px",
                    },
                    {
                      name: "Project",
                      selector: (row) => row['area/section'] || "N/A",
                      sortable: true,
                      width: "190px",
                    },
                    {
                      name: "Options",
                      cell: (row) => (
                        <div className="flex justify-center items-center">
                          <button
                            onClick={() => openModal(row.employeeId || row.id)}
                            className="w-20 h-8 border hover:bg-neutralSilver border-neutralDGray rounded-l flex items-center justify-center"
                          >
                            <FaIdCard
                              title="View ID"
                              className=" text-neutralDGray w-5 h-5"
                            />
                          </button>
                          <button className="w-20 h-8 border hover:bg-neutralSilver border-neutralDGray flex items-center justify-center">
                            <FaEnvelope
                              title="Message"
                              className=" text-neutralDGray w-5 h-5"
                            />
                          </button>
                          <button
                            className={`w-20 h-8 border border-neutralDGray rounded-r flex items-center justify-center transition ${
                              row.status === "Active"
                                ? "bg-green-500 text-white"
                                : "bg-red-500 text-white"
                            }`}
                            onClick={() =>
                              handleToggleStatus(row.id, row.status)
                            }
                          >
                            <FaMinusSquare
                              title="Toggle Status"
                              className="w-5 h-5"
                            />
                          </button>
                        </div>
                      ),
                      width: "240px",
                    },
                  ]}
                  data={filteredEmployees}
                  progressPending={loading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee ID Modal */}
      <EmployeeIDCard
        show={isModalOpen}
        handleClose={closeModal}
        employeeId={selectedEmployeeId}
        refreshEmployees={fetchEmployees} // Pass the function as a prop
      />
      <BlockEmployeeModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onConfirm={confirmBlockEmployee}
        employee={employeeToBlock}
      />

      <UnBlockEmployeeModal
        isOpen={isUnBlockModalOpen}
        onClose={() => setIsUnBlockModalOpen(false)}
        onConfirm={confirmUnblockEmployee}
        employee={employeeToBlock}
      />
    </div>
  );
};

export default List;
