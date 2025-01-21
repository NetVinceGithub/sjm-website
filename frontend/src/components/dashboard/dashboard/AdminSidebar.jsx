import React from 'react'
import { NavLink } from 'react-router-dom'
import { FaBuilding, FaTachometerAlt, FaUsers, FaCogs, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa'

const AdminSidebar = () => {
  return(
    <div className="bg-gray-800 text-white h-screen fixed left-0 top-0 bottom-0 space-y-2 w-64">
      <div className='bg-teal-600 h-12 flex items-center justify-center'> 
        <h3>Employee MS</h3>
      </div>
      <div>
        <NavLink to="/admin-dashboard"
            className={({isActive}) => `${isActive ? "bg-teal-500" : ""} flex items-center space-x-4 block py-2.5 px-4 rounded`}
            end>
              <FaTachometerAlt />
              <span>Payroll Dashboard</span>
        </NavLink>

        <NavLink to="/admin-dashboard/employees"
             className={({isActive}) => `${isActive ? "bg-teal-500" : ""} flex items-center space-x-4 block py-2.5 px-4 rounded`}
             end>
              <FaUsers />
              <span>Employee</span>
        </NavLink>

        <NavLink to="/admin-dashboard/departments"
            className={({isActive}) => `${isActive ? "bg-teal-500" : ""} flex items-center space-x-4 block py-2.5 px-4 rounded`}
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
              <FaCogs />
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