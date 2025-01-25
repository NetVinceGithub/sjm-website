import React from 'react'
import { NavLink } from 'react-router-dom'
import { FaBuilding, FaTachometerAlt, FaUsers, FaCogs, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa'
import Logo from '/public/logo-rembg.png'

const AdminSidebar = () => {
  return(
    <div className="bg-[#793B4F] text-white h-screen fixed mt-30 text-left bottom-0 space-y-2 w-64">
      <div className="bg-[#793B4F] h-20 flex items-center justify-center gap-1">
        <img src={Logo} alt="Company Logo" className="w-12 h-12" />
        <h3 className="text-white text-poppins font-bold">St. John Majore Services<br />Company Inc.</h3>
      </div>
      <div>
        <NavLink to="/admin-dashboard"
            className={({isActive}) => `${isActive ? "bg-[#5f2e3d]" : ""} flex items-center space-x-4 block py-2.5 px-4`}
            end>
              <FaTachometerAlt />
              <span>Payroll Dashboard</span>
        </NavLink>

        <NavLink to="/admin-dashboard/employees"
             className={({isActive}) => `${isActive ? "bg-[#5f2e3d]" : ""} flex items-center space-x-4 block py-2.5 px-4`}
             end>
              <FaUsers />
              <span>Employees</span>
        </NavLink>

        <NavLink to="/admin-dashboard/departments"
            className={({isActive}) => `${isActive ? "bg-[#5f2e3d]  " : ""} flex items-center space-x-4 block py-2.5 px-4`}
            end>
              <FaCalendarAlt />
              <span>Department</span>
        </NavLink>

        <NavLink to="/admin-dashboard"
            className="flex items-center space-x-4 block py-2.5 px-4 rounded">
              <FaBuilding />
              <span>Leave</span>
        </NavLink>

        
        <NavLink to="/admin-dashboard/payroll-dashboard"
            className="flex items-center space-x-4 block py-2.5 px-4 rounded">
              <FaBuilding />
              <span>Payroll Dashboard</span>
        </NavLink>

   

        <NavLink to="/admin-dashboard/projects"
            className={({isActive}) => `${isActive ? "bg-teal-500" : ""} flex items-center space-x-4 block py-2.5 px-4 rounded`}
            end>
              <FaUsers />
              <span>Projects</span>
        </NavLink>

        <NavLink to="/admin-dashboard/lounge"
            className={({isActive}) => `${isActive ? "bg-teal-500" : ""} flex items-center space-x-4 block py-2.5 px-4 rounded`}
              end>

              <FaCogs />
              <span>Admin</span>
        </NavLink>
      </div>
    </div>
  )
}

export default AdminSidebar