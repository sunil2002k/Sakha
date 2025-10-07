import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";



const IdeaAnalyzer = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Unified form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tech_stack: "",
    category: "",
    expected_outcomes: "",
    type: "mentorship",
    targetAmount: "",
  });

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
        `${process.env.VITE_APP_URL}/analyze-pdf`,
        formDataPdf,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const data = res.data;
      setFormData((prev) => ({
        ...prev,
        title: data.title || "",
        description: data.description || "",
        tech_stack: data.tech_stack || "",
        category: data.category || "",
        expected_outcomes: data.expected_outcomes || "",
      }));
    } catch (err) {
      // Optionally handle error
      console.error(err);
      
    }
    setLoading(false);
  };

  // Handle manual form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit form
const handleProjectSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post(
      "http://localhost:5500/api/v1/projects/create-project",
      formData
    );
    alert("Project submitted successfully!");
    setFormData({
      title: "",
      description: "",
      tech_stack: "",
      category: "",
      expected_outcomes: "",
      type: "mentorship",
      targetAmount: "",
    });
    setPdfFile(null);
    setPdfUrl(null);
    navigate('/');
  } catch (err) {
    alert(
      err.response?.data?.message ||
        "Failed to submit project. Please try again."
    );
  }
};

  return (
    <div className="p-8  max-w-4xl mx-auto ">
      <h2 className="text-3xl font-bold mb-6 text-center text-white drop-shadow">
        Showcase your project
      </h2>

      {/* Single Project Upload + PDF Form */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-8 mb-10">
        <h3 className="text-xl font-semibold mb-4 text-white">
          Upload Your Project or Analyze PDF
        </h3>
        <form onSubmit={handleProjectSubmit} className="space-y-4">
          <div>
            <label
              className="block text-white mb-1 font-medium"
              htmlFor="pdfFile"
            >
              Upload PDF
            </label>
            <input
              id="pdfFile"
              type="file"
              accept=".pdf"
              onChange={handlePdfChange}
              className="block text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            <button
              type="button"
              onClick={analyzePdf}
              disabled={!pdfFile || loading}
              className={`mt-2 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition ${
                !pdfFile || loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Analyzing..." : "Analyze PDF"}
            </button>
          </div>

          <div>
            <label
              className="block text-white mb-1 font-medium"
              htmlFor="title"
            >
              Project Title
            </label>
            <input
              id="title"
              type="text"
              name="title"
              placeholder="Project Title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label
              className="block text-white mb-1 font-medium"
              htmlFor="tech_stack"
            >
              Tech Stack
            </label>
            <input
              id="tech_stack"
              type="text"
              name="tech_stack"
              placeholder="Tech Stack"
              value={formData.tech_stack}
              onChange={handleChange}
              className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label
              className="block text-white mb-1 font-medium"
              htmlFor="category"
            >
              Category
            </label>
            <input
              id="category"
              type="text"
              name="category"
              placeholder="Category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label
              className="block text-white mb-1 font-medium"
              htmlFor="description"
            >
              Project Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Project Description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400"
              rows="4"
              required
            />
          </div>

          <div>
            <label
              className="block text-white mb-1 font-medium"
              htmlFor="expected_outcomes"
            >
              Expected Outcomes
            </label>
            <textarea
              id="expected_outcomes"
              name="expected_outcomes"
              placeholder="Expected Outcomes"
              value={formData.expected_outcomes}
              onChange={handleChange}
              className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400"
              rows="4"
              required
            />
          </div>

          <div className="text-white">
            <span className="block mb-1 font-medium">Project Type</span>
            <label className="mr-4">
              <input
                type="radio"
                name="type"
                value="mentorship"
                checked={formData.type === "mentorship"}
                onChange={handleChange}
                className="accent-purple-500"
              />{" "}
              Mentorship Only
            </label>
            <label>
              <input
                type="radio"
                name="type"
                value="funding"
                checked={formData.type === "funding"}
                onChange={handleChange}
                className="accent-purple-500"
              />{" "}
              Raise Fund
            </label>
          </div>

          {formData.type === "funding" && (
            <div>
              <label
                className="block text-white mb-1 font-medium"
                htmlFor="targetAmount"
              >
                Target Amount (in NPR)
              </label>
              <input
                id="targetAmount"
                type="number"
                name="targetAmount"
                placeholder="Target Amount (in NPR)"
                value={formData.targetAmount}
                onChange={handleChange}
                className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-semibold transition"
          >
            Submit Project
          </button>
        </form>

        {/* PDF Preview */}
        {pdfUrl && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2 text-white">PDF Preview:</h4>
            <iframe
              src={pdfUrl}
              title="PDF Preview"
              width="100%"
              height="500px"
              className="border border-white/20 rounded bg-black/30"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeaAnalyzer;
