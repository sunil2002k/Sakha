import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaUser, FaSearch, FaTimesCircle } from "react-icons/fa";
import axios from "axios";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // mobile drawer
  const [showUserPopup, setShowUserPopup] = useState(false); // user icon popup
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const popupRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Submit", path: "/submit" },
    { name: "About", path: "/aboutus" },
  ];

  // Fetch logged-in user info
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get("http://localhost:5500/api/v1/users/getUser", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data.data);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  useEffect(() => {
    fetchUser();

    const handleStorageChange = () => fetchUser();
    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserPopup]);

  // Focus search input when mobile search is opened
  useEffect(() => {
    if (showMobileSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showMobileSearch]);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setUser(null);
    navigate("/login");
  };

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page or perform search
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setShowMobileSearch(false);
      setIsOpen(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Toggle mobile search
  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch);
    if (!showMobileSearch) {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }
  };

  return (
    <nav className="fixed w-full z-50 bg-white/10 dark:bg-gray-900/80 backdrop-blur-lg border-b border-white/20 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center text-white">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold tracking-wide z-10">
          Sakha
        </Link>

        {/* Desktop Search - Hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-lg mx-8">
          <form onSubmit={handleSearch} className="relative w-full">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full px-4 py-2 pl-10 pr-10 bg-white/10 dark:bg-gray-800/80 border border-white/20 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm text-white placeholder-gray-300"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimesCircle />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Desktop navigation */}
        <div className="hidden md:flex space-x-8 items-center">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `text-lg font-medium duration-200 ${
                  isActive ? "text-purple-400" : "text-white hover:text-purple-300"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          {/* User Icon / Info */}
          <div className="relative">
            <button
              className="p-2 rounded-full bg-white/20 dark:bg-gray-700 text-yellow-400 hover:bg-white/30 dark:hover:bg-gray-600 transition"
              aria-label="User Menu"
              onClick={() => setShowUserPopup((prev) => !prev)}
            >
              <FaUser />
            </button>

            {showUserPopup && (
              <div
                ref={popupRef}
                className="absolute right-0 mt-3 w-56 bg-white/10 dark:bg-gray-900/90 backdrop-blur-lg border border-white/20 dark:border-gray-700 rounded-xl shadow-lg p-4 z-50"
              >
                {user ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-purple-300 font-semibold">
                      Hello, {user.name}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1 bg-red-600 rounded-md hover:bg-red-700 transition"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700 transition"
                  >
                    Login
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile: Search and Hamburger icons */}
        <div className="md:hidden flex items-center space-x-4">
          {/* Mobile Search Icon - Toggles search bar */}
          <button
            onClick={toggleMobileSearch}
            className="p-2 rounded-full bg-white/20 dark:bg-gray-700 hover:bg-white/30 dark:hover:bg-gray-600 transition"
            aria-label="Search"
          >
            <FaSearch />
          </button>

          {/* Hamburger Menu */}
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar - Slides down when activated */}
      {showMobileSearch && (
        <div className="md:hidden bg-white/10 dark:bg-gray-800/80 backdrop-blur-lg border-b border-white/20 dark:border-gray-700 px-4 py-3">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full px-4 py-2 pl-10 pr-10 bg-white/10 dark:bg-gray-700/80 border border-white/20 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm text-white placeholder-gray-300"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimesCircle />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowMobileSearch(false)}
              className="absolute -top-1 -right-2 p-1 text-gray-400 hover:text-white transition-colors"
              aria-label="Close search"
            >
              <FaTimes size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile drawer */}
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
          
          {/* Mobile User Info in Drawer */}
          <div className="mt-4 pt-4 border-t border-white/20">
            {user ? (
              <div className="flex flex-col space-y-3">
                <span className="text-purple-300 font-semibold">
                  Hello, {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 transition text-left"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700 transition text-center"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;