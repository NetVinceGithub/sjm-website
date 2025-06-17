import React, { useState, useEffect } from "react";
import Breadcrumb from "../dashboard/Breadcrumb";
import { FaPeopleGroup, FaRegWindowMaximize } from "react-icons/fa6";
import { FaSearch, FaSyncAlt } from "react-icons/fa";
import { MapPin, Phone, Mail, Calendar } from "lucide-react";
import ClientProfileModal from "../modals/clientProfile";
import axios from "axios";

const ClientList = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [employees, setEmployees] = useState([]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/employee`
      );
      setEmployees(response.data.employees);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/clients`
      );
      const data = await response.json();

      if (data.success) {
        // Transform API data to match component structure
        const transformedClients = data.data.map((client) => ({
          id: client.id,
          name: client.name,
          project: client.project || client.name, // add project field for matching
          deployed: client.deployedEmployees || 0,
          location: client.businessAddress || "No address provided",
          phone: client.contactNumber || "No phone provided",
          email: client.emailAddress || "No email provided",
          tin: client.tinNumber || "No TIN provided",
          joinDate: client.joinedDate || "No date provided",
          status: client.status || "Active",
          avatar: client.name
            ? client.name.substring(0, 2).toUpperCase()
            : "CL",
        }));

        // After employees are fetched, count employees per client project
        // But here clients fetched before employees so update after both fetched
        setClients(transformedClients);
        setFilteredClients(transformedClients);
      } else {
        console.error("Failed to fetch clients:", data.message);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sync clients from Google Sheets
  const syncClients = async () => {
    try {
      setSyncing(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/clients/sync`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();

      if (data.success) {
        await fetchClients();
        alert(`Successfully synced clients: ${data.message}`);
      } else {
        alert(`Sync failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Error syncing clients:", error);
      alert("Error syncing clients. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  // Update deployed count for clients based on employees matching project name
  const updateClientsWithEmployeeCount = (clientsList, employeesList) => {
    return clientsList.map((client) => {
      // Count employees where employee.project matches client.name (case insensitive)
      const count = employeesList.filter(
        (emp) =>
          emp.project &&
          client.name &&
          emp.project.toLowerCase() === client.name.toLowerCase()
      ).length;

      return {
        ...client,
        deployed: count.toString(), // keep string for display consistency
      };
    });
  };

  // Handle search input
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === "") {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(
        (client) =>
          client.name.toLowerCase().includes(term) ||
          client.company.toLowerCase().includes(term) ||
          client.email.toLowerCase().includes(term) ||
          client.location.toLowerCase().includes(term)
      );
      setFilteredClients(filtered);
    }
  };

  // Fetch clients and employees on mount
  useEffect(() => {
    const fetchAllData = async () => {
      await fetchEmployees();
      await fetchClients();
    };
    fetchAllData();
  }, []);

  // Update deployed count when either clients or employees state changes
  useEffect(() => {
    // Map project name to count of employees assigned to it
    const employeeCountByProject = employees.reduce((acc, emp) => {
      const projectName = emp.project?.trim().toUpperCase() || "";
      if (projectName) {
        acc[projectName] = (acc[projectName] || 0) + 1;
      }
      return acc;
    }, {});

    // Update clients with employee count based on matching project
    const updatedClients = clients.map((client) => {
      const clientProjectName =
        client.project?.trim().toUpperCase() ||
        client.name?.trim().toUpperCase() ||
        "";
      const deployedCount = employeeCountByProject[clientProjectName] || 0;
      return {
        ...client,
        deployed: deployedCount,
      };
    });

    setFilteredClients(updatedClients);
  }, [employees, clients]);

  const handleViewProfile = (client) => {
    setSelectedClient(client);
    setShowProfileModal(true);
  };

  const handleCloseModal = () => {
    setShowProfileModal(false);
    setSelectedClient(null);
  };

  return (
    <div className=" right-0 bottom-0  min-h-screen w-full bg-neutralSilver p-3 pt-16">
      <Breadcrumb
        items={[
          { label: "Clients", href: "" },
          { label: "Masterlist", href: "/admin-dashboard/employees" },
        ]}
      />

      <div className="bg-white h-[calc(100vh-120px)] w-full -mt-2 py-3 p-2 rounded-lg shadow">
        <div className="flex items-center justify-end mb-4">
          {/* Search & Sync Section - Aligned with Buttons */}
          <div className="flex items-center gap-3">
            <div className="flex rounded items-center relative">
              <input
                type="text"
                placeholder="Search Clients"
                value={searchTerm}
                onChange={handleSearch}
                className="px-2 pr-8 rounded text-sm py-1 border"
              />
              <FaSearch className="absolute right-2 text-neutralDGray" />
            </div>
            <button
              onClick={syncClients}
              disabled={syncing}
              className="px-3 py-0.5 h-8 border text-sm w-fit text-neutralDGray hover:bg-brandPrimary hover:text-white rounded flex items-center space-x-2 disabled:opacity-50"
            >
              <FaSyncAlt
                className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`}
              />
              {syncing ? "Syncing..." : "Sync Clients"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center -mt-3 h-[calc(100%-60px)]">
            <div className="text-center">
              <FaSyncAlt className="w-8 h-8 animate-spin mx-auto mb-2 text-brandPrimary" />
              <p>Loading clients...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 p-3 gap-3 overflow-y-auto h-[calc(100%-60px)]">
            {filteredClients.length === 0 ? (
              <div className="col-span-4 text-center py-8">
                <p className="text-gray-500 italic text-xs">No clients found</p>
              </div>
            ) : (
              filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="border border-neutralDGray -mt-3 h-fit rounded-lg shadow-md p-2.5 hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Header Row: Avatar, Name/Title, Status */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                        {client.avatar}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-800 leading-tight">
                          {client.name}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center text-nowrap">
                          <FaPeopleGroup className="w-4 h-4 mr-1" />
                          {client.deployed} Employee Deployed
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-1 py-1 rounded-full text-[10px] font-medium flex-shrink-0 ${
                        client.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {client.status}
                    </span>
                  </div>

                  <hr className="-mt-6" />
                  {/* Contact Info */}
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{client.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{client.phone}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaRegWindowMaximize className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{client.tin}</span>
                    </div>
                  </div>

                  {/* Join Date */}
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      Joined{" "}
                      {client.joinDate &&
                        new Date(client.joinDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewProfile(client)}
                      className="flex-1 h-8 flex text-xs justify-center items-center text-center text-neutralDGray border py-2 px-3 rounded-md font-medium hover:bg-green-400 hover:text-white transition-colors"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Client Profile Modal */}
        <ClientProfileModal
          show={showProfileModal}
          handleClose={handleCloseModal}
          client={selectedClient}
          employees={employees} // pass the employees array here
        />
      </div>
    </div>
  );
};

export default ClientList;
