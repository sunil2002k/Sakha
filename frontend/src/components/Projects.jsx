import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { 
  Search, 
  Filter, 
  Coins, 
  Users, 
  ArrowRight, 
  LayoutGrid, 
  Layers, 
  XCircle,
  TrendingUp,
  ChevronDown
} from "lucide-react";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const APIURL = import.meta.env.VITE_APP_URL;

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

  const categories = ["all", ...new Set(projects.map((proj) => proj.category).filter(Boolean))];
  const types = ["all", ...new Set(projects.map((proj) => proj.type).filter(Boolean))];

  useEffect(() => {
    let result = projects;

    if (searchQuery) {
      result = result.filter(
        (proj) =>
          proj.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          proj.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          proj.tech_stack?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter((proj) => proj.category === selectedCategory);
    }

    if (selectedType !== "all") {
      result = result.filter((proj) => proj.type === selectedType);
    }

    switch (sortBy) {
      case "newest":
        result = [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        result = [...result].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "title":
        result = [...result].sort((a, b) => a.title?.localeCompare(b.title));
        break;
      default:
        break;
    }

    setFilteredProjects(result);
  }, [projects, searchQuery, selectedCategory, selectedType, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedType("all");
    setSortBy("newest");
  };

  return (
    <div className="min-h-screen bg-base-100 text-base-content pt-24 pb-12 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight uppercase">
            Explore <span className="text-primary underline underline-offset-8 decoration-wavy decoration-2">Projects</span>
          </h1>
          <p className="text-lg opacity-60 max-w-2xl mx-auto font-medium leading-relaxed">
            Discover innovative projects from our community. Find inspiration, 
            collaborate, and support the next generation of builders.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Total Projects", value: projects.length, icon: <LayoutGrid className="size-5" /> },
            { label: "Funding", value: projects.filter(p => p.type === "funding").length, icon: <Coins className="size-5" /> },
            { label: "Mentorship", value: projects.filter(p => p.type === "mentorship").length, icon: <Users className="size-5" /> },
            { label: "Categories", value: categories.length - 1, icon: <Layers className="size-5" /> }
          ].map((stat, i) => (
            <div key={i} className="bg-base-200 border border-base-300 p-6 rounded-3xl text-center flex flex-col items-center group hover:border-primary/40 transition-colors">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl mb-3 group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <div className="text-2xl font-black">{stat.value}</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-50">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-base-200/50 backdrop-blur-md border border-base-300 rounded-[2.5rem] p-8 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-end">
            
            {/* Search */}
            <div className="lg:col-span-2 space-y-2">
              <label className="text-xs font-black uppercase tracking-widest opacity-60 ml-1">Search</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 opacity-40 group-focus-within:text-primary group-focus-within:opacity-100 transition-all" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Title, tech stack, or description..."
                  className="input input-bordered w-full pl-12 rounded-2xl bg-base-100 focus:border-primary transition-all font-medium"
                />
              </div>
            </div>

            {/* Selects */}
            {[
              { label: "Category", val: selectedCategory, set: setSelectedCategory, options: categories },
              { label: "Type", val: selectedType, set: setSelectedType, options: types },
              { label: "Sort By", val: sortBy, set: setSortBy, options: ["newest", "oldest", "title"] }
            ].map((filter, i) => (
              <div key={i} className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest opacity-60 ml-1">{filter.label}</label>
                <select
                  value={filter.val}
                  onChange={(e) => filter.set(e.target.value)}
                  className="select select-bordered w-full rounded-2xl bg-base-100 font-bold text-sm"
                >
                  {filter.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Reset Filters */}
          {(searchQuery || selectedCategory !== "all" || selectedType !== "all" || sortBy !== "newest") && (
            <div className="mt-6 flex justify-end">
              <button onClick={clearFilters} className="btn btn-ghost btn-sm text-error font-black uppercase tracking-tighter hover:bg-error/10">
                <XCircle className="size-4 mr-2" /> Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="mb-8 flex items-center justify-between">
            <h2 className="text-sm font-bold opacity-60">
              Showing <span className="text-base-content">{filteredProjects.length}</span> results
            </h2>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-base-200 h-80 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="card bg-base-200 border-2 border-dashed border-base-300 py-20 text-center rounded-[3rem]">
            <div className="flex flex-col items-center max-w-md mx-auto px-6">
              <div className="w-20 h-20 bg-base-300 rounded-full flex items-center justify-center mb-6">
                <Search className="size-10 opacity-20" />
              </div>
              <h3 className="text-2xl font-black mb-2">No projects match</h3>
              <p className="opacity-60 font-medium mb-8">Try adjusting your filters or search keywords to find what you're looking for.</p>
              <button onClick={clearFilters} className="btn btn-primary rounded-full px-8">Clear Everything</button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((proj) => (
              <Link to={`/project/${proj._id}`} key={proj._id} className="group">
                <div className="card bg-base-100 border border-base-300 h-full hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2 rounded-[2rem] overflow-hidden">
                  <div className="card-body p-8">
                    
                    {/* Badge Row */}
                    <div className="flex justify-between items-start mb-6">
                      <div className={`badge badge-lg gap-2 font-black text-[10px] uppercase tracking-widest py-4 px-4 rounded-xl border-none ${
                        proj.type === 'funding' ? 'bg-success/10 text-success' : 'bg-info/10 text-info'
                      }`}>
                        {proj.type === 'funding' ? <Coins className="size-3" /> : <Users className="size-3" />}
                        {proj.type}
                      </div>
                      
                      {proj.type === "funding" && proj.targetAmount && (
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">Target</p>
                          <p className="font-black text-primary">NPR {parseInt(proj.targetAmount).toLocaleString()}</p>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-black mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                      {proj.title}
                    </h3>
                    
                    <div className="badge badge-outline border-base-300 text-[10px] font-bold uppercase mb-4">
                      {proj.category}
                    </div>

                    <p className="text-sm opacity-60 font-medium line-clamp-3 mb-6 leading-relaxed">
                      {proj.description}
                    </p>

                    {/* Tech Stack */}
                    {proj.tech_stack && (
                      <div className="mb-6 p-3 bg-base-200 rounded-xl">
                        <p className="text-[9px] font-black uppercase opacity-40 tracking-tighter mb-1">Built With</p>
                        <p className="text-xs font-bold truncate opacity-80">{proj.tech_stack}</p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-auto pt-6 border-t border-base-300 flex items-center justify-between">
                      <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                        {new Date(proj.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-tighter text-primary group-hover:gap-4 transition-all">
                        Details <ArrowRight className="size-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {!loading && filteredProjects.length > 0 && (
          <div className="mt-20 text-center bg-primary text-primary-content p-12 rounded-[3rem] shadow-xl shadow-primary/20">
            <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">Have a brilliant idea?</h2>
            <p className="opacity-80 font-medium mb-8 max-w-md mx-auto">Join the hundreds of creators who have launched their projects on Sakha.</p>
            <Link to="/submit" className="btn btn-neutral rounded-full px-12 border-none shadow-lg">
              Submit Your Project <TrendingUp className="size-4 ml-2" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;