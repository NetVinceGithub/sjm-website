import React from 'react'
import { useAuth } from '../context/authContext';
import AdminSidebar from '../components/dashboard/dashboard/AdminSidebar';
import Navbar from '../components/dashboard/dashboard/NavBar';
import AdminSummary from '../components/dashboard/dashboard/PayrollSummary';
import { Outlet } from 'react-router-dom';

const AdminDashboard = () => {
  const {user} = useAuth() 

  return (
    <div className='flex'>
      <AdminSidebar />
      <div className='flex-1 ml-64 bg-neutralSilver'>
        <Navbar />
        <Outlet />
      </div>
    </div>
  )
}

export default AdminDashboard