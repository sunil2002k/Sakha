// components/Format.jsx (Ensure it looks like this)
import React from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import AdminSidebar from "./AdminSidebar.jsx";

const Format = ({ children, showSidebar = true }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="flex h-screen overflow-hidden">
      {showSidebar && (
        isAdminRoute ? <AdminSidebar /> : <Sidebar />
      )}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};
export default Format