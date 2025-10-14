import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../context/authContext";
import {
  FaTachometerAlt,
  FaUsers,
  FaCogs,
  FaMoneyBillWave,
  FaSignOutAlt,
  FaRegCalendarAlt,
  FaPoll,
  FaScroll,
  FaPrint,
  FaFolderOpen,
  FaChevronDown,
  FaChevronUp,
  FaBookOpen,
  FaClipboardList,
  FaCalendarPlus,
  FaCalendarCheck,
  FaFileInvoiceDollar,
  FaTimes,
  FaCalculator,
} from "react-icons/fa";
import {
  FaCalendarXmark,
  FaRegEnvelope,
  FaHandshake,
  FaBuildingLock,
  FaUserPlus,
  FaHeadset,
  FaLock,
  FaTableList,
} from "react-icons/fa6";
import Logo from "/public/logo-rembg.png";

const AdminSidebar = () => {
  const [userRole, setUserRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleLogoutClick = () => {
    setShowConfirmation(true);
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleRestrictedAccess = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleLogout = () => {
    logout();
    setShowConfirmation(false);
    navigate("/payroll-management-login");
  };

  const handleCancelLogout = () => {
    setShowConfirmation(false);
  };

  useEffect(() => {
    const checkUserRole = async () => {
      const token = localStorage.getItem("token");
      console.log("Token from localStorage:", token); // Debug line

      if (!token) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      try {
        console.log(
          "Making request to:",
          `${import.meta.env.VITE_API_URL}/api/users/current`
        ); // Debug line

        const userResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/current`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        console.log("Response:", userResponse.data); // Debug line

        const currentUserRole = userResponse.data.user.role;
        setUserRole(currentUserRole);
        setIsAuthorized(["admin", "approver", "hr"].includes(currentUserRole));
      } catch (error) {
        console.error("Error checking authorization:", error);
        console.error("Error response:", error.response?.data); // Debug line
        console.error("Error status:", error.response?.status); // Debug line
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, []);

  const isAdmin = userRole === "admin";
  const isApprover = userRole === "approver";
  const isHr = userRole === "hr";

  if (loading) {
    return <div className="text-white p-4">Loading...</div>;
  }

  return (
    <>
      <div className="bg-[#793B4F] text-white h-screen fixed top-0 left-0 bottom-0 w-64 z-10">
        {/* Logo Section */}
        <div className="h-20 flex flex-row items-center justify-center gap-1 px-4">
          <img src={Logo} alt="Company Logo" className="w-12 h-12" />
          <h3
            style={{ fontFamily: ['"AR Julian", sans-serif'].join(", ") }}
            className="text-white text-lg font-bold mt-2 leading-tight"
          >
            St. John Majore <br />
            <span className="text-[15px] font-normal">
              Services Company Inc.
            </span>
          </h3>
        </div>

        {/* Sidebar Menu */}
        <div className="p-2">
          {/* Dashboard */}
          <div className="mb-1 -mt-2">
            {isApprover || isAdmin || isHr ? (
              <button
                onClick={() => toggleDropdown("dashboard")}
                className="text-base flex items-center justify-between w-full text-left py-2.5 px-4 rounded-md text-white hover:bg-[#924F64] transition-all duration-300"
              >
                <span className="flex items-center space-x-4">
                  <FaTachometerAlt />
                  <span>Dashboard</span>
                </span>
                {activeDropdown === "dashboard" ? (
                  <FaChevronUp />
                ) : (
                  <FaChevronDown />
                )}
              </button>
            ) : (
              <button
                onClick={handleRestrictedAccess}
                className="flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-600 hover:bg-red-700 rounded-md"
              >
                <FaTachometerAlt />
                <span>Dashboard</span>
              </button>
            )}

            {/* Dashboard Submenu */}
            {activeDropdown === "dashboard" && (
              <div className="ml-6 mt-1 space-y-1">
                {/* Overview: Approver, HR, or Admin */}
                {(isApprover || isHr || isAdmin) && (
                  <NavLink
                    to="/admin-dashboard/overview"
                    end
                    className={({ isActive }) =>
                      `flex text-sm items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                        isActive
                          ? "font-bold  translate-x-7 transition-all duration-300"
                          : "hover:bg-[#924F64]"
                      }`
                    }
                  >
                    <span>Overview</span>
                  </NavLink>
                )}

                {/* Admin Settings: HR or Admin */}
                {(isHr || isAdmin || isApprover) && (
                  <NavLink
                    to="/admin-dashboard/menu"
                    className={({ isActive }) =>
                      `flex text-sm items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                        isActive
                          ? "font-bold  translate-x-7 transition-all duration-300"
                          : "hover:bg-[#924F64]"
                      }`
                    }
                  >
                    <span>Menu</span>
                  </NavLink>
                )}

                {isApprover ? (
                  <NavLink
                    to="/admin-dashboard/admin-settings"
                    className={({ isActive }) =>
                      `flex text-sm items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                        isActive
                          ? "font-bold  translate-x-7 transition-all duration-300"
                          : "hover:bg-[#924F64]"
                      }`
                    }
                  >
                    <span>Admin Settings</span>
                  </NavLink>
                ) : (
                  <button
                    onClick={handleRestrictedAccess}
                    className="text-sm flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-900/80 hover:cursor-not-allowed text-gray-300 rounded-md"
                  >
                    <span>Admin Settings</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Employees */}
          <div className="mb-1 -mt-2">
            {/* Toggle Employee Dropdown */}
            <button
              onClick={() => toggleDropdown("employee")}
              className="text-base flex items-center justify-between w-full text-left py-2.5 px-4 rounded-md text-white hover:bg-[#924F64] transition-all duration-300"
            >
              <span className="flex items-center space-x-4">
                <FaUsers />
                <span>Employee</span>
              </span>
              {activeDropdown === "employee" ? (
                <FaChevronUp />
              ) : (
                <FaChevronDown />
              )}
            </button>

            {/* Employee Submenu */}
            {activeDropdown === "employee" && (
              <div className="ml-6 mt-1 space-y-1">
                {isHr || isApprover ? (
                  <>
                    <NavLink
                      to="/admin-dashboard/employees"
                      className={({ isActive }) =>
                        `flex text-sm items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                          isActive
                            ? "font-bold  translate-x-7 transition-all duration-300"
                            : "hover:bg-[#924F64]"
                        }`
                      }
                      end
                    >
                      <span>Masterlist</span>
                    </NavLink>
                  </>
                ) : (
                  <button
                    onClick={handleRestrictedAccess}
                    className="text-sm flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-900/80 hover:cursor-not-allowed text-gray-300 rounded-md"
                  >
                    <span>Masterlist</span>
                  </button>
                )}
                {isHr || isApprover ? (
                  <>
                    <NavLink
                      to="/admin-dashboard/employees/add-employee"
                      className={({ isActive }) =>
                        `flex text-sm items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                          isActive
                            ? "font-bold  translate-x-7 transition-all duration-300"
                            : "hover:bg-[#924F64]"
                        }`
                      }
                      end
                    >
                      <span>Add Employee</span>
                    </NavLink>
                  </>
                ) : (
                  <button
                    onClick={handleRestrictedAccess}
                    className="text-sm flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-900/80 hover:cursor-not-allowed text-gray-300 rounded-md"
                  >
                    <span>Add Employee</span>
                  </button>
                )}
                {isHr || isApprover ? (
                  <>
                    <NavLink
                      to="/admin-dashboard/employees/employee-schedule"
                      className={({ isActive }) =>
                        `flex text-sm items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                          isActive
                            ? "font-bold  translate-x-7 transition-all duration-300"
                            : "hover:bg-[#924F64]"
                        }`
                      }
                      end
                    >
                      <span>Employee Schedule</span>
                    </NavLink>
                  </>
                ) : (
                  <button
                    onClick={handleRestrictedAccess}
                    className="text-sm flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-900/80 hover:cursor-not-allowed text-gray-300 rounded-md"
                  >
                    <span>Employee Schedule</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Attendance */}
          <div className="mb-1 -mt-2">
            <button
              onClick={() => toggleDropdown("attendance")}
              className="text-base flex items-center justify-between w-full text-left py-2.5 px-4 rounded-md text-white hover:bg-[#924F64] transition"
            >
              <span className="flex items-center space-x-4">
                <FaCalendarCheck />
                <span>Attendance</span>
              </span>
              {activeDropdown === "attendance" ? (
                <FaChevronUp />
              ) : (
                <FaChevronDown />
              )}
            </button>

            {/* Attendance Submenu */}
            {activeDropdown === "attendance" && (
              <div className="ml-6 mt-1 space-y-1">
                {isHr || isApprover ? (
                  <>
                    <NavLink
                      to="/admin-dashboard/attendance"
                      className={({ isActive }) =>
                        `flex text-sm items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                          isActive
                            ? "font-bold  translate-x-7 transition-all duration-300"
                            : "hover:bg-[#924F64]"
                        }`
                      }
                      end
                    >
                      <span>Add Attendance</span>
                    </NavLink>
                  </>
                ) : (
                  <button
                    onClick={handleRestrictedAccess}
                    className="text-sm flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-900/80 hover:cursor-not-allowed text-gray-300 rounded-md"
                  >
                    <span>Add Attendance</span>
                  </button>
                )}
                {isHr || isApprover ? (
                  <>
                    <NavLink
                      to="/admin-dashboard/attendance/history"
                      className={({ isActive }) =>
                        `flex text-sm items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                          isActive
                            ? "font-bold  translate-x-7 transition-all duration-300"
                            : "hover:bg-[#924F64]"
                        }`
                      }
                      end
                    >
                      <span>History</span>
                    </NavLink>
                  </>
                ) : (
                  <button
                    onClick={handleRestrictedAccess}
                    className="text-sm flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-900/80 hover:cursor-not-allowed text-gray-300 rounded-md"
                  >
                    <span>History</span>
                  </button>
                )}
                {isHr || isApprover ? (
                  <>
                    <NavLink
                      to="/admin-dashboard/holidays"
                      className={({ isActive }) =>
                        `flex text-sm items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                          isActive
                            ? "font-bold  translate-x-7 transition-all duration-300"
                            : "hover:bg-[#924F64]"
                        }`
                      }
                      end
                    >
                      <span>Holidays</span>
                    </NavLink>
                  </>
                ) : (
                  <button
                    onClick={handleRestrictedAccess}
                    className="text-sm flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-900/80 hover:cursor-not-allowed text-gray-300 rounded-md"
                  >
                    <span>Holidays</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Payroll */}
          <div className="mb-1 -mt-2">
            <button
              onClick={() => toggleDropdown("payroll")}
              className="text-base flex items-center justify-between w-full text-left py-2.5 px-4 rounded-md text-white hover:bg-[#924F64] transition-all duration-300"
            >
              <span className="flex items-center space-x-4">
                <FaFileInvoiceDollar />
                <span>Payroll</span>
              </span>
              {activeDropdown === "payroll" ? (
                <FaChevronUp />
              ) : (
                <FaChevronDown />
              )}
            </button>

            {/* Payroll Submenu */}
            {activeDropdown === "payroll" && (
              <div className="ml-6 mt-1 space-y-1">
                {isHr || isApprover ? (
                  <>
                    <NavLink
                      to="/admin-dashboard/employees/payroll-informations/list"
                      className={({ isActive }) =>
                        `flex text-sm items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                          isActive
                            ? "font-bold  translate-x-7 transition-all duration-300"
                            : "hover:bg-[#924F64]"
                        }`
                      }
                      end
                    >
                      <span>Payroll Information</span>
                    </NavLink>
                  </>
                ) : (
                  <button
                    onClick={handleRestrictedAccess}
                    className="text-sm flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-900/80 hover:cursor-not-allowed text-gray-300 rounded-md"
                  >
                    <span>Payroll Information</span>
                  </button>
                )}
                {isHr || isApprover ? (
                  <>
                    <NavLink
                      to="/admin-dashboard/payroll-generator"
                      className={({ isActive }) =>
                        `flex text-sm items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                          isActive
                            ? "font-bold  translate-x-7 transition-all duration-300"
                            : "hover:bg-[#924F64]"
                        }`
                      }
                      end
                    >
                      <span>Payroll Generator</span>
                    </NavLink>
                  </>
                ) : (
                  <button
                    onClick={handleRestrictedAccess}
                    className="text-sm flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-900/80 hover:cursor-not-allowed text-gray-300 rounded-md"
                  >
                    <span>Payroll Generator</span>
                  </button>
                )}
                {isApprover || isHr ? (
                  <>
                    <NavLink
                      to="/admin-dashboard/payslip-history"
                      className={({ isActive }) =>
                        `flex text-sm items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                          isActive
                            ? "font-bold  translate-x-7 transition-all duration-300"
                            : "hover:bg-[#924F64]"
                        }`
                      }
                      end
                    >
                      <span>Payroll History</span>
                    </NavLink>
                  </>
                ) : (
                  <button
                    onClick={handleRestrictedAccess}
                    className="text-sm flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-900/80 hover:cursor-not-allowed text-gray-300 rounded-md"
                  >
                    <span>Payroll History</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Clients */}
          <div className="mb-1 -mt-2">
            <button
              onClick={() => toggleDropdown("client")}
              className="text-base flex items-center justify-between w-full text-left py-2.5 px-4 rounded-md text-white hover:bg-[#924F64] transition-all duration-300"
            >
              <span className="flex items-center space-x-4">
                <FaHandshake />
                <span>Clients</span>
              </span>
              {activeDropdown === "client" ? (
                <FaChevronUp />
              ) : (
                <FaChevronDown />
              )}
            </button>

            {/* Client Submenu */}
            {activeDropdown === "client" && (
              <div className="ml-6 mt-1 space-y-1">
                {isApprover || isAdmin || isHr ? (
                  <NavLink
                    to="/admin-dashboard/client-list"
                    className={({ isActive }) =>
                      `flex text-sm items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                        isActive
                          ? "font-bold  translate-x-7 transition-all duration-300"
                          : "hover:bg-[#924F64]"
                      }`
                    }
                    end
                  >
                    <span>Masterlist</span>
                  </NavLink>
                ) : (
                  <button
                    onClick={handleRestrictedAccess}
                    className="text-sm flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-900/80 hover:cursor-not-allowed text-gray-300 rounded-md"
                  >
                    <span>Masterlist</span>
                  </button>
                )}

                {isApprover || isHr ? (
                  <NavLink
                    to="client/add-client"
                    className={({ isActive }) =>
                      `flex text-sm items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                        isActive
                          ? "font-bold  translate-x-7 transition-all duration-300"
                          : "hover:bg-[#924F64]"
                      }`
                    }
                    end
                  >
                    <span>Add Client</span>
                  </NavLink>
                ) : (
                  <button
                    onClick={handleRestrictedAccess}
                    className="flex text-sm items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-900/80 hover:cursor-not-allowed text-gray-300 rounded-md"
                  >
                    <span>Add Client</span>
                  </button>
                )}

                {isApprover || isAdmin ? (
                  <NavLink
                    to="/admin-dashboard/invoice-list"
                    className={({ isActive }) =>
                      `flex text-sm items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                        isActive
                          ? "font-bold  translate-x-7 transition-all duration-300"
                          : "hover:bg-[#924F64]"
                      }`
                    }
                    end
                  >
                    <span>Invoice</span>
                  </NavLink>
                ) : (
                  <button
                    onClick={handleRestrictedAccess}
                    className="flex text-sm items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-900/80 hover:cursor-not-allowed text-gray-300 rounded-md"
                  >
                    <span>Invoice</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-2 absolute mt-3 bottom-4 w-full">
          <button
            onClick={handleLogoutClick}
            className="flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-[#5f2e3d] hover:bg-[#271017] hover:scale-95 transition-all duration-300 rounded-md text-white"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Logout */}
      {showConfirmation && (
        <div className="fixed inset-0  bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-red-50 border-t-4 border-red-500 rounded-lg p-3 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-center">
              <div className="">
                <h3 className="text-base font-medium text-gray-800">
                  Confirm Logout
                </h3>
              </div>
              <div className="flex justify-end -mt-3">
                <button
                  onClick={handleCancelLogout}
                  className="text-gray-400 w-fit h-fit hover:text-gray-600 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <p className="text-gray-900 text-sm mb-2 text-center">
              Are you sure you want to logout? You'll need to sign in again to
              access your account.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={handleCancelLogout}
                className="flex-1 px-4 py-2 w-36 h-8 border flex justify-center text-sm items-center text-center text-neutralDGray rounded-lg hover:bg-gray-400 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 w-36 h-8 border flex justify-center text-sm items-center text-center text-neutralDGray rounded-lg hover:bg-green-400 hover:text-white transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for restricted access */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg text-center w-80 animate-fadeIn">
            <h2 className="text-base text-red-500 text-left">Access Denied</h2>
            <p className="mt-2 text-sm text-gray-700">
              You do not have permission to access this section.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="mt-1 px-4 py-2 border text-sm h-10 w-full text-neutralDGray rounded hover:text-white hover:bg-red-400 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
