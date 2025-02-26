import React from 'react';
import { FaUser } from 'react-icons/fa';

const SummaryCard = ({ icon, title, number, color }) => {
  return (
    <div className="h-[70px] -mt-7 flex rounded hover:scale-105 transition-all duration-300 bg-white shadow-md">
      {/* Left Section: Icon */}
      <div className={`text-2xl flex justify-center rounded-l w-14 rounded-bl items-center ${color} text-white px-3`}>
        {icon}
      </div>

      {/* Right Section: Text */}
      <div className="pl-4 py-1 flex flex-col justify-between flex-grow">
        {title && <p className="text-neutralDGray text-md">{title}</p>}
        <p className="-mt-1 text-2xl">{number}</p>
      </div>
    </div>


  );
};
export default SummaryCard;
