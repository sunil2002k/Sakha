import React, { useEffect, useState } from "react";
import { useParams,useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { axiosInstance } from "../lib/axios";
import { FaFacebook, FaTwitter, FaShare, FaRegCopy } from "react-icons/fa";

const Projectdetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const APIURL = import.meta.env.VITE_APP_URL;

  // Fetch project details
  const fetchProjectDetail = async () => {
    try {
      const res = await axios.get(`${APIURL}/api/v1/projects/${id}`);
      const proj = res.data.project ?? res.data;
      setProject(proj);

      // if addedBy is just an id, fetch user info
      const addedById =
        proj?.addedBy &&
        (typeof proj.addedBy === "string"
          ? proj.addedBy
          : proj.addedBy._id ?? null);
      if (addedById && !proj.addedBy.name && !proj.addedBy.email) {
        try {
          const userRes = await axios.get(
            `${APIURL}/api/v1/users/${addedById}`
          );
          // adjust depending on your getUserById response shape
          const userData =
            userRes.data?.data ?? userRes.data?.user ?? userRes.data;
          setCreator(userData);
        } catch (uErr) {
          console.error("Failed to fetch creator info:", uErr);
        }
      } else if (proj.addedBy && typeof proj.addedBy === "object") {
        // backend populated addedBy already
        setCreator(proj.addedBy);
      }
    } catch (err) {
      console.error("Error fetching project details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetail();
  }, [id]);

  // 🟩 eSewa payment handler
  const handlePayNow = async () => {
    try {
      setPaymentLoading(true);
      const amount = project.targetAmount || 500;
      const projectId = project._id;

      const { data } = await axios.post(
        `${APIURL}/api/v1/payments/initiate-payment`,
        {
          amount,
          projectId,
        }
      );

      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
      form.target = "_blank";

      const formData = {
        amount,
        tax_amount: 0,
        total_amount: amount,
        transaction_uuid: data.transaction_uuid,
        product_code: "EPAYTEST",
        product_service_charge: 0,
        product_delivery_charge: 0,
        // ask backend to redirect to frontend payment-result after verification
        success_url: `${APIURL}/api/v1/payments/complete-payment?redirect=${encodeURIComponent(
          window.location.origin + "/payment-result"
        )}`,
        // optional failure redirect
        failure_url: `${APIURL}/api/v1/payments/complete-payment?redirect=${encodeURIComponent(
          window.location.origin + "/payment-result?status=failed"
        )}`,
        signed_field_names: data.signed_field_names,
        signature: data.signature,
      };

      for (let key in formData) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = formData[key];
        form.appendChild(input);
      }

      document.body.appendChild(form);
      // use same tab so backend can redirect the browser to frontend payment-result
      form.target = "_self";
      form.submit();
      form.remove();
    } catch (error) {
      console.error("Error initiating eSewa payment:", error);
      alert("Failed to start payment. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleStartMentorship = async () => {
        try {
          // check auth via cookie (backend sets jwt cookie)
          await axiosInstance.get("/auth/me");
          // authenticated -> go to chatroom
          navigate(`/chatroom/${id}`);
        } catch (err) {
          console.warn("Auth check failed:", err);
          alert("Please log in to start a mentorship session.");
          navigate("/login");
      }
    };
  // 🕓 Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 text-xl">Loading project details...</p>
        </div>
      </div>
    );
  }

  // ❌ Not found
  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Project Not Found
          </h2>
          <p className="text-gray-400 mb-6">
            The project you're looking for doesn't exist.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white hover:from-purple-700 hover:to-pink-700 transition"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-purple-300 hover:text-purple-200 transition-colors mb-6"
          >
            <span className="mr-2">←</span>
            Back to Projects
          </Link>

          <div className="flex justify-center mb-4">
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                project.type === "funding"
                  ? "bg-green-500/20 text-green-300 border border-green-500/30"
                  : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
              }`}
            >
              {project.type === "funding"
                ? "💰 Funding Project"
                : "👥 Mentorship Project"}
            </span>
          </div>

          {project.images && project.images.length > 0 && (
            <div className="my-8">
              <h3 className="text-xl font-bold text-white mb-4">Gallery</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {project.images.map((imageUrl, index) => (
                  <img
                    key={index}
                    src={imageUrl}
                    alt={`Project image ${index + 1}`}
                    className="w-full h-48 object-cover rounded-xl shadow-lg"
                  />
                ))}
              </div>
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            {project.title}
          </h1>

          <div className="flex flex-wrap justify-center gap-4 text-gray-300">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
              {project.category}
            </span>
            {project.createdAt && (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                Posted {new Date(project.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Project Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Description */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                Project Description
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg">
                {project.description}
              </p>
            </div>

            {/* Expected Outcomes */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                Expected Outcomes
              </h2>
              <p className="text-gray-300 leading-relaxed">
                {project.expected_outcomes}
              </p>
            </div>

            {/* Tech Stack */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                Technology Stack
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.tech_stack?.split(",").map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-2 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30 text-sm backdrop-blur-lg"
                  >
                    {tech.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Action Panel */}
          <div className="space-y-6">
            {/* Project Info Card */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Project Details
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Category</p>
                  <p className="text-white font-semibold">{project.category}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-1">Project Type</p>
                  <p className="text-white font-semibold capitalize">
                    {project.type}
                  </p>
                </div>

                {project.type === "funding" && project.targetAmount && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Funding Goal</p>
                    <p className="text-2xl font-bold text-green-400">
                      NPR {parseInt(project.targetAmount).toLocaleString()}
                    </p>
                  </div>
                )}

                {project.createdAt && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Date Posted</p>
                    <p className="text-white font-semibold">
                      {new Date(project.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}

                {creator && (
                  <div>
                    <p className="text-white font-semibold">Posted By : {creator.name}</p>
                    <p className="text-sm text-gray-300">{creator.email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Take Action</h3>

              <div className="space-y-4">
                {project.type === "funding" && (
                  <button
                    onClick={handlePayNow}
                    disabled={paymentLoading}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                      paymentLoading
                        ? "bg-gray-600 cursor-not-allowed opacity-50"
                        : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25"
                    }`}
                  >
                    {paymentLoading ? (
                      <span className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        💰 Fund This Project
                      </span>
                    )}
                  </button>
                )}

                {project.type === "mentorship" && (
                  <button onClick={handleStartMentorship}
                    className="block w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-bold text-lg text-center hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
                  >
                    <span className="flex items-center justify-center">
                      👥 Start Mentorship Session
                    </span>
                  </button>
                )}

                <Link
                  to="/"
                  className="block w-full py-3 border border-purple-400/50 text-purple-300 rounded-xl font-semibold text-center hover:bg-purple-500/10 hover:border-purple-300 transition-all duration-300"
                >
                  Browse More Projects
                </Link>
              </div>
            </div>

            {/* Share Project */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Share <FaShare />
              </h3>
              <div className="flex space-x-3">
                <button className="flex-1 py-2 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition">
                  <FaTwitter />
                </button>
                <button className="flex-1 py-2 bg-blue-800/20 text-blue-300 border border-blue-700/30 rounded-lg hover:bg-blue-800/30 transition">
                  <FaFacebook />
                </button>
                <button className="flex-1 py-2 bg-gray-800/20 text-gray-300 border border-gray-700/30 rounded-lg hover:bg-gray-800/30 transition">
                  <FaRegCopy />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Projects Suggestion */}
        <div className="mt-12 text-center">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Inspired by this project?
            </h3>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              Submit your own innovative idea and get AI-powered analysis and
              community support.
            </p>
            <Link
              to="/submit"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white hover:from-purple-700 hover:to-pink-700 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
            >
              Submit Your Project
              <span className="ml-2">🚀</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projectdetail;
