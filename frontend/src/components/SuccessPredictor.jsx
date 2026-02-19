import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Sparkles, Send, RefreshCw, BrainCircuit, X } from "lucide-react";

const SuccessPredictor = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hello! I am your Startup Analyst. Let's calculate your success probability. What is your Project Domain? (e.g., HealthTech, AI)" }
  ]);
  const [userInput, setUserInput] = useState("");
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const scrollRef = useRef(null);

  // Matches the fields your Flask backend expects for 'input_df'
  const questions = [
    { key: 'project_domain', text: "Domain (HealthTech, EdTech, AI...)?", type: 'text' },
    { key: 'institution_type', text: "Institution Type (Technical/Management)?", type: 'text' },
    { key: 'year', text: "What is the current year?", type: 'number' },
    { key: 'team_size', text: "Total team size?", type: 'number' },
    { key: 'avg_team_experience', text: "Average team experience (years)?", type: 'number' },
    { key: 'innovation_score', text: "Innovation Score (1-5)?", type: 'number' },
    { key: 'funding_amount_usd', text: "Funding amount in USD?", type: 'number' },
    { key: 'market_readiness_level', text: "Market Readiness Level (1-5)?", type: 'number' },
    { key: 'competition_awards', text: "Number of awards won?", type: 'number' },
    { key: 'business_model_score', text: "Business Model Score (0.1 to 1.0)?", type: 'number' },
    { key: 'technology_maturity', text: "Technology Maturity Level (1-5)?", type: 'number' },
    { key: 'mentorship_support', text: "Mentorship Support (1 for Yes, 0 for No)?", type: 'number' },
    { key: 'incubation_support', text: "Incubation Support (1 for Yes, 0 for No)?", type: 'number' },
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const currentKey = questions[step].key;
    const value = questions[step].type === 'number' ? parseFloat(userInput) : userInput;
    
    const newMessages = [...messages, { role: "user", text: userInput }];
    setMessages(newMessages);
    
    const updatedData = { ...formData, [currentKey]: value };
    setFormData(updatedData);
    setUserInput("");

    if (step < questions.length - 1) {
      setStep(step + 1);
      setMessages([...newMessages, { role: "bot", text: questions[step + 1].text }]);
    } else {
      submitToBackend(updatedData);
    }
  };

  const submitToBackend = async (finalData) => {
    setLoading(true);
    setMessages(prev => [...prev, { role: "bot", text: "Processing with Gradient Boosting Model... ⚙️" }]);
    
    try {
      const response = await axios.post("http://127.0.0.1:5000/predict", finalData);
      
      const { success_probability, prediction } = response.data;
      setPredictionResult({ probability: success_probability, verdict: prediction });

      setMessages(prev => [...prev, { 
        role: "bot", 
        text: `Results are in! Success Probability: ${success_probability}. Prediction: ${prediction}.` 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "bot", text: "Error: " + (err.response?.data?.error || "Server offline") }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button onClick={() => setIsOpen(true)} className="btn btn-primary btn-circle btn-lg shadow-xl animate-pulse">
          <BrainCircuit size={30} />
        </button>
      ) : (
        <div className="card w-96 bg-base-100 shadow-2xl border border-primary/20 h-[550px] flex flex-col overflow-hidden">
          <div className="bg-primary p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2 font-bold"><Sparkles size={18}/> Success AI</div>
            <button onClick={() => setIsOpen(false)}><X size={20}/></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`chat ${m.role === 'bot' ? 'chat-start' : 'chat-end'}`}>
                <div className={`chat-bubble text-sm ${m.role === 'bot' ? 'bg-white text-black border' : 'chat-bubble-primary'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>

          <div className="p-4 bg-white border-t">
            {!predictionResult ? (
              <div className="flex gap-2">
                <input 
                  className="input input-bordered input-sm flex-1" 
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Your answer..."
                />
                <button onClick={handleSend} disabled={loading} className="btn btn-primary btn-sm">Send</button>
              </div>
            ) : (
              <button onClick={() => window.location.reload()} className="btn btn-outline btn-sm w-full">Restart Analysis</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuccessPredictor;