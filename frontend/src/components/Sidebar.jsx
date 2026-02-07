import React from "react";
import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, HomeIcon, UsersIcon } from "lucide-react";
import logo from "../assets/logo.png"

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-base-300">
        <Link to="/" className="flex items-center gap-2.5">
          <img 
            className="h-8 w-auto object-contain brightness-125 contrast-125" 
            src={logo} 
            alt="logo" 
          />
        </Link>
      </div>

     <nav className="flex-1 p-4 space-y-2 mt-4">
        {/* Added hover effects and active states to match Navbar style more closely */}
        {[
          { path: "/chatroom", icon: HomeIcon, label: "Overview" }, // Renamed Home to Overview to differentiate from Landing Page
          { path: "/friends", icon: UsersIcon, label: "Friends" },
          { path: "/notifications", icon: BellIcon, label: "Notifications" },
        ].map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentPath === item.path
                ? "bg-primary/20 text-primary border border-primary/30 shadow-sm"
                : "text-base-content/70 hover:bg-base-300 hover:text-base-content"
            }`}
          >
            <item.icon className={`size-5 ${currentPath === item.path ? "text-primary" : "opacity-70"}`} />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* USER PROFILE SECTION */}
      <div className="p-4 border-t border-base-300 mt-auto">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-10 rounded-full">
              <img src={authUser?.profilePic} alt="User Avatar" />
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{authUser?.fullName}</p>
            <p className="text-xs text-success flex items-center gap-1">
              <span className="size-2 rounded-full bg-success inline-block" />
              Online
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;