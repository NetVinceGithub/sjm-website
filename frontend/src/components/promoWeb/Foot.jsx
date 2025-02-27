import React, { useState } from "react";
import { Footer } from "flowbite-react";
import { BsFacebook } from "react-icons/bs";
import { FaX } from "react-icons/fa6";
import {
  FaEnvelopeOpenText,
  FaPhoneAlt,
  FaMobileAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";
import Logo from "../../assets/logo.png";
import Dole from "../../assets/dole.png";
import SEC from "../../assets/sec.png";


// Modal component for displaying content like Privacy Policy, Terms, Phone, and Mobile
const Modal = ({ isOpen, closeModal, title, content, type }) => {
  if (!isOpen) return null;

  const modalStyles = 
    type === "privacy"
      ? "p-8 max-w-3xl text-justify text-gray-700 w-[90%]  h-[60vh] overflow-y-hidden"
      : type === "phone" || type === "mobile"
        ? "p-6 w-[90%] sm:w-[250px] max-w-full text-center h-[30vh] flex flex-col justify-center"
        : "p-6 w-[90%] sm:w-[400px] max-w-full";



  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className={`bg-white rounded-lg ${modalStyles} relative`}>
        <FaX
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 cursor-pointer text-xl"
          onClick={closeModal}
        />
        <h2 className="text-xl font-bold mb-4 text-center">{title}</h2>
        <div className="h-[45vh] overflow-y-auto pr-4">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    </div>
  );
};


