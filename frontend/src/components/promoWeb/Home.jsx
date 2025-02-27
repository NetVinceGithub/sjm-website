import React, { useState, useEffect } from 'react';
import { Carousel } from 'flowbite-react';
import Img1 from '../../assets/1.png';
import Img2 from '../../assets/2.png';
import Img3 from '../../assets/3.png';
import Img32 from '../../assets/32.jpg';
import Img33 from '../../assets/33.jpg';
import Img34 from '../../assets/34.jpg';
import { FaArrowUp } from 'react-icons/fa';

const Home = () => {
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

  return (
    <div id="home" className="relative w-full min-h-screen">
      <Carousel indicators={false} slideInterval={5000} className="w-full h-screen">
        {[{ img: Img32, title: "YOUR TRUSTED <span style='color:#4CAF4F;'>SERVICE PARTNER.</span>", text: "Your partner in delivering top-tier manpower and utility services, from planning to implementation.", imgSrc: Img1 },
          { img: Img33, title: "YOUR SUCCESS, <span style='color:#4CAF4F;'>OUR MISSION.</span>", text: "Join our team committed to delivering exceptional service and creating rewarding opportunities for all.", imgSrc: Img2 },
          { img: Img34, title: "BUILDING FUTURES <span style='color:#4CAF4F;'>TOGETHER.</span>", text: "Collaborate with us to achieve excellence, whether you're a client seeking reliable services or a professional looking to grow.", imgSrc: Img3 }].map((slide, index) => (
            <div key={index} className="relative w-full h-screen flex flex-col items-start justify-center text-white px-12 md:flex-row md:items-center">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.img})` }}>
                <div className="absolute inset-0 bg-black opacity-70"></div>
              </div>
              <div className="relative z-10 w-full text-left md:w-1/2 flex flex-col items-start">
                <h1 className="text-4xl md:text-5xl font-bold" dangerouslySetInnerHTML={{ __html: slide.title }}></h1>
                <p className="text-lg mt-4 max-w-lg">{slide.text}</p>
                <button 
                  onClick={() => document.getElementById("connect").scrollIntoView({ behavior: "smooth" })}
                  className="mt-6 px-6 py-3 bg-brandPrimary text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all">
                  Connect with Us
                </button>
              </div>
              <div className="relative z-10 w-full flex justify-center md:w-1/2 md:justify-end mt-10 md:mt-0 order-first md:order-last">
                <img src={slide.imgSrc} alt="Slide" className="w-full max-w-xl md:w-full md:max-w-xl mx-auto mt-4" />
              </div>
            </div>
          ))}
      </Carousel>

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

export default Home;
