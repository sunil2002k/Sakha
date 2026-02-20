import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaUser,
  FaSearch,
  FaTimesCircle,
} from "react-icons/fa";
import { BellIcon, LogOutIcon, ShieldCheck } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useAuthUser from "../hooks/useAuthUser";
import useLogout from "../hooks/useLogout";
import logo from '../assets/logo.png'

const Navbar = ({ hideLogo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const popupRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  const { authUser } = useAuthUser();
  const { logoutMutation } = useLogout();

  useEffect(() => {
    console.debug("Navbar authUser:", authUser);
  }, [authUser]);


  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Submit", path: "/submit" },
    { name: "About", path: "/about" },
    ...(authUser?.role === "admin"
      ? [{ name: "Admin Panel", path: "/admin/dashboard" }]
      : [])
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setShowMobileSearch(false);
      setIsOpen(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

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

  return (
    <header className={`w-full z-50 sticky top-0 border-b transition-colors duration-300 ${
      hideLogo 
        ? "bg-base-200/50 backdrop-blur-sm border-base-300" 
        : "bg-base-100/80 backdrop-blur-xl border-base-300 shadow-[0_0_30px_rgba(15,23,42,0.8)]"
    }`}>
      <div className="mx-auto flex items-center justify-between px-4 py-3 lg:px-8">
        <div className="flex items-center gap-4">
          {!hideLogo && (
            <Link to="/" className="flex items-center gap-2">
              <span className="inline-flex items-center">
                <img
                  src={logo}
                  alt="Brand Logo"
                  className="h-8 md:h-10 w-auto object-contain brightness-125 contrast-125 drop-shadow-lg"
                />
              </span>
            </Link>
          )}
          
        </div>

        {/* Center: desktop search */}
        <div className="hidden flex-1 px-6 md:block">
          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/70" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, people, or ideas..."
              className="w-full px-4 py-2 pl-10 pr-10 bg-base-200/80 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-transparent backdrop-blur-md text-base-content placeholder-base-content/50 text-sm shadow-[0_0_12px_rgba(15,23,42,0.9)] transition-transform duration-150 hover:bg-base-200 focus:scale-[1.01]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/70 hover:text-base-content"
              >
                <FaTimesCircle />
              </button>
            )}
          </form>
        </div>

        {/* Right: desktop nav + user */}
        <div className="hidden items-center gap-5 md:flex">
          
          {/* ONLY show these links if the sidebar is NOT present */}
          {!hideLogo && (
            <nav className="flex items-center gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `text-xs md:text-sm px-3 py-1 rounded-full font-medium tracking-wide transition-all duration-200 ${isActive
                      ? " text-primary "
                      : "text-base-content/85 hover:bg-base-200/7 hover:text-primary border-transparent"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>
          )}

          {authUser && (
            <Link
              to="/notifications"
              className="relative inline-flex items-center justify-center rounded-full bg-base-200/80 p-2 text-base-content hover:bg-base-300/90 border border-base-300/80"
            >
              <BellIcon className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-success shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
            </Link>
          )}

          {/* Theme selector (desktop only) */}

          <div className="hidden md:flex items-center ml-2 relative">
            <ThemeSelector />
          </div>

          {/* User / auth popup */}
          <div className="relative" ref={popupRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowUserPopup((prev) => !prev);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-content text-sm font-semibold shadow-[0_0_15px_rgba(129,140,248,0.8)] hover:brightness-110"
            >
              {authUser ? (
                authUser?.profilePic ? (
                  <img
                    src={authUser.profilePic}
                    alt="User Avatar"
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <span>{authUser?.fullName?.[0] || "U"}</span>
                )
              ) : (
                <FaUser />
              )}
            </button>

            {showUserPopup && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-base-100 border border-base-300 shadow-2xl p-3 z-[9999] backdrop-blur-md"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserPopup(false)
                }
                } 
              >
                {authUser ? (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-content text-sm font-semibold">
                        {authUser?.fullName?.[0] || "U"}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-base-content">
                            {authUser?.fullName || "User"}
                          </span>

                          {authUser.isKYCverified ? (
                            <span className="badge badge-success gap-1 text-[10px]">
                              <ShieldCheck size={14} />
                              Verified
                            </span>
                          ) : (
                            <button
                              onClick={() => navigate("/kyc")}
                              className="btn btn-warning btn-xs btn-outline"
                            >
                              Verify Identity
                            </button>
                          )}
                        </div>


                        {authUser.email && (
                          <span className="text-[11px] text-base-content/60 truncate">
                            {authUser?.email}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => navigate("/profile")}
                        className="w-full rounded-lg border border-base-300/80 bg-base-200/70 px-3 py-2 text-left text-base-content hover:bg-base-300/90 transition-colors"
                      >
                        Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate("/myprojects")}
                        className="w-full rounded-lg border border-base-300/80 bg-base-200/70 px-3 py-2 text-left text-base-content hover:bg-base-300/90 transition-colors"
                      >
                        My Projects
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate("/settings")}
                        className="w-full rounded-lg border border-base-300/80 bg-base-200/70 px-3 py-2 text-left text-base-content hover:bg-base-300/90 transition-colors"
                      >
                        Settings
                      </button>
                    </div>

                    <div className="my-2 border-t border-base-300/60" />

                    <button
                      onClick={() => logoutMutation()}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-error/90 px-3 py-2 text-xs font-semibold text-error-content hover:bg-error transition-colors"
                    >
                      <LogOutIcon className="h-3.5 w-3.5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-content shadow-[0_0_18px_rgba(168,85,247,0.8)] hover:bg-primary-focus transition-colors"
                  >
                    Login to continue
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile right side */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={toggleMobileSearch}
            className="p-2 text-base-content hover:text-primary transition-colors"
            aria-label="Search"
          >
            <FaSearch />
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-base-content hover:text-primary transition-colors"
            aria-label="Menu"
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      {showMobileSearch && (
        <div className="md:hidden border-t border-base-300 bg-base-100/95 px-4 py-3">
          <form onSubmit={handleSearch} className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/70" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full px-4 py-2 pl-10 pr-10 bg-base-200/80 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent backdrop-blur-md text-base-content placeholder-base-content/50 text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/70 hover:text-base-content"
              >
                <FaTimesCircle />
              </button>
            )}
          </form>
        </div>
      )}

      {/* Mobile drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-base-300 bg-gradient-to-b from-base-100 via-base-200 to-base-100 px-4 pb-4">
          <nav className="flex flex-col gap-1 pt-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `mt-1  px-3 py-2 text-sm font-medium transition-all ${isActive
                    ? " text-primary-content"
                    : "text-base-content/90  hover:bg-base-200/5 hover:text-primary"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            <div className="mt-3">
              {authUser ? (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    logoutMutation();
                  }}
                  className="w-full rounded-full bg-error px-4 py-2 text-sm font-semibold text-error-content shadow-[0_0_16px_rgba(220,38,38,0.7)] hover:bg-error-focus transition-colors flex items-center justify-center gap-2"
                >
                  <LogOutIcon className="h-4 w-4" />
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/login");
                  }}
                  className="w-full rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-content shadow-[0_0_18px_rgba(168,85,247,0.8)] hover:bg-primary-focus transition-colors"
                >
                  Login
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;