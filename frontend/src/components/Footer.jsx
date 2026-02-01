import React from "react";
import { Link } from "react-router-dom";
import { 
  FaTwitter, 
  FaFacebookF, 
  FaInstagram, 
  FaLinkedinIn, 
  FaPaperPlane, 
  FaRocket 
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-base-200 text-base-content pt-20 pb-10 rounded-t-[3rem] mt-20">
      <div className="container mx-auto px-6 max-w-6xl">
        
        {/* Top Section: Brand & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-16 border-b border-base-300 pb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <div className="bg-primary text-primary-content p-3 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                <FaRocket className="text-2xl" />
              </div>
              <span className="text-2xl font-black tracking-tighter">
                ProjectHub<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="opacity-70 leading-relaxed mb-6 max-w-xs font-medium">
              Empowering innovators to turn dreams into reality. Join the community that builds the future, one project at a time.
            </p>
            <div className="flex gap-4">
              {[FaTwitter, FaFacebookF, FaInstagram, FaLinkedinIn].map((Icon, idx) => (
                <a 
                  key={idx} 
                  href="#" 
                  className="btn btn-circle btn-sm btn-ghost border border-base-300 hover:bg-primary hover:text-white hover:border-primary transition-all"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-1">
            <h6 className="font-black uppercase text-xs tracking-widest mb-6 opacity-40">Platform</h6>
            <div className="flex flex-col gap-3 font-bold text-sm">
              <Link to="/projects" className="link link-hover hover:text-primary transition-colors">Browse Projects</Link>
              <Link to="/create-project" className="link link-hover hover:text-primary transition-colors">Start a Campaign</Link>
              <Link to="/mentors" className="link link-hover hover:text-primary transition-colors">Find Mentors</Link>
              <Link to="/success-stories" className="link link-hover hover:text-primary transition-colors">Success Stories</Link>
            </div>
          </div>

          <div className="lg:col-span-1">
            <h6 className="font-black uppercase text-xs tracking-widest mb-6 opacity-40">Company</h6>
            <div className="flex flex-col gap-3 font-bold text-sm">
              <Link to="/about" className="link link-hover hover:text-primary transition-colors">About Us</Link>
              <Link to="/team" className="link link-hover hover:text-primary transition-colors">Our Team</Link>
              <Link to="/careers" className="link link-hover hover:text-primary transition-colors">Careers</Link>
              <Link to="/contact" className="link link-hover hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-1">
            <h6 className="font-black uppercase text-xs tracking-widest mb-6 opacity-40">Stay Updated</h6>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text text-xs font-bold opacity-70">Weekly digest of top projects</span>
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="email@example.com" 
                  className="input input-bordered w-full pr-12 rounded-xl focus:outline-none focus:border-primary bg-base-100" 
                />
                <button className="absolute top-0 right-0 rounded-l-none btn btn-ghost rounded-r-xl text-primary hover:bg-transparent">
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Copyright & Legal */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-bold opacity-50">
          <p>© {new Date().getFullYear()} ProjectHub Inc. All rights reserved.</p>
          <div className="flex gap-8">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="hover:text-primary transition-colors">Cookie Settings</Link>
          </div>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;
