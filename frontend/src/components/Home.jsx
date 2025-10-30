import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredProjects, setFeaturedProjects] = useState([]);

  const APIURL = import.meta.env.VITE_APP_URL;

  // Fetch all projects
  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${APIURL}/api/v1/projects/showproject`);
      const allProjects = res.data.projects || [];
      setProjects(allProjects);
      // Set first 3 projects as featured
      setFeaturedProjects(allProjects.slice(0, 3));
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-16">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_1px_1px, rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:40px_40px]"></div>

        {/* Floating Blobs */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 -right-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="relative z-10 text-center max-w-6xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            <span className="text-sm text-purple-200">
              AI-Powered Project Analysis
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Welcome to <span className="text-purple-400">Sakha</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Transform your ideas into reality with our{" "}
            <span className="text-purple-400 font-semibold">
              AI-powered analyzer
            </span>
            . Get insights, recommendations, and success predictions for your
            next big project!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              to="/submit"
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 backdrop-blur-lg"
            >
              <span className="relative z-10">Get Started Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>

            <Link
              to="/projects"
              className="group px-8 py-4 border border-purple-400/50 rounded-xl font-bold text-purple-300 hover:bg-purple-500/10 hover:border-purple-300 transition-all duration-300 hover:scale-105 backdrop-blur-lg"
            >
              Explore Projects
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-lg border border-white/10">
              <div className="text-2xl md:text-3xl font-bold text-white mb-2">
                {projects.length}+
              </div>
              <div className="text-gray-400 text-sm">Projects Listed</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-lg border border-white/10">
              <div className="text-2xl md:text-3xl font-bold text-white mb-2">
                95%
              </div>
              <div className="text-gray-400 text-sm">Success Rate</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-lg border border-white/10 col-span-2 md:col-span-1">
              <div className="text-2xl md:text-3xl font-bold text-white mb-2">
                24/7
              </div>
              <div className="text-gray-400 text-sm">AI Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Featured <span className="text-purple-400">Projects</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Discover innovative projects analyzed by our AI system
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white/5 rounded-2xl p-6 animate-pulse border border-white/10"
              >
                <div className="h-6 bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : featuredProjects.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-lg">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              No Projects Yet
            </h3>
            <p className="text-gray-400 mb-6">
              Be the first to submit your project!
            </p>
            <Link
              to="/submit"
              className="inline-flex items-center px-6 py-3 bg-purple-600 rounded-lg font-semibold text-white hover:bg-purple-700 transition backdrop-blur-lg"
            >
              Submit Your Project
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((proj, index) => (
              <Link
                to={`/project/${proj._id}`}
                key={proj._id}
                className="group"
              >
                <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10 overflow-hidden h-full">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all duration-500"></div>
                  {proj.images && proj.images.length > 0 && (
                    <img
                      src={proj.images[0]}
                      alt={proj.title}
                      className="w-full h-48 object-cover rounded-t-xl"
                    />
                  )}

                  {/* Project number */}
                  <div className="absolute top-4 right-4 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold backdrop-blur-lg">
                    {index + 1}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 relative z-10 group-hover:text-purple-300 transition-colors">
                    {proj.title}
                  </h3>

                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30 backdrop-blur-lg">
                      {proj.category}
                    </span>
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed relative z-10">
                    {proj.description.slice(0, 120)}
                    {proj.description.length > 120 && "..."}
                  </p>

                  {/* Hover arrow */}
                  <div className="absolute bottom-4 right-4 text-purple-400 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* View All Projects CTA */}
        {projects.length > 3 && (
          <div className="text-center mt-12">
            <Link
              to="/projects"
              className="inline-flex items-center px-6 py-3 border border-purple-400/50 text-purple-300 rounded-lg font-semibold hover:bg-purple-500/10 hover:border-purple-300 transition-all duration-300 backdrop-blur-lg"
            >
              View All Projects
              <span className="ml-2">→</span>
            </Link>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 max-w-4xl mx-auto">
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Analyze Your Project?
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Get AI-powered insights and maximize your project's success
            potential in minutes.
          </p>
          <Link
            to="/submit"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 backdrop-blur-lg"
          >
            Start Project Analysis
            <span className="ml-2">🚀</span>
          </Link>
        </div>
      </section>

      {/* Add CSS for blob animation */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Home;
