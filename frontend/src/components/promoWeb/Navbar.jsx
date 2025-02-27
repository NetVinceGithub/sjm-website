import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Link } from 'react-scroll';
import Logo from '../../assets/logo.png';

import { FaXmark, FaBars } from "react-icons/fa6";

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const location = useLocation();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsSticky(window.scrollY > 100);
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const specialRoutes = ['/careers', '/admin', '/faqs', '/services-offered'];
    const isSpecialRoute = specialRoutes.includes(location.pathname);

    const navItems = [
        { id: 1, link: "Home", path: "/", type: "home" },
        { id: 2, link: "About", path: "about", type: "scroll" },
        { id: 3, link: "Services", path: "services", type: "scroll" },
        { id: 4, link: "Careers", path: "/careers", type: "route" },
        { id: 5, link: "Administration", path: "/admin", type: "route" },
        { id: 6, link: "FAQs", path: "/faqs", type: "route" },
    ];

    return (
        <header className="w-full fixed top-0 left-0 right-0 z-50">
            <nav className={`py-2 lg:px-14 px-4 ${isSticky || isSpecialRoute ? "bg-white border-b shadow-md duration-300" : "bg-transparent md:bg-transparent"}`}>
                <div className="flex justify-between items-center text-base gap-8">
                    <a href="/" className="text-[1.6rem] font-semibold flex items-center space-x-3">
                        <img src={Logo} alt="Company Logo" className="w-14 h-14 inline-block items-center" />
                        <span className={(isSticky || isSpecialRoute) ? 'text-gray-900' : 'text-gray-100'} style={{ fontFamily: 'AR JULIAN, sans-serif' }}>
                            St.JohnMajore
                        </span>
                    </a>
                    
                    <ul className="md:flex space-x-12 hidden">
                        {navItems.map(({ id, link, path, type }) => (
                            <li key={id}>
                                {type === "scroll" ? (
                                    <Link to={path} spy smooth offset={-80} duration={500} className={`block text-base cursor-pointer ${(isSticky || isSpecialRoute) ? 'text-gray-900' : 'text-white'} hover:text-brandPrimary transition duration-300 ease-in-out ${link === 'Home' ? 'font-bold' : ''}`}>
                                        {link}
                                    </Link>
                                ) : (
                                    <RouterLink to={path} className={`block text-base cursor-pointer ${(isSticky || isSpecialRoute) ? 'text-gray-900' : 'text-white'} hover:text-brandPrimary transition duration-300 ease-in-out ${link === 'Home' ? 'font-bold' : ''}`}>
                                        {link}
                                    </RouterLink>
                                )}
                            </li>
                        ))}
                    </ul>
                    
                    <div className="hidden lg:flex items-center">
                        <button onClick={() => document.getElementById("connect").scrollIntoView({ behavior: "smooth" })} className="bg-brandPrimary text-white py-2 px-4 rounded-md hover:bg-brandPrimaryDark transition-all duration-300">
                            Connect with Us
                        </button>
                    </div>

                    <div className="md:hidden">
                        <button onClick={toggleMenu} className={`focus:outline-none ${(isSticky || isSpecialRoute) ? 'text-gray-900' : 'text-gray-100'}`}>
                            {isMenuOpen ? <FaXmark className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {isMenuOpen && (
                    <div className="space-y-4 px-4 mt-16 py-7 bg-brandPrimary fixed top-0 right-0 left-0 z-40 shadow-lg rounded-lg transition-all ease-in-out duration-300">
                        <ul className="space-y-4 text-center z-40">
                            {navItems.map(({ id, link, path, type }) => (
                                <li key={id}>
                                    {type === "scroll" ? (
                                        <Link to={path} spy smooth offset={-80} duration={500} className="block text-lg cursor-pointer text-white hover:text-gray-300 transition duration-300 ease-in-out" onClick={() => setIsMenuOpen(false)}>
                                            {link}
                                        </Link>
                                    ) : (
                                        <RouterLink to={path} className="block text-lg cursor-pointer text-white hover:text-gray-300 transition duration-300 ease-in-out" onClick={() => setIsMenuOpen(false)}>
                                            {link}
                                        </RouterLink>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Navbar;