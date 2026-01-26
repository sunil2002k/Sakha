import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { axiosInstance } from "../lib/axios";
import { 
  FaShare, 
  FaHeart, 
  FaRegHeart, 
  FaArrowLeft, 
  FaLightbulb, 
  FaHandsHelping, 
  FaUsers 
} from "react-icons/fa";
import PaymentProgress from "../components/PaymentProgress";

const ProjectdetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [creator, setCreator] = useState(null);
  const [showCustomAmountInput, setShowCustomAmountInput] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  const [isSaved, setIsSaved] = useState(false);

  const APIURL = import.meta.env.VITE_APP_URL;

  const fetchProjectDetail = async () => {
    try {
      const res = await axios.get(`${APIURL}/api/v1/projects/${id}`);
      const proj = res.data.project ?? res.data;
      setProject(proj);
      
      const addedById = proj?.addedBy && (typeof proj.addedBy === "string" ? proj.addedBy : proj.addedBy._id ?? null);

      if (addedById && !proj.addedBy.name && !proj.addedBy.email) {
        try {
          const userRes = await axios.get(`${APIURL}/api/v1/users/${addedById}`);
          const userData = userRes.data?.data ?? userRes.data?.user ?? userRes.data;
          setCreator(userData);
        } catch (uErr) {
          console.error("Failed to fetch creator info:", uErr);
        }
      } else if (proj.addedBy && typeof proj.addedBy === "object") {
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

  const handlePayNow = async () => {
    try {
      await axiosInstance.get("/auth/me");
      setShowCustomAmountInput(true);
      setCustomAmount(project.targetAmount || 500);  
    } catch (err) {
      alert("Please log in to support this project.");
      navigate("/login");
    }
  };

  const initiatePayment = async (amountToPay) => {
    if (amountToPay <= 0 || isNaN(amountToPay)) return alert("Please enter a valid amount.");
    try {
      const meRes = await axiosInstance.get("/auth/me");
      const fundedBy = meRes.data.user._id;
      setPaymentLoading(true);

      const { data } = await axios.post(`${APIURL}/api/v1/payments/initiate-payment`, {
        amount: amountToPay,
        projectId: project._id,
        fundedBy,
      });

      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
      const formData = {
        amount: amountToPay,
        tax_amount: 0,
        total_amount: amountToPay,
        transaction_uuid: data.transaction_uuid,
        product_code: "EPAYTEST",
        product_service_charge: 0,
        product_delivery_charge: 0,
        success_url: `${APIURL}/api/v1/payments/complete-payment?redirect=${encodeURIComponent(window.location.origin + "/payment-result")}`,
        failure_url: `${APIURL}/api/v1/payments/complete-payment?redirect=${encodeURIComponent(window.location.origin + "/payment-result?status=failed")}`,
        signed_field_names: data.signed_field_names,
        signature: data.signature,
      };

      for (let key in formData) {
        const input = document.createElement("input");
        input.type = "hidden"; input.name = key; input.value = formData[key];
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      alert("Payment failed. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleStartMentorship = async () => {
    try {
      await axiosInstance.get("/auth/me");
      navigate(`/chatroom`);
    } catch (err) {
      alert("Please log in to start a mentorship session.");
      navigate("/login");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
  );

  const isFunding = project.type === "funding";

  return (
    <div className="bg-base-100 text-base-content min-h-screen pb-20 transition-colors duration-300">
      
      {/* Theme-Aware Custom Amount Modal */}
      {showCustomAmountInput && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-base-200 p-8 rounded-[2.5rem] shadow-2xl max-w-md w-full border border-base-300">
            <h3 className="text-2xl font-black mb-2">Back this Project</h3>
            <p className="opacity-70 mb-6 text-sm font-medium">Enter the amount you wish to contribute to {project.title}</p>
            <div className="relative mb-8">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 opacity-50 font-black">NPR</span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="input input-bordered w-full pl-16 pr-6 py-8 text-xl font-black bg-base-100 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCustomAmountInput(false)} className="btn btn-ghost flex-1 rounded-2xl">Cancel</button>
              <button onClick={() => initiatePayment(customAmount)} className="btn btn-primary flex-1 rounded-2xl shadow-lg">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Back Link */}
        <Link to="/projects" className="inline-flex items-center gap-2 text-sm font-black opacity-60 hover:opacity-100 hover:text-primary transition-all mb-8">
          <FaArrowLeft className="w-3 h-3" /> BACK TO DISCOVER
        </Link>

        <div className="grid gap-12 lg:grid-cols-3">
          
          {/* LEFT: Project Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="relative aspect-video overflow-hidden rounded-[3rem] border border-base-300 shadow-xl bg-base-200">
              <img src={project.images?.[0]} alt={project.title} className="h-full w-full object-cover" />
              <div className="absolute left-6 top-6 bg-base-100/90 backdrop-blur px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest text-primary shadow-lg flex items-center gap-2">
                 {isFunding ? <FaLightbulb /> : <FaHandsHelping />}
                 {project.category || project.type}
              </div>
            </div>

            <div>
              <h1 className="text-4xl lg:text-6xl font-black leading-[1.05] tracking-tight">
                {project.title}
              </h1>
              
              <div className="mt-8 flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary text-primary-content flex items-center justify-center font-black shadow-lg text-lg">
                   {creator?.name?.charAt(0) || creator?.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-lg">{creator?.name || creator?.email || "Creator"}</div>
                  <div className="text-xs opacity-50 font-black uppercase tracking-widest">Innovation Lead</div>
                </div>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="mt-12 border-b border-base-300 flex gap-10">
              {["about", "outcomes", "updates"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-5 text-sm font-black uppercase tracking-widest transition-all relative ${
                    activeTab === tab ? "text-primary" : "opacity-40 hover:opacity-100"
                  }`}
                >
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full"></div>}
                </button>
              ))}
            </div>

            <div className="py-6 min-h-[300px]">
              {activeTab === "about" && (
                <div className="prose max-w-none text-base-content">
                  <p className="opacity-80 text-xl leading-[1.8] font-medium">{project.description}</p>
                  <h3 className="text-2xl font-black mt-12 mb-6">Built With</h3>
                  <div className="flex flex-wrap gap-2">
                     {project.tech_stack?.split(',').map((tech, i) => (
                       <span key={i} className="px-5 py-2.5 bg-base-200 border border-base-300 rounded-2xl text-xs font-bold shadow-sm">{tech.trim()}</span>
                     ))}
                  </div>
                </div>
              )}
              {activeTab === "outcomes" && (
                 <p className="opacity-80 text-lg leading-relaxed">{project.expected_outcomes || "The project aims to create a sustainable impact in the local community through technology."}</p>
              )}
              {activeTab === "updates" && <div className="text-center py-20 opacity-30 font-black uppercase tracking-widest text-xs">No updates yet</div>}
            </div>
          </div>

          {/* RIGHT: Sidebar Action Panel */}
          <div className="space-y-6">
            <div className="bg-base-200 rounded-[3rem] border border-base-300 p-10 shadow-2xl sticky top-24">
              
              {isFunding ? (
                <div className="space-y-8">
                  <div>
                    <div className="text-5xl font-black text-primary tracking-tighter">
                      NPR {parseInt(project.targetAmount || 0).toLocaleString()}
                    </div>
                    <p className="opacity-50 text-[10px] mt-2 font-black uppercase tracking-[0.2em]">Goal Amount</p>
                  </div>

                  <PaymentProgress 
                    projectId={project._id} 
                    targetAmount={project.targetAmount} 
                    APIURL={APIURL} 
                  />

                  <div className="grid grid-cols-2 gap-4 border-t border-base-300 pt-8">
                    <div>
                      <div className="text-2xl font-black">412</div>
                      <p className="text-[10px] opacity-50 font-black uppercase tracking-widest">Backers</p>
                    </div>
                    <div>
                      <div className="text-2xl font-black">18</div>
                      <p className="text-[10px] opacity-50 font-black uppercase tracking-widest">Days Left</p>
                    </div>
                  </div>

                  <button 
                    onClick={handlePayNow}
                    disabled={paymentLoading}
                    className="btn btn-primary btn-block btn-lg h-20 rounded-[1.5rem] shadow-xl text-lg font-black"
                  >
                    {paymentLoading ? "PROCESSING..." : "FUND THIS PROJECT"}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="badge badge-primary badge-outline font-black py-3 uppercase tracking-widest">Seeking Expertise</div>
                  <h3 className="text-3xl font-black leading-tight">Join the team as a Mentor</h3>
                  <p className="opacity-70 text-sm leading-relaxed font-medium">This creator is looking for specialized guidance to bring this vision to life.</p>
                  
                  <div className="pt-6 border-t border-base-300 flex items-center gap-4">
                    <div className="h-12 w-12 bg-base-300 rounded-2xl flex items-center justify-center opacity-50 font-bold"><FaUsers /></div>
                    <div>
                      <div className="text-xl font-black">3 Slots</div>
                      <div className="text-[10px] opacity-50 font-black uppercase tracking-widest">Available</div>
                    </div>
                  </div>

                  <button 
                    onClick={handleStartMentorship}
                    className="btn btn-primary btn-block btn-lg h-20 rounded-[1.5rem] shadow-xl text-lg font-black"
                  >
                    START SESSION
                  </button>
                </div>
              )}

              {/* Shared Actions */}
              <div className="mt-8 pt-8 border-t border-base-300 flex gap-3">
                <button 
                  onClick={() => setIsSaved(!isSaved)} 
                  className="btn btn-outline flex-1 rounded-2xl border-base-300 text-[10px] font-black"
                >
                  {isSaved ? <FaHeart className="text-error" /> : <FaRegHeart />} SAVE
                </button>
                <button className="btn btn-outline flex-1 rounded-2xl border-base-300 text-[10px] font-black">
                  <FaShare /> SHARE
                </button>
              </div>
            </div>

            {/* Social Proof / Category Card */}
            <div className="bg-base-200 rounded-[2rem] border border-base-300 p-8 shadow-sm">
               <h4 className="font-black uppercase text-xs tracking-widest mb-4 opacity-50">Project Category</h4>
               <div className="flex items-center gap-4">
                  <div className="p-4 bg-primary/10 text-primary rounded-2xl">
                     {isFunding ? <FaLightbulb size={24}/> : <FaHandsHelping size={24}/>}
                  </div>
                  <div>
                    <div className="font-black text-lg">{project.category || "General"}</div>
                    <div className="text-xs opacity-50 font-medium">Verified Submission</div>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectdetailPage;