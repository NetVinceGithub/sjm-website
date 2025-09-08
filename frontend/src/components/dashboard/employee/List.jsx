import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import defaultProfile from "../../../../src/assets/default-profile.png"; // Adjust path as needed
// import { EmployeeButtons } from "../../../utils/EmployeeHelper";
import {
  FaSearch,
  FaSyncAlt,
  FaIdCard,
  FaEdit,
  FaPaperclip,
} from "react-icons/fa";
import EmployeeIDCard from "../EmployeeIDCard";
import Breadcrumb from "../dashboard/Breadcrumb";
import DropdownStatusButton from "./DropdownStatusButton";
import {
  FaPrint,
  FaRegFileExcel,
  FaRegFilePdf,
  FaRegEnvelope,
  FaFilter,
} from "react-icons/fa6";
import { FaEnvelope, FaMinusSquare, FaTimes } from "react-icons/fa";
import BlockEmployeeModal from "../modals/BlockEmployeeModal";
import InactiveEmployee from "../modals/InactiveEmployee";
import UnBlockEmployeeModal from "../modals/UnblockEmployeeModal";
import ActivateEmployeeModal from "../modals/ActivateEmployeeModal";
import BulkEmployeeMessageModal from "../modals/BulkEmployeeMessageModal";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/authContext";
import { ThreeDots } from "react-loader-spinner";
import FilterList from "../modals/FilterList";
import { useNavigate } from "react-router-dom";

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
  const [isInactiveModalOpen, setIsInactiveModalOpen] = useState(false);
  const [employeeToBlock, setEmployeeToBlock] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isActivateEmployeeOpen, setIsActivateEmployeeOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isEmailModalEmployee, setIsEmailModalEmployee] = useState(null);
  const [emailMessage, setEmailMessage] = useState();
  const [subject, setSubject] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showBulkMessage, setShowBulkMessage] = useState(false);
  const [showFilterList, setshowFilterList] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [activeFilters, setActiveFilters] = useState({});
  const [originalEmployees, setOriginalEmployees] = useState([]);
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const bulkMessage = () => {
    setShowBulkMessage(true); // ✅ This is correct
  };

  const handleCloseBulk = () => {
    setShowBulkMessage(false); // ✅ This is correct
  };

  // Add this function to classify employees based on separation date
  const classifyEmploymentStatus = (employees) => {
    return employees.map((employee) => {
      // Check if employee has a date of separation and it's not null/empty
      if (
        employee.dateofseparation &&
        employee.dateofseparation.trim() !== "" &&
        employee.dateofseparation !== "N/A"
      ) {
        // Parse the separation date
        const separationDate = new Date(employee.dateofseparation);
        const currentDate = new Date();

        // If separation date is valid and is today or in the past
        if (!isNaN(separationDate.getTime()) && separationDate <= currentDate) {
          return {
            ...employee,
            employmentstatus: "RESIGNED",
            status: "Inactive", // Also set status to Inactive for resigned employees
          };
        }
      }

      // Return employee unchanged if no valid separation date
      return employee;
    });
  };

  const openFilterList = () => {
    setshowFilterList(true);
  };

  const handleCloseFilterList = () => {
    setshowFilterList(false); // ✅ This is correct
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/employee`
      );

      console.log("API Response:", response.data); // Debug log

      if (response.data.success) {
        // Fix: Access employees from response.data.employees
        const employees = response.data.employees; // Changed from response.employees

        // Apply employment status classification
        const classifiedEmployees = classifyEmploymentStatus(employees);

        setEmployees(classifiedEmployees);
        setOriginalEmployees(classifiedEmployees);
        notifyBirthdays(classifiedEmployees);
        notifyTrainingExpiring(classifiedEmployees);
        notifyMedicalExpiring(classifiedEmployees);
        setFilteredEmployees(classifiedEmployees);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
    applyFilters(filters);
  };

  const applyFilters = (filters) => {
    let filtered = [...originalEmployees];

    // Apply search filter if exists
    const searchInput = document.querySelector(
      'input[placeholder="Search Employee"]'
    );
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";

    if (searchTerm) {
      filtered = filtered.filter((emp) =>
        emp.name.toLowerCase().includes(searchTerm)
      );
    }

    // Apply department filter
    if (filters.department && filters.department.length > 0) {
      filtered = filtered.filter((emp) =>
        filters.department.includes(emp.department)
      );
    }

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((emp) => {
        const effectiveStatus =
          emp.employmentstatus === "RESIGNED" ? "Inactive" : emp.status;
        return filters.status.includes(effectiveStatus);
      });
    }

    // Apply employment status filter
    if (filters.employmentStatus && filters.employmentStatus.length > 0) {
      filtered = filtered.filter((emp) =>
        filters.employmentStatus.includes(emp.employment_status)
      );
    }

    // Apply employment classification filter
    if (
      filters.employmentClassification &&
      filters.employmentClassification.length > 0
    ) {
      filtered = filtered.filter((emp) =>
        filters.employmentClassification.includes(emp.employment_classification)
      );
    }

    // Apply position filter
    if (filters.position && filters.position.length > 0) {
      filtered = filtered.filter((emp) =>
        filters.position.includes(emp.position_title)
      );
    }

    // Apply project filter
    if (filters.project && filters.project.length > 0) {
      filtered = filtered.filter((emp) =>
        filters.project.includes(emp.project || "N/A")
      );
    }

    // Apply employment rank filter
    if (filters.employmentRank && filters.employmentRank.length > 0) {
      filtered = filtered.filter((emp) =>
        filters.employmentRank.includes(emp.employment_rank)
      );
    }

    if (filters.civilStatus && filters.civilStatus.length > 0) {
      filtered = filtered.filter((emp) =>
        filters.civilStatus.includes(emp.civil_status)
      );
    }

    if (filters.sex && filters.sex.length > 0) {
      filtered = filtered.filter((emp) => filters.sex.includes(emp.gender));
    }

    // Apply date range filter (date of hire)
    if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);

      filtered = filtered.filter((emp) => {
        if (!emp.dateofhire) return false;
        const hireDate = new Date(emp.dateofhire);
        return hireDate >= startDate && hireDate <= endDate;
      });
    }

    // Apply age range filter
    if (filters.ageRange && (filters.ageRange.min || filters.ageRange.max)) {
      filtered = filtered.filter((emp) => {
        const age = parseInt(emp.age);
        if (isNaN(age)) return false;

        const minAge = filters.ageRange.min
          ? parseInt(filters.ageRange.min)
          : 0;
        const maxAge = filters.ageRange.max
          ? parseInt(filters.ageRange.max)
          : 999;

        return age >= minAge && age <= maxAge;
      });
    }

    setFilteredEmployees(filtered);
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

    // Start with original data
    let filtered = [...originalEmployees];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((emp) =>
        emp.name.toLowerCase().includes(searchTerm)
      );
    }

    // Reapply existing filters
    if (Object.keys(activeFilters).length > 0) {
      // Apply department filter
      if (activeFilters.department && activeFilters.department.length > 0) {
        filtered = filtered.filter((emp) =>
          activeFilters.department.includes(emp.department)
        );
      }

      // Apply status filter
      if (activeFilters.status && activeFilters.status.length > 0) {
        filtered = filtered.filter((emp) => {
          const effectiveStatus =
            emp.employmentstatus === "RESIGNED" ? "Inactive" : emp.status;
          return activeFilters.status.includes(effectiveStatus);
        });
      }

      // Apply employment status filter
      if (
        activeFilters.employmentStatus &&
        activeFilters.employmentStatus.length > 0
      ) {
        filtered = filtered.filter((emp) =>
          activeFilters.employmentStatus.includes(emp.employmentstatus)
        );
      }

      // Apply other filters as needed...
    }

    setFilteredEmployees(filtered);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setFilteredEmployees(originalEmployees);

    // Clear search input
    const searchInput = document.querySelector(
      'input[placeholder="Search Employee"]'
    );
    if (searchInput) {
      searchInput.value = "";
    }
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
    console.log("Message button");
    const employee = employees.find((emp) => emp.id === employeeId);
    setIsEmailModalEmployee(employeeId);
    setIsEmailModalOpen(true);
    console.log("Message working button");
  };

  const closeEmailModal = () => {
    setIsEmailModalOpen(false);
    setEmailMessage("");
  };

  // Updated submit function
  const handleSubmitEmailMessage = async () => {
    // Validation
    if (!emailMessage.trim()) {
      setSubmitError("Message cannot be empty");
      return;
    }

    if (!isEmailModalEmployee) {
      setSubmitError("No employee selected");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const employee = employees.find((emp) => emp.id === isEmailModalEmployee);

      // Create FormData to handle file uploads
      const formData = new FormData();

      // Add text fields
      formData.append("employeeId", isEmailModalEmployee);
      formData.append("employeeName", employee?.name || "Unknown");
      formData.append(
        "employeeCode",
        employee?.employeeCode || employee?.ecode || "N/A"
      );
      formData.append(
        "employeeEmail",
        employee?.emailaddress || "No Email Provided"
      );
      formData.append("subject", subject || "No subject provided");
      formData.append("message", emailMessage.trim());
      formData.append("sentAt", new Date().toISOString());
      formData.append("sentBy", user.name);

      // Add files to FormData
      attachments.forEach((file) => {
        formData.append("attachments", file); // Note: 'attachments' should match your backend multer field name
      });

      console.log("Sending FormData with", attachments.length, "attachments");

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/employee/messaging`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload Progress: ${percentCompleted}%`);
          },
        }
      );

      console.log("Email sent successfully:", response.data);

      // Clear attachments after successful send
      setAttachments([]);
      setEmailMessage("");
      setSubject("");
      closeEmailModal();
    } catch (error) {
      console.error("Error sending message:", error);

      if (error.response) {
        setSubmitError(error.response.data.message || "Failed to send message");
      } else if (error.request) {
        setSubmitError("Network error. Please check your connection.");
      } else {
        setSubmitError("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEmailModal = () => {
    setAttachments([]);
    setEmailMessage("");
    setSubject("");
    setSubmitError("");
    closeEmailModal();
  };

  // Update the confirmBlockEmployee function to handle both Block and Inactive
  const confirmBlockEmployee = async () => {
    if (employeeToBlock) {
      try {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/employee/toggle-status/${
            employeeToBlock.id
          }`
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

        setIsInactiveModalOpen(false);
        setEmployeeToBlock(null);

        // Add success notification
        toast.success("Employee status updated to Inactive!");
      } catch (error) {
        console.error("Error updating employee status:", error);
        toast.error("Failed to update employee status. Please try again.");
      }
    }
  };

  // Separate function specifically for blocking (setting status to "Block")
  const confirmBlockEmployeeToBlocked = async () => {
    if (employeeToBlock) {
      try {
        // Use the correct API endpoint for blocking
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/employee/block/${
            employeeToBlock.id
          }`
        );

        // Update employee status in state to "Block"
        setEmployees((prevEmployees) =>
          prevEmployees.map((emp) =>
            emp.id === employeeToBlock.id ? { ...emp, status: "Block" } : emp
          )
        );

        setFilteredEmployees((prevFiltered) =>
          prevFiltered.map((emp) =>
            emp.id === employeeToBlock.id ? { ...emp, status: "Block" } : emp
          )
        );

        // Close modal and clear state
        setIsBlockModalOpen(false);
        setEmployeeToBlock(null);

        // Add success notification
        toast.success("Employee successfully blocked!");
      } catch (error) {
        console.error("Error blocking employee:", error);
        toast.error("Failed to block employee. Please try again.");
      }
    }
  };

  const confirmUnblockEmployee = async () => {
    if (employeeToBlock) {
      try {
        // Use appropriate API endpoint based on current status
        const currentStatus = employeeToBlock.status;
        let apiEndpoint;
        let newStatus;

        if (currentStatus === "Block") {
          // Unblocking from Block status
          apiEndpoint = `${import.meta.env.VITE_API_URL}/api/employee/unblock/${
            employeeToBlock.id
          }`;
          newStatus = "Active";
        } else if (currentStatus === "Inactive") {
          // Activating from Inactive status
          apiEndpoint = `${
            import.meta.env.VITE_API_URL
          }/api/employee/activate/${employeeToBlock.id}`;
          newStatus = "Active";
        } else {
          // Fallback to toggle-status
          apiEndpoint = `${
            import.meta.env.VITE_API_URL
          }/api/employee/toggle-status/${employeeToBlock.id}`;
          newStatus = "Active";
        }

        await axios.put(apiEndpoint);

        // Update employee status in state
        setEmployees((prevEmployees) =>
          prevEmployees.map((emp) =>
            emp.id === employeeToBlock.id ? { ...emp, status: newStatus } : emp
          )
        );

        setFilteredEmployees((prevFiltered) =>
          prevFiltered.map((emp) =>
            emp.id === employeeToBlock.id ? { ...emp, status: newStatus } : emp
          )
        );

        setIsUnBlockModalOpen(false);
        setEmployeeToBlock(null);

        // Add success notification
        toast.success(
          `Employee successfully ${
            currentStatus === "Block" ? "unblocked" : "activated"
          }!`
        );
      } catch (error) {
        console.error("Error updating employee status:", error);
        toast.error("Failed to update employee status. Please try again.");
      }
    }
  };

  const handleResignationConfirm = () => {
    // After confirming activation of resigned employee, proceed with unblock
    setIsActivateEmployeeOpen(false);
    setIsUnBlockModalOpen(true);
  };

  const handleResignationCancel = () => {
    setIsActivateEmployeeOpen(false);
    setEmployeeToBlock(null);
  };

// Fixed handleToggleStatus function - replace the existing one in your List.js component


  const handleToggleStatus = async (
    id,
    currentStatus,
    employmentStatus,
    newStatus
  ) => {
    const employee = employees.find((emp) => emp.id === id);
    if (!employee) return;

    console.log("Toggle Status Debug:", {
      id,
      currentStatus,
      employmentStatus,
      newStatus,
    });

    // If dropdown selection, use newStatus
    if (newStatus) {
      if (newStatus === "Block") {
        setEmployeeToBlock(employee);
        setIsBlockModalOpen(true);
        return;
      } else if (newStatus === "Inactive") {
        setEmployeeToBlock(employee);
        setIsInactiveModalOpen(true);
        return;
      } else if (newStatus === "Active") {
        // For dropdown "Active" selection, determine which modal based on current status
        setEmployeeToBlock(employee);
        if (currentStatus === "Block") {
          setIsUnBlockModalOpen(true); // Unblock modal for blocked employees
        } else if (currentStatus === "Inactive") {
          // Always use Activate modal for inactive employees (regardless of employment status)
          setIsActivateEmployeeOpen(true);
        }
        return;
      }
    }
  



    if (employmentStatus === "RESIGNED" && currentStatus === "Inactive") {
      // Special case for resigned employees - show activate modal first
      setEmployeeToBlock(employee);
      setIsActivateEmployeeOpen(true);
      return;
    }
  
    // Regular status changes for main button clicks
    if (currentStatus === "Block") {
      // Block -> Active (Unblock) - Use Unblock Modal
      setEmployeeToBlock(employee);
      setIsUnBlockModalOpen(true);
    } else if (currentStatus === "Inactive") {
      // Inactive -> Active - Always use Activate Modal for inactive employees
      setEmployeeToBlock(employee);
      setIsActivateEmployeeOpen(true); 
    } else if (currentStatus === "Active") {
      // Active -> Inactive (default action)
      setEmployeeToBlock(employee);
      setIsInactiveModalOpen(true);
    }
  };



  // requires: import * as XLSX from 'xlsx';
  const exportToExcel = () => {
    if (!filteredEmployees || filteredEmployees.length === 0) {
      alert("⚠ No data available to export.");
      return;
    }

    const headers = [
      "HC",
      "ECODE",
      "LASTNAME",
      "FIRSTNAME",
      "MIDDLENAME",
      "FULLNAME",
      "POSITION",
      "PROJECT",
      "DEPARTMENT",
      "AREA/SECTION",
      "EMPLOYMENT RANK",
      "DATE OF HIRE",
      "DATE OF SEPARATION",
      "TENURITY TO CLIENT (IN MONTHS)",
      "EMPLOYMENT CLASSIFICATION",
      "EMPLOYMENT STATUS",
      "CIVIL STATUS",
      "SEX",
      "BIRTHDATE",
      "AGE",
      "CURRENT ADDRESS",
      "PERMANENT ADDRESS",
      "CONTACT NUMBER",
      "EMAIL ADDRESS",
      "GOVERNMENT ID NUMBER",
      "EMERGENCY CONTACT NAME",
      "EMERGENCY CONTACT NUMBER",
      "EMERGENCY CONTACT ADDRESS",
      "MEDICAL",
      "HEALTHCARD",
      "GMP",
      "PRP",
      "HOUSEKEEPING",
      "SAFETY",
      "CRR",
      "SSS",
      "PHILHEALTH",
      "PAGIBIG",
      "TIN NUMBER",
    ];

    // Map header label -> possible keys in your employee object (in order of preference)
    const keyMap = {
      HC: ["hc"],
      ECODE: ["ecode"],
      LASTNAME: ["last_name", "lastName"],
      FIRSTNAME: ["first_name", "firstName"],
      MIDDLENAME: ["middle_name", "middleName"],
      FULLNAME: ["name", "complete_name", "completeName"],
      POSITION: ["position_title", "positiontitle", "designation", "position"],
      PROJECT: ["project"],
      DEPARTMENT: ["department"],
      "AREA/SECTION": ["area_section", "area/section", "areaSection"],
      "EMPLOYMENT RANK": ["employment_rank", "employmentrank"],
      "DATE OF HIRE": ["date_of_hire", "dateOfHire"],
      "DATE OF SEPARATION": ["date_of_separation", "dateOfSeparation"],
      "TENURITY TO CLIENT (IN MONTHS)": [
        "tenuritytoclient(inmonths)",
        "tenuritytoclient",
        "tenurity_to_client",
        "tenure_months",
        "tenureMonths",
      ],
      "EMPLOYMENT CLASSIFICATION": ["employment_classification"],
      "EMPLOYMENT STATUS": ["employment_status", "status"],
      "CIVIL STATUS": ["civil_status"],
      SEX: ["gender", "sex"],
      BIRTHDATE: ["birthdate"],
      AGE: ["age"],
      "CURRENT ADDRESS": ["current_address"],
      "PERMANENT ADDRESS": ["permanent_address"],
      "CONTACT NUMBER": ["contact_no", "contactNumber"],
      "EMAIL ADDRESS": ["email_address", "email"],
      "GOVERNMENT ID NUMBER": ["government_id_number", "governmentIdNumber"],
      "EMERGENCY CONTACT NAME": [
        "emergency_contact_name",
        "emergencyContactName",
        "emergency_contact",
      ],
      "EMERGENCY CONTACT NUMBER": [
        "emergency_contact_number",
        "emergencyContactNumber",
      ],
      "EMERGENCY CONTACT ADDRESS": [
        "emergency_contact_address",
        "emergencyContactAddress",
      ],
      MEDICAL: ["medical", "medical_date"],
      HEALTHCARD: ["health_card_date", "health_card", "healthcard"],
      GMP: ["gmp_date"],
      PRP: ["prp_date"],
      HOUSEKEEPING: ["housekeeping_date"],
      SAFETY: ["safety_date"],
      CRR: ["crr_date"],
      SSS: ["sss"],
      PHILHEALTH: ["phil_health", "philhealth"],
      PAGIBIG: ["pag_ibig", "pagibig"],
      "TIN NUMBER": ["tin", "tin_number"],
    };

    // Helper: compute tenure months from dates (if no precomputed field)
    const computeTenureMonths = (emp) => {
      const hireStr = emp.date_of_hire || emp.dateOfHire || emp.dateofhire;
      if (!hireStr) return "";
      const hire = new Date(hireStr);
      if (isNaN(hire)) return "";
      const endStr =
        emp.date_of_separation ||
        emp.dateOfSeparation ||
        emp.dateofseparation ||
        null;
      const end = endStr ? new Date(endStr) : new Date();
      if (isNaN(end)) return "";
      let months = (end.getFullYear() - hire.getFullYear()) * 12;
      months += end.getMonth() - hire.getMonth();
      // adjust if day-of-month smaller
      if (end.getDate() < hire.getDate()) months -= 1;
      return months >= 0 ? months : 0;
    };

    // Get first available value for a header
    const getValueForHeader = (emp, header) => {
      if (header === "TENURITY TO CLIENT (IN MONTHS)") {
        // try precomputed keys first
        const keys = keyMap[header];
        for (const k of keys) {
          if (emp[k] !== undefined && emp[k] !== null && emp[k] !== "") {
            return emp[k];
          }
        }
        // otherwise compute
        return computeTenureMonths(emp);
      }

      const keys = keyMap[header] || [];
      for (const k of keys) {
        if (emp[k] !== undefined && emp[k] !== null && emp[k] !== "") {
          return emp[k];
        }
      }

      // fallback: try to find any case-insensitive match (defensive)
      const lowerKeys = Object.keys(emp).reduce((acc, cur) => {
        acc[cur.toLowerCase()] = emp[cur];
        return acc;
      }, {});
      const headerKey = header.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      // try direct normalized match
      if (lowerKeys[headerKey] !== undefined) return lowerKeys[headerKey];

      return "";
    };

    // Build rows in the order of headers
    const rows = filteredEmployees.map((emp) =>
      headers.map((h) => {
        const val = getValueForHeader(emp, h);
        // Format dates as yyyy-mm-dd (if it's a valid date string)
        if (typeof val === "string" && /\d{4}-\d{2}-\d{2}/.test(val))
          return val;
        // For Date objects
        if (val instanceof Date && !isNaN(val)) {
          return val.toISOString().slice(0, 10);
        }
        // Keep numbers as-is, else stringify
        return val === null || val === undefined ? "" : val;
      })
    );

    const dataWithHeaders = [headers, ...rows];

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(dataWithHeaders);

    // Optional: auto column widths (basic estimation)
    ws["!cols"] = headers.map((h) => ({
      wch: Math.max(10, Math.min(30, h.length + 5)),
    }));

    // Create workbook and append
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");

    // Trigger download
    XLSX.writeFile(wb, "Employee_Masterlist.xlsx");
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
      when: (row) => row.employmentstatus === "RESIGNED",
      style: {
        opacity: 0.5,
        backgroundColor: "#f5f5f5",
        "&:hover": {
          opacity: 0.7,
          backgroundColor: "#e5e5e5",
          cursor: "not-allowed",
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
      name: "Last Name",
      selector: (row) => row.last_name,
      sortable: true,
      width: "100px",
    },
    {
      name: "First Name",
      selector: (row) => row.first_name,
      sortable: true,
      width: "110px",
    },
    {
      name: "Middle Name",
      selector: (row) => row.middle_name,
      sortable: true,
      width: "120px",
    },
    {
      name: "Full Name",
      selector: (row) => row.name,
      sortable: true,
      width: "230px",
    },
    {
      name: "Position",
      selector: (row) => row.position_title,
      sortable: true,
      width: "310px",
    },
    {
      name: "Project",
      selector: (row) => row.project || "N/A",
      sortable: true,
      width: "200px",
    },
    {
      name: "Department",
      selector: (row) => row.department,
      sortable: true,
      width: "200px",
    },
    {
      name: "Area/Section",
      selector: (row) => row["area/section"] || "N/A",
      sortable: true,
      width: "200px",
    },
    {
      name: "Employment Rank",
      selector: (row) => row.employment_rank,
      sortable: true,
      width: "230px",
    },
    {
      name: "Date of Hire",
      selector: (row) => row.date_of_hire,
      sortable: true,
      width: "180px",
    },
    {
      name: "Date of Separation",
      selector: (row) => row.dateofseparation || "N/A",
      sortable: true,
      width: "180px",
    },
    {
      name: "Tenurity to Client",
      selector: (row) => row["tenuritytoclient(inmonths)"] || "N/A",
      sortable: true,
      width: "140px",
    },
    {
      name: "Employment Classification",
      selector: (row) => row.employment_classification,
      sortable: true,
      width: "200px",
    },
    {
      name: "Employment Status",
      selector: (row) => row.status,
      sortable: true,
      width: "180px",
    },
    {
      name: "Civil Status",
      selector: (row) => row.civil_status,
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
      width: "180px",
      cell: (row) => {
        const approaching = isBirthdayApproaching(row.birthdate);
        return (
          <div
            style={{
              backgroundColor: approaching ? "#ffcc00" : "transparent",
              padding: "4px",
              borderRadius: "4px",
              color: approaching ? "white" : "inherit",
            }}
          >
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
      name: "Current Address",
      selector: (row) => row.current_address || "N/A",
      sortable: true,
      width: "400px",
    },
    {
      name: "Permanent Address",
      selector: (row) => row.permanent_address || "N/A",
      sortable: true,
      width: "400px",
    },
    {
      name: "Contact No.",
      selector: (row) => row.contact_no,
      sortable: true,
      width: "130px",
    },
    {
      name: "Email Address",
      selector: (row) => row.email_address || "N/A",

      sortable: true,
      width: "200px",
    },
    {
      name: "Government ID Number",
      selector: (row) => row.government_id_number || "N/A",

      sortable: true,
      width: "200px",
    },
    {
      name: "Emergency Contact Name",
      selector: (row) => row.emergency_contact_name,
      sortable: true,
      width: "230px",
    },
    {
      name: <div style={{ textAlign: "center" }}>Emergency Contact No.</div>,
      selector: (row) => row.emergency_contact_number,
      sortable: true,
      width: "180px",
    },
    {
      name: "Emergency Contact Address",
      selector: (row) => row.emergency_contact_address,
      sortable: true,
      width: "400px",
    },
    {
      name: "Medical",
      selector: (row) => row.medical || "N/A",
      sortable: true,
      width: "180px",
      cell: (row) => {
        const medStr = row.medical;
        const expiringMed = isMedicalExpiringSoon(medStr);
        return (
          <div
            style={{
              backgroundColor: expiringMed ? "#B2FBA5" : "transparent",
              padding: "4px",
              borderRadius: "4px",
              color: expiringMed ? "#333" : "inherit",
              fontWeight: expiringMed ? "bold" : "normal",
            }}
          >
            {medStr || "N/A"}
            {""}
            {expiringMed && <span style={{ color: "red" }}>⚕️</span>}
          </div>
        );
      },
    },
    {
      name: "Health Card",
      selector: (row) => row.health_card_date,
      sortable: true,
      width: "180px",
    },
    {
      name: "GMP",
      selector: (row) => row.gmp_date || "N/A",
      sortable: true,
      width: "180px",
      cell: (row) => {
        const dateStr = row.gmp_date;
        const expiring = dateStr ? isTrainingExpiringSoon(dateStr) : false;

        return (
          <div
            style={{
              backgroundColor: expiring ? "#ff5e58" : "transparent",
              padding: "4px",
              borderRadius: "4px",
              color: expiring ? "#333" : "inherit",
              fontWeight: expiring ? "bold" : "normal",
            }}
          >
            {dateStr || "N/A"}{" "}
            {expiring && <span style={{ color: "#b36b00" }}>⚠️</span>}
          </div>
        );
      },
    },
    {
      name: "PRP",
      selector: (row) => row.prp_date || "N/A",
      sortable: true,
      width: "180px",
      cell: (row) => {
        const dateStr = row.prp_date;
        const expiring = dateStr ? isTrainingExpiringSoon(dateStr) : false;

        return (
          <div
            style={{
              backgroundColor: expiring ? "#ff5e58" : "transparent",
              padding: "4px",
              borderRadius: "4px",
              color: expiring ? "#333" : "inherit",
              fontWeight: expiring ? "bold" : "normal",
            }}
          >
            {dateStr || "N/A"}{" "}
            {expiring && <span style={{ color: "#b36b00" }}>⚠️</span>}
          </div>
        );
      },
    },
    {
      name: "Housekeeping",
      selector: (row) => row.housekeeping_date || "N/A",
      sortable: true,
      width: "180px",
      cell: (row) => {
        const dateStr = row.housekeeping_date;
        const expiring = dateStr ? isTrainingExpiringSoon(dateStr) : false;

        return (
          <div
            style={{
              backgroundColor: expiring ? "#ff5e58" : "transparent",
              padding: "4px",
              borderRadius: "4px",
              color: expiring ? "#333" : "inherit",
              fontWeight: expiring ? "bold" : "normal",
            }}
          >
            {dateStr || "N/A"}{" "}
            {expiring && <span style={{ color: "#b36b00" }}>⚠️</span>}
          </div>
        );
      },
    },
    {
      name: "Safety",
      selector: (row) => row.safety_date || "N/A",
      sortable: true,
      width: "180px",
      cell: (row) => {
        const dateStr = row.safety_date;
        const expiring = dateStr ? isTrainingExpiringSoon(dateStr) : false;

        return (
          <div
            style={{
              backgroundColor: expiring ? "#ff5e58" : "transparent",
              padding: "4px",
              borderRadius: "4px",
              color: expiring ? "#333" : "inherit",
              fontWeight: expiring ? "bold" : "normal",
            }}
          >
            {dateStr || "N/A"}{" "}
            {expiring && <span style={{ color: "#b36b00" }}>⚠️</span>}
          </div>
        );
      },
    },
    {
      name: "CRR",
      selector: (row) => row.crr_date || "N/A",
      sortable: true,
      width: "180px",
      cell: (row) => {
        const dateStr = row.crr_date;
        const expiring = dateStr ? isTrainingExpiringSoon(dateStr) : false;

        return (
          <div
            style={{
              backgroundColor: expiring ? "#ff5e58" : "transparent",
              padding: "4px",
              borderRadius: "4px",
              color: expiring ? "#333" : "inherit",
              fontWeight: expiring ? "bold" : "normal",
            }}
          >
            {dateStr || "N/A"}{" "}
            {expiring && <span style={{ color: "#b36b00" }}>⚠️</span>}
          </div>
        );
      },
    },
    {
      name: "SSS",
      selector: (row) => row.sss,
      sortable: true,
      width: "150px",
    },
    {
      name: "PhilHealth",
      selector: (row) => row.phil_health,
      sortable: true,
      width: "150px",
    },
    {
      name: "Pag-IBIG",
      selector: (row) => row.pag_ibig,
      sortable: true,
      width: "150px",
    },
    {
      name: "TIN Number",
      selector: (row) => row.tin,
      sortable: true,
      width: "150px",
    },
    {
      name: "Options",
      cell: (row) => {
        const isResigned = row.employmentstatus === "RESIGNED";
        const effectiveStatus = isResigned ? "Inactive" : row.status;

        return (
          <div className="flex justify-center items-center sticky-actions">
            <button
              onClick={() => openModal(row.employeeId || row.id)}
              className="w-10 h-8 border hover:bg-neutralSilver border-neutralDGray rounded-l flex items-center justify-center"
            >
              <FaIdCard title="View ID" className="text-neutralDGray w-4 h-4" />
            </button>
            {/* <button
              onClick={() => openEmailModal(row.employeeId || row.id)}
              className="w-10 h-8 border hover:bg-neutralSilver border-neutralDGray flex items-center justify-center"
            >
              <FaEnvelope
                title="Message"
                className="text-neutralDGray w-4 h-4"
              />
            </button> */}

            <button
              onClick={() =>
                navigate(
                  `/admin-dashboard/employees/edit/${row.employeeId || row.id}`
                )
              }
              className="w-10 h-8 border hover:bg-neutralSilver border-neutralDGray flex items-center justify-center"
            >
              <FaEdit title="Edit" className="text-neutralDGray w-4 h-4" />
            </button>
            <DropdownStatusButton
              row={row}
              effectiveStatus={effectiveStatus}
              handleToggleStatus={(id, status, empStatus, newStatus) => {
                console.log("DropdownButton clicked:", {
                  id,
                  status,
                  empStatus,
                  newStatus,
                });
                handleToggleStatus(id, status, empStatus, newStatus);
              }}
            />
          </div>
        );
      },
      width: "150px",
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

  const isTrainingExpiringSoon = (trainingDate, daysAhead = 30) => {
    if (!trainingDate) return false;

    const today = new Date();
    const currentYear = today.getFullYear();

    const attendedDate = new Date(trainingDate);
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
    const count = people.filter((p) =>
      isBirthdayApproaching(p.birthdate)
    ).length;
    if (count > 0) {
      toast.info(
        <div style={{ fontSize: "0.8rem" }}>
          {count} {count > 1 ? "people have" : "person has"} their birthday
          {count > 1 ? "s" : ""} approaching soon.
        </div>,
        {
          autoClose: 5000,
          closeButton: false,
          closeOnClick: true,
          position: "top-right",
        }
      );
    }
  };

  const notifyTrainingExpiring = (people) => {
    const count = people.filter((p) =>
      isTrainingExpiringSoon(p.attendedtrainingandseminar)
    ).length;
    if (count > 0) {
      toast.warning(
        <div style={{ fontSize: "0.8rem" }}>
          {count} training{count > 1 ? "s are" : " is"} expiring soon.
        </div>,
        {
          autoClose: 5000,
          closeOnClick: true,
          closeButton: false,
          position: "top-right",
        }
      );
    }
  };

  const notifyMedicalExpiring = (people) => {
    const count = people.filter((p) => isMedicalExpiringSoon(p.medical)).length;
    if (count > 0) {
      toast.error(
        <div style={{ fontSize: "0.8rem" }}>
          {count} medical{count > 1 ? "s are" : " is"} expiring soon.
        </div>,
        {
          autoClose: 5000,
          closeOnClick: true,
          closeButton: false,
          position: "top-right",
        }
      );
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate file count
    if (files.length + attachments.length > 10) {
      setSubmitError("Maximum 10 files allowed");
      return;
    }

    // Validate file sizes (20MB per file)
    const maxSize = 100 * 1024 * 1024; // 20MB
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      setSubmitError(
        `Files exceed 20MB limit: ${oversizedFiles
          .map((f) => f.name)
          .join(", ")}`
      );
      return;
    }

    // Add new files to existing attachments
    setAttachments((prev) => [...prev, ...files]);
    setSubmitError(""); // Clear any previous errors

    // Clear the input so the same file can be selected again if needed
    e.target.value = "";
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className=" right-0 bottom-0  min-h-screen w-full bg-neutralSilver p-3 pt-16">
      <Breadcrumb
        items={[
          { label: "Employee" },
          { label: "Masterlist", href: "/admin-dashboard/employees" },
        ]}
      />
      <div className="bg-white p-2 -mt-3 rounded-lg shadow w-[calc(100vw-310px)] flex justify-between">
        <div className="inline-flex border border-neutralDGray rounded h-8">
          <button
            onClick={bulkMessage}
            className="px-3 w-20 h-full border-r  hover:bg-neutralSilver transition-all duration-300 border-neutralDGray rounded-l flex items-center justify-center"
          >
            <FaRegEnvelope
              title="Print"
              className="text-neutralDGray] transition-all duration-300"
            />
          </button>

          <button
            onClick={exportToExcel} // Export as Excel
            className="px-3 w-20 h-full hover:bg-neutralSilver border-l-0 transition-all duration-300 rounded-r flex items-center justify-center"
          >
            <FaRegFileExcel
              title="Export to PDF"
              className=" text-neutralDGray"
            />
          </button>
        </div>

        <div className="flex flex-row gap-2 w-1/2 justify-end">
          <div className="flex w-full">
            <input
              type="text"
              placeholder="Search Employee"
              onChange={handleFilter}
              className="px-2 text-xs rounded w-full h-8 py-0.5 border"
            />
            <FaSearch className="-ml-6 mt-1.5 text-neutralDGray/60" />
          </div>
          <div
            onClick={openFilterList}
            className="px-2 text-xs text-neutralDGray rounded w-1/4 items-center hover:bg-neutralSilver flex justify-between h-8 py-0.5 border"
          >
            Filter Options{" "}
            <span>
              <FaFilter className="mr-2" />
            </span>
          </div>
        </div>
      </div>

      <div className=" bg-white w-[calc(100vw-310px)] p-2 mt-2 rounded-lg shadow">
        {/* Containing the table list */}
        <div className="w-full overflow-x-auto ">
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
                  dense
                  fixedHeader
                  paginationPerPage={20}
                  highlightOnHover={true}
                  data={filteredEmployees}
                  progressPending={loading}
                  conditionalRowStyles={conditionalRowStyles}
                  progressComponent={
                    <div className="flex justify-center items-center gap-2 text-gray-600 text-sm">
                      <ThreeDots
                        visible={true}
                        height="60"
                        width="60"
                        color="#4fa94d"
                        radius="9"
                        ariaLabel="three-dots-loading"
                        wrapperStyle={{}}
                        wrapperClass=""
                      />
                    </div>
                  }
                  noDataComponent={
                    <div className="text-gray-500 text-sm italic py-4 text-center">
                      *** No data found ***
                    </div>
                  }
                  fixedHeaderScrollHeight="530px"
                  pagination
                  expandableRows={true}
                  expandableRowExpanded={(row) => expandedRows[row.id] === true}
                  expandableRowsComponent={({ data }) =>
                    data.employmentstatus === "REHIRED" ? (
                      <div className="p-3 ml-5 text-neutralDGray/60 text-xs font-medium">
                        <span>Notes:</span>
                        <li className="ml-5">
                          This employee has been rehired on (date).
                        </li>
                      </div>
                    ) : null
                  }
                  expandOnRowClicked={false}
                  // Add this function to control which rows can be expanded
                  expandableRowDisabled={(row) =>
                    row.employmentstatus !== "REHIRED"
                  }
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
                    <span className="text-xs font-medium text-gray-600">
                      Employee Name:
                    </span>
                    <span className="text-xs text-gray-800">
                      {employees.find((emp) => emp.id === isEmailModalEmployee)
                        ?.name || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between -mt-2 items-center">
                    <span className="text-xs font-medium text-gray-600">
                      Employee Code:
                    </span>
                    <span className="text-xs text-gray-800">
                      {employees.find((emp) => emp.id === isEmailModalEmployee)
                        ?.employeeCode ||
                        employees.find((emp) => emp.id === isEmailModalEmployee)
                          ?.ecode ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600">
                      Sent to:
                    </span>
                    <span className="text-xs text-gray-800">
                      {employees.find((emp) => emp.id === isEmailModalEmployee)
                        ?.emailaddress || "NO Email"}
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
                <label
                  htmlFor="subject"
                  className="block text-xs font-medium text-gray-700 -mt-2 mb-2"
                >
                  Subject <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="subject"
                  rows="1"
                  className="w-full text-xs px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Type your email subject here..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={isSubmitting}
                />

                <label
                  htmlFor="message"
                  className="block text-xs font-medium text-gray-700 mb-2 mt-4"
                >
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  rows="4"
                  value={emailMessage}
                  onChange={(e) => {
                    setEmailMessage(e.target.value);
                    if (submitError) setSubmitError("");
                  }}
                  className="w-full text-xs px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Type your message here..."
                  disabled={isSubmitting}
                />

                <div className="absolute bottom-2 right-2">
                  <label
                    htmlFor="attachment"
                    className="cursor-pointer text-gray-400 hover:text-gray-600"
                  >
                    <FaPaperclip className="w-4 h-4" />
                  </label>
                  <input
                    id="attachment"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isSubmitting}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xlsx,.xls,.csv"
                  />
                </div>
              </div>

              {/* File attachments preview - UPDATED */}
              {attachments.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">
                    Attachments ({attachments.length}/10)
                  </h4>
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-xs"
                      >
                        <span
                          className="text-gray-600 truncate max-w-[200px]"
                          title={file.name}
                        >
                          {file.name} ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700 ml-2"
                          disabled={isSubmitting}
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                  className="px-4 w-1/2 h-fit text-xs flex justify-center items-center text-center py-2 text-gray-600 border-gray-100 border rounded-md hover:text-white hover:bg-green-200 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {isSubmitting ? "Sending..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee ID Modal */}
      <EmployeeIDCard
        show={isModalOpen}
        handleClose={closeModal}
        employeeId={selectedEmployeeId}
        refreshEmployees={fetchEmployees} // Pass the function as a prop
      />

      {/* Block Employee Modal - for Active/Inactive to Block transitions */}
      <BlockEmployeeModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onConfirm={confirmBlockEmployeeToBlocked} // Use specific blocking function
        employee={employeeToBlock}
      />

      {/* Activate Employee Modal - for resigned employees */}
      <ActivateEmployeeModal
        isOpen={isActivateEmployeeOpen}
        onClose={() => setIsActivateEmployeeOpen(false)}
        onConfirm={handleResignationConfirm}
        employee={employeeToBlock}
      />

      {/* Unblock Employee Modal - for Block/Inactive to Active transitions */}
      <UnBlockEmployeeModal
        isOpen={isUnBlockModalOpen}
        onClose={() => setIsUnBlockModalOpen(false)}
        onConfirm={confirmUnblockEmployee}
        employee={employeeToBlock}
      />

      {/* Inactive Employee Modal - for Active to Inactive transitions */}
      <InactiveEmployee
        isOpen={isInactiveModalOpen}
        onClose={() => setIsInactiveModalOpen(false)}
        onConfirm={confirmBlockEmployee} // This will set status to "Inactive"
        employee={employeeToBlock}
      />

      <BulkEmployeeMessageModal
        show={showBulkMessage} // ✅ Correct prop name
        handleCloseBulk={handleCloseBulk} // ✅ Correct prop name
      />

      {showFilterList && (
        <FilterList
          show={showFilterList}
          handleCloseFilterList={handleCloseFilterList}
          employees={originalEmployees} // Pass original data for generating filter options
          onFilterChange={handleFilterChange} // Pass the filter change handler
          onClearFilters={clearAllFilters} // Pass clear filters function
          activeFilters={activeFilters} // Pass current active filters
        />
      )}
    </div>
  );
};

export default List;
