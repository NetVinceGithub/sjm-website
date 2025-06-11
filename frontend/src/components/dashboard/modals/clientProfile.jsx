import React from "react";
import { Modal } from "react-bootstrap";
import {
  FaRegWindowMaximize,
} from "react-icons/fa6";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBuilding,
  FaCalendarAlt,
} from "react-icons/fa";
import DataTable from "react-data-table-component";

export default function ClientProfileModal({
  show,
  isOpen,
  handleClose,
  onClose,
  client,
  employees = [],  // <- new prop to pass employee list
}) {
  const isModalOpen = show ?? isOpen;
  const closeHandler = handleClose ?? onClose;

  if (!client) return null;

  // Filter employees deployed to this client based on project name
  const deployedEmployees = employees.filter(
    (emp) =>
      emp.project?.trim().toUpperCase() ===
      (client.project?.trim().toUpperCase() || client.name?.trim().toUpperCase())
  );

  // Columns config for DataTable
  const columns = [
    {
      name: "Employee Name",
      selector: (row) =>
        [row.firstname, row.middlename, row.lastname]
          .filter(Boolean)
          .join(" ") || "No name available",
      sortable: true,
      wrap: true,
    },
    {
      name: "Position",
      selector: (row) => row.positiontitle || "N/A",
      sortable: true,
      wrap: true,
    },
    
  ];

  return (
    <Modal
      show={isModalOpen}
      onHide={closeHandler}
      centered
      size="lg"
      scrollable
    >
      <Modal.Header className="py-3 px-4 border-b text-sm" closeButton>
        <Modal.Title as="h4" className="text-base  text-gray-800">
          Client Profile
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <div className="bg-white">
          {/* Header Section with Avatar and Basic Info */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {client.avatar}
              </div>
              <div>
                <h2 className="text-2xl font-bold mt-2">{client.name}</h2>
                <p className="text-blue-100 italic text-xs flex items-center gap-2">
                  Tin Number: {""}
                  {client.tin}
                </p>
              </div>
              <div className="ml-auto hover:scale-105 transition-all duration-300">
                <span
                  className={`px-3 py-1 rounded-full flex text-sm font-medium ${
                    client.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {client.status}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="p-6">
            <h3 className="text-sm text-gray-800 mb-4 border-b pb-1">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 h-20 bg-gray-50 rounded-lg hover:bg-blue-100 transition-all duration-300">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaPhone className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mt-3.5 uppercase tracking-wide">
                    Phone
                  </p>
                  <p className="text-sm font-medium -mt-3 text-gray-800">
                    {client.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 h-20 bg-gray-50 rounded-lg hover:bg-green-100 transition-all duration-300">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FaEnvelope className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mt-3.5  uppercase tracking-wide">
                    Email
                  </p>
                  <p className="text-sm font-medium -mt-3 text-gray-800">
                    {client.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3  h-20 bg-gray-50 rounded-lg hover:bg-red-100 transition-all duration-300">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <FaMapMarkerAlt className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mt-3.5  tracking-wide">
                    Location
                  </p>
                  <p className="text-sm font-medium -mt-3 text-gray-800">
                    {client.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 h-20 bg-gray-50 rounded-lg hover:bg-purple-100 transition-all duration-300">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <FaCalendarAlt className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mt-3.5 uppercase tracking-wide">
                    Join Date
                  </p>
                  <p className="text-sm font-medium -mt-3 text-gray-800">
                    {client.joinDate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details Section */}
          <div className="px-6 pb-6">
            <h3 className="text-sm text-gray-800 mb-4 border-b pb-1">
              Deployed Employees
            </h3>
            <DataTable
              columns={columns}
              data={deployedEmployees}
              noDataComponent={
                <div className="text-center text-xs py-8 text-gray-500">
                  No deployed employees found.
                </div>
              }
              dense
              highlightOnHover
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-t bg-gray-50">
        <button
          onClick={closeHandler}
          className="px-6 py-2 h-8 w-fit flex justify-center items-center text-center text-sm bg-white border border-gray-300 text-gray-700 rounded-md"
        >
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
}
