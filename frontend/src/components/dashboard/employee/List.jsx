import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import defaultProfile from "../../../../src/assets/default-profile.png"; // Adjust path as needed
// import { EmployeeButtons } from "../../../utils/EmployeeHelper";
import { FaSearch, FaSyncAlt, FaIdCard, FaPaperclip } from "react-icons/fa";
import EmployeeIDCard from "../EmployeeIDCard";
import Breadcrumb from "../dashboard/Breadcrumb";
import { FaPrint, FaRegFileExcel, FaRegFilePdf, FaRegEnvelope } from "react-icons/fa6";
import { FaEnvelope, FaMinusSquare, FaTimes } from "react-icons/fa";
import BlockEmployeeModal from "../modals/BlockEmployeeModal";
import UnBlockEmployeeModal from "../modals/UnblockEmployeeModal";
import ActivateEmployeeModal from "../modals/ActivateEmployeeModal";
import BulkEmployeeMessageModal from "../modals/BulkEmployeeMessageModal"
import { toast } from 'react-toastify';
import { useAuth } from "../../../context/authContext";

const List = () => {
  const { user } = useAuth();

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
  const [isActivateEmployeeOpen, setIsActivateEmployeeOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isEmailModalEmployee, setIsEmailModalEmployee] = useState(null);
  const [emailMessage, setEmailMessage] = useState();
  const [subject, setSubject] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showBulkMessage, setShowBulkMessage] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    fetchEmployees();
  }, []);

  const bulkMessage = () => {
    setShowBulkMessage(true);  // ✅ This is correct
  };

  const handleCloseBulk = () => {
    setShowBulkMessage(false); // ✅ This is correct
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/employee`);
      if (response.data.success) {
        setEmployees(response.data.employees);
        notifyBirthdays(response.data.employees);
        notifyTrainingExpiring(response.data.employees);
        notifyMedicalExpiring(response.data.employees);
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
      await axios.get(`${import.meta.env.VITE_API_URL}/api/employee/import`);
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

  const openEmailModal = (employeeId) => {
    console.log("Message button")
    const employee = employees.find((emp) => emp.id === employeeId);
    setIsEmailModalEmployee(employeeId);
    setIsEmailModalOpen(true);
    console.log("Message working button")

  }

  const closeEmailModal = () => {
    setIsEmailModalOpen(false);
    setEmailMessage('');
  }

  const handleSubmitEmailMessage = async () => {
    // Validation
    if (!emailMessage.trim()) {
      setSubmitError('Message cannot be empty');
      return;
    }

    if (!isEmailModalEmployee) {
      setSubmitError('No employee selected');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const employee = employees.find(emp => emp.id === isEmailModalEmployee);

      const messageData = {
        employeeId: isEmailModalEmployee,
        employeeName: employee?.name || 'Unknown',
        employeeCode: employee?.employeeCode || employee?.ecode || 'N/A',
        employeeEmail: employee?.emailaddress || "No Email Provided",
        subject: subject || 'No subject provided',
        message: emailMessage.trim(),
        sentAt: new Date().toISOString(),
        sentBy: user.name // You might want to get this from your auth context
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/employee/messaging`,
        messageData,)

      closeEmailModal();


    } catch (error) {
      console.error('Error sending message:', error);

      if (error.response) {
        // Server responded with error
        setSubmitError(error.response.data.message || 'Failed to send message');
      } else if (error.request) {
        // Network error
        setSubmitError('Network error. Please check your connection.');
      } else {
        // Other error
        setSubmitError('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEmailModal = () => {
    closeEmailModal();
  }

  const confirmBlockEmployee = async () => {
    if (employeeToBlock) {
      try {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/employee/toggle-status/${employeeToBlock.id}`
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
          `${import.meta.env.VITE_API_URL}/api/employee/toggle-status/${employeeToBlock.id}`
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

  const handleResignationConfirm = () => {
    setIsActivateEmployeeOpen(false);
    setIsUnBlockModalOpen(true); // Proceed with unblock modal
  };

  const handleResignationCancel = () => {
    setIsActivateEmployeeOpen(false);
    setEmployeeToBlock(null);
  };

  const handleToggleStatus = async (id, currentStatus, employmentStatus) => {
    const employee = employees.find((emp) => emp.id === id);

    if (!employee) return;

    // Check if employee is resigned and trying to activate
    if (employmentStatus === 'RESIGNED' && currentStatus === 'Inactive') {
      setEmployeeToBlock(employee);
      setIsActivateEmployeeOpen(true);
      return;
    }

    if (currentStatus === "Inactive") {
      setEmployeeToBlock(employee);
      setIsUnBlockModalOpen(true);
    } else {
      setEmployeeToBlock(employee);
      setIsBlockModalOpen(true);
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

  const customStyles = {
    table: {
      style: {
        fontWeight: "bold",
        backgroundColor: "#fff",
        width: "100%",
        margin: "0 auto",
      },
    },
    headRow: {
      style: {
        height: "40px", // consistent height
      },
    },
    rows: {
      style: {
        height: "40px", // consistent row height
      },
    },
    headCells: {
      style: {
        backgroundColor: "#fff",
        color: "#333",
        fontWeight: "bold",
        fontSize: "13px", // text-sm
        display: "flex",
        alignItems: "center",
        padding: "4px 8px",
      },
    },
    cells: {
      style: {
        fontSize: "12px", // text-sm
        padding: "4px 8px",
        display: "flex",
        alignItems: "center",
        height: "100%", // ensures it fills the row height
      },
    },
  };

  const conditionalRowStyles = [
    {
      when: row => row.employmentstatus === 'RESIGNED',
      style: {
        opacity: 0.5,
        backgroundColor: '#f5f5f5',
        '&:hover': {
          opacity: 0.7,
          backgroundColor: '#e5e5e5',
          cursor: 'not-allowed',
        },
      },
    },
  ];

  // Define columns with sticky positioning for Options column
  const columns = [
    {
      name: "Image",
      cell: (row) => (
        <img
          src={`${import.meta.env.VITE_API_URL}/uploads/${row.profileImage}`}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover"
          onError={(e) => (e.target.src = defaultProfile)}
        />
      ),
      width: "60px",
      center: true,
    },
    {
      name: "Ecode",
      selector: (row) => row.ecode,
      sortable: true,
      width: "80px",
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      width: "230px",
    },
    {
      name: "Last Name",
      selector: (row) => row.lastname,
      sortable: true,
      width: "100px",
    },
    {
      name: "First Name",
      selector: (row) => row.firstname,
      sortable: true,
      width: "110px",
    },
    {
      name: "Middle Name",
      selector: (row) => row.middlename,
      sortable: true,
      width: "120px",
    },
    {
      name: "Position Title",
      selector: (row) => row.positiontitle,
      sortable: true,
      width: "310px",
    },
    {
      name: "Department",
      selector: (row) => row.department,
      sortable: true,
      width: "120px",
    },
    {
      name: "Area/Section",
      selector: (row) => row['area/section'] || "N/A",
      sortable: true,
      width: "120px",
    },
    {
      name: "Date of Hire",
      selector: (row) => row.dateofhire,
      sortable: true,
      width: "120px",
    },
    {
      name: "Tenurity to Client",
      selector: (row) => row['tenuritytoclient(inmonths)'] || "N/A",
      sortable: true,
      width: "140px",
    },
    {
      name: "Employment Status",
      selector: (row) => row.employmentstatus,
      sortable: true,
      width: "180px",
    },
    {
      name: "Civil Status",
      selector: (row) => row.civilstatus,
      sortable: true,
      width: "120px",
    },
    {
      name: "Sex",
      selector: (row) => row.gender,
      sortable: true,
      width: "100px",
    },
    {
      name: "Birthdate",
      selector: (row) => row.birthdate,
      sortable: true,
      width: "120px",
      cell: (row) => {
        const approaching = isBirthdayApproaching(row.birthdate);
        return (
          <div style={{
            backgroundColor: approaching ? "#ffcc00" : "transparent",
            padding: "4px",
            borderRadius: "4px",
            color: approaching ? "white" : "inherit"
          }}>
            {row.birthdate}{" "}
            {approaching && <span style={{ color: "orange" }}>🎉</span>}
          </div>
        );
      },
    },
    {
      name: "Age",
      sortable: true,
      selector: (row) => row.age,
      width: "80px",
    },
    {
      name: "Contact No.",
      selector: (row) => row.contactno,
      sortable: true,
      width: "130px",
    },
    {
      name: "Permanent Address",
      selector: (row) => row.permanentaddress || "N/A",
      sortable: true,
      width: "400px",
    },
    {
      name: "Current Address",
      selector: (row) => row.address || "N/A",
      sortable: true,
      width: "400px",
    },
    {
      name: "Email Address",
      selector: (row) => row.emailaddress || "N/A",

      sortable: true,
      width: "200px",
    },
    {
      name: "Last Attended (T/S)",
      selector: (row) => row.attendedtrainingandseminar || "N/A",
      sortable: true,
      width: "160px",
      cell: (row) => {
        const dateStr = row.attendedtrainingandseminar;
        const expiring = isTrainingExpiringSoon(dateStr);

        return (
          <div style={{
            backgroundColor: expiring ? "#ff5e58" : "transparent",
            padding: "4px",
            borderRadius: "4px",
            color: expiring ? "#333" : "inherit",
            fontWeight: expiring ? "bold" : "normal",
          }}>
            {dateStr || "N/A"}{" "}
            {expiring && <span style={{ color: "#b36b00" }}>⚠️</span>}
          </div>
        );
      },
    },
    {
      name: "Date of Separation",
      selector: (row) => row.dateofseparation || "N/A",
      sortable: true,
      width: "150px",
    },
    {
      name: "Medical",
      selector: (row) => row.medical || "N/A",
      sortable: true,
      width: "120px",
      cell: (row) => {
        const medStr = row.medical;
        const expiringMed = isMedicalExpiringSoon(medStr);
        return (
          <div style={{
            backgroundColor: expiringMed ? "#B2FBA5" : "transparent",
            padding: "4px",
            borderRadius: "4px",
            color: expiringMed ? "#333" : "inherit",
            fontWeight: expiringMed ? "bold" : "normal",
          }}>
            {medStr || "N/A"}{""}
            {expiringMed && <span style={{ color: "red" }}>⚕️</span>}
          </div>
        )
      }
    },
    {
      name: "Options",
      cell: (row) => {
        // Determine if employee is resigned and should be inactive
        const isResigned = row.employmentstatus === 'RESIGNED';
        const effectiveStatus = isResigned ? 'Inactive' : row.status;

        return (
          <div className="flex justify-center items-center sticky-actions">
            <button
              onClick={() => openModal(row.employeeId || row.id)}
              className="w-14 h-8 border hover:bg-neutralSilver border-neutralDGray rounded-l flex items-center justify-center"
            >
              <FaIdCard
                title="View ID"
                className=" text-neutralDGray w-5 h-5"
              />
            </button>
            <button
              onClick={() => openEmailModal(row.employeeId || row.id)}  // ← Pass the ID
              className="w-14 h-8 border hover:bg-neutralSilver border-neutralDGray flex items-center justify-center"
            >
              <FaEnvelope
                title="Message"
                className="text-neutralDGray w-5 h-5"
              />
            </button>
            <button
              className={`w-14 h-8 border border-neutralDGray rounded-r flex items-center justify-center transition ${effectiveStatus === "Active"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
                }`}
              onClick={() =>
                handleToggleStatus(row.id, effectiveStatus, row.employmentstatus)
              }
            >
              <FaMinusSquare
                title="Toggle Status"
                className="w-5 h-5"
              />
            </button>
          </div>
        );
      },
      width: "200px",
      right: true,
      center: true,
    },
  ];

  // Alerts!!!
  const isBirthdayApproaching = (birthdate, daysAhead = 7) => {
    const today = new Date();
    const currentYear = today.getFullYear();

    const birthdayThisYear = new Date(birthdate);
    birthdayThisYear.setFullYear(currentYear);

    const diff = (birthdayThisYear - today) / (1000 * 60 * 60 * 24);

    return diff >= 0 && diff <= daysAhead;
  };

  const isTrainingExpiringSoon = (attendedtrainingandseminar, daysAhead = 30) => {
    const today = new Date();
    const currentYear = today.getFullYear();

    const attendedDate = new Date(attendedtrainingandseminar);
    attendedDate.setFullYear(currentYear);

    const diff = (attendedDate - today) / (1000 * 60 * 60 * 24);

    return diff >= 0 && diff <= daysAhead;
  };

  const isMedicalExpiringSoon = (medical, daysAhead = 30) => {
    const today = new Date();
    const currentYear = today.getFullYear();

    const medicalDate = new Date(medical);
    medicalDate.setFullYear(currentYear);

    const diff = (medicalDate - today) / (1000 * 60 * 60 * 24);

    return diff >= 0 && diff <= daysAhead;
  };

  // Toast notification functions
  const notifyBirthdays = (people) => {
    const count = people.filter(p => isBirthdayApproaching(p.birthdate)).length;
    if (count > 0) {
      toast.info(
        <div style={{ fontSize: '0.8rem' }}>
          {count} {count > 1 ? 'people have' : 'person has'} their birthday{count > 1 ? 's' : ''} approaching soon.
        </div>,
        {
          autoClose: 5000,
          closeButton: false,
          closeOnClick: true,
          position: 'top-right',
        }
      );

    }
  };

  const notifyTrainingExpiring = (people) => {
    const count = people.filter(p => isTrainingExpiringSoon(p.attendedtrainingandseminar)).length;
    if (count > 0) {
      toast.warning(
        <div style={{ fontSize: '0.8rem' }}>
          {count} training{count > 1 ? 's are' : ' is'} expiring soon.
        </div>,
        {
          autoClose: 5000,
          closeOnClick: true,
          closeButton: false,
          position: 'top-right',
        }
      );

    }
  };

  const notifyMedicalExpiring = (people) => {
    const count = people.filter(p => isMedicalExpiringSoon(p.medical)).length;
    if (count > 0) {
      toast.error(
        <div style={{ fontSize: '0.8rem' }}>
          {count} medical{count > 1 ? 's are' : ' is'} expiring soon.
        </div>,
        {
          autoClose: 5000,
          closeOnClick: true,
          closeButton: false,
          position: 'top-right',
        }
      );

    }
  };

  return (
    <div className="fixed top-0 right-0 bottom-0 min-h-screen w-[calc(100%-16rem)] bg-neutralSilver p-6 pt-16">
      <Breadcrumb
        items={[
          { label: "Employee", href: "" },
          { label: "Masterlist", href: "/admin-dashboard/employees" },
        ]}
      />
      <div className="bg-white  h-[calc(100vh-120px)] w-full -mt-1 py-3 p-2 rounded-lg shadow">
        <div className="flex items-center justify-between">
          {/* Button Group - Centered Vertically */}
          <div className="inline-flex border border-neutralDGray rounded h-8">
            <button
              onClick={bulkMessage}
              className="px-3 w-20 h-full border-r border-neutralDGray hover:bg-neutralSilver transition-all duration-300 border-neutralDGray rounded-l flex items-center justify-center"
            >
              <FaRegEnvelope
                title="Print"
                className="text-neutralDGray] transition-all duration-300"
              />
            </button>

            <button
              onClick={exportToPDF} // Export as PDF
              className="px-3 w-20 h-full hover:bg-neutralSilver border-l-0 transition-all duration-300 rounded-r flex items-center justify-center"
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
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-2xl w-11/12 sm:w-96 md:w-[28rem] lg:w-[30rem] relative">
                  <h3 className="text-base mb-2 text-green-500">
                    Sync Successful!
                  </h3>
                  <p className="text-justify text-sm">
                    Employees have been successfully synchronized.
                  </p>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 w-24 h-8 border flex justify-center items-center text-center text-neutralDGray rounded-lg hover:bg-red-400 hover:text-white transition-all"
                    >
                      Close
                    </button>
                  </div>
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
                <style jsx>{`
                  .sticky-actions {
                    position: sticky !important;
                    right: 0 !important;
                    background: white !important;
                    z-index: 10 !important;
                    box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
                  }
                  
                  /* Override react-data-table-component styles for sticky column */
                  .rdt_TableCol:last-child {
                    position: sticky !important;
                    right: 0 !important;
                    background: white !important;
                    z-index: 10 !important;
                    box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
                  }
                  
                  .rdt_TableHeadRow .rdt_TableCol:last-child {
                    position: sticky !important;
                    right: 0 !important;
                    background: white !important;
                    z-index: 11 !important;
                    box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
                  }
                  
                  .rdt_TableRow .rdt_TableCell:last-child {
                    position: sticky !important;
                    right: 0 !important;
                    background: white !important;
                    z-index: 10 !important;
                    box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
                  }
                `}</style>
                <DataTable
                  customStyles={customStyles}
                  columns={columns}
                  data={filteredEmployees}
                  progressPending={loading}
                  progressComponent={
                    <div className="flex justify-center items-center gap-2 py-4 text-gray-600 text-sm">
                      <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-500"></span>
                      Loading data...
                    </div>
                  }
                  pagination
                  expandableRows={true}
                  expandableRowExpanded={(row) => expandedRows[row.id] === true}
                  expandableRowsComponent={({ data }) =>
                    data.employmentstatus === 'REHIRED' ? (
                      <div className="p-3 ml-5 text-neutralDGray/60 text-xs font-medium">
                        <span>Notes:</span>
                        <li className="ml-5">This employee has been rehired on (date).</li>
                      </div>
                    ) : null
                  }
                  expandOnRowClicked={false}
                  // Add this function to control which rows can be expanded
                  expandableRowDisabled={(row) => row.employmentstatus !== 'REHIRED'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
            {/* Modal Header */}
            <div className="flex justify-between items-center h-10 border-b px-4">
              <h2 className="text-sm mt-2 text-gray-800">Send Message</h2>
              <button
                onClick={handleCancelEmailModal}
                className="text-gray-400 w-fit h-fit flex-justify-end hover:text-gray-600 transition-colors"
                disabled={isSubmitting}
              >
                <FaTimes className="w-4 h-4 flex justify-end" />
              </button>
            </div>


            {/* Modal Body */}
            <div className="p-6">
              {/* Employee Information */}
              <div className="mb-2 -mt-3">
                <div className="rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-600">Employee Name:</span>
                    <span className="text-xs text-gray-800">
                      {employees.find(emp => emp.id === isEmailModalEmployee)?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between -mt-2 items-center">
                    <span className="text-xs font-medium text-gray-600">Employee Code:</span>
                    <span className="text-xs text-gray-800">
                      {employees.find(emp => emp.id === isEmailModalEmployee)?.employeeCode ||
                        employees.find(emp => emp.id === isEmailModalEmployee)?.ecode || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600">Sent to:</span>
                    <span className="text-xs text-gray-800">
                      {employees.find(emp => emp.id === isEmailModalEmployee)?.emailaddress || 'NO Email'}
                    </span>
                  </div>
                </div>
              </div>
              <hr />
              {/* Error Message */}
              {submitError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{submitError}</p>
                </div>
              )}

              {/* Message Input */}
              <div className="mb-6 relative">
                <label htmlFor="message" className="block text-xs font-medium text-gray-700 -mt-4 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  rows="1"
                  className="w-full text-xs px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Type your email subject here..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
                <label htmlFor="message" className="block text-xs font-medium text-gray-700 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  rows="4"
                  value={emailMessage}
                  onChange={(e) => {
                    setEmailMessage(e.target.value);
                    if (submitError) setSubmitError('');
                  }}
                  className="w-full text-xs px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Type your message here..."
                  disabled={isSubmitting}
                />

                {/* Paperclip + File name + Remove */}
                <div className="absolute bottom-2 right-2">
                  <label htmlFor="attachment" className="cursor-pointer text-gray-400 hover:text-gray-600">
                    <FaPaperclip className="w-4 h-4" />
                  </label>
                  <input
                    id="attachment"
                    type="file"
                    onChange={(e) => setAttachment(e.target.files[0])}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </div>

                {/* File name and remove below textarea */}
                {attachment && (
                  <div className="-mt-4 ml-2 flex items-center gap-2 text-[11px] text-gray-400">
                    <span className="truncate max-w-[200px]" title={attachment.name}>
                      {attachment.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAttachment(null)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancelEmailModal}
                  className="px-4 w-1/2 h-fit text-xs text-center py-2 text-gray-600 border-gray-100 border rounded-md hover:bg-red-200 hover:text-white transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitEmailMessage}
                  className="px-4 w-1/2 h-fit text-xs flex justify-center items-center text-center py-2 text-gray-600 border-gray-100 border rounded-md hover:text-white  hover:bg-green-200 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {isSubmitting ? 'Sending...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )
      }


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

      <ActivateEmployeeModal
        isOpen={isActivateEmployeeOpen}
        onClose={handleResignationCancel}
        onConfirm={handleResignationConfirm}
        employee={employeeToBlock} // Corrected prop name
      />

      <UnBlockEmployeeModal
        isOpen={isUnBlockModalOpen}
        onClose={() => setIsUnBlockModalOpen(false)}
        onConfirm={confirmUnblockEmployee}
        employee={employeeToBlock}
      />

      <BulkEmployeeMessageModal
        show={showBulkMessage}       // ✅ Correct prop name
        handleCloseBulk={handleCloseBulk}  // ✅ Correct prop name
      />
    </div >
  );
};

export default List;