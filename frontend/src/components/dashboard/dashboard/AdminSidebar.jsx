import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaCogs, FaMoneyBillWave, FaSignOutAlt, FaRegCalendarAlt , FaPoll, FaScroll, FaPrint, FaFolderOpen, FaChevronDown} from 'react-icons/fa';
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

  // Handle restricted access
  const handleRestrictedAccess = (e) => {
    e.preventDefault(); // Prevent navigation
    setShowModal(true); // Show modal
  };
  
  // Handle user logout
  const handleLogout = () => {
    logout(); // Call logout function
    navigate('/login'); // Redirect to login page
  };

  return (
    <>
      <div className="bg-[#793B4F] text-white h-screen fixed top-0 left-0 bottom-0 w-64 overflow-y-auto z-10">
        {/* Logo Section */}
        <div className="bg-[#793B4F] h-20 flex items-center justify-center gap-1">
          <img src={Logo} alt="Company Logo" className="w-12 h-12" />
          <h3 className="text-white text-poppins font-bold text-sm text-center leading-tight">
            St. John Majore Services <br /> Company Inc.
          </h3>
        </div>

        {/* Sidebar Menu */}
        <div className="p-2">
          {/* Dashboard */}
          <div className="mb-2">
            {isAdmin ? (
              <NavLink
                to="/admin-dashboard"
                className={({ isActive }) =>
                  `flex items-center space-x-4 block py-2.5 px-4 rounded-md ${
                    isActive ? "bg-[#5f2e3d] font-bold border-l-4 translate-x-4 transition-all duration-300 w-56" : "hover:bg-[#924F64]"
                  }`
                }
                end
              >
                <FaTachometerAlt />
                <span>Dashboard</span>
              </NavLink>
            ) : (
              <button
                onClick={() => {
                  setIsDashboardOpen(!isDashboardOpen);
                  handleRestrictedAccess();
                }}
                className="flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-600 hover:bg-red-700 rounded-md"
              >
                <FaTachometerAlt />
                <span>Payroll Dashboard</span>
              </button>
            )}
          </div>
          

          {/* Employees */}
          {isEmployee || isAdmin ? (
            <NavLink
              to="/admin-dashboard/employees"
              className={({ isActive }) =>
                `flex items-center space-x-4 block py-2.5 px-4 rounded-md ${
                  isActive ? "bg-[#5f2e3d] font-bold border-l-4 translate-x-4 transition-all duration-300 w-56" : "hover:bg-[#924F64]"
                }`
              }
              end
            >
              <FaUsers />
              <span>Employee IS</span>
            </NavLink>
          ) : (
            <button
              onClick={handleRestrictedAccess}
              className="flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-600 hover:bg-red-700 rounded-md"
            >
              <FaUsers />
              <span>Employees IS</span>
            </button>
          )}

          {/* Attendance */}
          {isAdmin ? (
            <NavLink
              to="/admin-dashboard/attendance"
              className={({ isActive }) =>
                `flex items-center space-x-4 block py-2.5 px-4 rounded-md ${
                  isActive ? "bg-[#5f2e3d] font-bold border-l-4 translate-x-4 transition-all duration-300 w-56" : "hover:bg-[#924F64]"
                }`
              }
              end
            >
              <FaRegCalendarAlt   />
              <span>Attendance IS</span>
            </NavLink>
          ) : (
            <button
              onClick={handleRestrictedAccess}
              className="flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-600 hover:bg-red-700 rounded-md"
            >
              <FaRegCalendarAlt   />
              <span>Attendance IS</span>
            </button>
          )}

          {/* Payroll Information */}
          {isAdmin ? (
            <NavLink
              to="/admin-dashboard/employees/payroll-informations/list"
              className={({ isActive }) =>
                `flex items-center space-x-4 block py-2.5 px-4 rounded-md ${
                  isActive ? "bg-[#5f2e3d] font-bold border-l-4 translate-x-4 transition-all duration-300 w-56" : "hover:bg-[#924F64]"
                }`
              }
              end
            >
              <FaPoll  />
              <span>Payroll Information</span>
            </NavLink>
          ) : (
            <button
              onClick={handleRestrictedAccess}
              className="flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-600 hover:bg-red-700 rounded-md"
            >
              <FaPoll  />
              <span>Payroll Information</span>
            </button>
          )}

          {/* Payroll Generator */}
          {isAdmin ? (
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center space-x-4 block py-2.5 px-4 rounded-md ${
                  isActive ? "bg-[#5f2e3d] font-bold border-l-4 translate-x-4 transition-all duration-300 w-56" : "hover:bg-[#924F64]"
                }`
              }
              end
            >
              <FaPrint  />
              <span>Payroll Generator</span>
            </NavLink>
          ) : (
            <button
              onClick={handleRestrictedAccess}
              className="flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-600 hover:bg-red-700 rounded-md"
            >
              <FaPrint  />
              <span>Payroll Generator</span>
            </button>
          )}

          {/* Payroll History */}
          {isAdmin ? (
            <NavLink
              to="/admin-dashboard/payslip-history"
              className={({ isActive }) =>
                `flex items-center space-x-4 block py-2.5 px-4 rounded-md ${
                  isActive ? "bg-[#5f2e3d] font-bold border-l-4 translate-x-4 transition-all duration-300 w-56" : "hover:bg-[#924F64]"
                }`
              }
              end
            >
              <FaFolderOpen  />
              <span>Payroll History</span>
            </NavLink>
          ) : (
            <button
              onClick={handleRestrictedAccess}
              className="flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-600 hover:bg-red-700 rounded-md"
            >
              <FaFolderOpen   />
              <span>Payroll History</span>
            </button>
          )}

          {/* Invoice */}
          {isAdmin ? (
            <NavLink
              to="/admin-dashboard/invoice-list"
              className={({ isActive }) =>
                `flex items-center space-x-4 block py-2.5 px-4 rounded-md ${
                  isActive ? "bg-[#5f2e3d] font-bold border-l-4 translate-x-4 transition-all duration-300 w-56" : "hover:bg-[#924F64]"
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

          {/* Admin Settings */}
          {isAdmin ? (
            <NavLink
              to="/admin-dashboard/lounge"
              className={({ isActive }) =>
                `flex items-center space-x-4 block py-2.5 px-4 rounded-md ${
                  isActive ? "bg-[#5f2e3d] font-bold border-l-4 translate-x-4 transition-all duration-300 w-56" : "hover:bg-[#924F64]"
                }`
              }
              end
            >
              <FaCogs />
              <span>Admin</span>
            </NavLink>
          ) : (
            <button
              onClick={handleRestrictedAccess}
              className="flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-red-600 hover:bg-red-700 rounded-md"
            >
              <FaCogs />
              <span>Admin</span>
            </button>
          )}
        </div>

        {/* Logout Button */}
        <div className="p-2 absolute bottom-4 w-full">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-4 w-full text-left py-2.5 px-4 bg-[#5f2e3d] hover:bg-[#271017] hover:-translate-y-4 transition-all duration-300 rounded-md text-white"
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
