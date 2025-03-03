import React, { useState, useEffect } from 'react';
import Img25 from '../assets/25.png'; 
import Img26 from '../assets/26.png';
import Img27 from '../assets/27.png';
import Img28 from '../assets/28.png';
import Img29 from '../assets/29.png';
import Img30 from '../assets/30.png';
import ImgBg from '../assets/24.png';
import { FaArrowUp } from 'react-icons/fa';

const Administration = () => {
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
  const team = [
    {
      id: 1,
      title: "Renjie Derilo",
      description: "Operations Deputy Officer",
      image: Img27,
    },
    {
      id: 2,
      title: "Mia Mary Sora",
      description: "Human Resources Head",
      image: Img30,
    },
    {
      id: 3,
      title: "Paula Jane Castillo",
      description: "Administration Head",
      image: Img28,
    },
    {
      id: 4,
      title: "Lady Anne Francisco",
      description: "Accounting Clerk/Bookkeeper",
      image: Img29,
    },
  ];

  return (
    <div className="relative w-full max-w-screen-2xl mx-auto p-6 lg:p-12">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${ImgBg})`,
          opacity: 0.7,
          zIndex: -1,
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
        }}
      ></div>

      {/* Header for Key Executives */}
      <div>
        <h1 className="italic text-brandPrimary font-bold text-2xl mt-20 lg:text-3xl">
          KEY EXECUTIVES
        </h1>
        <hr className="border-black my-4" />
      </div>

      {/* President Section */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 mt-8">
        <img
          src={Img25}
          alt="President"
          className="w-25 lg:w-60 h-auto"
        />
        <div className="text-gray-900 text-lg leading-relaxed text-center lg:text-left">
          <p>
            <strong><span className='text-3xl'>Dr. Leandro C. Manalaysay</span></strong><br />
            <span className='text-[16px] mt-2 italic '>President & Chief Finance Officer</span> <br />
            A respected medical doctor and radiologist, former President of the Philippine College of Radiology and Founding 
            President of the Radiological Society of Nuclear Medicine and Molecular Imaging, is expected to drive St. John Majore's full potential.
          </p>
        </div>
      </div>

      {/* Vice President Section */}
      <div className="flex flex-col lg:flex-row-reverse items-center justify-center gap-6 mt-8">
        <img
          src={Img26}
          alt="Vice President"
          className="w-25 lg:w-60 h-auto"
        />
        <div className="text-gray-900 text-lg leading-relaxed text-center lg:text-left">
          <p>
            <strong><span className='text-3xl'>Joel R. Bernido</span></strong><br />
            <span className='text-[16px] italic '>Vice President & Chief Operating Officer</span> <br />
            The company was formed through the initiative of one of its founding partners, Mr. Joel R. Bernido,
            who is an established expert in the field of services and manpower in southern Luzon.
          </p>
        </div>
      </div>

      {/* Header for Team Section */}
      <div>
        <h1 className="italic text-brandPrimary font-bold text-2xl mt-10 lg:text-3xl">
          TEAM TO HELP YOU
        </h1>
        <hr className="border-black my-4" />
      </div>

      {/* Team Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
        {team.map((member) => (
          <div key={member.id} className="flex flex-col items-center justify-center gap-2">
            <img
              src={member.image}
              alt={member.title}
              className="w-40 h-40 rounded-full"  // Increased image size
            />
            <h4 className="text-lg font-bold text-gray-900">{member.title}</h4>
            <p className="text-sm text-gray-700">{member.description}</p>
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

export default Administration;
