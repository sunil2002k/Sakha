import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { FaBars, FaTimes, FaUser } from "react-icons/fa";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // mobile drawer
  const [showUserPopup, setShowUserPopup] = useState(false); // user icon popup
  const popupRef = useRef(null);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Submit", path: "/Submit" },
    { name: "Signup", path: "/signup" },
    { name: "Login", path: "/login" },
    { name: "About", path: "/aboutus" },
  ];

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowUserPopup(false);
      }
    };
    if (showUserPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserPopup]);

  return (
    <nav className="fixed w-full z-50 bg-white/10 dark:bg-gray-900/80 backdrop-blur-lg border-b border-white/20 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center text-white">
        <Link to="/" className="text-2xl font-bold tracking-wide">
          Sakha
        </Link>

        {/* Desktop: User icon triggers popup */}
        <div className="hidden md:flex space-x-8 items-center">
          <button
            className="p-2 rounded-full bg-white/20 dark:bg-gray-700 text-yellow-400 hover:bg-white/30 dark:hover:bg-gray-600 transition"
            aria-label="Open navigation"
            onClick={() => setShowUserPopup(true)}
          >
            <FaUser />
          </button>
        </div>

        {/* Mobile: Hamburger icon only */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* User icon popup (desktop only) */}
      {showUserPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            ref={popupRef}
            className="bg-white/10 dark:bg-gray-900/90 backdrop-blur-lg border border-white/20 dark:border-gray-700 rounded-xl shadow-2xl p-8 w-full max-w-xs ml-200 mt-100 relative"
          >
            <nav className="flex flex-col space-y-4 mt-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setShowUserPopup(false)}
                  className={({ isActive }) =>
                    `block py-2 px-4 rounded text-lg duration-200 ${
                      isActive
                        ? "bg-purple-600 text-white"
                        : "text-white hover:bg-purple-700/60"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile drawer (hamburger menu) */}
      {isOpen && (
        <div className="md:hidden bg-white/10 dark:bg-gray-900/80 backdrop-blur-md px-4 pb-4 text-white">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block py-2 pr-4 pl-3 duration-200 ${
                  isActive ? "text-purple-400" : "text-white"
                } border-b border-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 lg:hover:bg-transparent lg:border-0 hover:text-purple-400 lg:p-0`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
