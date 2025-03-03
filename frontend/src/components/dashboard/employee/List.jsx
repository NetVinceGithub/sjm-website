import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
// import { EmployeeButtons } from "../../../utils/EmployeeHelper";
import { FaSearch, FaSyncAlt, FaIdCard } from "react-icons/fa";
import EmployeeIDCard from "../EmployeeIDCard";
import Breadcrumb from "../dashboard/Breadcrumb";
import { FaPrint, FaRegFileExcel, FaRegFilePdf } from "react-icons/fa6";
import { FaEnvelope, FaMinusSquare } from "react-icons/fa";

const List = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      alert("✅ Employees successfully synced from Google Sheets!");
    } catch (error) {
      console.error("❌ Error syncing employees:", error);
      alert("⚠ Failed to sync employees. Check the console for details.");
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
    <div className="fixed p-6 pt-20">
      <Breadcrumb
        items={[
          { label: "Employee", href: "" },
          { label: "Masterlist", href: "/admin-dashboard/employees" },
        ]}
      />
      <div className="bg-white w-[77rem] -mt-1 py-3 p-2 rounded-lg shadow">
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
          <button
            onClick={syncEmployees}
            disabled={syncing}
            className="px-3 py-0.5 h-8 border text-neutralDGray hover:bg-brandPrimary hover:text-white rounded flex items-center space-x-2 disabled:opacity-50"
          >
            <FaSyncAlt className="w-4 h-4" />
            <span>{syncing ? "Syncing..." : "Sync Employees"}</span>
          </button>
        </div>
      </div>

        {/* Containing the table list */}
        <div className="mt-3 overflow-x-auto">
          <div className="w-full flex justify-center">
            <div className="w-full max-w-[75rem]">
              <div className="border rounded-md">
                <DataTable
                  customStyles={customStyles}
                  columns={[
                    { name: "Ecode", selector: (row) => row.ecode, sortable: true, width: "110px", center: true },
                    { name: "Name", selector: (row) => row.name, sortable: true, width: "200px" },
                    { name: "Position", selector: (row) => row.positiontitle, sortable: true, width: "350px", center: true },
                    { name: "Department", selector: (row) => row.department || "N/A", sortable: true, width: "250px", center: true },
                    {
                      name: "Options",
                      cell: (row) => (
                        <div className="flex justify-center items-center">
                          <button onClick={() => openModal(row.employeeId || row.id)} className="w-20 h-8 border hover:bg-neutralSilver border-neutralDGray rounded-l flex items-center justify-center">
                            <FaIdCard title="View ID" className=" text-neutralDGray w-5 h-5" />
                          </button>
                          <button className="w-20 h-8 border hover:bg-neutralSilver border-neutralDGray flex items-center justify-center">
                            <FaEnvelope title="Message" className=" text-neutralDGray w-5 h-5" />
                          </button>
                          <button className="w-20 h-8 border hover:bg-neutralSilver border-neutralDGray rounded-r flex items-center justify-center">
                            <FaMinusSquare title="Block" className=" text-neutralDGray w-5 h-5" />
                          </button>
                        </div>
                      ),
                      width: "240px", // Adjusted for better fit
                      center: true,
                    },
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

      {/* Employee ID Modal */}
      <EmployeeIDCard show={isModalOpen} handleClose={closeModal} employeeId={selectedEmployeeId} />
    </div>
  );
};

export default List;
