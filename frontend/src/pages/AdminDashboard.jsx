import React, { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ userCount: 0, projectCount: 0 });
  const [loading, setLoading] = useState(true);
  const [kycList, setKycList] = useState([]);
  const [kycLoading, setKycLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get("/admin/stats");
        if (res?.data?.success) {
          setStats({
            userCount: res.data.userCount || 0,
            projectCount: res.data.projectCount || 0,
          });
        }
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchKyc = async () => {
      setKycLoading(true);
      try {
        const res = await axiosInstance.get("/kyc/all");
        setKycList(res.data || []);
      } catch (err) {
        console.error("Failed to fetch KYC list", err);
      } finally {
        setKycLoading(false);
      }
    };
    fetchKyc();
  }, []);

  const handleVerify = async (id) => {
    setActionLoadingId(id);
    try {
      await axiosInstance.post(`/kyc/verify/${id}`);
      setKycList(prev => prev.map(k => k._id === id ? { ...k, status: 'verified' } : k));
    } catch (err) {
      alert("Failed to verify");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoadingId(id);
    try {
      await axiosInstance.post(`/kyc/reject/${id}`);
      setKycList(prev => prev.map(k => k._id === id ? { ...k, status: 'rejected' } : k));
    } catch (err) {
      alert("Failed to reject");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 text-base-content p-6 pt-24 transition-colors">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        {/* Stats Grid using DaisyUI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="stats shadow bg-base-200 border border-base-300">
            <div className="stat">
              <div className="stat-title text-base-content/70">Total Users</div>
              <div className="stat-value text-primary">{loading ? "..." : stats.userCount}</div>
              <div className="stat-desc text-base-content/50">Registered on platform</div>
            </div>
          </div>
          
          <div className="stats shadow bg-base-200 border border-base-300">
            <div className="stat">
              <div className="stat-title text-base-content/70">Total Projects</div>
              <div className="stat-value text-secondary">{loading ? "..." : stats.projectCount}</div>
              <div className="stat-desc text-base-content/50">Submitted ideas</div>
            </div>
          </div>
        </div>

        {/* KYC Management Table */}
        <div className="card bg-base-200 shadow-xl border border-base-300">
          <div className="card-body">
            <h2 className="card-title mb-4 text-2xl">Identity Verifications</h2>
            {kycLoading ? (
              <div className="flex justify-center p-10">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-base-300 text-base-content">
                      <th>Full Name</th>
                      <th>Email/ID</th>
                      <th>Date Submitted</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kycList.map((k) => (
                      <tr key={k._id} className="hover:bg-base-100/50">
                        <td className="font-medium">{k.fullName}</td>
                        <td className="opacity-70">{k.submittedBy}</td>
                        <td className="text-sm">
                          {new Date(k.submittedAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div className={`badge ${
                            k.status === 'pending' ? 'badge-warning' : 
                            k.status === 'verified' ? 'badge-success' : 'badge-error'
                          }`}>
                            {k.status}
                          </div>
                        </td>
                        <td>
                          {k.status === "pending" && (
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleVerify(k._id)} 
                                disabled={actionLoadingId === k._id}
                                className="btn btn-xs btn-success"
                              >
                                {actionLoadingId === k._id ? "..." : "Verify"}
                              </button>
                              <button 
                                onClick={() => handleReject(k._id)} 
                                disabled={actionLoadingId === k._id}
                                className="btn btn-xs btn-error"
                              >
                                {actionLoadingId === k._id ? "..." : "Reject"}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;