import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Search as SearchIcon, ArrowUpRight, Layers, Cpu, ArrowLeft } from "lucide-react";

const Search = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const location = useLocation();
  const APIURL = import.meta.env.VITE_APP_URL;
  const query = new URLSearchParams(location.search).get("q");

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      try {
        setLoading(true);
        const res = await axios.get(`${APIURL}/api/v1/projects/search?q=${query}`);
        if (res.data.projects.length > 0) {
          setProjects(res.data.projects);
          setMessage("");
        } else {
          setProjects([]);
          setMessage("No matching projects found.");
        }
      } catch (error) {
        toast.error("Error fetching search results.");
        setMessage("Error fetching results. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-base-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          {/* Header skeleton */}
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-base-300 rounded w-24" />
            <div className="h-8 bg-base-300 rounded w-72" />
            <div className="h-4 bg-base-300 rounded w-40" />
          </div>
          {/* Card skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card bg-base-200 border border-base-300 animate-pulse">
                <div className="card-body p-6 gap-4">
                  <div className="h-5 bg-base-300 rounded w-3/4" />
                  <div className="space-y-2">
                    <div className="h-3 bg-base-300 rounded w-full" />
                    <div className="h-3 bg-base-300 rounded w-5/6" />
                    <div className="h-3 bg-base-300 rounded w-4/6" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-base-300 rounded-full w-20" />
                    <div className="h-6 bg-base-300 rounded-full w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">

        {/* ── Header ── */}
        <div className="space-y-4">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-base-content/40 hover:text-primary transition-colors duration-200 uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Projects
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <SearchIcon className="w-4 h-4 text-primary" />
                </div>
                <p className="text-primary text-xs font-bold tracking-widest uppercase">Search Results</p>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Results for{" "}
                <span className="text-primary">"{query}"</span>
              </h1>
            </div>

            {projects.length > 0 && (
              <div className="shrink-0">
                <span className="badge badge-primary badge-lg font-semibold px-4">
                  {projects.length} project{projects.length !== 1 ? "s" : ""} found
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="divider opacity-20" />

        {/* ── Empty / Error state ── */}
        {message ? (
          <div className="card bg-base-200 border border-base-300">
            <div className="card-body p-12 text-center gap-4">
              <div className="p-4 rounded-2xl bg-base-300 w-fit mx-auto">
                <SearchIcon className="w-8 h-8 text-base-content/30" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-lg">No results found</h3>
                <p className="text-base-content/55 text-sm max-w-xs mx-auto">
                  We couldn't find any projects matching <span className="font-semibold">"{query}"</span>. Try a different keyword.
                </p>
              </div>
              <Link to="/projects" className="btn btn-primary btn-sm rounded-xl gap-2 w-fit mx-auto mt-2">
                Browse All Projects
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (

          /* ── Results Grid ── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <Link
                to={`/project/${proj._id}`}
                key={proj._id}
                className="group card bg-base-200 border border-base-300 hover:border-primary/25 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Image */}
                {proj.images?.[0] && (
                  <figure className="relative h-40 bg-base-300 overflow-hidden">
                    <img
                      src={proj.images[0]}
                      alt={proj.title}
                      loading="lazy"
                      style={{ opacity: 0, transition: "opacity 0.5s ease, transform 0.5s ease" }}
                      onLoad={(e) => { e.target.style.opacity = "1"; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="badge badge-primary badge-sm font-semibold uppercase tracking-wider">
                        {proj.category}
                      </span>
                    </div>
                  </figure>
                )}

                <div className="card-body p-6 gap-3">
                  <h3 className="font-bold text-base leading-snug group-hover:text-primary transition-colors duration-200">
                    {proj.title}
                  </h3>

                  <p className="text-base-content/55 text-sm leading-relaxed line-clamp-2">
                    {proj.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.tech_stack && (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-base-300 text-base-content/60 font-medium">
                        <Cpu className="w-3 h-3" />
                        {proj.tech_stack.split(",")[0].trim()}
                        {proj.tech_stack.split(",").length > 1 && ` +${proj.tech_stack.split(",").length - 1}`}
                      </span>
                    )}
                    {!proj.images?.[0] && proj.category && (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                        <Layers className="w-3 h-3" />
                        {proj.category}
                      </span>
                    )}
                  </div>

                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider group-hover:gap-2.5 transition-all duration-200">
                      View Project <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Search;