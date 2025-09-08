import React from "react";
import { Modal } from "react-bootstrap";
import { FaPersonShelter, FaFileInvoiceDollar } from "react-icons/fa6";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBuilding,
  FaCalendarAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";

export default function ClientProfileModal({
  show,
  isOpen,
  handleClose,
  onClose,
  client,
  employees = [], // <- new prop to pass employee list
}) {
  const isModalOpen = show ?? isOpen;
  const closeHandler = handleClose ?? onClose;
  const navigate = useNavigate();

  if (!client) return null;

  // Filter employees deployed to this client based on project name
  const deployedEmployees = employees.filter(
    (emp) =>
      emp.project?.trim().toUpperCase() ===
      (client.project?.trim().toUpperCase() ||
        client.name?.trim().toUpperCase())
  );

  const handleEdit = () => {
    closeHandler(); // close modal
    navigate(`/admin-dashboard/client/edit/${client.id}`); // ⬅ redirect to edit
  };

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
    {
      name: "Employment Status",
      selector: (row) => row.employmentstatus || "N/A",
      sortable: true,
      wrap: true,
    },
  ];

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString || dateString === "No date provided") return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

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
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 px-4">
            <div className="flex items-center gap-3min-h-[60px]">
              <div className="w-14 h-14 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-neutralGray font-medium text-lg flex-shrink-0">
                {client.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 mt-3 ml-3">
                <h2 className="text-base font-medium">{client.name}</h2>
                <p className="text-blue-100 italic text-xs -mt-2">
                  {client.clientCode || "No client code"}
                </p>
                <p className="text-blue-100 italic text-xs -mt-3">
                  TIN No.: {client.tinNumber || "No TIN provided"}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium shadow-md ${
                  client.status === "Active"
                    ? "bg-green-200 text-black shadow-[0_0_8px_#86efac]"
                    : "bg-red-200 text-black shadow-[0_0_8px_#fca5a5]"
                }`}
              >
                {client.status}
              </span>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="p-4">
            <h3 className="text-sm text-gray-800 mb-4 border-b pb-1">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 -mt-2">
              <div className="flex items-center gap-3 p-3 h-16 bg-gray-50 rounded-lg hover:bg-blue-100 transition-all duration-300">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaPersonShelter className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mt-3.5 tracking-wide">
                    Contact Person
                  </p>
                  <p className="text-xs font-medium -mt-3 text-gray-800">
                    {client.contactPerson || "No contact person"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 h-16 bg-gray-50 rounded-lg hover:bg-green-100 transition-all duration-300">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FaEnvelope className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mt-3.5 tracking-wide">
                    Email
                  </p>
                  <p className="text-xs font-medium -mt-3 text-gray-800">
                    {client.emailAddress || "No email provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 h-16 bg-gray-50 rounded-lg hover:bg-yellow-100 transition-all duration-300">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <FaPhone className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500  mt-3.5  tracking-wide">
                    Contact Number
                  </p>
                  <p className="text-xs font-medium -mt-3 text-gray-800">
                    {client.contactNumber || "No phone provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 -mt-7">
            <h3 className="text-sm text-gray-800 mb-4  border-b pb-1">
              Partnership Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 -mt-2">
              <div className="flex items-center gap-3 p-3 h-16 bg-gray-50 rounded-lg hover:bg-purple-100 transition-all duration-300">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <FaCalendarAlt className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mt-3.5 tracking-wide">
                    Join Date
                  </p>
                  <p className="text-xs font-medium -mt-3 text-gray-800">
                    {formatDate(client.joinedDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 h-16 bg-gray-50 rounded-lg hover:bg-red-100 transition-all duration-300">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <FaCalendarAlt className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mt-3.5 tracking-wide">
                    Expiry Date
                  </p>
                  <p className="text-xs font-medium -mt-3 text-gray-800">
                    {formatDate(client.expiryDate) || "No expiry date"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 h-16 bg-gray-50 rounded-lg hover:bg-blue-100 transition-all duration-300">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaFileInvoiceDollar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mt-3.5 tracking-wide">
                    Billing Frequency
                  </p>
                  <p className="text-xs font-medium -mt-3 text-gray-800">
                    {client.billingFrequency || "Not specified"}
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
          onClick={handleEdit}
          className="px-6 py-2 h-8 w-fit flex justify-center items-center text-center text-sm bg-white border border-gray-300 text-gray-700 rounded-md"
        >
          Edit
        </button>
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
