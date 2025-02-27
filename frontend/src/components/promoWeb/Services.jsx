import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Client1 from '../assets/client1.png';
import Client2 from '../assets/client2.png';
import {
  FaToolbox ,
  FaUsersGear,
  FaUtensils,
  FaBroom ,
  FaTruckRampBox,
  FaTruckArrowRight
} from "react-icons/fa6";
import { FaHouseUser} from "react-icons/fa";
import { Button } from 'flowbite-react';

const clientImages = [Client1, Client2];
const Services = () => {
  const [showArrow, setShowArrow] = useState(false);
  const services = [
    {
      id: 1,
      title: "Housekeeping & Facility Maintenance Services",
      description: "We provide reliable staff to keep your facilities clean, organized, and well-maintained.",
      image: <FaToolbox   className="w-14 h-14 text-neutralDGray" />
    },
    {
      id: 2,
      title: "Food Processing Services",
      description: "We supply skilled workers to ensure hygienic, efficient, and high-quality food production.",
      image: <FaUtensils className="w-14 h-14 text-neutralDGray" />
    },
    {
      id: 3,
      title: "Industrial & Toll Manufacturing Services",
      description: "We deliver dedicated personnel to support seamless industrial and toll manufacturing operations.",
      image: <FaUsersGear className="w-14 h-14 text-neutralDGray" />
    },
    {
      id: 4,
      title: "Warehouse, Logistics, & Retail Services",
      description: "We provide trained staff to keep your supply chain, logistics, and retail operations running smoothly.",
      image: <FaTruckRampBox className="w-14 h-14 text-neutralDGray" />
    },
    {
      id: 5,
      title: "Back Office & Staffing Services",
      description: "We offer professional support to handle your administrative and staffing needs with efficiency and care.",
      image: <FaHouseUser className="w-14 h-14 text-neutralDGray" />
    },
    {
      id: 6,
      title: "Learn More",
      description: "We tailor our manpower solutions to fit your unique business needs—let’s find the right team for you!",
      image: <FaTruckArrowRight className="w-14 h-14 text-neutralDGray" />
    }
  ];

  return (
    <div id='services' className='md:px-14 px-4 py-16 max-w-screen-2xl mx-auto'>
      <div className='text-center my-8'>
        <h2 className='text-4xl text-neutralDGray font-semibold mb-2'>Our Clients</h2>
        <p className='text-[1.3rem] text-neutralGray'>From startups to global enterprises, we serve a wide variety of clients.</p>

        <div className='my-12 flex flex-wrap justify-center items-center gap-8'>
          {clientImages.map((img, index) => (
            <motion.img
              key={index}
              src={img}
              alt={`Client ${index + 1}`}
              className={`w-auto h-20 ${index === 1 ? 'h-36' : 'h-16'}`}
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              viewport={{amount: 0.4 }} 
            />
         ))}
        </div>

        <p className='text-[1.3rem] text-neutralGray'>... be one of our <span className='text-brandPrimary font-semibold italic'>Clients!</span></p>
      </div>

      <div className='mt-20 md:w-1/2 mx-auto text-center'>
        <h2 className='text-4xl text-neutralDGray font-semibold mb-2'>Manage Your Services Needs In One System.</h2>
        <p className='text-[1.3rem] text-neutralGray'>Comprehensive Services Capabilities</p>
      </div>

      <div className='mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {services.map((service) => (
          <div
            key={service.id}
            className={`relative px-4 py-8 text-center md:w-[350px] mt-4 mx-auto md:h-80 rounded-md shadow cursor-pointer hover:-translate-y-5 hover:border-b-4 hover:border-indigo-700 transition-all duration-300 flex flex-col items-center justify-between h-full ${
              service.id === 6 ? 'group' : ''
            }`}
          >
            <div>
              <div className='bg-[#E8F5E9] mb-4 h-14 w-14 mx-auto rounded-tl-3xl rounded-br-3xl'>
                <div className='-ml-5'>{service.image}</div>
              </div>
              <h4 className='text-2xl font-bold text-neutralDGray mb-2 px-2'>{service.title}</h4>
              <p className='text-sm text-neutralGray'>{service.description}</p>
            </div>
            {service.id === 6 && (
              <Link to="/services-offered">
                <button className="absolute top-[80%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                                  opacity-0 group-hover:opacity-100 px-6 py-3 
                                  bg-brandPrimary shadow-lg rounded-md text-white font-semibold 
                                  hover:bg-neutralDGray transition-all duration-300">
                  Explore Now
                </button>
              </Link>
            )}
          </div>
        ))}
      </div>
      {showArrow && (
              <button
                onClick={scrollToTop}
                className="fixed bottom-10 right-10 bg-brandPrimary opacity-50 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:bg-brandPrimary hover:-translate-y-4 hover:opacity-100 hover:text-white"
              >
                <FaArrowUp className="text-xl" />
              </button>
      )}
    </div>
  );
};

export default Services;
