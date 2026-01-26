import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import React from "react";

const Format = ({ children, showSidebar = false }) => {
  return (
    <div className="min-h-screen">
      <div className="flex">
        {showSidebar && <Sidebar />}

        <div className="flex-1 flex flex-col">
          {/* Pass showSidebar to Navbar to handle logo visibility */}
          <Navbar hideLogo={showSidebar} />

          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
};
export default Format;