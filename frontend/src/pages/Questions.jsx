import React, { useState, useEffect } from 'react';
import { Accordion } from "flowbite-react";
import { FaArrowUp } from 'react-icons/fa';

const Questions = () => {
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
    <main className="px-4 lg:px-14 w-full max-w-screen-2xl mx-auto min-h-full pt-20 lg:pt-24 flex flex-col">
      <div>
        {/* Styled Heading */}
        <h1 className="text-4xl text-neutralDGray font-semibold text-center">
          Frequently Asked Questions
        </h1>
        <p className="text-neutralDGray text-center mt-3 mb-10">Manpower Agency Offering Manpower, Hospitality, Utility Services, Equipment, and Materials</p>
      </div>
      <div>
        <div className="px-4 lg:px-14 max-w-screen-2xl pb-10 mx-auto min-h-full h-auto">
          <Accordion collapseAll className='bg-white'>
            <Accordion.Panel className='bg-white hover:bg-brandPrimary hover:text-white transition-all duration-300'>
              <Accordion.Title className='text-base sm:text-lg text-neutralDGray hover:bg-brandPrimary hover:text-white transition-all duration-300'>
                What services do you offer?
              </Accordion.Title>
              <Accordion.Content className='text-neutralDGray dark:text-gray-300'>
                <p className="mb-6 text-lg sm:text-lg leading-relaxed text-justify">
                  We proudly offer <span className="font-semibold text-gray-900 dark:text-white">comprehensive and reliable services</span> tailored to meet the needs of various industries. Our specialized offerings include:
                </p>

                {/* List of Services */}
                <ul className="mb-6 space-y-4 pl-6 pr-6 text-justify">
                  <li>
                    <span className="font-semibold text-gray-900 dark:text-white">  🔹 Manpower Services:</span> We provide highly skilled and reliable manpower for a wide range of industries, from construction to technical services, ensuring that your projects run smoothly with top-quality labor.
                  </li>
                  <li>
                    <span className="font-semibold text-gray-900 dark:text-white">🔹 Hospitality Services:</span> We offer exceptional staffing solutions for the hospitality industry, supplying trained professionals—including waitstaff, housekeepers, and managers—ensuring your guests receive outstanding service and a memorable experience.
                  </li>
                  <li>
                    <span className="font-semibold text-gray-900 dark:text-white">🔹 Utility Services:</span> Our team specializes in delivering efficient utility services, including maintenance and operational support for essential services. We guarantee reliable workforce solutions to keep systems running smoothly.
                  </li>
                  <li>
                    <span className="font-semibold text-gray-900 dark:text-white">🔹 Equipment Rental and Supply:</span> We provide a vast range of state-of-the-art equipment, from construction machinery to specialized industrial tools, ensuring that your projects have the right tools for the job, whether short-term rentals or long-term use.
                  </li>
                  <li>
                    <span className="font-semibold text-gray-900 dark:text-white">🔹 Materials Supply:</span> We offer a consistent supply of high-quality materials for construction, manufacturing, and other industrial needs. Our services ensure timely delivery of premium raw materials and consumables to keep your operations on track and efficient.
                  </li>
                </ul>

                {/* Call-to-Action with Highlighted Keywords */}
                <p className="text-lg sm:text-lg text-neutralDGray dark:text-gray-200 text-justify">
                  With a focus on <span className="text-[#86B950] dark:text-blue-400">quality</span>, <span className="text-[#4492D6] dark:text-green-400">reliability</span>, and <span className="text-[#9D426E] dark:text-yellow-400">customer satisfaction</span>, we’re dedicated to providing solutions that empower your business and project success!
                </p>
              </Accordion.Content>
            </Accordion.Panel>
            
            <Accordion.Panel>
              <Accordion.Title className='text-base sm:text-lg text-neutralDGray hover:bg-brandPrimary hover:text-white transition-all duration-300'>
                Are your manpower services flexible in terms of duration?
              </Accordion.Title>
              <Accordion.Content>
                <p className="mb-6 text-lg sm:text-lg text-neutralDGray leading-relaxed text-justify">
                  Yes, absolutely! Our manpower services are highly flexible and tailored to meet your specific needs. Whether you require short-term staffing for a project, seasonal support, or long-term labor solutions, we can accommodate various durations. <br /><br />
                  We understand that every project has unique timelines, so we offer:
                </p>

                {/* List of Services */}
                <ul className=" text-neutralDGray mb-6 space-y-4 pl-6 pr-6 text-justify">
                  <li>
                    🔹 Temporary Staff for immediate, short-term needs.
                  </li>
                  <li>
                   🔹 Project-based Contract.
                  </li>
                  <li>
                    🔹 Fixed-term based.
                  </li>
                  <li>
                    🔹 Contractual manpower for medium to long-term engagements.
                  </li>
                  <li>
                    🔹 Permanent placement for positions requiring long-term commitment and consistency.
                  </li>
                </ul>

                {/* Call-to-Action */}
                <p className="text-lg sm:text-lg text-neutralDGray dark:text-gray-200 text-justify">
                  Our goal is to provide the right number of workers with the right skill sets for the duration that best fits your requirements, ensuring a seamless integration into your operations.
                </p>
              </Accordion.Content>
            </Accordion.Panel>

            <Accordion.Panel>
              <Accordion.Title className='text-base sm:text-lg text-neutralDGray hover:bg-brandPrimary hover:text-white transition-all duration-300'>
                How do I get started with your services?
              </Accordion.Title>
              <Accordion.Content>
                <p className="mb-6 text-lg sm:text-lg leading-relaxed text-justify">
                  Getting started with our services is <span className="font-semibold text-gray-900 dark:text-white">simple and straightforward</span>. Here's how you can begin:
                </p>

                {/* List of Services */}
                <ul className="mb-6 space-y-4 pl-6 pr-6 text-justify">
                  <li>
                    <span className="font-semibold text-gray-900 dark:text-white">  🔹 Contact Us:</span> Reach out to our team through phone, email, or our 
                      website’s contact form. Let us know the services you’re interested in 
                      (manpower, hospitality, utility services, equipment, or materials), and 
                      provide basic details about your project or requirements.
                  </li>
                  <li>
                    <span className="font-semibold text-gray-900 dark:text-white">🔹 Consultation:</span> We’ll schedule an initial consultation to discuss your 
                    specific needs in detail. This helps us understand your project, timelines, 
                    and any specialized requirements.     
                  </li>
                  <li>
                    <span className="font-semibold text-gray-900 dark:text-white">🔹 Custom Proposal:</span> Based on our consultation, we’ll provide a tailored 
                      proposal that outlines the services we’ll provide, including manpower, 
                      equipment, or materials, as well as costs and timelines.
                  </li>   
                  <li>
                    <span className="font-semibold text-gray-900 dark:text-white">🔹 Agreement and Onboarding:</span> Once the proposal is agreed upon, we’ll 
                      move forward with formalizing the contract and onboarding process. This 
                      will include any legal documentation and a detailed plan of action.
                  </li>
                  <li>
                    <span className="font-semibold text-gray-900 dark:text-white">🔹 Execution:</span> Upon agreement, we begin deploying the resources and 
                      services you need. We’ll ensure that everything runs smoothly and that 
                      your requirements are met on time and within budget.
                  </li>
                  <li>
                    <span className="font-semibold text-gray-900 dark:text-white">🔹 Ongoing Support:</span> We provide continuous support throughout the 
                      duration of the service, with regular check-ins to ensure everything is on 
                      track and making adjustments as needed.
                  </li>
                </ul>

                {/* Call-to-Action with Highlighted Keywords */}
                <p className="text-lg sm:text-lg text-neutralDGray text-justify">
                  Contact us today, to discuss your needs and we'll ensure you get the right solutions tailored specifically for your project!
                </p>
              </Accordion.Content>
            </Accordion.Panel>

            <Accordion.Panel>
              <Accordion.Title className='text-base sm:text-lg text-neutralDGray hover:bg-brandPrimary hover:text-white transition-all duration-300'>
                Do you provide training for your workforce?
              </Accordion.Title>
              <Accordion.Content>
                <p className="mb-6 text-lg sm:text-lg text-neutralDGray  leading-relaxed text-justify">
                  Yes we provide <span className="font-semibold text-gray-900 dark:text-white">comprehensive training</span> for our workforce to ensure that 
                  they meet the <span className="font-semibold text-gray-900 dark:text-white">highest industry standards</span>  are fully prepared to handle the specific needs for your project.
                  <br /><br />
                  Our training programs include:
                </p>

                {/* List of Services */}
                <ul className="mb-6 space-y-4 pl-6 pr-6 text-neutralDGray  text-justify">
                  <li>
                    <span className="font-semibold text-gray-900 dark:text-white">  🔹 Skill-based Training:</span> RDepending on the job requirements, our workers 
                      undergo targeted training to enhance their technical and operational 
                      skills, ensuring they are proficient in their respective roles.
                  </li>
                  <li>
                    <span className="font-semibold text-gray-900 dark:text-white">🔹 Safety Training:</span> We prioritize safety and conduct rigorous safety 
                      awareness and compliance training, especially for high-risk industries and 
                      large-scale projects, ensuring our workforce adheres to industry 
                      regulations and best practices.
                  </li>
                  <li>
                    <span className="font-semibold text-gray-900 dark:text-white">🔹 Ongoing Development:</span> We also offer continuous training and upskilling 
                      to keep our workforce up-to-date with the latest industry trends, tools, and 
                      technologies.
                  </li>   
                </ul>

                {/* Call-to-Action with Highlighted Keywords */}
                <p className="text-lg sm:text-lg text-neutralDGray text-justify">
                  By investing in our workforce’s skills and safety, we ensure that your projects are staffed 
                  with competent, reliable, and well-prepared professionals who contribute to the success 
                  of your business.
                </p>
              </Accordion.Content>
            </Accordion.Panel>

            <Accordion.Panel>
              <Accordion.Title className='text-base sm:text-lg text-neutralDGray hover:bg-brandPrimary hover:text-white transition-all duration-300'>
                How do I make payments for your services?
              </Accordion.Title>
              <Accordion.Content>
                <p className="mb-6 text-lg sm:text-lg leading-relaxed text-neutralDGray  text-justify">
                  We offer <span className="font-semibold text-gray-900 dark:text-white">flexible paymment options</span> to make the process as conveient as possible for our clients. Here's how you can make payments for our services:
                </p>

                {/* List of Services */}
                <ul className="mb-6 space-y-4 pl-6 pr-6 text-neutralDGray  text-justify">
                  <li>
                    <span className="font-semibold text-gray-900 dark:text-white">  🔹 Invoice-Based Payments:</span> After the initial consultation and agreement, we’ll 
                    provide you with a detailed invoice outlining the cost of the services rendered, 
                    including any applicable taxes and fees. Payments can be made based on 
                    the agreed-upon payment terms.
                  </li>
                  <li>
                    <span className="font-semibold text-gray-900 dark:text-white">🔹 Payment Terms:</span> Invoices are payable within 45 days from the invoice date.
                  </li>
                  <li>
                    <span className="font-semibold text-gray-900 dark:text-white">🔹 Accepted Payment Methods:</span> We accept a wide range of payment methods 
                    for your convenience, including: <br  /><br />
                    <ul>
                      <li><span className='pl-6 pr-6 text-neutralDGray font-medium'>a. Bank Transfer: Direct payments to our company’s bank account.</span></li>
                      <li><span className='pl-6 pr-6 text-neutralDGray font-medium'>b. Debit Card: Payments via major card providers.</span></li>
                      <li><span className='pl-6 pr-6 text-neutralDGray font-medium'>c. Online Payment Systems: Through secure online payment gateways.</span></li>
                      <li><span className='pl-6 pr-6 text-neutralDGray font-medium'>d. Checks: For clients preferring traditional methods, checks are also 
                      accepted.</span></li>
                    </ul>
                  </li>   
                </ul>
                {/* Call-to-Action with Highlighted Keywords */}
                <p className="text-lg sm:text-lg text-neutralDGray text-justify">
                Our goal is to ensure a seamless and transparent payment process, with options that 
                best fit your business requirements and project scope. If you have any specific payment 
                queries, feel free to discuss them with us, and we’ll be happy to assist!
                </p>
              </Accordion.Content>
            </Accordion.Panel>

            <Accordion.Panel>
              <Accordion.Title className='text-base sm:text-lg text-neutralDGray hover:bg-brandPrimary hover:text-white transition-all duration-300'>
                How do I contact customer support if I have an issue or concern?
              </Accordion.Title>
              <Accordion.Content>
              <p className="mb-6 text-lg sm:text-lg text-neutralDGray leading-relaxed text-justify">
                  If you have any issues or concerns, our <span className="font-semibold text-gray-900 dark:text-white">customer support team</span> is here to assist you promptly. You can contact us through the following methods:
                </p>

                {/* List of Services */}
                <ul className="mb-6 space-y-4 text-neutralDGray pl-6 pr-6 text-justify">
                  <li>
                    <span className="font-semibold text-gray-900 dark:text-white">  🔹 Phone Support:</span> Call our dedicated customer support hotline for immediate 
                      assistance. Our team is available during business hours to answer your 
                      questions or address any concerns. <br  /><br />
                      <span className="font-semibold text-gray-900 pl-6 dark:text-white">  📞 Phone Number:</span> (043) 575-5675<br />
                      <span className="font-semibold text-gray-900 pl-6 dark:text-white">  📱 Phone Number:</span> 0917-185-1909<br />
                  </li>
                  <li>
                    <span className="font-semibold text-gray-900 dark:text-white">🔹 Email Support:</span> You can email us at sjmajore@gmail.com and we will get back to 
                    you as quickly as possible with a detailed response.
                  </li>
                  <li>
                    <span className="font-semibold text-gray-900 dark:text-white">🔹 Online Contact Form:</span> Visit our website and use the online contact form to 
                      submit your inquiry or issue. You’ll receive a prompt acknowledgment, and a 
                      support representative will follow up with you. <br  /><br />
                      <span className="font-semibold text-gray-900 pl-6 dark:text-white">  🌐 Website:</span><br />
                  </li>   
                  <li>
                    <span className="font-semibold text-gray-900 dark:text-white">🔹 Social Media:</span> You can also reach us via our social media channels (Facebook, 
                      Instagram, LinkedIn, etc.) for quick inquiries or support.
                      <br  /><br />
                      <span className="font-semibold pl-6 text-gray-900 dark:text-white">  ⓕ Facebook:</span>  https://www.facebook.com/stjohnmajore/<br />
                      <span className="font-semibold pl-6 text-gray-900 dark:text-white">  🇮🇳 LinkedIn:</span> https://www.linkedin.com/in/stjohnmajore/
                      <br />
                  </li>
                  <li>
                    <span className="font-semibold text-gray-900 dark:text-white">🔹 In-Person Support:</span> If needed, we can schedule an in-person meeting to discuss 
                    your concerns and find the best resolution for any issues you’re facing.
                  </li>
                </ul>

                {/* Call-to-Action with Highlighted Keywords */}
                <p className="text-lg sm:text-lg text-neutralDGray text-justify">
                  Our customer support team is committed to providing you with timely, professional, and helpful 
                  assistance to ensure a smooth experience with our services. Feel free to contact us anytime!
                </p>
              </Accordion.Content>
            </Accordion.Panel>

          </Accordion>
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
    </main>
  );
};

export default Questions;
