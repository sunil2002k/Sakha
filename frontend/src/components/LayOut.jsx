import React from "react";
import { Outlet} from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const LayOut = () => {
  return (
    <>
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="relative z-10 flex-grow ">
        <Outlet />
      </main>
      <Footer />
      </div>
    </>
  );
};

export default LayOut;
