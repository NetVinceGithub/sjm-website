import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import { EmployeeButtons } from "../../../utils/EmployeeHelper";
import { FaSearch, FaSyncAlt, FaIdCard } from "react-icons/fa";
import EmployeeIDCard from "../EmployeeIDCard";
import Breadcrumb from "../dashboard/Breadcrumb";

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
        backgroundColor: "#f4f4f4",
        width: "100%",
        margin: "0 auto",
      },
    },
    headCells: {
      style: {
        backgroundColor: "#f4f4f4",
        color: "#333",
        textAlign: "center",
        fontWeight: "bold",
      },
    },
    cells: {
      style: {
        padding: "3px",
        textAlign: "center",
      },
    },
  };

  return (
    <div className="p-6 pt-20">
      <Breadcrumb
        items={[
          { label: "Employee", href: "" },
          { label: "Masterlist", href: "/admin-dashboard/employees" },
        ]}
      />
      <div className="bg-white -mt-1 p-4 rounded-lg shadow">
        <div className="flex justify-end gap-3 items-center -mt-1">
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
            className="px-3 py-0.5 h-7 border text-neutralDGray hover:bg-brandPrimary hover:text-white rounded flex items-center space-x-2 disabled:opacity-50"
          >
            <FaSyncAlt className="w-4 h-4" />
            <span>{syncing ? "Syncing..." : "Sync Employees"}</span>
          </button>
        </div>

        {/* Containing the table list */}
        <div className="mt-3 overflow-x-auto">
          <div className="w-full text-center">
            <DataTable
              customStyles={customStyles}
              columns={[
                { name: "Ecode", selector: (row) => row.ecode, sortable: true },
                { name: "Name", selector: (row) => row.name, sortable: true },
                { name: "Position", selector: (row) => row.positiontitle, sortable: true },
                { name: "Department", selector: (row) => row.department || "N/A", sortable: true },
                {
                  name: "ID Card",
                  cell: (row) => (
                    <button
                      onClick={() => openModal(row.employeeId || row.id)} // Pass the correct ID
                      className="bg-blue-500 text-white px-2 py-1 rounded flex items-center"
                    >
                      <FaIdCard className="mr-1" /> View ID
                    </button>
                  ),
                },
                { name: "Options", cell: (row) => <EmployeeButtons Id={row.employeeId || row.id} /> },
              ]}
              data={filteredEmployees}
              pagination
              progressPending={loading}
            />
          </div>
        </div>
      </div>

      {/* Employee ID Modal */}
      <EmployeeIDCard show={isModalOpen} handleClose={closeModal} employeeId={selectedEmployeeId} />
    </div>
  );
};

export default List;
