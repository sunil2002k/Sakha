import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const APIURL = import.meta.env.VITE_APP_URL;

  // Fetch all projects
  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${APIURL}/api/v1/projects/showproject`);
      const projectsData = res.data.projects || [];
      setProjects(projectsData);
      setFilteredProjects(projectsData);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    
  }, []);

  // Extract unique categories
  const categories = [
    "all",
    ...new Set(projects.map((proj) => proj.category).filter(Boolean)),
  ];
  const types = [
    "all",
    ...new Set(projects.map((proj) => proj.type).filter(Boolean)),
  ];

  // Filter and sort projects
  useEffect(() => {
    let result = projects;

    // Search filter
    if (searchQuery) {
      result = result.filter(
        (proj) =>
          proj.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          proj.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          proj.tech_stack?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((proj) => proj.category === selectedCategory);
    }

    // Type filter
    if (selectedType !== "all") {
      result = result.filter((proj) => proj.type === selectedType);
    }

    // Sorting
    switch (sortBy) {
      case "newest":
        result = [...result].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case "oldest":
        result = [...result].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        break;
      case "title":
        result = [...result].sort((a, b) => a.title?.localeCompare(b.title));
        break;
      default:
        break;
    }

    setFilteredProjects(result);
  }, [projects, searchQuery, selectedCategory, selectedType, sortBy]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedType("all");
    setSortBy("newest");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Explore <span className="text-purple-400">Projects</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Discover innovative projects from our community. Find inspiration,
            collaborate, and support amazing ideas.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-white mb-2">
              {projects.length}
            </div>
            <div className="text-gray-400">Total Projects</div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-white mb-2">
              {projects.filter((p) => p.type === "funding").length}
            </div>
            <div className="text-gray-400">Funding Projects</div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-white mb-2">
              {projects.filter((p) => p.type === "mentorship").length}
            </div>
            <div className="text-gray-400">Mentorship Projects</div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-white mb-2">
              {categories.length - 1}
            </div>
            <div className="text-gray-400">Categories</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-white mb-2 font-medium">
                Search Projects
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, description, or tech stack..."
                  className="w-full p-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-lg"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-white mb-2 font-medium">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-lg"
              >
                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                    className="bg-gray-800"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-white mb-2 font-medium">
                Project Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-lg"
              >
                {types.map((type) => (
                  <option key={type} value={type} className="bg-gray-800">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-white mb-2 font-medium">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-lg"
              >
                <option value="newest" className="bg-gray-800">
                  Newest First
                </option>
                <option value="oldest" className="bg-gray-800">
                  Oldest First
                </option>
                <option value="title" className="bg-gray-800">
                  Title A-Z
                </option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchQuery ||
            selectedCategory !== "all" ||
            selectedType !== "all" ||
            sortBy !== "newest") && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-purple-300 hover:text-purple-200 transition-colors flex items-center"
              >
                Clear All Filters
                <span className="ml-2">×</span>
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-300">
            Showing{" "}
            <span className="text-white font-semibold">
              {filteredProjects.length}
            </span>{" "}
            of{" "}
            <span className="text-white font-semibold">{projects.length}</span>{" "}
            projects
          </p>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white/5 rounded-2xl p-6 animate-pulse border border-white/10"
              >
                <div className="h-6 bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-lg">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              No Projects Found
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {projects.length === 0
                ? "No projects have been submitted yet. Be the first to share your idea!"
                : "No projects match your current filters. Try adjusting your search criteria."}
            </p>
            {projects.length === 0 ? (
              <Link
                to="/submit"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white hover:from-purple-700 hover:to-pink-700 transition"
              >
                Submit First Project
              </Link>
            ) : (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-6 py-3 border border-purple-400/50 text-purple-300 rounded-xl font-semibold hover:bg-purple-500/10 hover:border-purple-300 transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((proj) => (
                <Link
                  to={`/project/${proj._id}`}
                  key={proj._id}
                  className="group"
                >
                  <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10 overflow-hidden h-full flex flex-col">
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all duration-500"></div>

                    {/* Project Type Badge */}
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          proj.type === "funding"
                            ? "bg-green-500/20 text-green-300 border border-green-500/30"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        }`}
                      >
                        {proj.type === "funding"
                          ? "💰 Funding"
                          : "👥 Mentorship"}
                      </span>

                      {proj.type === "funding" && proj.targetAmount && (
                        <span className="text-yellow-400 text-sm font-semibold">
                          NPR {parseInt(proj.targetAmount).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Project Title */}
                    <h3 className="text-xl font-bold text-white mb-3 relative z-10 group-hover:text-purple-300 transition-colors line-clamp-2">
                      {proj.title}
                    </h3>

                    {/* Category */}
                    <div className="mb-4 relative z-10">
                      <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30">
                        {proj.category}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-sm leading-relaxed relative z-10 mb-4 flex-grow line-clamp-3">
                      {proj.description}
                    </p>

                    {/* Tech Stack */}
                    {proj.tech_stack && (
                      <div className="mb-4 relative z-10">
                        <p className="text-gray-400 text-xs font-semibold mb-1">
                          Tech Stack:
                        </p>
                        <p className="text-gray-300 text-sm line-clamp-2">
                          {proj.tech_stack}
                        </p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/10 relative z-10">
                      <span className="text-gray-400 text-sm">
                        {new Date(proj.createdAt).toLocaleDateString()}
                      </span>
                      <div className="text-purple-400 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        View Details →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Load More (if needed in future) */}
            {filteredProjects.length > 0 && (
              <div className="text-center mt-12">
                <p className="text-gray-400 mb-4">
                  Showing all {filteredProjects.length} projects
                </p>
                <Link
                  to="/submit"
                  className="inline-flex items-center px-6 py-3 border border-purple-400/50 text-purple-300 rounded-xl font-semibold hover:bg-purple-500/10 hover:border-purple-300 transition-all duration-300"
                >
                  Submit Your Project
                  <span className="ml-2">🚀</span>
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add CSS for line clamp utility */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Projects;
