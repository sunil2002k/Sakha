import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all projects
  const fetchProjects = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5500/api/v1/projects/showproject"
      );
      setProjects(res.data.projects || []);
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
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center text-white">
      <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">
        Welcome to Sakha 🚀
      </h1>
      <p className="text-lg text-gray-200 max-w-xl mb-8">
        Discover, analyze, and submit innovative project ideas. Use our
        AI-powered analyzer to get insights, recommendations, and success
        predictions for your next big idea!
      </p>

      <a
        href="/Submit"
        className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold shadow hover:bg-purple-700 transition"
      >
        Get Started
      </a>

      {/* Project List */}
      <div className="w-full max-w-4xl mt-12 text-left">
        <h2 className="text-3xl font-semibold mb-4 text-center">
          Latest Projects
        </h2>

        {loading ? (
          <p className="text-gray-300 text-center">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-gray-400 text-center">No projects found.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <Link to={`/project/${proj._id}`} key={proj._id}>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 hover:shadow-lg hover:scale-105 transition">
                  <h3 className="text-xl font-bold text-purple-400 mb-2">
                    {proj.title}
                  </h3>
                  <p className="text-sm text-gray-300 mb-2">
                    <span className="font-semibold">Category:</span>{" "}
                    {proj.category}
                  </p>
                  <p className="text-gray-200 text-sm">
                    {proj.description.slice(0, 80)}...
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
