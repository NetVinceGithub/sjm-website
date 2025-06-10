import React, { useState } from "react";
import Breadcrumb from "../dashboard/Breadcrumb";
import {
  FaPeopleGroup,
  FaRegWindowMaximize,
} from "react-icons/fa6";
import { FaSearch, FaSyncAlt } from "react-icons/fa";
import { MapPin, Phone, Mail, Calendar } from "lucide-react";
import ClientProfileModal from "../modals/clientProfile";

const ClientList = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const clients = [
    {
      id: 1,
      name: "Palm Beach",
      company: "Palm Beach Resort",
      deployed: "1",
      location: "Barangay Hugom Laiya, San Juan Batangas, Philippines 4226",
      phone: "8 551 3704 | +63 917 884 4425",
      email: "palmbeachlaiya@gmail.com",
      tin: "000 – 123 – 456 – 001",
      joinDate: "June 2025",
      status: "Active",
      avatar: "PB",
    }
  ];

  const handleViewProfile = (client) => {
    setSelectedClient(client);
    setShowProfileModal(true);
  };

  const handleCloseModal = () => {
    setShowProfileModal(false);
    setSelectedClient(null);
  };

  return (
    <div className="fixed top-0 right-0 bottom-0 min-h-screen w-[calc(100%-16rem)] bg-neutralSilver p-6 pt-16">
      <Breadcrumb
        items={[
          { label: "Clients", href: "" },
          { label: "Masterlist", href: "/admin-dashboard/employees" },
        ]}
      />

      <div className="bg-white h-[calc(100vh-120px)] w-full -mt-1 py-3 p-2 rounded-lg shadow">
        <div className="flex items-center justify-end mb-4">

          {/* Search & Sync Section - Aligned with Buttons */}
          <div className="flex items-center gap-3">
            <div className="flex rounded items-center relative">
              <input
                type="text"
                placeholder="Search Clients"
                className="px-2 pr-8 rounded py-0.5 border"
              />
              <FaSearch className="absolute right-2 text-neutralDGray" />
            </div>
            <button className="px-3 py-0.5 h-8 border text-neutralDGray hover:bg-brandPrimary hover:text-white rounded flex items-center space-x-2 disabled:opacity-50">
              <FaSyncAlt className="w-4 h-4 mr-2" />
              Sync Clients
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 overflow-y-auto h-[calc(100%-60px)]">
          {clients.map((client) => (
            <div
              key={client.id}
              className="border border-neutralDGray h-fit rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
            >
              {/* Header Row: Avatar, Name/Title, Status */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                    {client.avatar}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 leading-tight">{client.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center">
                      <FaPeopleGroup className="w-4 h-4 mr-1" />
                      {client.deployed} Employee Deployed
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                  client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {client.status}
                </span>
              </div>

              <hr className="-mt-3" />
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
                <span>Joined {client.joinDate}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleViewProfile(client)}
                  className="flex-1 h-8 flex justify-center items-center text-center text-neutralDGray border py-2 px-3 rounded-md text-sm font-medium hover:bg-green-300 hover:text-white transition-colors"
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Client Profile Modal */}
        <ClientProfileModal
          show={showProfileModal}
          handleClose={handleCloseModal}
          client={selectedClient}
        />
      </div>
    </div>
  );
};

export default ClientList;