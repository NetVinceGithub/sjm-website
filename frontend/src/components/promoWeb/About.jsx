import React from 'react';
import Img15 from '../../assets/15.png';
import { FaUsersLine, FaHandshake, FaPeopleCarryBox, FaLink } from "react-icons/fa6";

const About = () => {
  return (
    <div>
      {/* About Section */}
      <div id='about' className="px-4 lg:px-14 max-w-screen-2xl mx-auto my-8">
        <div className="md:w-11/12 mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div>
            <img src={Img15} alt="The Team"/>
          </div>
          <div className="md:w-3/4 mx-auto">
            <h2 className="text-5xl font-semibold mb-4 text-neutralDGray md:w-4/5">
              Providing Services, Driving Success.
            </h2>
            <p className="md:w-3/4 text-base text-neutralGray mb-8">
              St. John Majore Services Company Inc., a newly established private corporation, is committed to delivering exceptional manpower, 
              hospitality, utility services, equipment, and materials. With a vision to lead and innovate, it seeks to establish a formidable 
              presence in San Juan, Batangas' thriving industrial corridor—ushering in a new era of growth and progress.
            </p>
            <button onClick={() => document.getElementById("values").scrollIntoView({ behavior: "smooth" })} className="btn-primary">Learn More</button>
          </div>
        </div>
      </div>
      {/* Company Stats */}
      <div className="px-4 lg:px-14 max-w-screen-2xl mx-auto bg-neutralSilver py-16">
        <div className='flex flex-col md:flex-row justify-between items-center gap-8'>
            <div className='md:w-1/2'>
                <h2 className="text-4xl font-semibold mb-4 text-neutralDGray md:w-2/3">
                Fostering growth for<br /> <span className='text-brandPrimary'>companies and careers.</span>
                </h2>
                <p className="md:w-3/4 text-base text-neutralGray mb-8">
                Reaching our goal with hard work and dedication.
                </p>
            </div>

            {/* Stats */}
            <div className='md:w-1/2 mx-auto flex sm:flex-row flex-col sm:items-center justify-around gap-12'>
                <div className='space-y-8'>
                    <div className='flex items-center gap-4'>
                        <FaUsersLine className="icon" />
                        <div>
                            <h4 className='text-2xl text-neutralDGray font-semibold'>1, 000</h4>
                            <p>Applicants</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-4'>
                        <FaHandshake className="icon" />
                        <div>
                            <h4 className='text-2xl text-neutralDGray font-semibold'>1, 000</h4>
                            <p>Partners</p>
                        </div>
                    </div>
                </div>
                <div className='space-y-8'>
                    <div className='flex items-center gap-4'>
                        <FaPeopleCarryBox className="icon" />
                        <div>
                            <h4 className='text-2xl text-neutralDGray font-semibold'>1, 000</h4>
                            <p>Deployed</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-4'>
                        <FaLink className="icon" />
                        <div>
                            <h4 className='text-2xl text-neutralDGray font-semibold'>1, 000</h4>
                            <p>Connections</p>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default About;
