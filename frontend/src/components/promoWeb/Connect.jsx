import React, { useState } from 'react';
import Img31 from '../../assets/31.png';

const Connect = () => {
  const [formData, setFormData] = useState({ name: '' });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Submitted:', formData);
  };

  return (
    <div>
      {/* Promotional Section */}
      <div id='connect' className='bg-neutralSilver py-12 px-4'>
        <div className="mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Form Section on Left */}
          <div className="max-w-md mx-auto px-8 pt-6 pb-8 mb-4 sm:w-full md:w-1/2">
            <form onSubmit={handleSubmit}>
              <div className="mb-4 flex flex-col sm:flex-row sm:space-x-4">
                <div className="w-full sm:w-1/2">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstname">
                    Firstname*
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="firstname"
                    name="firstname"
                    type="text"
                    placeholder="Firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                  />
                </div>

                <div className="w-full sm:w-1/2">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="surname">
                    Surname*
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="surname"
                    name="surname"
                    type="text"
                    placeholder="Surname"
                    value={formData.surname}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mb-4 flex flex-col sm:flex-row sm:space-x-4">
                <div className="w-full sm:w-1/2">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
                    Type
                  </label>
                  <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="">Select Type</option>
                    <option value="type1">Client</option>
                    <option value="type2">Applicant</option>
                  </select>
                </div>

                <div className="w-full sm:w-1/2">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="services">
                    Services
                  </label>
                  <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="services"
                    name="services"
                    value={formData.services}
                    onChange={handleChange}
                  >
                    <option value="">Select Service</option>
                    <option value="service1">Manpower Services</option>
                    <option value="service2">Hospitality Services</option>
                    <option value="service3">Utility Services</option>
                    <option value="service4">Equipment Rental and Supply</option>
                    <option value="service5">Materials Supply</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email*
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                  Phone Number*
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="message">
                  Message
                </label>
                <textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="message"
                  name="message"
                  placeholder="Message"
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  className="btn-primary"
                  type="submit"
                >
                  Send
                </button>
              </div>
            </form>
          </div>

          {/* Promotional Section on Right */}
          <div className="flex flex-col md:flex-row justify-center items-center md:justify-start w-full md:w-1/2 text-center md:text-left">
            <img src={Img31} className="w-1/3 md:w-48 h-auto mb-4 md:mb-0" />
            <div className="md:w-3/4 mx-auto">
              <h2 className="text-3xl font-semibold mb-4 text-neutralDGray">
                Your <span className='text-brandPrimary'>Future</span> Starts Here!
              </h2>
              <p className="text-sm text-neutralGray mb-8">
                At St. John Majore, we’re not just about business—we’re about building relationships that drive growth.
                Whether you're looking for innovative solutions or an exciting career opportunity, we’re here to help you succeed. Join us and
                let's create a brighter future together.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connect;
