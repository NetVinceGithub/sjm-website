import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import { EmployeeButtons } from "../../../utils/EmployeeHelper";
import { FaSearch, FaSyncAlt, FaIdCard } from "react-icons/fa";
import Modal from "react-modal";
import EmployeeIDCard from "../EmployeeIDCard"; // Ensure correct import

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

  return (
    <div className="p-6">
      <h6 className="mt-1">
        <span className="text-green-500 font-bold">Payroll System</span> / Employee Data
      </h6>
      <div className="mt-4 bg-white p-4 rounded-lg shadow">
        <h3 className="text-2xl mt-2 font-bold text-center">MANAGE EMPLOYEES</h3>

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
          <button
            onClick={syncEmployees}
            disabled={syncing}
            className="px-3 py-0.5 h-8 bg-green-500 text-white rounded flex items-center space-x-2 disabled:opacity-50"
          >
            <FaSyncAlt className="w-4 h-4" />
            <span>{syncing ? "Syncing..." : "Sync Employees"}</span>
          </button>
        </div>

        {/* Containing the table list */}
        <div className="mt-6 overflow-x-auto">
        <DataTable
          columns={[
            { name: "Ecode", selector: (row) => row.ecode, sortable: true },
            { name: "Name", selector: (row) => row.name, sortable: true },
            { name: "Position", selector: (row) => row.positiontitle, sortable: true },
            { name: "Department", selector: (row) => row.department || "N/A", sortable: true },
            { 
              name: "ID Card", 
              cell: (row) => {
                console.log("Row Data:", row); // Debugging: Check row structure
                return (
                  <button
                    onClick={() => openModal(row.ecode)} // Use ecode if it's the unique ID
                    className="bg-blue-500 text-white px-2 py-1 rounded flex items-center"
                  >
                    <FaIdCard className="mr-1" /> View ID
                  </button>
                );
              }
            }
            ,
            { name: "Options", cell: (row) => <EmployeeButtons Id={row.employeeId || row.id} /> }
          ]}
          data={filteredEmployees}
          pagination
          progressPending={loading}
        />;

        </div>
      </div>

      {/* Employee ID Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Employee ID Card"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        {selectedEmployeeId && <EmployeeIDCard employeeId={selectedEmployeeId} />}
        <button onClick={closeModal} className="btn btn-danger">
          Close
        </button>
      </Modal>
    </div>
  );
};

export default List;
