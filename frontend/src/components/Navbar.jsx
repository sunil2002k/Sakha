import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaUser,
  FaSearch,
  FaTimesCircle,
} from "react-icons/fa";
import { BellIcon, LogOutIcon, ShipWheelIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useAuthUser from "../hooks/useAuthUser";
import useLogout from "../hooks/useLogout";

const CombinedHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const popupRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { authUser } = useAuthUser();
  const { logoutMutation } = useLogout();

  useEffect(() => {
    // quick debug to confirm authUser shape
    console.debug("Navbar authUser:", authUser);
  }, [authUser]);

  const isChatPage = location.pathname?.startsWith("/chat");

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Submit", path: "/submit" },
    { name: "About", path: "/aboutus" },
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
    <header className="w-full bg-slate-950/80 backdrop-blur-xl border-b border-white/10 shadow-[0_0_30px_rgba(15,23,42,0.8)]  z-50 sticky">
      <div className="mx-auto flex items-center justify-between px-4 py-3 lg:px-8">
        {/* Left: logo + chat badge */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-white">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 via-fuchsia-500 to-indigo-500 shadow-[0_0_18px_rgba(168,85,247,0.9)]">
              <ShipWheelIcon className="h-4 w-4 text-white drop-shadow-[0_0_6px_rgba(15,23,42,0.8)]" />
            </span>
            <span className="inline-flex items-center rounded-full border border-white/10 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-teal-400/20 px-3 py-1 text-sm font-semibold tracking-wide text-white/90">
              Sakha
            </span>
          </Link>

          {isChatPage && (
            <Link
              to="/chat"
              className="hidden md:inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-slate-100 border border-slate-700/70 shadow-[0_0_10px_rgba(15,23,42,0.8)]"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
              <span>Streamify chat</span>
            </Link>
          )}
        </div>

        {/* Center: desktop search */}
        <div className="hidden flex-1 px-6 md:block">
          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, people, or ideas..."
              className="w-full px-4 py-2 pl-10 pr-10 bg-white/8 dark:bg-slate-900/80 border border-white/15 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/80 focus:border-transparent backdrop-blur-md text-white placeholder-gray-400 text-sm shadow-[0_0_12px_rgba(15,23,42,0.9)] transition-transform duration-150 hover:bg-white/12 focus:scale-[1.01]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
              >
                <FaTimesCircle />
              </button>
            )}
          </form>
        </div>

        {/* Right: desktop nav + user */}
        <div className="hidden items-center gap-5 md:flex">
          <nav className="flex items-center gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `text-xs md:text-sm px-3 py-1 rounded-full font-medium tracking-wide transition-all duration-200 ${
                    isActive
                      ? "bg-purple-600/30 text-purple-200 border border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.7)]"
                      : "text-white/85 hover:bg-white/7 hover:text-purple-100 border border-transparent"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {authUser && (
            <Link
              to="/notifications"
              className="relative inline-flex items-center justify-center rounded-full bg-slate-900/80 p-2 text-slate-100 hover:bg-slate-800/90 border border-slate-700/80"
            >
              <BellIcon className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
            </Link>
          )}

          {/* Theme selector (desktop only) */}
          {/* //** todo */}
          {authUser && (
            <div className="hidden md:flex items-center ml-2 relative">
              
              {/* <ThemeSelector /> */}
          </div>
          )}
          {/* User / auth popup */}
          <div className="relative" ref={popupRef}>
            <button
              onClick={(e) => {
                e.stopPropagation(); // prevent document handler from immediately closing popup
                setShowUserPopup((prev) => !prev);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-sm font-semibold shadow-[0_0_15px_rgba(129,140,248,0.8)] hover:brightness-110"
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
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-950 border border-slate-600 shadow-2xl p-3 z-[9999] backdrop-blur-md"
                onClick={(e) => e.stopPropagation()} // keep clicks inside from bubbling out
              >
                {authUser ? (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-sm font-semibold">
                        {authUser?.fullName?.[0] || "U"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-50">
                          {authUser?.fullName || "User"}
                        </span>
                        {authUser.email && (
                          <span className="text-[11px] text-slate-400 truncate">
                            {authUser?.email}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => navigate("/profile")}
                        className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-left text-slate-200 hover:bg-slate-800/90 transition-colors"
                      >
                        Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate("/settings")}
                        className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-left text-slate-200 hover:bg-slate-800/90 transition-colors"
                      >
                        Settings
                      </button>
                    </div>

                    <div className="my-2 border-t border-slate-700/60" />

                    <button
                      onClick={() => logoutMutation()}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-red-600/90 px-3 py-2 text-xs font-semibold text-white hover:bg-red-500 transition-colors"
                    >
                      <LogOutIcon className="h-3.5 w-3.5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_18px_rgba(168,85,247,0.8)] hover:bg-purple-500 transition-colors"
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
            className="p-2 text-white hover:text-purple-300"
            aria-label="Search"
          >
            <FaSearch />
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-white hover:text-purple-300"
            aria-label="Menu"
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      {showMobileSearch && (
        <div className="md:hidden border-t border-white/10 bg-slate-950/95 px-4 py-3">
          <form onSubmit={handleSearch} className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full px-4 py-2 pl-10 pr-10 bg-white/8 dark:bg-gray-900/80 border border-white/18 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-md text-white placeholder-gray-300 text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
              >
                <FaTimesCircle />
              </button>
            )}
          </form>
        </div>
      )}

      {/* Mobile drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-white/10 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 pb-4">
          <nav className="flex flex-col gap-1 pt-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `mt-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-purple-600/25 text-purple-100 border border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.7)]"
                      : "text-white/90 border border-transparent hover:bg-white/5 hover:text-purple-100"
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
                  className="w-full rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_16px_rgba(220,38,38,0.7)] hover:bg-red-500 transition-colors flex items-center justify-center gap-2"
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
                  className="w-full rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_18px_rgba(168,85,247,0.8)] hover:bg-purple-500 transition-colors"
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

export default CombinedHeader;
