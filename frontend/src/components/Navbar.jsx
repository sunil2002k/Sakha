import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { FaBars, FaTimes, FaMoon, FaSun } from "react-icons/fa";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dark, setDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Submit", path: "/Submit" },
    { name: "Signup", path: "/signup" },
    { name: "Login", path: "/login" },
    { name: "About", path: "/aboutus" },
  ];

  return (
    <nav className="fixed w-full z-50 bg-white/10 dark:bg-gray-900/80 backdrop-blur-lg border-b border-white/20 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center text-white">
        <Link to="/" className="text-2xl font-bold tracking-wide">
          Sakha
        </Link>

        <div className="hidden md:flex space-x-8 items-center">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `block py-2 pr-4 pl-3 duration-200 ${
                  isActive ? "text-purple-400" : "text-white"
                } border-b border-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 lg:hover:bg-transparent lg:border-0 hover:text-purple-400 lg:p-0`
              }
            >
              {link.name}
            </NavLink>
          ))}
          <button
            onClick={() => setDark((d) => !d)}
            className="ml-4 p-2 rounded-full bg-white/20 dark:bg-gray-700 text-yellow-400 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-gray-600 transition"
            aria-label="Toggle dark mode"
          >
            {dark ? <FaSun /> : <FaMoon />}
          </button>
        </div>

        <div className="md:hidden flex items-center">
          <button
            onClick={() => setDark((d) => !d)}
            className="mr-2 p-2 rounded-full bg-white/20 dark:bg-gray-700 text-yellow-400 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-gray-600 transition"
            aria-label="Toggle dark mode"
          >
            {dark ? <FaSun /> : <FaMoon />}
          </button>
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

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
