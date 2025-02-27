import React from 'react';
import { Carousel } from 'flowbite-react';
import Img16 from '../assets/16.png'; 
import Img17 from '../assets/17.png';
import Img23 from '../assets/23.png';

const Products = () => {
  return (
    <div>
      {/* About Section */}
      <div className="px-4 lg:px-14 max-w-screen-2xl mx-auto h-auto my-8">
        <div className="md:w-11/12 mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="md:w-1/2 w-full">
            <img
              id="legacy" 
              src={Img16}
              alt="The Team"
              className="w-full h-auto object-cover rounded"
            />
          </div>
          <div className="md:w-3/4 w-full mx-auto">
            <h2 className="text-3xl md:text-5xl font-semibold mb-4 text-neutralDGray md:w-4/5">
              A Legacy of Excellence and Impact.
            </h2>
            <p className="w-full md:w-11/12 text-sm md:text-base text-gray-600 mb-8 leading-relaxed">
              At the heart of our mission lies a commitment to exceptional service, safety, and sustainability. With a
              vision grounded in international standards, we don’t just provide services—we create transformative
              opportunities that drive growth for businesses and communities alike, building a thriving future of
              success for all.
            </p>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div id="testimonials" className="px-4 lg:px-14 max-w-screen-2xl mx-auto bg-gray-100 py-16">
        <Carousel indicators={true} slideInterval={5000} className="w-full h-auto md:h-screen">
          {[
            {
              role: "Manager, Jollibee San Juan",
              title: "John Doe",
              text: "Working with SJM has been an absolute game-changer for our team. Their commitment to finding the right talent with the right attitude has significantly improved our operations. The candidates they’ve provided have not only brought essential skills to the table but have also seamlessly integrated into our culture of teamwork and customer-first values. We especially appreciate how SJM always goes above and beyond to ensure we’re matched with individuals who truly embody a spirit of malasakit. Their professionalism, attention to detail, and focus on sustainability have made them our trusted partner for recruitment. We look forward to many more years of success together!",
              imgSrc: Img17,
            },
            {
              role: "Receptionist, San Juan Resort",
              title: "Jane Smith",
              text: "Working with SJM has been a rewarding journey. They matched me with a role that aligns with my skills and values, allowing me to make an immediate impact. The team’s dedication to excellence, collaboration, and sustainability has made it easy to integrate and grow within the company. I’m excited for what’s ahead!",
              imgSrc: Img23,
            },
          ].map((slide, index) => (
            <div key={index} className="relative w-full h-auto md:h-screen flex flex-col items-start justify-center text-gray-800 px-12 md:flex-row md:items-center">
              {/* Text Content */}
              <div className="relative z-10 w-full text-left md:w-1/2 flex flex-col items-start">
                <div className="absolute -left-10 -top-10 text-9xl text-gray-800 opacity-20" style={{ fontFamily: '"AR JULIAN", sans-serif' }}>
                  “
                </div>
                <p className="text-lg mt-4 max-w-lg text-gray-600">{slide.text}</p>
                <h1 className="text-xl md:text-2xl font-bold text-brandPrimary mt-4">{slide.title}</h1>
                <p className="text-base text-gray-600 italic">{slide.role}</p>
                <div className="absolute right-10 bottom-0 text-9xl text-gray-600 opacity-20" style={{ fontFamily: '"AR JULIAN", sans-serif' }}>
                  ”
                </div>
              </div>

              {/* Image Content */}
              <div className="relative z-10 w-full flex justify-center md:w-1/2 md:justify-end mt-10 md:mt-0 order-first ">
                <img
                  src={slide.imgSrc}
                  alt="Testimonial"
                  className="w-full max-w-xl md:w-full md:max-w-xl mx-auto mt-4 rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src = 'https://via.placeholder.com/500'; // Fallback image
                  }}
                />
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
};

export default Products;