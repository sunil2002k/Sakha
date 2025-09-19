import React from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const LayOut = () => {
  return (
    <>
      <Navbar />
      <main className="relative z-10 pt-20">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </>
  );
};

export default LayOut;
