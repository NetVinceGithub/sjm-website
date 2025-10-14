import React, { useState, useEffect } from "react";
import Breadcrumb from "../dashboard/Breadcrumb";
import {
  FaPeopleGroup,
  FaRegWindowMaximize,
  FaPersonShelter,
} from "react-icons/fa6";
import { FaSearch, FaSyncAlt } from "react-icons/fa";
import { MapPin, Phone, Mail, Calendar } from "lucide-react";
import ClientProfileModal from "../modals/clientProfile";
import axios from "axios";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

const ClientList = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [showClientProfile, setShowClientProfile] = useState(false);
  const [showEditClientForm, setShowEditClientForm] = useState(false);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found for fetching employees");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/employee`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      console.log("Employees response:", response.data);
      setEmployees(response.data.employees || response.data.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchClients = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found - user not authenticated");
        setLoading(false);
        return;
      }

      console.log(
        "Fetching clients with token:",
        token.substring(0, 20) + "..."
      );

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/clients`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Clients API response:", response.data);

      const data = response.data;

      if (data.success) {
        const clientsData = data.data.data || data.data;

        console.log("Raw clients data:", clientsData);

        // Store the raw clients data for employee count calculation
        setClients(clientsData);
      } else {
        console.error("API returned success: false", data);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      if (error.response?.status === 401) {
        console.error("Authentication failed - redirecting to login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === "") {
      // Reset to all clients with current employee counts
      updateClientEmployeeCounts();
    } else {
      const filtered = filteredClients.filter(
        (client) =>
          client.name.toLowerCase().includes(term) ||
          client.email.toLowerCase().includes(term) ||
          client.location.toLowerCase().includes(term) ||
          (client.contact_person &&
            client.contact_person.toLowerCase().includes(term))
      );
      setFilteredClients(filtered);
    }
  };

  // Function to update client data with employee counts
  const updateClientEmployeeCounts = () => {
    if (!clients.length || !employees.length) return;

    console.log("Updating employee counts...");
    console.log("Clients:", clients);
    console.log("Employees:", employees);

    // Helper function to normalize text for comparison (same as in modal)
    const normalizeText = (text) => {
      if (!text) return "";
      return text
        .toLowerCase()
        .replace(/[.,\s]+/g, " ") // Replace punctuation and multiple spaces with single space
        .replace(
          /\binc\b|\bincorporated\b|\bcorp\b|\bcorporation\b|\bltd\b|\blimited\b/g,
          ""
        ) // Remove common company suffixes
        .trim();
    };

    // Helper function to check if two names match using fuzzy matching
    const namesMatch = (name1, name2) => {
      const normalized1 = normalizeText(name1);
      const normalized2 = normalizeText(name2);

      if (!normalized1 || !normalized2) return false;

      const words1 = normalized1.split(" ").filter((word) => word.length > 2);
      const words2 = normalized2.split(" ").filter((word) => word.length > 2);

      if (words1.length === 0 || words2.length === 0) return false;

      const matches = words1.filter((word1) =>
        words2.some((word2) => word1.includes(word2) || word2.includes(word1))
      );

      // Return true if at least 60% of words match
      return matches.length / Math.max(words1.length, words2.length) >= 0.6;
    };

    // Transform clients with employee counts using fuzzy matching
    const transformedClients = clients.map((client) => {
      // Count employees that match this client
      const deployedCount = employees.filter((emp) => {
        const empProject = emp.project || emp.client || emp.clientName || "";
        const clientName = client.name || "";

        return namesMatch(empProject, clientName);
      }).length;

      console.log(`Client "${client.name}" has ${deployedCount} employees`);

      return {
        id: client.id,
        name: client.name,
        project: client.project,
        deployed: deployedCount, // This now uses fuzzy matching
        location: client.businessAddress || "No address provided",
        businessAddress: client.businessAddress || "No address provided",
        phone: client.contactNumber || "No phone provided",
        email: client.emailAddress || "No email provided",
        emailAddress: client.emailAddress || "No email provided",
        tin: client.tinNumber || "No TIN provided",
        tinNumber: client.tinNumber || "No TIN provided",
        joinDate: client.joinedDate || client.createdAt || "No date provided",
        joinedDate: client.joinedDate || client.createdAt || "No date provided",
        expiryDate: client.expiryDate || "No date provided for expiry date",
        status:
          client.expiryDate && new Date(client.expiryDate) > new Date()
            ? "Active"
            : "Inactive",
        avatar: client.name ? client.name.substring(0, 2).toUpperCase() : "CL",
        remarks: client.project || "No remarks available for this client.",
        contact_person: client.contactPerson || "No contact person",
        billing_frequency: client.billingFrequency,
        client_code: client.clientCode,
      };
    });

    console.log(
      "Transformed clients with employee counts:",
      transformedClients
    );
    setFilteredClients(transformedClients);
  };

  useEffect(() => {
    const fetchAllData = async () => {
      await fetchEmployees();
      await fetchClients();
    };
    fetchAllData();
  }, []);

  // Update client employee counts whenever clients or employees data changes
  useEffect(() => {
    if (clients.length > 0) {
      updateClientEmployeeCounts();
    }
  }, [employees, clients]);

  const handleViewProfile = (client) => {
    setSelectedClient(client);
    setShowProfileModal(true);
  };

  const handleCloseModal = () => {
    setShowProfileModal(false);
    setSelectedClient(null);
  };

  const handleReactivate = (client) => {
    console.log("Reactivating client:", client.name);
  };

  return (
    <div className="right-0 bottom-0 min-h-screen w-full bg-neutralSilver p-3 pt-16">
      <Breadcrumb
        items={[
          { label: "Clients" },
          { label: "Masterlist", href: "/admin-dashboard/client-list" },
        ]}
      />

      <div className="bg-white h-[calc(100vh-120px)] w-full -mt-2 py-3 p-2 rounded-lg shadow">
        <div className="flex items-center justify-end mb-4">
          <div className="flex rounded w-1/2 justify-end items-center relative">
            <input
              type="text"
              placeholder="Search Clients"
              value={searchTerm}
              onChange={handleSearch}
              className="px-2 pr-8 rounded w-1/2 right-0 text-sm py-1 border"
            />
            <FaSearch className="absolute right-2 text-neutralDGray" />
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
          <div className="grid grid-cols-4 p-3 gap-2 overflow-y-auto h-[calc(100%-60px)]">
            {filteredClients.length === 0 ? (
              <div className="col-span-4 text-center py-8">
                <p className="text-gray-500 italic text-xs">No clients found</p>
              </div>
            ) : (
              filteredClients.map((client) => (
                <div
                  key={client.id}
                  data-tooltip-id="client-tooltip"
                  data-tooltip-content={`Remarks: ${
                    client.remarks || "No remarks available for this client."
                  }`}
                  className="border border-neutralDGray -mt-4 h-fit rounded-lg shadow-md p-2.5 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-base flex-shrink-0">
                        {client.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-800 leading-tight">
                          {client.name}
                        </h3>
                        <p className="text-xs text-gray-600 flex items-center text-nowrap">
                          <FaPeopleGroup className="w-4 h-4 mr-1" />
                          {client.deployed} Employee
                          {client.deployed !== 1 ? "s" : ""} Deployed
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full text-[10px] p-2 font-medium flex-shrink-0 ${
                        client.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {client.status}
                    </span>
                  </div>

                  <hr className="-mt-6" />

                  <div className="space-y-1 mb-3 -mt-3 p-2 rounded-xl border">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-3 h-3 mr-2 flex-shrink-0" />
                      <span className="truncate text-xs">
                        {client.businessAddress}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-3 h-3 mr-2 flex-shrink-0" />
                      <span className="truncate text-xs">{client.phone}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaPersonShelter className="w-3 h-3 mr-2 flex-shrink-0" />
                      <span className="truncate text-xs">
                        {client.contact_person || "No contact person"}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-3 h-3 mr-2 flex-shrink-0" />
                      <span className="truncate text-xs">
                        {client.emailAddress}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaRegWindowMaximize className="w-3 h-3 mr-2 flex-shrink-0" />
                      <span className="truncate text-xs">
                        {client.tinNumber}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center text-xs text-gray-500 mb-3">
                    <Calendar className="w-3 h-3 mr-2" />
                    <span>
                      Joined{" "}
                      {client.joinedDate &&
                        client.joinedDate !== "No date provided" &&
                        new Date(client.joinedDate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      {(client.joinedDate === "No date provided" ||
                        !client.joinedDate) &&
                        "N/A"}
                    </span>
                  </div>

                  {client.status === "Inactive" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewProfile(client)}
                        className="w-1/2 h-8 flex text-xs justify-center items-center text-center text-neutralDGray border py-2 px-3 rounded-md font-medium hover:bg-green-400 hover:text-white transition-colors"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => handleReactivate(client)}
                        className="w-1/2 h-8 flex text-xs justify-center items-center text-center text-neutralDGray border py-2 px-3 rounded-md font-medium hover:bg-red-400 hover:text-white transition-colors"
                      >
                        Renew Contract
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleViewProfile(client)}
                      className="w-full h-8 flex text-xs justify-center items-center text-center text-neutralDGray border py-2 px-3 rounded-md font-medium hover:bg-green-400 hover:text-white transition-colors"
                    >
                      View Profile
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        <ClientProfileModal
          show={showProfileModal}
          handleClose={handleCloseModal}
          client={selectedClient}
          employees={employees}
        />
      </div>

      {showEditClientForm && (
        <AddClientForm
          id={selectedClient.id}
          onClose={() => {
            setShowEditClientForm(false);
            setSelectedClient(null);
          }}
        />
      )}

      <Tooltip
        anchorSelect="[data-tooltip-id='client-tooltip']"
        place="top"
        content=""
        render={({ activeAnchor }) => {
          if (activeAnchor) {
            const tooltipContent = activeAnchor.getAttribute(
              "data-tooltip-content"
            );
            return (
              <div
                style={{
                  padding: "2px 2px",
                  textAlign: "center",
                  lineHeight: "1.4",
                }}
              >
                {tooltipContent || "No remarks available"}
              </div>
            );
          }
          return null;
        }}
        style={{
          backgroundColor: "rgba(71, 81, 95, 0.8)",
          color: "#ffffff",
          borderRadius: "6px",
          fontSize: "12px",
          maxWidth: "250px",
          zIndex: 9999,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
          backdropFilter: "blur(4px)",
        }}
        offset={-5}
        delayShow={200}
        delayHide={100}
        noArrow={true}
      />
    </div>
  );
};

export default ClientList;
