import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/authContext';
import { FaBars } from 'react-icons/fa';

const NavBar = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setDate(now.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }));
      setTime(now.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
      }));
    };

    updateDateTime(); // Set initial values
    const timer = setInterval(updateDateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <nav 
    className="flex fixed z-50 top-0 items-center w-screen text-white justify-between h-11 bg-[#5f2e3d] px-6 mx-auto left-[16rem] right-0"
    style={{ width: "calc(100% - 16rem)" }} 
    >
      {/* Hamburger Button (visible on small screens) */}
      <button 
        className="text-white text-2xl md:hidden focus:outline-none" 
        onClick={toggleSidebar}
      >
        <FaBars />
      </button>
      
      <p className='mt-3 align-middle hidden md:block'>Welcome back, <span className='text-brandPrimary font-semibold'>{user?.name || "Guest"}</span>!</p>
      <div className="mt-3 text-left leading-tight text-[13px]">
        <p>{date}</p> {/* Day and Date on Top */}
        <p className="-mt-4 font-medium text-xl">{time}</p> {/* Time Below */}
      </div>
    </nav>
  );
};

export default NavBar;