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
  FaCalculator,
} from "react-icons/fa";
import {
  FaCalendarXmark,
  FaRegEnvelope,
  FaHandshake,
  FaBuildingLock,
  FaUserPlus,
  FaHeadset,
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

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleRestrictedAccess = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleLogout = () => {
    logout();
    navigate("/payroll-management-login");
  };

  useEffect(() => {
    const checkUserRole = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      try {
        const userResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/current`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const currentUserRole = userResponse.data.user.role;
        setUserRole(currentUserRole);
        setIsAuthorized(["admin", "approver", "hr"].includes(currentUserRole));
      } catch (error) {
        console.error("Error checking authorization:", error);
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
      <div className="bg-[#793B4F] text-white h-screen fixed top-0 left-0 bottom-0 w-64 overflow-y-auto z-10">
        {/* Logo Section */}
        <div className="h-20 flex flex-row items-center justify-center gap-1 px-4">
          <img src={Logo} alt="Company Logo" className="w-12 h-12" />
          <h3
            style={{ fontFamily: ['"AR Julian", sans-serif'].join(", ") }}
            className="text-white text-[18px] font-bold text-sm mt-2 leading-tight"
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
                className="flex items-center justify-between w-full text-left py-2.5 px-4 rounded-md text-white hover:bg-[#924F64] transition-all duration-300"
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
                      `flex items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                        isActive
                          ? "bg-[#5f2e3d] font-bold border-l-4"
                          : "hover:bg-[#924F64]"
                      }`
                    }
                  >
                    <FaBookOpen />
                    <span>Overview</span>
                  </NavLink>
                )}

                {/* Admin Settings: HR or Admin */}
                {(isHr || isAdmin || isApprover) && (
                  <NavLink
                    to="/admin-dashboard/menu"
                    className={({ isActive }) =>
                      `flex items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                        isActive
                          ? "bg-[#5f2e3d] font-bold border-l-4"
                          : "hover:bg-[#924F64]"
                      }`
                    }
                  >
                    <FaTableList />
                    <span>Menu</span>
                  </NavLink>
                )}

                {isApprover && (
                  <NavLink
                    to="/admin-dashboard/admin-settings"
                    className={({ isActive }) =>
                      `flex items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                        isActive
                          ? "bg-[#5f2e3d] font-bold border-l-4"
                          : "hover:bg-[#924F64]"
                      }`
                    }
                  >
                    <FaCogs />
                    <span>Admin Settings</span>
                  </NavLink>
                )}
              </div>
            )}
          </div>

          {/* Employees */}
          <div className="mb-1 -mt-2">
            {/* Toggle Employee Dropdown */}
            <button
              onClick={() => toggleDropdown("employee")}
              className="flex items-center justify-between w-full text-left py-2.5 px-4 rounded-md text-white hover:bg-[#924F64] transition-all duration-300"
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
                        `flex items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                          isActive
                            ? "bg-[#5f2e3d] font-bold border-l-4"
                            : "hover:bg-[#924F64]"
                        }`
                      }
                      end
                    >
                      <FaUsers />
                      <span>Masterlist</span>
                    </NavLink>
                  </>
                ) : (
                  <button
                    onClick={handleRestrictedAccess}
                    className="flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-900/80 hover:cursor-not-allowed text-gray-300 rounded-md"
                  >
                    <FaUsers />
                    <span>Masterlist</span>
                  </button>
                )}
                {isHr || isApprover ? (
                  <>
                    <NavLink
                      to="/admin-dashboard/employees/add-employee"
                      className={({ isActive }) =>
                        `flex items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                          isActive
                            ? "bg-[#5f2e3d] font-bold border-l-4"
                            : "hover:bg-[#924F64]"
                        }`
                      }
                      end
                    >
                      <FaUserPlus />
                      <span>Add Employee</span>
                    </NavLink>
                  </>
                ) : (
                  <button
                    onClick={handleRestrictedAccess}
                    className="flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-900/80 hover:cursor-not-allowed text-gray-300 rounded-md"
                  >
                    <FaUserPlus />
                    <span>Add Employee</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Attendance */}
          <div className="mb-1 -mt-2">
            <button
              onClick={() => toggleDropdown("attendance")}
              className="flex items-center justify-between w-full text-left py-2.5 px-4 rounded-md text-white hover:bg-[#924F64] transition"
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
                        `flex items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                          isActive
                            ? "bg-[#5f2e3d] font-bold border-l-4"
                            : "hover:bg-[#924F64]"
                        }`
                      }
                      end
                    >
                      <FaCalendarPlus />
                      <span>Add Attendance</span>
                    </NavLink>
                  </>
                ) : (
                  <button
                    onClick={handleRestrictedAccess}
                    className="flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-900/80 hover:cursor-not-allowed text-gray-300 rounded-md"
                  >
                    <FaCalendarPlus />
                    <span>Add Attendance</span>
                  </button>
                )}
                {isHr || isApprover ? (
                  <>
                    <NavLink
                      to="/admin-dashboard/attendance/history"
                      className={({ isActive }) =>
                        `flex items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                          isActive
                            ? "bg-[#5f2e3d] font-bold border-l-4"
                            : "hover:bg-[#924F64]"
                        }`
                      }
                      end
                    >
                      <FaRegCalendarAlt />
                      <span>History</span>
                    </NavLink>
                  </>
                ) : (
                  <button
                    onClick={handleRestrictedAccess}
                    className="flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-900/80 hover:cursor-not-allowed text-gray-300 rounded-md"
                  >
                    <FaRegCalendarAlt />
                    <span>History</span>
                  </button>
                )}
                {isHr || isApprover ? (
                  <>
                    <NavLink
                      to="/admin-dashboard/holidays"
                      className={({ isActive }) =>
                        `flex items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                          isActive
                            ? "bg-[#5f2e3d] font-bold border-l-4"
                            : "hover:bg-[#924F64]"
                        }`
                      }
                      end
                    >
                      <FaCalendarXmark />
                      <span>Holidays</span>
                    </NavLink>
                  </>
                ) : (
                  <button
                    onClick={handleRestrictedAccess}
                    className="flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-900/80 hover:cursor-not-allowed text-gray-300 rounded-md"
                  >
                    <FaCalendarXmark />
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
              className="flex items-center justify-between w-full text-left py-2.5 px-4 rounded-md text-white hover:bg-[#924F64] transition-all duration-300"
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
                        `flex -mt-1 items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                          isActive
                            ? "bg-[#5f2e3d] font-bold border-l-4"
                            : "hover:bg-[#924F64]"
                        }`
                      }
                      end
                    >
                      <FaPoll />
                      <span>P. Information</span>
                    </NavLink>
                  </>
                ) : (
                  <button
                    onClick={handleRestrictedAccess}
                    className="flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-900/80 hover:cursor-not-allowed text-gray-300 rounded-md"
                  >
                    <FaPoll />
                    <span>P. Information</span>
                  </button>
                )}
                {isHr || isApprover ? (
                  <>
                    <NavLink
                      to="/admin-dashboard/payroll-summary"
                      className={({ isActive }) =>
                        `flex -mt-1 items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                          isActive
                            ? "bg-[#5f2e3d] font-bold border-l-4"
                            : "hover:bg-[#924F64]"
                        }`
                      }
                      end
                    >
                      <FaPrint />
                      <span>P. Generator</span>
                    </NavLink>
                  </>
                ) : (
                  <button
                    onClick={handleRestrictedAccess}
                    className="flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-900/80 hover:cursor-not-allowed text-gray-300 rounded-md"
                  >
                    <FaPrint />
                    <span>P. Generator</span>
                  </button>
                )}
                {isApprover || isHr ? (
                  <>
                    <NavLink
                      to="/admin-dashboard/payslip-history"
                      className={({ isActive }) =>
                        `flex -mt-1 items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                          isActive
                            ? "bg-[#5f2e3d] font-bold border-l-4"
                            : "hover:bg-[#924F64]"
                        }`
                      }
                      end
                    >
                      <FaFolderOpen />
                      <span>P. History</span>
                    </NavLink>
                  </>
                ) : (
                  <button
                    onClick={handleRestrictedAccess}
                    className="flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-900/80 hover:cursor-not-allowed text-gray-300 rounded-md"
                  >
                    <FaFolderOpen />
                    <span>P. History</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Clients */}
          <div className="mb-1 -mt-2">
            <button
              onClick={() => toggleDropdown("client")}
              className="flex items-center justify-between w-full text-left py-2.5 px-4 rounded-md text-white hover:bg-[#924F64] transition-all duration-300"
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
                      `flex items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                        isActive
                          ? "bg-[#5f2e3d] font-bold border-l-4"
                          : "hover:bg-[#924F64]"
                      }`
                    }
                    end
                  >
                    <FaBuildingLock />
                    <span>Masterlist</span>
                  </NavLink>
                ) : (
                  <button
                    onClick={handleRestrictedAccess}
                    className="flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-900/80 hover:cursor-not-allowed text-gray-300 rounded-md"
                  >
                    <FaScroll />
                    <span>Invoice</span>
                  </button>
                )}

                {isApprover || isHr ? (
                  <NavLink
                    to="client/add-client"
                    className={({ isActive }) =>
                      `flex items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                        isActive
                          ? "bg-[#5f2e3d] font-bold border-l-4"
                          : "hover:bg-[#924F64]"
                      }`
                    }
                    end
                  >
                    <FaHeadset />
                    <span>Add Client</span>
                  </NavLink>
                ) : (
                  <button
                    onClick={handleRestrictedAccess}
                    className="flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-900/80 hover:cursor-not-allowed text-gray-300 rounded-md"
                  >
                    <FaHeadset />
                    <span>Add Client</span>
                  </button>
                )}

                {isApprover || isAdmin ? (
                  <NavLink
                    to="/admin-dashboard/invoice-list"
                    className={({ isActive }) =>
                      `flex items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                        isActive
                          ? "bg-[#5f2e3d] font-bold border-l-4"
                          : "hover:bg-[#924F64]"
                      }`
                    }
                    end
                  >
                    <FaScroll />
                    <span>Invoice</span>
                  </NavLink>
                ) : (
                  <button
                    onClick={handleRestrictedAccess}
                    className="flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-900/80 hover:cursor-not-allowed text-gray-300 rounded-md"
                  >
                    <FaScroll />
                    <span>Invoice</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-2 relative mt-3 bottom-4 w-full">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-[#5f2e3d] hover:bg-[#271017] hover:scale-95 transition-all duration-300 rounded-md text-white"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>

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
