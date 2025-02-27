import React from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6';

const LeftArrow = React.forwardRef(({ onClick }, ref) => (
  <div
    className="text-2xl text-gray-700 cursor-pointer"
    onClick={onClick}
    ref={ref} 
  >
    <FaAngleLeft />
  </div>
));

const RightArrow = React.forwardRef(({ onClick }, ref) => (
  <div
    className="text-2xl text-gray-700 cursor-pointer"
    onClick={onClick}
    ref={ref} 
  >
    <FaAngleRight />
  </div>
));

const Values = () => {
  const values = [
    {
      id: 1,
      img: '/src/assets/18.png',
      title: 'Compassionate Care and Service',
      text: 'We treat everyone with kindness and respect, fostering strong relationships through empathy and genuine care.',
    },
    {
      id: 2,
      img: '/src/assets/19.png',
      title: 'Collaborating for Collective Success',
      text: 'We treat everyone with kindness and respect, fostering strong relationships through empathy and genuine care.',
    },
    {
      id: 3,
      img: '/src/assets/20.png',
      title: 'Doing What’s Right, Even When No One Is Watching',
      text: 'We act transparently and ethically, building trust by consistently doing what’s right, even in tough situations.',
    },
    {
      id: 4,
      img: '/src/assets/21.png',
      title: 'Pursuing Perfection in Everything We Do',
      text: 'We set high standards and continually strive to surpass them, delivering exceptional results and striving for improvement.',
    },
    {
      id: 5,
      img: '/src/assets/22.png',
      title: 'Stewardship for a Sustainable Future',
      text: 'We prioritize sustainable growth, ensuring that our decisions benefit both our stakeholders and the broader community.',
    },
  ];

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1024 },
      items: 3,
    },
    desktop: {
      breakpoint: { max: 1024, min: 768 },
      items: 2,
    },
    tablet: {
      breakpoint: { max: 768, min: 464 },
      items: 1,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  return (
    <div className="px-4 lg:px-14 max-w-screen-2xl mx-auto my-12">
      <div className="text-center md:w-1/2 mx-auto">
        <h2 id='values' className="text-4xl font-semibold mb-4 text-neutralDGray">
          Building a Future of Growth Through Our Core Values
        </h2>
        <p className="text-sm text-neutralGray mb-8 md:w-3/4 mx-auto">
          At the core of our mission is a commitment to not only delivering services but creating opportunities that
          propel growth and success. Our core values guide every step of our journey, inspiring us to make a lasting and
          positive impact in the communities we serve:
        </p>
      </div>

      <Carousel
        responsive={responsive}
        infinite={true}
        autoPlay={true}
        autoPlaySpeed={2500}
        showDots={true}
        itemClass="px-4"
        containerClass="mx-0"
      >
        {values.map((value) => (
          <div
            key={value.id}
            className="mx-auto relative flex flex-col justify-center items-center p-6 bg-white rounded-lg shadow-md hover:scale-90 hover:shadow-brandPrimary hover:shadow-md transition-transform duration-300 ease-in-out"
            style={{ height: '450px' }} 
          >
            <div className="flex justify-center mb-4">
              <img
                src={value.img}
                alt={value.title}
                style={{ height: '250px', width: '250px' }}
                className="object-cover rounded-lg"
              />
            </div>
            <h5 className="text-2xl font-bold tracking-tight text-neutralDGray dark:text-white mb-2">
              {value.title}
            </h5>
            <p className="font-normal text-sm text-neutralGray">{value.text}</p>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default Values;
