import React from "react";

const Footer = () => {
  return (
    <footer className="w-full bg-white/10 backdrop-blur-lg border-t border-white/20 py-4 mt-8 text-center text-gray-200 text-sm">
      © {new Date().getFullYear()} Sakha. All rights reserved.
    </footer>
  );
};

export default Footer;
