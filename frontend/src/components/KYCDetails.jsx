import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const KYCDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [kyc, setKyc] = useState(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKycDetails = async () => {
      try {
        const res = await axiosInstance.get("/kyc/all");
        const found = res.data.find((item) => item._id === id);
        setKyc(found);
      } catch (err) {
        toast.error("Error fetching details");
      } finally {
        setLoading(false);
      }
    };
    fetchKycDetails();
  }, [id]);

// Inside KYCDetails.jsx
const handleStatusUpdate = async (type) => {
  try {
    const endpoint = type === "verify" ? `/kyc/${id}/verify` : `/kyc/${id}/reject`;
    
  
    await axiosInstance.put(endpoint, { reason: reason || "" }); 
    
    toast.success(`User notified successfully`);
    navigate("/admin/dashboard");
  } catch (err) {
    toast.error("Failed to update status");
  }
};

  if (loading) return <div className="p-10 text-center"><span className="loading loading-spinner"></span></div>;

  return (
    <div className="max-w-4xl mx-auto p-6 pt-24">
      <div className="bg-base-200 p-8 rounded-box shadow-xl border border-base-300">
        <h2 className="text-2xl font-bold mb-6">Review KYC: {kyc?.fullName}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <p><strong>Address:</strong> {kyc?.address}</p>
            <p><strong>DOB:</strong> {new Date(kyc?.dob).toLocaleDateString()}</p>
            <p><strong>User ID:</strong> {kyc?.submittedBy}</p>
          </div>
          
          <div className="space-y-4">
            <label className="label font-bold">ID Card Document</label>
            <img src={kyc?.idCardUrl} alt="ID Card" className="rounded-lg shadow-md w-full" />
            <label className="label font-bold">Selfie Verification</label>
            <img src={kyc?.selfieUrl} alt="Selfie" className="rounded-lg shadow-md w-full" />
          </div>
        </div>

        {kyc?.status === "pending" && (
          <div className="mt-10 p-6 bg-base-300 rounded-xl">
            <label className="label">Add a reason or message for the user:</label>
            <textarea 
              className="textarea textarea-bordered w-full" 
              placeholder="e.g. Please re-upload your ID, it was blurry."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex gap-4 mt-4">
              <button onClick={() => handleStatusUpdate("verify")} className="btn btn-success flex-1">Approve</button>
              <button onClick={() => handleStatusUpdate("reject")} className="btn btn-error flex-1">Reject</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KYCDetails;