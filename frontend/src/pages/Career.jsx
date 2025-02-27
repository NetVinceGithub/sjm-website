import React, { useState, useEffect } from 'react';
import {
  FaPeopleRoof,
  FaShopify,
  FaPeopleCarryBox,
  FaChalkboardUser,
  FaHandHoldingDollar,
  FaGears,
  FaPersonDigging,
  FaPersonMilitaryRifle,
  FaHospitalUser,
  FaPen    
} from "react-icons/fa6";
import { Button } from 'flowbite-react';
import { FaArrowUp } from 'react-icons/fa';


const Modal = ({ showModal, setShowModal, job }) => (
  <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${showModal ? 'block' : 'hidden'}`}>
    <div className="bg-white mt-20 p-6 rounded-lg shadow-lg w-[600px] max-h-[80vh] overflow-y-auto relative text-left">
      <button onClick={() => setShowModal(false)} className="absolute top-2 left-4 text-2xl">&times;</button>
      <h2 className="text-2xl mt-5 font-semibold mb-2 text-neutralDGray">{job.title}</h2>
      <p className="text-neutralGray mb-4"><strong>Location:</strong> {job.location}</p>
      <div className="mb-4">
        <strong>Requirements:</strong>
        <ul className="list-disc pl-5 text-neutralGray">
          {job.requirements.map((req, index) => <li key={index}>{req}</li>)}
        </ul>
      </div>
      <div className="mb-4">
        <strong>Responsibilities:</strong>
        <ul className="list-disc pl-5 text-neutralGray">
          {job.responsibilities.map((resp, index) => <li key={index}>{resp}</li>)}
        </ul>
      </div>
      <a href={job.link} target="_blank" rel="noopener noreferrer">
        <Button className="bg-brandPrimary shadow-md text-white font-semibold hover:bg-neutralDGray transition-all duration-300 w-full">
          Apply Now
        </Button>
      </a>
    </div>
  </div>
);

const Career = () => {
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
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const services = [
    {
      id: 1,
      title: "Retail Sales Assistant",
      description: "Provide customer service and ensure smooth operations of the retail store, including managing sales and stock.",
      location: "SM Mall, Cebu, Philippines",
      requirements: [
        "At least 1 year of experience in retail or sales",
        "Strong communication and customer service skills",
        "Knowledge of sales techniques and product information",
        "Ability to handle cash transactions and stock inventory"
      ],
      responsibilities: [
        "Greet and assist customers in choosing products",
        "Process sales transactions and manage cash register",
        "Maintain store cleanliness and organize products on shelves",
        "Stock shelves and assist in inventory management",
        "Handle customer inquiries, complaints, and returns"
      ],
      image: <FaShopify className="w-12 h-12 text-neutralDGray" />, 
      link: "https://forms.gle/RrwGyv2LmWfpeeKU7"
    },
    {
      id: 2,
      title: "Housekeeping Staff",
      description: "Maintain cleanliness and orderliness of guest rooms and common areas in a hotel or resort.",
      location: "Boracay, Philippines",
      requirements: [
        "Previous experience in housekeeping or similar role in hospitality",
        "Attention to detail and strong organizational skills",
        "Ability to work in a team and independently",
        "Flexibility to work different shifts, including weekends and holidays"
      ],
      responsibilities: [
        "Clean guest rooms, bathrooms, and public areas",
        "Replace linens, towels, and toiletries in rooms",
        "Assist with laundry services and replenish supplies",
        "Maintain the cleanliness of lobbies and hallways",
        "Report maintenance issues and ensure guest satisfaction"
      ],
      image: <FaPeopleRoof className="w-12 h-12 text-neutralDGray" />, 
      link: "https://forms.gle/RrwGyv2LmWfpeeKU7"
    },
    {
      id: 3,
      title: "Plant Supervisor",
      description: "Oversee the operations of the warehouse, including managing inventory, shipments, and staff.",
      location: "Logistics Hub, Cavite, Philippines",
      requirements: [
        "At least 2 years of experience in warehouse operations or management",
        "Strong leadership and team management skills",
        "Knowledge of inventory control systems",
        "Ability to work in a fast-paced environment and under pressure"
      ],
      responsibilities: [
        "Supervise warehouse staff and ensure productivity",
        "Monitor inventory levels and ensure accurate stock counts",
        "Coordinate shipments and deliveries to clients",
        "Ensure health and safety standards are maintained",
        "Prepare reports on warehouse activities and inventory status"
      ],
      image: <FaPeopleCarryBox className="w-12 h-12 text-neutralDGray" />, 
      link: "https://forms.gle/RrwGyv2LmWfpeeKU7"
    },
    {
      id: 4,
      title: "Machine Operator",
      description: "Operate machinery in a manufacturing setting, ensuring smooth production processes and quality control.",
      location: "Electronics Manufacturing Plant, Laguna, Philippines",
      requirements: [
        "Bachelor’s degree in Electronics or related field",
        "Experience operating machinery or in a manufacturing environment",
        "Experience operating machinery or in a manufacturing environment",
        "Strong attention to detail and troubleshooting skills",
        "Ability to work in shifts (day or night)"
      ],
      responsibilities: [
        "Operate machines according to production schedules",
        "Monitor machine performance and quality of products",
        "Perform routine maintenance and troubleshooting of equipment",
        "Ensure workstations are clean and comply with safety standards",
        "Ensure workstations are clean and comply with safety standards"
      ],
      image: <FaGears className="w-12 h-12 text-neutralDGray" />, 
      link: "https://forms.gle/RrwGyv2LmWfpeeKU7"
    },
    {
      id: 5,
      title: "Teacher",
      description: "Teach and guide students in their academic growth while maintaining a safe and engaging classroom environment.",
      location: "Private School, Quezon City, Philippines",
      requirements: [
        "Bachelor’s degree in Education or a related field",
        "Strong communication and teaching skills",
        "Passion for working with children and fostering their development",
        "Ability to create lesson plans and manage classroom behavior"
      ],
      responsibilities: [
        "Plan and deliver lessons based on the curriculum",
        "Assess student progress and provide feedback",
        "Maintain a positive and supportive classroom environment",
        "Communicate with parents regarding student performance",
        "Participate in school events, meetings, and professional development"
      ],
      image: <FaChalkboardUser className="w-12 h-12 text-neutralDGray" />, 
      link: "https://forms.gle/RrwGyv2LmWfpeeKU7"
    },
    {
      id: 6,
      title: "Bank Teller",
      description: "Handle customer transactions, such as deposits, withdrawals, and account inquiries, while providing excellent customer service.",
      location: "National Bank, Makati City, Philippines",
      requirements: [
        "High school diploma or equivalent (Bachelor's degree a plus)",
        "Basic knowledge of banking procedures and financial transactions",
        "Strong numerical and customer service skills",
        "Attention to detail and ability to handle cash accurately"
      ],
      responsibilities: [
        "Process deposits, withdrawals, and transfers for customers",
        "Process deposits, withdrawals, and transfers for customers",
        "Provide information on bank products and services",
        "Ensure the security of cash and other financial assets",
        "Maintain accurate transaction records and balance cash drawers"
      ],
      image: <FaHandHoldingDollar className="w-12 h-12 text-neutralDGray" />, 
      link: "https://forms.gle/RrwGyv2LmWfpeeKU7"
    },
    {
      id: 7,
      title: "Construction Worker",
      description: "Assist in the construction process by performing physical tasks such as digging, lifting, and handling materials.",
      location: "Taguig, Philippines",
      requirements: [
        "No formal experience required, though experience in construction is a plus",
        "Physical fitness and ability to perform heavy labor tasks",
        "Ability to follow safety protocols and work as part of a team"
      ],
      responsibilities: [
        "Assist with loading and unloading construction materials",
        "Dig trenches, mix cement, and support site preparation tasks",
        "Operate hand tools and machinery under supervision",
        "Maintain a clean and organized construction site",
        "Follow instructions from supervisors and work in compliance with safety regulations"
      ],
      image: <FaPersonDigging  className="w-12 h-12 text-neutralDGray" />, 
      link: "https://forms.gle/RrwGyv2LmWfpeeKU7"
    },
    {
      id: 8,
      title: "Healthcare Nurse",
      description: "Provide direct patient care, monitoring vital signs, administering medications, and assisting doctors and medical staff.",
      location: "Private Hospital, Quezon City, Philippines",
      requirements: [
        "Registered Nurse (RN) with a valid PRC license",
        "Experience in clinical settings (hospital, clinic, etc.)",
        "Excellent communication and interpersonal skills",
        "Excellent communication and interpersonal skills"
      ],
      responsibilities: [
        "Monitor and record patients’ vital signs and medical history",
        "Administer medications and treatments as prescribed by doctors",
        "Assist physicians with medical procedures and examinations",
        "Educate patients and families about health conditions and care",
        "Ensure patient comfort and advocate for their well-being"
      ],
      image: <FaHospitalUser  className="w-12 h-12 text-neutralDGray" />, 
      link: "https://forms.gle/RrwGyv2LmWfpeeKU7"
    },
    {
      id: 9,
      title: "Security Guard",
      description: "Monitor premises, protect property, and ensure safety for clients and employees.",
      location: "SM Mall, Cebu, Philippines",
      requirements: [
        "Valid security guard license",
        "At least 1 year of experience in security services",
        "Ability to stand for long hours and maintain focus",
        "Strong observation and conflict resolution skills"
      ],
      responsibilities: [
        "Monitor building entrances, exits, and grounds for security threats",
        "Ensure safety protocols are followed by all visitors and staff",
        "Respond to emergencies and assist in evacuation procedures",
        "Check identification and issue visitor passes",
        "Maintain detailed logs of incidents and activities"
      ],
      image: <FaPersonMilitaryRifle  className="w-12 h-12 text-neutralDGray" />, 
      link: "https://forms.gle/RrwGyv2LmWfpeeKU7"
    }
  ];

  return (
    <div className='md:px-14 px-4 py-16 max-w-screen-2xl mx-auto'>
      <div className='mt-10 md:w-1/2 mx-auto text-center'>
        <h2 className='text-4xl text-neutralDGray font-semibold mb-2'>Your Next Job, All in One Place<br /> — Apply with Ease!</h2>
        <p className='text-neutralGray'>Ready to start your journey with us?</p>
      </div>

      <div className='mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
        {services.map((service) => (
          <div
            key={service.id}
            className={`relative px-4 py-8 text-center md:w-[300px] mx-auto md:h-80 rounded-md shadow cursor-pointer hover:-translate-y-5 hover:border-b-4 hover:border-indigo-700 transition-all duration-300 flex flex-col items-center justify-between h-full group`}
          >
            <div>
              <div className='bg-[#E8F5E9] mb-4 h-14 w-14 mx-auto rounded-tl-3xl rounded-br-3xl'>
                <div className='-ml-5'>{service.image}</div>
              </div>
              <h4 className='text-2xl font-bold text-neutralDGray mb-2 px-2'>{service.title}</h4>
              <p className='text-sm text-neutralGray'>{service.description}</p>
            </div>
            <Button
              onClick={() => { setSelectedJob(service); setShowModal(true); }}
              className="absolute top-[80%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-brandPrimary shadow-md text-white font-semibold hover:bg-neutralDGray transition-all duration-300"
            >
              Explore Now
            </Button>
          </div>
        ))}
      </div>
      {selectedJob && <Modal showModal={showModal} setShowModal={setShowModal} job={selectedJob} />}
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

export default Career;
