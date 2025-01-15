import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/authContext';

const NavBar = () => {
  const { user } = useAuth();
  const [dateTime, setDateTime] = useState(new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
  }));

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(
        new Date().toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: true,
        })
      );
    }, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center text-white justify-between h-12 bg-teal-600 px-5">
      <p>Welcome {user.name}</p>
      <p>{dateTime}</p> {/* Displays the current day, date, and time */}
      <button className="px-4 py-1 bg-teal-700 hover:bg-teal-800">Logout</button>
    </div>
  );
};

export default NavBar;
