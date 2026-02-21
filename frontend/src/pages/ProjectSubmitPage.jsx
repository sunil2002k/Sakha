import React, { useState, useRef } from "react";
import axios from "axios";
import { axiosInstance } from "../lib/axios.js";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Sparkles,
  FileText,
  Target,
  ImagePlus,
  Rocket,
  Users,
  ChevronRight,
  CheckCircle,
  Loader2,
  BrainCircuit,
  Lightbulb,
  HandCoins,
} from "lucide-react";

const STEPS = ["Project Info", "Details", "Type & Goals", "Media"];

const ProjectSubmitPage = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const isSubmittingRef = useRef(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    tech_stack: "",
    category: "",
    expected_outcomes: "",
    type: "",
    targetAmount: "",
    problem: "",
  });

  const APIURL = import.meta.env.VITE_APP_URL;

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    setPdfFile(file);
    setAnalyzed(false);
    if (file?.type === "application/pdf") setPdfUrl(URL.createObjectURL(file));
    else setPdfUrl(null);
  };

  const analyzePdf = async (e) => {
    e.preventDefault();
    if (!pdfFile) return;
    setAnalyzing(true);
    const fd = new FormData();
    fd.append("file", pdfFile);
    try {
      const res = await axios.post(`http://127.0.0.1:5000/analyze-pdf`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = res.data;
      setForm((prev) => ({
        ...prev,
        title: data.title || "",
        description: data.description || "",
        tech_stack: data.tech_stack || "",
        category: data.category || "",
        expected_outcomes: data.expected_outcomes || "",
      }));
      setAnalyzed(true);
      toast.success("PDF analyzed! Form fields have been filled.");
    } catch {
      toast.error("Failed to analyze PDF. Please fill the form manually.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
    setPreviewUrls(selected.map((f) => URL.createObjectURL(f)));
  };

  // ── Fix 1: each step validates only its own fields ──
  const stepValid = (s = step) => {
    if (s === 0) return form.title.trim() && form.category.trim() && form.tech_stack.trim();
    if (s === 1) return form.description.trim() && form.expected_outcomes.trim();
    if (s === 2) {
      if (!form.type) return false;
      if (form.type === "funding") return !!form.targetAmount;
      if (form.type === "mentorship") return !!form.problem.trim();
      return false;
    }
    if (s === 3) return true; // images optional
    return true;
  };

  // ── Fix 2: Next button uses type="button" — never triggers form submit ──
  const goNext = () => {
    if (stepValid()) setStep((s) => s + 1);
  };

  const goBack = () => setStep((s) => s - 1);

  // ── Fix 3: submit only called explicitly from the final step button ──
  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setLoading(true);

    const formDataToSubmit = new FormData();
    Object.keys(form).forEach((key) => {
      formDataToSubmit.append(key, form[key]);
    });
    // Fix 4: append each image file individually with key "images"
    files.forEach((image) => {
      formDataToSubmit.append("images", image);
    });

    try {
      const res = await axiosInstance.post("/projects/create-project", formDataToSubmit);
      toast.success("Project submitted successfully!");
      navigate(`/project/${res.data.project._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

        <div className="text-center space-y-4 pt-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-semibold tracking-widest uppercase">
            <Rocket className="w-3 h-3" />
            Submit Your Project
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Share Your <span className="text-primary">Idea</span>
          </h1>
          <p className="text-base-content/55 text-lg max-w-xl mx-auto">
            Upload a PDF and let AI fill the form, or fill it manually.
          </p>
        </div>

        {/* ── AI PDF Analyzer ── */}
        <div className="card bg-base-200 border border-base-300 overflow-hidden">
          <div className="card-body p-0">
            <div className="flex items-center gap-3 px-7 py-5 border-b border-base-300">
              <div className="p-2 rounded-xl bg-primary/10">
                <BrainCircuit className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-sm">AI-Powered Analysis</p>
                <p className="text-xs text-base-content/50">Upload your project PDF and auto-fill the form instantly</p>
              </div>
              {analyzed && (
                <span className="ml-auto badge badge-success badge-sm gap-1 font-semibold">
                  <CheckCircle className="w-3 h-3" /> Analyzed
                </span>
              )}
            </div>
            <div className="px-7 py-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <label className="flex-1 group cursor-pointer">
                  <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 border-dashed transition-all duration-200 ${
                    pdfFile ? "border-primary/40 bg-primary/5" : "border-base-300 hover:border-primary/30 hover:bg-base-300/50"
                  }`}>
                    <div className="p-2 rounded-lg bg-base-300 shrink-0">
                      <FileText className={`w-4 h-4 ${pdfFile ? "text-primary" : "text-base-content/40"}`} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${pdfFile ? "text-primary" : "text-base-content/50"}`}>
                        {pdfFile ? pdfFile.name : "Click to upload PDF"}
                      </p>
                      <p className="text-xs text-base-content/35">PDF files only</p>
                    </div>
                  </div>
                  <input type="file" accept=".pdf" onChange={handlePdfChange} className="hidden" />
                </label>
                <button
                  type="button"
                  onClick={analyzePdf}
                  disabled={!pdfFile || analyzing}
                  className="btn btn-primary rounded-xl gap-2 px-6 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 shrink-0"
                >
                  {analyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</> : <><Sparkles className="w-4 h-4" /> Analyze PDF</>}
                </button>
              </div>
              {pdfUrl && (
                <div className="rounded-xl overflow-hidden border border-base-300">
                  <iframe src={pdfUrl} title="PDF Preview" className="w-full h-48" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Step Progress ── */}
        <div className="card bg-base-200 border border-base-300">
          <div className="card-body p-6">
            <div className="flex items-center justify-between gap-2">
              {STEPS.map((label, i) => (
                <React.Fragment key={i}>
                  <button
                    type="button"
                    onClick={() => { if (i < step) setStep(i); }}
                    className={`flex flex-col items-center gap-1.5 flex-1 ${i < step ? "cursor-pointer" : "cursor-default"}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      i < step ? "bg-success text-success-content" : i === step ? "bg-primary text-primary-content shadow-lg shadow-primary/30" : "bg-base-300 text-base-content/30"
                    }`}>
                      {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`text-xs font-semibold hidden sm:block transition-colors duration-200 ${
                      i === step ? "text-primary" : i < step ? "text-success" : "text-base-content/30"
                    }`}>{label}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${i < step ? "bg-success" : "bg-base-300"}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* ── Step Content Card ── */}
        <div className="card bg-base-200 border border-base-300">
          <div className="card-body p-7 sm:p-10 space-y-7">

            {/* STEP 0 */}
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <p className="text-primary text-xs font-bold tracking-widest uppercase mb-1">Step 1</p>
                  <h2 className="text-2xl font-bold">Basic Information</h2>
                  <p className="text-base-content/50 text-sm mt-1">Give your project an identity.</p>
                </div>
                <div className="divider opacity-20 my-2" />
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Project Title <span className="text-error">*</span></label>
                    <input
                      type="text" name="title" placeholder="e.g. EduTrack — AI-Powered Learning Platform"
                      value={form.title} onChange={handleChange}
                      className="input input-bordered w-full bg-base-100 focus:border-primary focus:outline-none rounded-xl"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Category <span className="text-error">*</span></label>
                      <input
                        type="text" name="category" placeholder="e.g. EdTech, HealthTech, AI"
                        value={form.category} onChange={handleChange}
                        className="input input-bordered w-full bg-base-100 focus:border-primary focus:outline-none rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Tech Stack <span className="text-error">*</span></label>
                      <input
                        type="text" name="tech_stack" placeholder="e.g. React, Node.js, MongoDB"
                        value={form.tech_stack} onChange={handleChange}
                        className="input input-bordered w-full bg-base-100 focus:border-primary focus:outline-none rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <p className="text-primary text-xs font-bold tracking-widest uppercase mb-1">Step 2</p>
                  <h2 className="text-2xl font-bold">Project Details</h2>
                  <p className="text-base-content/50 text-sm mt-1">Describe what you're building and why it matters.</p>
                </div>
                <div className="divider opacity-20 my-2" />
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Project Description <span className="text-error">*</span></label>
                    <textarea
                      name="description" placeholder="What it does, who it's for, and what problem it solves..."
                      value={form.description} onChange={handleChange}
                      className="textarea textarea-bordered w-full bg-base-100 focus:border-primary focus:outline-none rounded-xl min-h-[140px] resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Expected Outcomes <span className="text-error">*</span></label>
                    <textarea
                      name="expected_outcomes" placeholder="What will this project achieve? Measurable goals and impact..."
                      value={form.expected_outcomes} onChange={handleChange}
                      className="textarea textarea-bordered w-full bg-base-100 focus:border-primary focus:outline-none rounded-xl min-h-[120px] resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <p className="text-primary text-xs font-bold tracking-widest uppercase mb-1">Step 3</p>
                  <h2 className="text-2xl font-bold">Type & Goals</h2>
                  <p className="text-base-content/50 text-sm mt-1">What kind of support are you looking for?</p>
                </div>
                <div className="divider opacity-20 my-2" />
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { value: "mentorship", icon: Users, title: "Mentorship", desc: "Connect with experienced mentors who can guide your project.", color: "secondary" },
                    { value: "funding", icon: HandCoins, title: "Raise Funds", desc: "Raise capital from investors and community supporters.", color: "primary" },
                  ].map(({ value, icon: Icon, title, desc, color }) => (
                    <label key={value} className={`cursor-pointer card border-2 transition-all duration-200 ${
                      form.type === value ? `border-${color} bg-${color}/5` : "border-base-300 bg-base-100 hover:border-base-content/20"
                    }`}>
                      <div className="card-body p-5 gap-3">
                        <div className="flex items-start justify-between">
                          <div className={`p-2.5 rounded-xl bg-${color}/10`}>
                            <Icon className={`w-5 h-5 text-${color}`} />
                          </div>
                          <input
                            type="radio" name="type" value={value}
                            checked={form.type === value} onChange={handleChange}
                            className={`radio radio-${color} mt-0.5`}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{title}</p>
                          <p className="text-xs text-base-content/50 mt-0.5 leading-relaxed">{desc}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {form.type === "funding" && (
                  <div className="card bg-base-100 border border-primary/20 rounded-xl">
                    <div className="card-body p-6 gap-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-primary" />
                        <p className="font-semibold text-sm">Funding Goal</p>
                      </div>
                      <label className="block text-xs text-base-content/50 mb-1">Target Amount (NPR) <span className="text-error">*</span></label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-base-content/40">NPR</span>
                        <input
                          type="number" name="targetAmount" value={form.targetAmount}
                          onChange={handleChange} placeholder="e.g. 100000"
                          className="input input-bordered w-full bg-base-200 pl-14 focus:border-primary focus:outline-none rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {form.type === "mentorship" && (
                  <div className="card bg-base-100 border border-secondary/20 rounded-xl">
                    <div className="card-body p-6 gap-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Lightbulb className="w-4 h-4 text-secondary" />
                        <p className="font-semibold text-sm">Problem Statement</p>
                      </div>
                      <label className="block text-xs text-base-content/50 mb-1">What challenges do you need help with? <span className="text-error">*</span></label>
                      <textarea
                        name="problem" value={form.problem} onChange={handleChange}
                        placeholder="Describe challenges and what expertise would help most..."
                        className="textarea textarea-bordered w-full bg-base-200 focus:border-secondary focus:outline-none rounded-xl min-h-[120px] resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <p className="text-primary text-xs font-bold tracking-widest uppercase mb-1">Step 4</p>
                  <h2 className="text-2xl font-bold">Project Media</h2>
                  <p className="text-base-content/50 text-sm mt-1">Add images to make your project stand out. (Optional)</p>
                </div>
                <div className="divider opacity-20 my-2" />

                {/* Upload zone — plain label, no nested form */}
                <label className="group cursor-pointer block">
                  <div className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 ${
                    files.length > 0 ? "border-primary/40 bg-primary/5" : "border-base-300 hover:border-primary/30 hover:bg-base-300/30"
                  }`}>
                    <div className="flex flex-col items-center gap-3">
                      <div className={`p-4 rounded-2xl ${files.length > 0 ? "bg-primary/10" : "bg-base-300"}`}>
                        <ImagePlus className={`w-7 h-7 ${files.length > 0 ? "text-primary" : "text-base-content/30"}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {files.length > 0 ? `${files.length} image${files.length > 1 ? "s" : ""} selected` : "Click to upload images"}
                        </p>
                        <p className="text-xs text-base-content/40 mt-0.5">PNG, JPG, WEBP — multiple allowed</p>
                      </div>
                    </div>
                  </div>
                  {/* Fix: input is OUTSIDE any form tag so it won't interfere */}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {/* Image previews */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {previewUrls.map((url, i) => (
                      <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-base-300 bg-base-300">
                        <img src={url} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Review summary */}
                <div className="card bg-base-100 border border-base-300 rounded-xl">
                  <div className="card-body p-5 gap-3">
                    <p className="text-xs font-bold text-base-content/50 uppercase tracking-wider">Review Summary</p>
                    <div className="space-y-2 text-sm">
                      {[
                        { label: "Title", value: form.title },
                        { label: "Category", value: form.category },
                        { label: "Tech Stack", value: form.tech_stack },
                        { label: "Type", value: form.type },
                        form.type === "funding" && { label: "Target", value: `NPR ${parseInt(form.targetAmount || 0).toLocaleString()}` },
                        { label: "Images", value: `${files.length} uploaded` },
                      ].filter(Boolean).map(({ label, value }) => (
                        <div key={label} className="flex justify-between gap-4">
                          <span className="text-base-content/50">{label}</span>
                          <span className="font-semibold text-right truncate max-w-[60%] capitalize">{value || "—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Navigation buttons — ALL type="button" except final submit ── */}
            <div className="flex gap-3 pt-2">
              {step > 0 && (
                <button type="button" onClick={goBack} className="btn btn-ghost rounded-xl px-8">
                  Back
                </button>
              )}
              <div className="flex-1" />
              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!stepValid()}
                  className="btn btn-primary rounded-xl gap-2 px-8 hover:scale-[1.02] transition-all duration-200 disabled:opacity-40"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn btn-primary rounded-xl gap-2 px-8 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all duration-200"
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><Rocket className="w-4 h-4" /> Submit Project</>}
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSubmitPage;