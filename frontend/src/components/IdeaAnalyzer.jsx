import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const IdeaAnalyzer = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [fileNames, setFileNames] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const isSubmittingRef = useRef(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    tech_stack: "",
    category: "",
    expected_outcomes: "",
    type: "",
    targetAmount: "",
  });
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();

  const APIURL = import.meta.env.VITE_APP_URL;

  // PDF upload
  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    setPdfFile(file);
    if (file && file.type === "application/pdf") {
      setPdfUrl(URL.createObjectURL(file));
    } else {
      setPdfUrl(null);
    }
  };

  // Analyze PDF and fill form
  const analyzePdf = async (e) => {
    e.preventDefault();
    if (!pdfFile) return;
    setLoading(true);
    const formDataPdf = new FormData();
    formDataPdf.append("file", pdfFile);

    try {
      const res = await axios.post(
        `http://127.0.0.1:5000/analyze-pdf`,
        formDataPdf,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const data = res.data;
      setForm((prev) => ({
        ...prev,
        title: data.title || "",
        description: data.description || "",
        tech_stack: data.tech_stack || "",
        category: data.category || "",
        expected_outcomes: data.expected_outcomes || "",
      }));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // Handle manual form changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to submit a project.");
      setLoading(false);
      sSubmittingRef.current = false;
      navigate("/login");
      return;
    }

    const API_ENDPOINT = `${APIURL}/api/v1/projects/create-project`;

    // 1. Create FormData object
    const formDataToSubmit = new FormData();

    // Append all text fields
    Object.keys(form).forEach((key) => {
      if (key !== "images" && key !== "pdfFile") {
        formDataToSubmit.append(key, form[key]);
      }
    });

    // 2. Append image files
    files.forEach((image) => {
      formDataToSubmit.append("images", image);
    });

    // // Optional: Append PDF file if needed
    // if (pdfFile) {
    //   formDataToSubmit.append("pdfFile", pdfFile);
    // }

    try {
      // send Authorization header with Bearer token
      const res = await axios.post(API_ENDPOINT, formDataToSubmit, {
        headers: {
          Authorization: `Bearer ${token}`,
          // do not set Content-Type — browser will set multipart boundary automatically
        },
      });

      alert("Project submitted successfully!");
      navigate(`/project/${res.data.project._id}`);
    } catch (error) {
      console.error("Submission error:", error.response?.data || error.message);
      alert(
        error.response?.data?.message ||
          "Submission failed. Check the console for details."
      );
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Submit Your <span className="text-purple-400">Project</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Upload your project PDF for AI analysis or fill out the form
            manually to showcase your innovative idea
          </p>
        </div>

        {/* Main Form Container */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl shadow-purple-500/10 p-6 md:p-8 mb-8">
          {/* PDF Upload Section */}
          <div className="mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-2xl font-bold mb-4 text-white flex items-center">
              <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
              AI-Powered PDF Analysis
            </h3>
            <p className="text-gray-300 mb-4">
              Upload your project PDF and let our AI automatically analyze and
              fill the form for you
            </p>

            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
              <div className="flex-1">
                <label
                  className="block text-white mb-2 font-medium"
                  htmlFor="pdfFile"
                >
                  Upload Project PDF
                </label>
                <input
                  id="pdfFile"
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfChange}
                  className="block w-full text-sm text-gray-300 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-600 file:to-pink-600 file:text-white hover:file:from-purple-700 hover:file:to-pink-700 transition-all duration-300"
                />
              </div>

              <button
                type="button"
                onClick={analyzePdf}
                disabled={!pdfFile || loading}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 backdrop-blur-lg ${
                  !pdfFile || loading
                    ? "bg-gray-600 cursor-not-allowed opacity-50"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Analyzing...
                  </span>
                ) : (
                  "Analyze PDF"
                )}
              </button>
            </div>
          </div>

          {/* Project Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Project Title */}
              <div className="md:col-span-2">
                <label
                  className="block text-white mb-2 font-medium"
                  htmlFor="title"
                >
                  Project Title *
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  placeholder="Enter your project title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full p-4 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-lg transition-all duration-300"
                  required
                />
              </div>

              {/* Tech Stack */}
              <div>
                <label
                  className="block text-white mb-2 font-medium"
                  htmlFor="tech_stack"
                >
                  Tech Stack *
                </label>
                <input
                  id="tech_stack"
                  type="text"
                  name="tech_stack"
                  placeholder="e.g., React, Node.js, MongoDB"
                  value={form.tech_stack}
                  onChange={handleChange}
                  className="w-full p-4 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-lg transition-all duration-300"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label
                  className="block text-white mb-2 font-medium"
                  htmlFor="category"
                >
                  Category *
                </label>
                <input
                  id="category"
                  type="text"
                  name="category"
                  placeholder="e.g., Web Development, AI, Blockchain"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full p-4 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-lg transition-all duration-300"
                  required
                />
              </div>

              {/* Project Description */}
              <div className="md:col-span-2">
                <label
                  className="block text-white mb-2 font-medium"
                  htmlFor="description"
                >
                  Project Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe your project in detail..."
                  value={form.description}
                  onChange={handleChange}
                  className="w-full p-4 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-lg transition-all duration-300 resize-vertical min-h-[120px]"
                  rows="4"
                  required
                />
              </div>

              {/* Expected Outcomes */}
              <div className="md:col-span-2">
                <label
                  className="block text-white mb-2 font-medium"
                  htmlFor="expected_outcomes"
                >
                  Expected Outcomes *
                </label>
                <textarea
                  id="expected_outcomes"
                  name="expected_outcomes"
                  placeholder="What do you expect to achieve with this project?"
                  value={form.expected_outcomes}
                  onChange={handleChange}
                  className="w-full p-4 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-lg transition-all duration-300 resize-vertical min-h-[120px]"
                  rows="4"
                  required
                />
              </div>

              {/* Images */}
              <div className="mb-6">
                <label
                  htmlFor="images"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Project Images
                </label>
                <input
                  id="images"
                  type="file"
                  multiple // Allows selection of multiple files
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-white bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-3 focus:border-purple-500 focus:ring-purple-500 transition-all duration-300"
                />
                {files.length > 0 && (
                  <p className="text-gray-400 text-sm mt-2">
                    {files.length} file(s) selected.
                  </p>
                )}
              </div>
            </div>

            {/* Project Type */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <span className="block text-white mb-3 font-medium">
                Project Type *
              </span>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer flex-1">
                  <input
                    type="radio"
                    name="type"
                    value="mentorship"
                    checked={form.type === "mentorship"}
                    onChange={handleChange}
                    className="w-4 h-4 text-purple-600 bg-gray-900 border-gray-300 focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-white font-medium">
                      Mentorship Only
                    </span>
                    <p className="text-gray-400 text-sm mt-1">
                      Get guidance and support from experienced mentors
                    </p>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer flex-1">
                  <input
                    type="radio"
                    name="type"
                    value="funding"
                    checked={form.type === "funding"}
                    onChange={handleChange}
                    className="w-4 h-4 text-purple-600 bg-gray-900 border-gray-300 focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-white font-medium">Raise Funds</span>
                    <p className="text-gray-400 text-sm mt-1">
                      Seek financial support for your project
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Funding Amount */}
            {form.type === "funding" && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <label
                  className="block text-white mb-2 font-medium"
                  htmlFor="targetAmount"
                >
                  Target Funding Amount (NPR) *
                </label>
                <input
                  id="targetAmount"
                  type="number"
                  name="targetAmount"
                  placeholder="Enter amount in Nepalese Rupees"
                  value={form.targetAmount}
                  onChange={handleChange}
                  className="w-full p-4 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-lg transition-all duration-300"
                  required
                />
                <p className="text-gray-400 text-sm mt-2">
                  Specify the amount you need to bring your project to life
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 backdrop-blur-lg ${
                loading ? "opacity-60 cursor-not-allowed hover:scale-100 hover:shadow-none" : ""
              }`}
            >
              {loading ? "Submitting..." : "Submit Project 🚀"}
            </button>
          </form>
        </div>

        {/* PDF Preview */}
        {pdfUrl && (
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <h4 className="text-xl font-bold mb-4 text-white flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
              PDF Preview
            </h4>
            <div className="border border-white/10 rounded-xl overflow-hidden">
              <iframe
                src={pdfUrl}
                title="PDF Preview"
                width="100%"
                height="500px"
                className="bg-white"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeaAnalyzer;
