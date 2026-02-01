import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { 
  Sparkles, 
  Rocket, 
  Users, 
  TrendingUp,
  ArrowRight
} from "lucide-react";
import SkeletonCard from "./SkeletonCard";

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredProjects, setFeaturedProjects] = useState([]);

  const APIURL = import.meta.env.VITE_APP_URL;

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${APIURL}/api/v1/projects/showproject`);
      const all = res.data.projects || [];
      setProjects(all);
      setFeaturedProjects(all.slice(0, 3));
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Stats for the platform
  const platformStats = [
    { label: "Active Projects", value: "100+", icon: Rocket },
    { label: "Community Members", value: "1K+", icon: Users },
    { label: "Successful Collaborations", value: "50+", icon: TrendingUp },
    { label: "Innovation Rate", value: "98%", icon: Sparkles },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-10">
        
        {/* HERO SECTION */}
        <section className="text-center space-y-6 py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="size-4" />
            Where Ideas Meet Opportunity
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              InnovateU
            </span>
          </h1>
          
          <p className="text-base-content/70 text-lg sm:text-xl max-w-2xl mx-auto">
            A unified platform for students, investors, and mentors to collaborate,
            support ideas, and drive innovation forward.
          </p>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              to="/submit"
              className="btn btn-lg btn-primary shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Rocket className="size-5 mr-2" />
              Submit Your Project
            </Link>
            <Link
              to="/projects"
              className="btn btn-lg btn-outline btn-primary hover:bg-primary hover:text-white transition-all duration-300"
            >
              <ArrowRight className="size-5 mr-2" />
              Explore Projects
            </Link>
          </div>
        </section>

        {/* PLATFORM STATS */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {platformStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="card bg-base-200 hover:shadow-lg transition-all duration-300">
                <div className="card-body p-4 sm:p-6 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Icon className="size-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                  <p className="text-sm opacity-70">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </section>

        {/* FEATURED PROJECTS */}
        
<section>
  <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div>
      <h2 className="text-3xl font-black tracking-tight">Featured Projects</h2>
      <p className="opacity-70 font-medium">Discover innovation from our community.</p>
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {loading ? (
      // 1. SHOW SKELETONS WHILE LOADING DATA
      [1, 2, 3].map((i) => <SkeletonCard key={i} />)
    ) : (
      featuredProjects.map((proj) => (
        <Link to={`/project/${proj._id}`} key={proj._id} className="group">
          <div className="card bg-base-200 hover:shadow-2xl transition-all duration-500 h-full border border-base-300/50 overflow-hidden rounded-[2rem]">
            
            {/* 2. OPTIMIZED IMAGE HANDLING */}
            <figure className="relative h-48 bg-base-300 overflow-hidden">
              <img 
                src={proj.images?.[0]} 
                alt={proj.title}
                loading="lazy"
                onLoad={(e) => e.target.classList.add('opacity-100')}
                className="w-full h-full object-cover opacity-0 transition-opacity duration-700 group-hover:scale-110"
              />
              <div className="absolute top-4 right-4">
                <span className="badge badge-primary font-black uppercase text-[10px] tracking-widest p-3 shadow-lg">
                  {proj.category}
                </span>
              </div>
            </figure>

            <div className="card-body p-8">
              <h3 className="text-xl font-black group-hover:text-primary transition-colors">
                {proj.title}
              </h3>
              <p className="opacity-70 text-sm line-clamp-2 font-medium">
                {proj.description}
              </p>
              <div className="card-actions justify-end mt-6">
                <span className="text-primary font-black text-xs flex items-center gap-2 group-hover:gap-3 transition-all">
                  VIEW PROJECT <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))
    )}
  </div>
</section>

        {/* FINAL CTA */}
        <section className="pt-8">
          <div className="card bg-gradient-to-br from-primary to-secondary text-white shadow-2xl">
            <div className="card-body p-8 sm:p-12 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Innovate?
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
                Join InnovateU and turn your ideas into successful projects with our
                community of mentors and investors.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup" className="btn btn-accent btn-lg text-white hover:shadow-xl transition-all duration-300">
                  <Users className="size-5 mr-2" />
                  Join Now
                </Link>
                <Link to="/about" className="btn btn-outline btn-lg btn-accent text-white hover:bg-white/20">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK LINKS */}
        <section className="pt-4">
          <h3 className="text-xl font-semibold mb-4 text-center">Get Started</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card bg-base-200 hover:shadow-lg transition-all duration-300">
              <div className="card-body p-6 text-center">
                <div className="p-3 rounded-full bg-primary/10 inline-flex mb-3 items-center justify-center">
                  <Rocket className="size-6 text-primary " />
                </div>
                <h4 className="font-semibold mb-2">Submit Project</h4>
                <p className="text-sm opacity-70 mb-3">Share your innovative idea with our community</p>
                <Link to="/submit" className="btn btn-ghost btn-sm">Get Started</Link>
              </div>
            </div>
            <div className="card bg-base-200 hover:shadow-lg transition-all duration-300">
              <div className="card-body p-6 text-center">
                <div className="p-3 rounded-full bg-secondary/10 inline-flex mb-3 items-center justify-center">
                  <Users className="size-6 text-secondary" />
                </div>
                <h4 className="font-semibold mb-2">Find Mentors</h4>
                <p className="text-sm opacity-70 mb-3">Connect with experienced mentors in your field</p>
                <Link to="/mentors" className="btn btn-ghost btn-sm">Browse Mentors</Link>
              </div>
            </div>
            <div className="card bg-base-200 hover:shadow-lg transition-all duration-300">
              <div className="card-body p-6 text-center">
                <div className="p-3 rounded-full bg-accent/10 inline-flex mb-3 items-center justify-center">
                  <TrendingUp className="size-6 text-accent" />
                </div>
                <h4 className="font-semibold mb-2">Explore Projects</h4>
                <p className="text-sm opacity-70 mb-3">Discover and support innovative projects</p>
                <Link to="/projects" className="btn btn-ghost btn-sm">View Projects</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;