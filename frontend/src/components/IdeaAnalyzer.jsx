import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

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
      toast.error(err);
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
      toast.error("Please login to submit a project.");
      setLoading(false);
      isSubmittingRef.current = false;
      navigate("/login");
      return;
    }

    const API_ENDPOINT = `${APIURL}/api/v1/projects/create-project`;

    const formDataToSubmit = new FormData();
    Object.keys(form).forEach((key) => {
      if (key !== "images" && key !== "pdfFile") {
        formDataToSubmit.append(key, form[key]);
      }
    });

    files.forEach((image) => {
      formDataToSubmit.append("images", image);
    });

    try {
      const res = await axios.post(API_ENDPOINT, formDataToSubmit, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Project submitted successfully!");
      navigate(`/project/${res.data.project._id}`);
    } catch (error) {
      toast.error("Submission error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-base-100 pt-20 pb-12 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-base-content">
            Submit Your <span className="text-primary">Project</span>
          </h1>
          <p className="text-lg md:text-xl text-base-content/70 max-w-2xl mx-auto">
            Upload your project PDF for AI analysis or fill out the form
            manually to showcase your innovative idea
          </p>
        </div>

        {/* Main Form Container */}
        <div className="card bg-base-200 shadow-xl p-6 md:p-8 mb-8 border border-base-300">
          {/* PDF Upload Section */}
          <div className="mb-8 p-6 bg-base-300/50 rounded-xl border border-base-300">
            <h3 className="text-2xl font-bold mb-4 text-base-content flex items-center">
              <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
              AI-Powered PDF Analysis
            </h3>
            <p className="text-base-content/70 mb-4">
              Upload your project PDF and let our AI automatically analyze and
              fill the form for you
            </p>

            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
              <div className="flex-1 w-full">
                <label className="label text-base-content font-medium" htmlFor="pdfFile">
                  Upload Project PDF
                </label>
                <input
                  id="pdfFile"
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfChange}
                  className="file-input file-input-bordered file-input-primary w-full bg-base-100"
                />
              </div>

              <button
                type="button"
                onClick={analyzePdf}
                disabled={!pdfFile || loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Analyze PDF"
                )}
              </button>
            </div>
          </div>

          {/* Project Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Project Title */}
              <div className="md:col-span-2">
                <label className="label text-base-content font-medium" htmlFor="title">
                  Project Title *
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  placeholder="Enter your project title"
                  value={form.title}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-base-100 text-base-content"
                  required
                />
              </div>

              {/* Tech Stack */}
              <div>
                <label className="label text-base-content font-medium" htmlFor="tech_stack">
                  Tech Stack *
                </label>
                <input
                  id="tech_stack"
                  type="text"
                  name="tech_stack"
                  placeholder="e.g., React, Node.js"
                  value={form.tech_stack}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-base-100 text-base-content"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="label text-base-content font-medium" htmlFor="category">
                  Category *
                </label>
                <input
                  id="category"
                  type="text"
                  name="category"
                  placeholder="e.g., AI, Web"
                  value={form.category}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-base-100 text-base-content"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="label text-base-content font-medium" htmlFor="description">
                  Project Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe your project..."
                  value={form.description}
                  onChange={handleChange}
                  className="textarea textarea-bordered w-full bg-base-100 text-base-content min-h-[120px]"
                  required
                />
              </div>

              {/* Expected Outcomes */}
              <div className="md:col-span-2">
                <label className="label text-base-content font-medium" htmlFor="expected_outcomes">
                  Expected Outcomes *
                </label>
                <textarea
                  id="expected_outcomes"
                  name="expected_outcomes"
                  placeholder="Expected achievements..."
                  value={form.expected_outcomes}
                  onChange={handleChange}
                  className="textarea textarea-bordered w-full bg-base-100 text-base-content min-h-[120px]"
                  required
                />
              </div>

              {/* Images */}
              <div className="md:col-span-2">
                <label className="label text-base-content font-medium" htmlFor="images">
                  Project Images
                </label>
                <input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input file-input-bordered w-full bg-base-100"
                />
              </div>
            </div>

            {/* Project Type */}
            <div className="bg-base-300/30 rounded-xl p-6 border border-base-300">
              <span className="block text-base-content mb-3 font-medium">Project Type *</span>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center space-x-3 p-4 bg-base-100 rounded-lg border border-base-300 cursor-pointer flex-1 hover:bg-base-300/50 transition-colors">
                  <input
                    type="radio"
                    name="type"
                    value="mentorship"
                    checked={form.type === "mentorship"}
                    onChange={handleChange}
                    className="radio radio-primary"
                  />
                  <span className="text-base-content font-medium">Mentorship Only</span>
                </label>

                <label className="flex items-center space-x-3 p-4 bg-base-100 rounded-lg border border-base-300 cursor-pointer flex-1 hover:bg-base-300/50 transition-colors">
                  <input
                    type="radio"
                    name="type"
                    value="funding"
                    checked={form.type === "funding"}
                    onChange={handleChange}
                    className="radio radio-primary"
                  />
                  <span className="text-base-content font-medium">Raise Funds</span>
                </label>
              </div>
            </div>

            {/* Funding Amount */}
            {form.type === "funding" && (
              <div className="bg-base-300/30 rounded-xl p-6 border border-base-300 animate-in fade-in slide-in-from-top-2">
                <label className="label text-base-content font-medium" htmlFor="targetAmount">
                  Target Funding Amount (NPR) *
                </label>
                <input
                  id="targetAmount"
                  type="number"
                  name="targetAmount"
                  value={form.targetAmount}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-base-100 text-base-content"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block text-lg"
            >
              {loading ? "Submitting..." : "Submit Project 🚀"}
            </button>
          </form>
        </div>

        {/* PDF Preview */}
        {pdfUrl && (
          <div className="card bg-base-200 shadow-xl p-6 border border-base-300">
            <h4 className="text-xl font-bold mb-4 text-base-content">PDF Preview</h4>
            <div className="rounded-xl overflow-hidden border border-base-300">
              <iframe src={pdfUrl} title="PDF Preview" width="100%" height="500px" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeaAnalyzer;