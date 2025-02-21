import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
import axios from "axios";
import { EmployeeButtons } from "../../../utils/EmployeeHelper";

const List = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

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

  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold text-center">Manage Employees</h3>

      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search by Name"
          onChange={handleFilter}
          className="px-4 py-0.5 border"
        />
        <button
          onClick={syncEmployees}
          disabled={syncing}
          className="px-4 py-1 bg-blue-500 text-white rounded"
        >
          {syncing ? "Syncing..." : "Sync Employees"}
        </button>
        <Link to="/admin-dashboard/add-employee" className="px-4 py-1 bg-teal-600 rounded text-white">
          Add New Employee
        </Link>
      </div>

      <div className="mt-6">
        <DataTable
          columns={[
            { name: "Ecode", selector: (row) => row.ecode, sortable: true },
            { name: "Name", selector: (row) => row.name, sortable: true },
            { name: "Position", selector: (row) => row.positiontitle, sortable: true },
            { name: "Department", selector: (row) => row.department || "N/A", sortable: true },
            {name: "Action", cell: (row) => <EmployeeButtons Id={row.employeeId || row.id} />}
            
          ]}
          data={filteredEmployees}
          pagination
          progressPending={loading}
        />
      </div>
    </div>
  );
};

export default List;