const Foot = () => {
  // State to control modal visibility for Privacy, Terms, Phone, and Mobile
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    content: "",
    type: "",
  });

  const openModal = (type) => {
    if (type === "privacy") {
      setModalContent({
        title: "Privacy Policy",
        content: `
          <p>At <strong>St. John Majore Services Company Inc.</strong>, we understand the importance of safeguarding your privacy and personal data.
          This Privacy policy outlines how we collect, use, disclose, and protect your information when you visit our website <a href="#">[website link]</a>
          and use our recruitment services. By accessing our website or utilizing our services, you consent to the practices described 
          in this policy.</p>
          
          <h3 class="font-bold mt-4">1. Information We Collect</h3>
          <p>We may collect personal information when you visit our website, apply for a job, or interact with our recruitment team. The types of information we collect include:</p>
          <ul class="list-disc pl-5">
            <li><strong>Personal Identifiable Information (PII):</strong> Name, email address, phone number, 
            resume, job preferences, and any other information you provide during the 
            application process.</li>
            <li><strong>Non-Personal Information:</strong> IP address, browser type, operating system, and 
            website usage data collected through cookies.</li>
          </ul>

          <h3 class="font-bold mt-4">2. How We Use Your Information</h3>
          <ul class="list-disc pl-5">
            <li>Provide staffing, recruitment, and workforce management services.</li>
            <li>Communicate with you regarding job opportunities, application status, and other 
            recruitment-related matters.</li>
            <li>Improve our website, services, and overall customer experience.</li>
            <li>Ensure the security of our platform and prevent fraudulent activity.</li>
            <li>Comply with legal obligations and resolve any disputes that may arise.</li>
          </ul>

          <h3 class="font-bold mt-4">3. How We Protect Your Information</h3>
          <p>We take reasonable steps to protect your personal information from unauthorized 
          access, use, or disclosure. While we strive to secure your data, please be aware that no 
          method of internet transmission or electronic storage is completely secure, and we 
          cannot guarantee absolute protection.
          </p>

          <h3 class="font-bold mt-4">4. Sharing Your Information</h3>
          <p>We respect your privacy and do not sell, rent, or trade your personal information. 
          However, we may share your data in the following situations:</p>
          <ul class="list-disc pl-5">
            <li><strong>With service providers:</strong> We may share information with third-party vendors or 
            service providers to assist with processing applications, conducting background 
            checks, and improving our website.</li>
            <li><strong>With potential employers:</strong>  If you have applied for a position through our 
            recruitment services, we may share your application and details with the hiring 
            organizations as part of the recruitment process.</li>
            <li><strong>Legal obligations:</strong>  We may disclose your personal information to comply with 
            legal requests, such as subpoenas, court orders, or other legal processes.</li>
          </ul>

          <h3 class="font-bold mt-4">5. Cookies and Tracking Technologies</h3>
          <p>Our website uses cookies and other tracking technologies to improve your user 
          experience and personalize content. Cookies help us analyze traffic and understand how 
          visitors engage with our website. You can control the use of cookies through your 
          browser settings. Please note that disabling cookies may impact the functionality of 
          some parts of the website.</p>

          <h3 class="font-bold mt-4">6. Your Rights and Choices</h3>
          <p>You have the right to:</p>
          <ul class="list-disc pl-5">
            <li>Access, update, or correct your personal information.</li>
            <li>Request that we delete your personal information, subject to legal requirements.</li>
            <li>Opt-out of receiving marketing communications by following the unsubscribe 
            instructions in our emails or by contacting us directly.
            </li>
          </ul>
          <p>To exercise your rights, please contact us at [Insert Contact Information].</p>

          <h3 class="font-bold mt-4">7. Links to Other Websites</h3>
          <p>Our website may contain links to third-party websites. We are not responsible for the 
          privacy practices or content of these external sites. We encourage you to review their 
          privacy policies before sharing any personal information.</p>

          <h3 class="font-bold mt-4">8. Children's Privacy</h3>
          <p>Our website may contain links to third-party websites. We are not responsible for the 
          privacy practices or content of these external sites. We encourage you to review their 
          privacy policies before sharing any personal information.</p>

          <h3 class="font-bold mt-4">9. Changes to this Privacy Policy</h3>
          <p>We may update this Privacy Policy periodically to reflect changes in our practices or to 
          comply with legal or regulatory requirements. We will post the updated policy on our 
          website, and the changes will take effect immediately upon posting.</p>
        `,
        type: "privacy",
      });
    } else if (type === "phone") {
      setModalContent({
        title: "Phone Number",
        content: "(043) 575 - 5675",
        type: "phone",
      });
    } else if (type === "mobile") {
      setModalContent({
        title: "Mobile Numbers",
        content: `0917-185-1909 <br/>
        0936-269-5914`,
        type: "mobile",
      });
    }
    setModalOpen(true);
  };

  const logos = [
    { id: 1, src: Dole, title: "DOLE Order No. 174 Compliant" },
    { id: 2, src: SEC, title: "SEC Registered" }
  ];
  // Close modal
  const closeModal = () => setModalOpen(false);

  return (
    <Footer container className="bg-[#e0e1dd] text-neutralDGray py-8">
      <div className="w-full">
        <div className="grid w-full justify-between sm:flex sm:justify-between md:flex md:grid-cols-1">
          <div>
          <Footer.Brand
            href="#"
            src={Logo}
            alt="St. John Majore Logo"
            name="St.JohnMajore"
            style={{ fontFamily: '"AR JULIAN", sans-serif'}}
          />

            <div
              style={{
                fontStyle: "italic",
                fontSize: "13px",
                marginTop: "5px",
                marginBottom: "30px"
              }}
              className="mt-4 text-neutral-800 max-w-full sm:max-w-[80%] mx-auto sm:ml-5 md:text-sm lg:text-base"
            >
              The first private services corporation based in San Juan, Batangas
              providing manpower, hospitality, utility services, equipment, and
              materials.
            </div>
            <div
              style={{ fontSize: "13px", marginTop: "30px" }}
              className="mt-4 text-neutral-800 max-w-full sm:max-w-[80%] mx-auto sm:ml-5 md:text-sm lg:text-base"
            >
              Office Hours: Monday to Saturday, 8:00 AM to 5:00 PM
            </div>
            <div className="my-8 ml-5 flex flex-wrap justify-start items-center gap-8">
              {logos.map((logo) => (
                <img
                  key={logo.id}
                  src={logo.src}
                  alt={logo.title}
                  title={logo.title}
                  className={`w-auto ${logo.id === 2 ? 'h-20' : 'h-16'}`}
                />
              ))}
            </div>

          </div>

          <div className="mt-4 grid text-neutral-800 grid-cols-2 gap-8 sm:mt-4 sm:grid-cols-3 sm:gap-6">
            <div>
              <Footer.Title className="text-neutral-800" title="Links" />
              <Footer.LinkGroup col>
                <Footer.Link className="text-neutral-800" href="#legacy">Our Legacy</Footer.Link>
                <Footer.Link className="text-neutral-800" href="#testimonials">Testimonials</Footer.Link>
                <Footer.Link className="text-neutral-800" href="#values">Core Values</Footer.Link>
                <Footer.Link className="text-neutral-800" href="/admin">Our Team</Footer.Link>
                <Footer.Link className="text-neutral-800" href="/faqs">FAQs</Footer.Link>
              </Footer.LinkGroup>
            </div>
            <div>
              <Footer.Title className="text-neutral-800" title="Legal" />
              <Footer.LinkGroup col>
                <Footer.Link className="cursor-pointer text-neutral-800" onClick={() => openModal("privacy")}>
                  Privacy Policy
                </Footer.Link>
              </Footer.LinkGroup>
            </div>
          </div>
        </div>
        <Footer.Divider className="my-2 text-neutral-800" style={{ borderTop: '1px solid #2d3748', marginTop: '220px', marginBottom: '25px' }} />
        <div id="contact" className="mt-1 text-neutral-800 w-full sm:flex sm:items-center sm:justify-between">
          <Footer.Copyright className="text-neutral-800" href="#" by="St.JohnMajore" year={2025} />
          <div className="mt-4 flex space-x-6 sm:mt-0 sm:justify-center">
            {/* Facebook */}
            <a
              href="https://www.facebook.com/stjohnmajore"
              target="_blank" 
              rel="noopener noreferrer"
              className="text-neutral-800 hover:text-brandPrimary"
            >
              <BsFacebook className="w-6 h-6" />
            </a>

            {/* Gmail */}
            <a
              href="https://mail.google.com/mail/u/0/?fs=1&to=sjmajore@gmail.com&su=INQUIRY&body=Hello,+I+would+like+to+ask...&tf=cm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-800 hover:text-brandPrimary"
            >
              <FaEnvelopeOpenText className="w-6 h-6" />
            </a>

            {/* Phone Icon */}
            <a
              onClick={() => openModal("phone")}
              className="cursor-pointer text-neutral-800 hover:text-brandPrimary"
            >
              <FaPhoneAlt className="w-6 h-6" />
            </a>

            {/* Mobile Icon */}
            <a
              onClick={() => openModal("mobile")}
              className="cursor-pointer text-neutral-800 hover:text-brandPrimary"
            >
              <FaMobileAlt className="w-6 h-6" />
            </a>

            {/* Address */}
            <a
              href="https://maps.app.goo.gl/xjenYP2KzCtPJuk59"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-800 hover:text-brandPrimary"
            >
              <FaMapMarkerAlt className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>

      {/* Modal Component */}
      <Modal
        isOpen={modalOpen}
        closeModal={closeModal}
        title={modalContent.title}
        content={modalContent.content}
        type={modalContent.type}
      />
    </Footer>
  );
};

export default Foot;
