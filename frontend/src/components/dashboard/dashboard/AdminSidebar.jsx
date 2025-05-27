import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaCogs, FaMoneyBillWave, FaSignOutAlt, FaRegCalendarAlt , FaPoll, FaScroll, FaPrint, FaFolderOpen, FaChevronDown, FaChevronUp, FaBookOpen,
  FaClipboardList, FaUserPlus, FaCalendarPlus , FaCalendarCheck, FaFileInvoiceDollar, FaCalculator 
 } from 'react-icons/fa';
 import { FaCalendarXmark } from "react-icons/fa6";
import { useAuth } from '../../../context/authContext';
import Logo from '/public/logo-rembg.png';


const AdminSidebar = () => {
  const role = localStorage.getItem("userRole"); // Get user role from localStorage
  const isAdmin = role === "admin";
  const isEmployee = role === "employee";

  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const { logout } = useAuth(); // Get logout function from AuthContext
  const navigate = useNavigate(); // Hook for navigation
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isEmployeeOpen, setIsEmployeeOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isPayrollOpen, setIsPayrollOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };
  
  // Handle restricted access
  const handleRestrictedAccess = (e) => {
    e.preventDefault(); // Prevent navigation
    setShowModal(true); // Show modal
  };
  
  // Handle user logout
  const handleLogout = () => {
    logout(); // Call logout function
    navigate('/payroll-management-login'); // Redirect to login page
  };

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
            <span className="text-[15px] font-normal">Services Company Inc.</span>
          </h3>
        </div>

        {/* Sidebar Menu */}
        <div className="p-2">

        {/* Dashboard */}
        <div className="mb-1 -mt-2">
          {isAdmin ? (
            <button
              onClick={() => toggleDropdown("dashboard")}
              className="flex items-center justify-between w-full text-left py-2.5 px-4 rounded-md text-white hover:bg-[#924F64] transition-all duration-300"
            >
              <span className="flex items-center space-x-4">
                <FaTachometerAlt />
                <span>Dashboard</span>
              </span>
              {activeDropdown === "dashboard" ? <FaChevronUp /> : <FaChevronDown />}
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
              {isAdmin ? (
                <>
                  <NavLink
                    to="/admin-dashboard/overview"
                    end
                    className={({ isActive }) =>
                      `flex -mt-1 items-center text-white no-underline space-x-3 py-2 px-4 rounded-md ${
                        isActive ? "bg-[#5f2e3d]" : "hover:bg-[#924F64]"
                      }`
                    }
                  >
                    <FaBookOpen />
                    <span>Overview</span>
                  </NavLink>

                  <NavLink
                    to="/admin-dashboard/lounge"
                    className={({ isActive }) =>
                      `flex -mt-3 items-center space-x-3 text-white no-underline py-2 px-4 rounded-md ${
                        isActive ? "bg-[#5f2e3d]" : "hover:bg-[#924F64]"
                      }`
                    }
                  >
                    <FaCogs />
                    <span>Admin Settings</span>
                  </NavLink>
                </>
              ) : (
                <button
                  onClick={handleRestrictedAccess}
                  className="flex items-center space-x-4 w-full text-left py-2 px-4 bg-red-600 hover:bg-red-700 rounded-md"
                >
                  <FaTachometerAlt />
                  <span>Payroll Dashboard</span>
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
              className="flex items-center justify-between w-full text-left py-2.5 px-4 rounded-md text-white hover:bg-[#924F64] transition-all duration-300"
            >
              <span className="flex items-center space-x-4">
                <FaUsers />
                <span>Employee</span>
              </span>
              {activeDropdown === "employee" ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {/* Employee Submenu */}
            {activeDropdown === "employee" && (
              <div className="ml-6 mt-1 space-y-1">
                {isEmployee || isAdmin ? (
                  <>
                    <NavLink
                      to="/admin-dashboard/employees"
                      className={({ isActive }) =>
                        `flex -mt-1 items-center space-x-4 text-white no-underline py-2.5 px-4 rounded-md transition-all duration-300 ${
                          isActive ? "bg-[#5f2e3d]" : "hover:bg-[#924F64]"
                        }`
                      }
                      end
                    >
                      <FaUsers />
                      <span>Masterlist</span>
                    </NavLink>

                    {/* <NavLink
                      to="/admin-dashboard/add-employee"
                      className={({ isActive }) =>
                        `flex -mt-3 items-center space-x-4 text-white no-underline py-2.5 px-4 rounded-md transition-all duration-300 ${
                          isActive ? "bg-[#5f2e3d]" : "hover:bg-[#924F64]"
                        }`
                      }
                      end
                    >
                      <FaUserPlus />
                      <span>Add New</span>
                    </NavLink> */}
                  </>
                ) : (
                  <button
                    onClick={handleRestrictedAccess}
                    className="flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-600 hover:bg-red-700 rounded-md"
                  >
                    <FaClipboardList />
                    <span>Employees IS</span>
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
              {activeDropdown === "attendance" ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {/* Attendance Submenu */}
            {activeDropdown === "attendance" && (
              <div className="ml-6 mt-1 space-y-1">
                {isEmployee || isAdmin ? (
                  <>
                    <NavLink
                      to="/admin-dashboard/attendance"
                      className={({ isActive }) =>
                        `flex -mt-1 items-center space-x-4 text-white no-underline py-2.5 px-4 rounded-md transition ${
                          isActive ? "bg-[#5f2e3d]" : "hover:bg-[#924F64]"
                        }`
                      }
                      end
                    >
                      <FaCalendarPlus />
                      <span>Add Attendance</span>
                    </NavLink>
                    <NavLink
                      to="/admin-dashboard/attendance-computation"
                      className={({ isActive }) =>
                        `flex -mt-1 items-center space-x-4 text-white no-underline py-2.5 px-4 rounded-md transition ${
                          isActive ? "bg-[#5f2e3d]" : "hover:bg-[#924F64]"
                        }`
                      }
                      end
                    >
                      <FaCalculator />
                      <span>A. Computation</span>
                    </NavLink>

                    <NavLink
                      to="/admin-dashboard/attendance/history"
                      className={({ isActive }) =>
                        `flex -mt-1 items-center space-x-4 text-white no-underline py-2.5 px-4 rounded-md transition ${
                          isActive ? "bg-[#5f2e3d]" : "hover:bg-[#924F64]"
                        }`
                      }
                      end
                    >
                      <FaRegCalendarAlt />
                      <span>History</span>
                    </NavLink>

                    <NavLink
                      to="/admin-dashboard/holidays"
                      className={({ isActive }) =>
                        `flex -mt-1 items-center space-x-4 text-white no-underline py-2.5 px-4 rounded-md transition ${
                          isActive ? "bg-[#5f2e3d]" : "hover:bg-[#924F64]"
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
                    className="flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-600 hover:bg-red-700 rounded-md"
                  >
                    <FaRegCalendarAlt />
                    <span>Attendance</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Payroll */}
          <div className="mb-1 -mt-2">
            {isAdmin ? (
              <button
                onClick={() => toggleDropdown("payroll")}
                className="flex items-center justify-between w-full text-left py-2.5 px-4 rounded-md text-white hover:bg-[#924F64] transition-all duration-300"
              >
                <span className="flex items-center space-x-4">
                  <FaFileInvoiceDollar />
                  <span>Payroll</span>
                </span>
                {activeDropdown === "payroll" ? <FaChevronUp /> : <FaChevronDown />}
              </button>
            ) : (
              <button
                onClick={handleRestrictedAccess} // Add restriction to the main button as well
                className="flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-600 hover:bg-red-700 rounded-md"
              >
                <FaFileInvoiceDollar />
                <span>Payroll</span>
              </button>
            )}

            {/* Payroll Submenu */}
            {activeDropdown === "payroll" && (
              <div className="ml-6 mt-1 space-y-1">
                {isAdmin ? (
                  <>
                    <NavLink
                      to="/admin-dashboard/employees/payroll-informations/list"
                      className={({ isActive }) =>
                        `flex -mt-1 items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                          isActive ? "bg-[#5f2e3d] font-bold border-l-4" : "hover:bg-[#924F64]"
                        }`
                      }
                      end
                    >
                      <FaPoll />
                      <span>P. Information</span>
                    </NavLink>

                    <NavLink
                      to="/admin-dashboard/payroll-summary"
                      className={({ isActive }) =>
                        `flex -mt-1 items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                          isActive ? "bg-[#5f2e3d] font-bold border-l-4" : "hover:bg-[#924F64]"
                        }`
                      }
                      end
                    >
                      <FaPrint />
                      <span>P. Generator</span>
                    </NavLink>

                    <NavLink
                      to="/admin-dashboard/payslip-history"
                      className={({ isActive }) =>
                        `flex -mt-1 items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                          isActive ? "bg-[#5f2e3d] font-bold border-l-4" : "hover:bg-[#924F64]"
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
                    className="flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-600 hover:bg-red-700 rounded-md"
                  >
                    <FaFileInvoiceDollar />
                    <span>Payroll</span>
                  </button>
                )}
              </div>
            )}
          </div>


          {/* Invoice */}
          {isAdmin ? (
            <NavLink
              to="/admin-dashboard/invoice-list"
              className={({ isActive }) =>
                `flex items-center space-x-4 py-2.5 text-white no-underline px-4 rounded-md ${
                  isActive ? "bg-[#5f2e3d] font-bold border-l-4" : "hover:bg-[#924F64]"
                }`
              }
              end
            >
              <FaScroll   />
              <span>Invoice</span>
            </NavLink>
          ) : (
            <button
              onClick={handleRestrictedAccess}
              className="flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-600 hover:bg-red-700 rounded-md"
            >
              <FaScroll   />
              <span>Invoice</span>
            </button>
          )}
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
            <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
            <p className="mt-2 text-gray-700">You do not have permission to access this section.</p>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition"
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
