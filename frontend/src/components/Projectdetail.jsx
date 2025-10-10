import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const Projectdetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProjectDetail = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5500/api/v1/projects/${id}`
      );
      setProject(res.data.project);
      // console.log(res.data.project);
      
    } catch (err) {
      console.error("Error fetching project details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetail();
  }, [id]);

  if (loading) {
    return (
      <p className="text-gray-300 text-center mt-10">
        Loading project details...
      </p>
    );
  }

  if (!project) {
    return (
      <p className="text-gray-400 text-center mt-10">Project not found.</p>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-[80vh] text-white px-6">
      <div className="max-w-3xl w-full bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-lg mt-12">
        <h1 className="text-4xl font-bold text-purple-400 mb-4">
          {project.title}
        </h1>
        <p className="text-gray-300 mb-2">
          <span className="font-semibold">Category:</span> {project.category}
        </p>
        <p className="text-gray-200 mb-4">{project.description}</p>
        <p className="text-gray-200 mb-4">{project.expected_outcomes}</p>
        <p className="text-gray-200 mb-4">{project.targetAmount}</p>
        <p className="text-gray-200 mb-4">{project.tech_stack}</p>
        <p className="text-gray-200 mb-4">{project.type}</p>
        

        {project.createdAt && (
          <p className="text-sm text-gray-400">
            Posted on: {new Date(project.createdAt).toLocaleDateString()}
          </p>
        )}

        <Link
          to="/"
          className="inline-block mt-6 px-6 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Projectdetail;
