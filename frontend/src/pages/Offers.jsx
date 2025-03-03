import React,  { useState, useEffect } from "react";
import { 
  FaBuildingColumns, FaCartShopping, FaCity, FaWarehouse, FaHospital, 
  FaHouseChimneyUser, FaPersonDigging, FaGasPump, FaKitchenSet, 
  FaMartiniGlassCitrus, FaMicrochip, FaPeopleGroup, FaClipboardCheck, FaPenRuler  
} from "react-icons/fa6";
import Img1 from '../assets/choose.jpg';
import { FaArrowUp } from 'react-icons/fa';

export default function Offers() {
  const [showArrow, setShowArrow] = useState(false);
  
    useEffect(() => {
      const handleScroll = () => {
        setShowArrow(window.scrollY > 200);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);
  
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  const services = [
    { id: 1, title: "Hospitality & Tourism", icon: <FaMartiniGlassCitrus />, color: "bg-gray-600", description: "Empowering hotels, resorts, and travel agencies with skilled personnel." },
    { id: 2, title: "Retail & Shopping Centers", icon: <FaCartShopping />, color: "bg-green-500", description: "Providing trained workforce solutions for seamless customer service." },
    { id: 3, title: "Manufacturing & Industrial Operations", icon: <FaCity />, color: "bg-yellow-500", description: "Ensuring efficiency and productivity in manufacturing sectors." },
    { id: 4, title: "Fast Food Chains & Restaurants", icon: <FaKitchenSet />, color: "bg-red-500", description: "Delivering trained staff for food service and kitchen operations." },
    { id: 5, title: "Healthcare Facilities", icon: <FaHospital />, color: "bg-blue-500", description: "Staffing hospitals, clinics, and wellness centers with skilled professionals." },
    { id: 6, title: "Warehousing & Maintenance Facilities", icon: <FaWarehouse />, color: "bg-purple-500", description: "Optimizing logistics and storage efficiency through expert workforce." },
    { id: 7, title: "Banking & Educational Institutions", icon: <FaBuildingColumns />, color: "bg-red-600", description: "Supporting finance and education sectors with specialized personnel." },
    { id: 8, title: "Property Management & Real Estate", icon: <FaHouseChimneyUser />, color: "bg-cyan-500", description: "Offering reliable staffing for property management and real estate firms." },
    { id: 9, title: "Construction Sites", icon: <FaPersonDigging />, color: "bg-orange-500", description: "Providing skilled laborers and project supervisors for construction needs." },
    { id: 10, title: "Energy & Petroleum", icon: <FaGasPump />, color: "bg-pink-500", description: "Ensuring operational efficiency in energy and petroleum industries." },
    { id: 11, title: "Semiconductor & Electronics", icon: <FaMicrochip />, color: "bg-lime-500", description: "Enhancing workforce solutions for the fast-paced tech sector." },
  ];

  const benefits = [
    { id: 1, title: "Efficient Recruitment", icon: <FaPeopleGroup  />, description: "With our dedicated network of headhunters across CALABARZON, we can deliver qualified personnel quickly and effectively." },
    { id: 2, title: "DOLE Compliance", icon: <FaClipboardCheck  />, description: <>We strictly adhere to DOLE Order No. 174, guaranteeing that all employment practices are aligned with the <a target="_blank" 
      rel="noopener noreferrer"  href="https://laborlaw.ph/general-labor-standards/" className="hover:text-brandPrimary underline">General Labor Standards</a>.</> },
    { id: 3, title: "Tailored Services", icon: <FaPenRuler  />, description: "Whether you need administrative, clerical, or manual labor staff, we provide customized services to meet the specific needs of your organization." },
  ];

  return (
    <div className="md:px-14 px-4 py-16 max-w-screen-2xl mx-auto">
      {/* Section Title */}
      <div className="mt-10 md:w-1/2 mx-auto text-center">
        <h2 className="text-4xl text-gray-800 font-semibold mb-2">
          St. John Majore: Workforce Redefined
        </h2>
        <p className="text-gray-500">
          Providing flexible, reliable, and skilled personnel to power industries across sectors.
        </p>
      </div>

      {/* Service Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12 max-w-4xl mx-auto">
        {services.map((service, index) => (
          <div
            key={service.id}
            className={`flex items-center space-x-4 p-4 bg-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition duration-300 ${
              index % 2 === 0 ? "flex-row-reverse" : ""
            }`}
          >
            <div className={`w-16 h-16 flex items-center justify-center text-white text-2xl font-bold rounded-lg ${service.color}`}>
              {service.icon}
            </div>
            <div className="text-left">
              <h3 className="text-xl font-semibold text-gray-800">{service.title}</h3>
              <p className="text-gray-500 text-sm">{service.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* "Why Choose Us?" Section */}
      <div className="py-4 mt-6">
        {/* Content Section */}
        <div className="text-center mt-10">
          <h2 className="text-4xl font-bold text-gray-800">Why Choose Us?</h2>
          <p className="text-gray-600 mt-4">Discover what makes us the best choice for your needs.</p>
        </div>
        
        {/* Why Choose Us Section */}
        <div className="relative w-full mt-10">
          {/* Image Section */}
          <div className="w-full h-64 md:h-80">
            <img 
              src={Img1}
              alt="Why Choose Us" 
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          {/* Benefits Grid - Moved Up with Negative Margin */}
          <div className="relative -mt-16 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 ">
              {benefits.map((benefit) => (
                <div key={benefit.id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-center">
                  <div className="w-16 h-16 flex items-center justify-center text-white text-2xl font-bold bg-blue-600 rounded-lg mx-auto">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mt-4">{benefit.title}</h3>
                  <p className="text-gray-600 mt-2">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
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
}
