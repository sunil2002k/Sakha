import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";


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
        const res = await axios.get(
          `${APIURL}/api/v1/projects/search?q=${query}`
        );
        if (res.data.projects.length > 0) {
          setProjects(res.data.projects);
          setMessage("");
        } else {
          setProjects([]);
          setMessage("No matching projects found.");
        }
      } catch (error) {
        toast.error("Error fetching search results:", error);
        setMessage("Error fetching results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (loading)
    return (
      <div className="text-center text-white mt-20 text-lg">
        Loading results...
      </div>
    );

  return (
    <div className="p-8 max-w-5xl mx-auto text-white">
      <h2 className="text-3xl font-bold mb-6">
        Search Results for: <span className="text-purple-400">{query}</span>
      </h2>

      {message ? (
        <p className="text-gray-300">{message}</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((proj) => (
            <Link to={`/project/${proj._id}`}>
              <div
                key={proj._id}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 shadow-lg hover:shadow-purple-500/20 transition"
              >
                <h3 className="text-xl font-semibold mb-2 text-purple-300">
                  {proj.title}
                </h3>
                <p className="text-sm text-gray-300 line-clamp-3">
                  {proj.description}
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  <strong>Tech Stack:</strong> {proj.tech_stack}
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  <strong>Category:</strong> {proj.category}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
