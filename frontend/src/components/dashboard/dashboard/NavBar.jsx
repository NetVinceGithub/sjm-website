import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/authContext';

const NavBar = () => {
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
    <nav className="flex items-center text-white justify-between h-14 bg-[#5f2e3d] px-5">
      <p>Welcome, {user?.name || "Guest"}</p>
      <div className="mt-1 text-right leading-tight text-[13px]">
        <p>{date}</p> {/* Day and Date on Top */}
        <p className="text-lg">{time}</p> {/* Time Below */}
      </div>
    </nav>
  );
};

export default NavBar;
