import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Rocket,
  Users,
  TrendingUp,
  ArrowRight,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import SkeletonCard from "./SkeletonCard";
import SuccessPredictor from "./SuccessPredictor";

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

  const platformStats = [
    { label: "Active Projects", value: "100+", icon: Rocket },
    { label: "Community Members", value: "1K+", icon: Users },
    { label: "Collaborations", value: "50+", icon: TrendingUp },
    { label: "Innovation Rate", value: "98%", icon: Sparkles },
  ];

  const quickLinks = [
    {
      icon: Rocket,
      title: "Submit a Project",
      desc: "Share your idea and get discovered by mentors and investors.",
      cta: "Get Started",
      to: "/submit",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Users,
      title: "Find Mentors",
      desc: "Connect with industry experts who can guide your journey.",
      cta: "Browse Mentors",
      to: "/mentors",
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      icon: TrendingUp,
      title: "Explore Projects",
      desc: "Discover and support the next wave of innovation.",
      cta: "View Projects",
      to: "/projects",
      color: "text-accent",
      bg: "bg-accent/10",
    },
  ];

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-24">

        {/* ── HERO ── */}
        <section className="text-center space-y-8 pt-8">
          {/* Eyebrow pill */}
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-semibold tracking-widest uppercase">
              <Zap className="w-3 h-3" />
              Where Ideas Meet Opportunity
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08]">
              Build the Future
              <br />
              <span className="text-primary">Together.</span>
            </h1>
            <p className="text-base-content/60 text-lg sm:text-xl max-w-xl mx-auto font-normal leading-relaxed mt-4">
              InnovateU connects students, investors, and mentors to collaborate,
              fund ideas, and accelerate innovation.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/submit"
              className="btn btn-primary btn-lg rounded-xl px-8 gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-200"
            >
              <Rocket className="w-4 h-4" />
              Submit Your Project
            </Link>
            <Link
              to="/projects"
              className="btn btn-ghost btn-lg rounded-xl px-8 gap-2 hover:bg-base-200 transition-all duration-200"
            >
              Explore Projects
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Social proof */}
          <p className="text-base-content/40 text-sm">
            Trusted by{" "}
            <span className="text-base-content/70 font-semibold">1,000+</span>{" "}
            innovators across{" "}
            <span className="text-base-content/70 font-semibold">50+</span>{" "}
            institutions
          </p>
        </section>

        {/* Divider */}
        <div className="divider opacity-20" />

        {/* ── SUCCESS PREDICTOR ── */}
        <SuccessPredictor />

        {/* ── STATS ── */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {platformStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="card bg-base-200 border border-base-300 hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="card-body p-6 items-center text-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                      <p className="text-xs text-base-content/50 font-medium mt-0.5">{stat.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── FEATURED PROJECTS ── */}
        <section className="space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-primary text-xs font-bold tracking-widest uppercase mb-2">Featured</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Latest Projects</h2>
            </div>
            <Link
              to="/projects"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all duration-200"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? [1, 2, 3].map((i) => <SkeletonCard key={i} />)
              : featuredProjects.map((proj) => (
                  <Link
                    to={`/project/${proj._id}`}
                    key={proj._id}
                    className="group card bg-base-200 border border-base-300 hover:border-primary/25 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <figure className="relative h-44 bg-base-300 overflow-hidden">
                      <img
                        src={proj.images?.[0]}
                        alt={proj.title}
                        loading="lazy"
                        onLoad={(e) => {
                          e.target.style.opacity = "1";
                        }}
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                        style={{ opacity: 0, transition: "opacity 0.5s ease, transform 0.5s ease" }}
                      />
                      <div className="absolute top-3 left-3">
                        <span className="badge badge-primary badge-sm font-semibold uppercase tracking-wider">
                          {proj.category}
                        </span>
                      </div>
                    </figure>

                    <div className="card-body p-6 gap-3">
                      <h3 className="font-bold text-lg leading-snug group-hover:text-primary transition-colors duration-200">
                        {proj.title}
                      </h3>
                      <p className="text-base-content/55 text-sm leading-relaxed line-clamp-2">
                        {proj.description}
                      </p>
                      <div className="pt-2">
                        <span className="inline-flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider group-hover:gap-2.5 transition-all duration-200">
                          View Project <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
          </div>

          <div className="flex justify-center sm:hidden">
            <Link to="/projects" className="btn btn-outline btn-primary btn-sm rounded-xl gap-2">
              View all projects <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section>
          <div className="card bg-primary text-primary-content overflow-hidden relative">
            {/* Subtle dot-grid overlay */}
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, currentColor 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            <div className="card-body relative p-10 sm:p-16 text-center space-y-6">
              <div>
                <p className="text-primary-content/60 text-xs font-bold tracking-widest uppercase mb-3">
                  Join the community
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                  Ready to build something
                  <br className="hidden sm:block" /> remarkable?
                </h2>
              </div>
              <p className="text-primary-content/75 text-base max-w-md mx-auto">
                Join thousands of innovators, mentors, and investors already
                shaping the future on InnovateU.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link
                  to="/signup"
                  className="btn btn-lg rounded-xl bg-white text-primary border-none hover:bg-white/90 hover:scale-[1.02] transition-all duration-200 shadow-lg gap-2"
                >
                  <Users className="w-4 h-4" />
                  Create Free Account
                </Link>
                <Link
                  to="/about"
                  className="btn btn-lg btn-ghost rounded-xl text-primary-content/80 hover:bg-white/10 transition-all duration-200"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── QUICK LINKS ── */}
        <section className="space-y-8 pb-8">
          <div className="text-center">
            <p className="text-primary text-xs font-bold tracking-widest uppercase mb-2">Get Started</p>
            <h3 className="text-2xl font-bold">Everything you need, in one place</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {quickLinks.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="card bg-base-200 border border-base-300 hover:border-primary/25 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="card-body p-7 gap-4">
                    <div className={`p-3 rounded-xl ${item.bg} w-fit`}>
                      <Icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-base">{item.title}</h4>
                      <p className="text-sm text-base-content/55 leading-relaxed">{item.desc}</p>
                    </div>
                    <Link
                      to={item.to}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${item.color} hover:gap-2.5 transition-all duration-200 mt-1`}
                    >
                      {item.cta} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;