import React, { useState } from "react";
import { ArrowLeft, UploadCloud } from "lucide-react";
import { useNavigate } from "react-router-dom";

const KYCFormPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    address: "",
  });

  const [idCard, setIdCard] = useState(null);
  const [selfie, setSelfie] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleKycSubmit = (e) => {
    e.preventDefault();

    // prepare form data
    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("dob", formData.dob);
    data.append("address", formData.address);
    data.append("idCard", idCard);
    data.append("selfie", selfie);

    // call your backend API here
    console.log("KYC Submitted", data);
  };

  return (
    <div className="min-h-screen flex justify-center px-4 py-10 bg-slate-950 text-white">
      <div className="max-w-xl w-full p-8 border border-slate-800 bg-slate-900/40 rounded-3xl shadow-xl backdrop-blur-xl">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-300 hover:text-white mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>

        <h2 className="text-2xl font-bold mb-3">KYC Verification</h2>
        <p className="text-slate-400 mb-8 text-sm">
          Please provide the following details and documents for identity verification.
        </p>

        <form onSubmit={handleKycSubmit} className="space-y-6">

          {/* Full Name */}
          <div>
            <label className="text-sm text-slate-300">Full Name</label>
            <input
              type="text"
              name="fullName"
              className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          {/* DOB */}
          <div>
            <label className="text-sm text-slate-300">Date of Birth</label>
            <input
              type="date"
              name="dob"
              className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
              value={formData.dob}
              onChange={handleChange}
              required
            />
          </div>

          {/* Address */}
          <div>
            <label className="text-sm text-slate-300">Address</label>
            <textarea
              name="address"
              className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
              placeholder="Enter your full address"
              rows="3"
              value={formData.address}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          {/* ID Card Upload */}
          <div>
            <label className="text-sm text-slate-300">Citizenship / National ID</label>
            <div className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-4 cursor-pointer">
              <label className="flex flex-col items-center justify-center text-center cursor-pointer">
                <UploadCloud className="w-8 h-8 text-purple-400" />
                <span className="mt-2 text-slate-300 text-sm">
                  {idCard ? idCard.name : "Upload ID document"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,application/pdf"
                  onChange={(e) => setIdCard(e.target.files[0])}
                  required
                />
              </label>
            </div>
          </div>

          {/* Selfie Upload */}
          <div>
            <label className="text-sm text-slate-300">Selfie Photo</label>
            <div className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-4 cursor-pointer">
              <label className="flex flex-col items-center justify-center text-center cursor-pointer">
                <UploadCloud className="w-8 h-8 text-purple-400" />
                <span className="mt-2 text-slate-300 text-sm">
                  {selfie ? selfie.name : "Upload a clear selfie"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => setSelfie(e.target.files[0])}
                  required
                />
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-6 rounded-full bg-purple-600 py-3 text-sm font-semibold hover:bg-purple-500 transition-all"
          >
            Submit KYC
          </button>
        </form>
      </div>
    </div>
  );
};

export default KYCFormPage;
