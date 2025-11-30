import React from "react";
import { Outlet} from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const LayOut = () => {
  return (
    <>
      <Navbar />
      <main className="relative z-10 ">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default LayOut;
