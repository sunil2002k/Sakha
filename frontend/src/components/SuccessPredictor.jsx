import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Send, BrainCircuit, X, RotateCcw } from "lucide-react";

const questions = [
  { key: "project_domain", text: "What's your project domain?", placeholder: "e.g. HealthTech, AI, EdTech", type: "text" },
  { key: "institution_type", text: "Institution type?", placeholder: "e.g. Technical, Management", type: "text" },
  { key: "year", text: "Current year?", placeholder: "e.g. 2024", type: "number" },
  { key: "team_size", text: "Total team size?", placeholder: "e.g. 5", type: "number" },
  { key: "avg_team_experience", text: "Average team experience (years)?", placeholder: "e.g. 2", type: "number" },
  { key: "innovation_score", text: "Innovation score (1–5)?", placeholder: "e.g. 4", type: "number" },
  { key: "funding_amount_usd", text: "Funding amount in USD?", placeholder: "e.g. 50000", type: "number" },
  { key: "market_readiness_level", text: "Market readiness level (1–5)?", placeholder: "e.g. 3", type: "number" },
  { key: "competition_awards", text: "Competition awards won?", placeholder: "e.g. 2", type: "number" },
  { key: "business_model_score", text: "Business model score (0.1–1.0)?", placeholder: "e.g. 0.8", type: "number" },
  { key: "technology_maturity", text: "Technology maturity level (1–5)?", placeholder: "e.g. 3", type: "number" },
  { key: "mentorship_support", text: "Mentorship support available?", placeholder: "1 = Yes, 0 = No", type: "number" },
  { key: "incubation_support", text: "Incubation support available?", placeholder: "1 = Yes, 0 = No", type: "number" },
];

const SuccessPredictor = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "👋 Hi! I'm your Startup Analyst. I'll predict your project's success probability using 13 key metrics.\n\nLet's begin — " + questions[0].text },
  ]);
  const [userInput, setUserInput] = useState("");
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !result) inputRef.current?.focus();
  }, [isOpen, step, result]);

  const handleSend = async () => {
    if (!userInput.trim() || loading) return;

    const q = questions[step];
    const value = q.type === "number" ? parseFloat(userInput) : userInput;
    const newMessages = [...messages, { role: "user", text: userInput }];
    const updatedData = { ...formData, [q.key]: value };

    setMessages(newMessages);
    setFormData(updatedData);
    setUserInput("");

    if (step < questions.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: "bot", text: questions[nextStep].text }]);
      }, 350);
    } else {
      await submitToBackend(updatedData);
    }
  };

  const submitToBackend = async (finalData) => {
    setLoading(true);
    setMessages((prev) => [...prev, { role: "bot", text: "Analyzing your data with the Gradient Boosting model…" }]);
    try {
      const response = await axios.post("http://127.0.0.1:5000/predict", finalData);
      const { success_probability, prediction } = response.data;
      setResult({ probability: success_probability, verdict: prediction });
      setMessages((prev) => [...prev, { role: "bot", text: "Analysis complete! Your results are below." }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "bot", text: "⚠️ " + (err.response?.data?.error || "Could not reach the prediction server.") }]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(0);
    setFormData({});
    setUserInput("");
    setResult(null);
    setLoading(false);
    setMessages([
      { role: "bot", text: "👋 Hi! I'm your Startup Analyst. I'll predict your project's success probability using 13 key metrics.\n\nLet's begin — " + questions[0].text },
    ]);
  };

  const progress = Math.round((step / questions.length) * 100);
  const isSuccess = result?.verdict?.toLowerCase().includes("success");
  const probNum = parseFloat(result?.probability) * 100 || 0;

  return (
    <div className="fixed bottom-2 right-6 z-50 flex flex-col items-end gap-3">

      {/* CHAT WINDOW */}
      {isOpen && (
        <div
          className="card w-[360px] sm:w-96 bg-base-100 shadow-2xl border border-base-300 flex flex-col overflow-hidden"
          style={{ height: "450px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-primary text-primary-content shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-white/20">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">Success AI</p>
                <p className="text-primary-content/60 text-xs">Startup Analyst</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                className="btn btn-ghost btn-xs text-primary-content/70 hover:text-primary-content hover:bg-white/10 rounded-lg"
                title="Restart"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-ghost btn-xs text-primary-content/70 hover:text-primary-content hover:bg-white/10 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {!result && (
            <div className="w-full h-0.5 bg-base-300 shrink-0">
              <div
                className="h-0.5 bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Step counter */}
          {!result && (
            <div className="px-5 py-2 flex justify-between items-center shrink-0 border-b border-base-200">
              <span className="text-xs text-base-content/40">
                Question {Math.min(step + 1, questions.length)} of {questions.length}
              </span>
              <span className="text-xs font-semibold text-primary">{progress}%</span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-base-200/40">
            {messages.map((m, i) => (
              <div key={i} className={`flex items-end gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "bot" && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mb-0.5">
                    <BrainCircuit className="w-3 h-3 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    m.role === "user"
                      ? "bg-primary text-primary-content rounded-br-sm"
                      : "bg-base-100 border border-base-300 text-base-content rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {/* Loading dots */}
            {loading && (
              <div className="flex items-end gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <BrainCircuit className="w-3 h-3 text-primary" />
                </div>
                <div className="bg-base-100 border border-base-300 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <span className="loading loading-dots loading-sm text-primary" />
                </div>
              </div>
            )}

            {/* Result card */}
            {result && (
              <div className={`rounded-2xl p-4 border mt-1 ${isSuccess ? "bg-success/10 border-success/25" : "bg-error/10 border-error/25"}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className={`font-bold text-sm ${isSuccess ? "text-success" : "text-error"}`}>
                    {result.verdict}
                  </p>
                  <span className={`badge badge-sm font-semibold ${isSuccess ? "badge-success" : "badge-error"}`}>
                    {isSuccess ? "Promising" : "Needs Work"}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-base-content/50">
                    <span>Success Probability</span>
                    <span className="font-bold text-base-content">{result.probability}</span>
                  </div>
                  <div className="w-full h-1.5 bg-base-300 rounded-full overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-1000 ${isSuccess ? "bg-success" : "bg-error"}`}
                      style={{ width: `${Math.min(probNum, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-4 bg-base-100 border-t border-base-300 shrink-0">
            {!result ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type={questions[step]?.type || "text"}
                    className="input input-bordered input-sm flex-1 rounded-xl bg-base-200 focus:border-primary focus:outline-none text-sm"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder={questions[step]?.placeholder || "Your answer…"}
                    disabled={loading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={loading || !userInput.trim()}
                    className="btn btn-primary btn-sm rounded-xl px-3 hover:scale-105 transition-all duration-150 disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-base-content/30 text-center">
                  Press <kbd className="kbd kbd-xs">Enter</kbd> to continue
                </p>
              </div>
            ) : (
              <button
                onClick={handleReset}
                className="btn btn-outline btn-sm w-full rounded-xl gap-2 hover:scale-[1.01] transition-all duration-150"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Start New Analysis
              </button>
            )}
          </div>
        </div>
      )}

      {/* FAB BUTTON */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`btn btn-primary btn-circle shadow-xl shadow-primary/30 hover:scale-110 transition-all duration-200 ${
          isOpen ? "btn-md" : "btn-lg"
        }`}
        title="Success Predictor"
      >
        {isOpen ? <X className="w-5 h-5" /> : <BrainCircuit className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default SuccessPredictor;