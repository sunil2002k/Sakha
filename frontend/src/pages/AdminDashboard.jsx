import React, { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ProjectManager from "../components/ProjectManager";

const StatCard = ({ label, value, loading, icon, badgeClass }) => (
  <div className="card bg-base-200 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
    <div className="card-body p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <div className={`badge badge-lg font-mono text-xs ${badgeClass}`}>
          {loading ? <span className="loading loading-dots loading-xs" /> : value}
        </div>
      </div>
      <p className="text-base-content/50 text-xs uppercase tracking-widest font-medium">{label}</p>
    </div>
  </div>
);

const statusBadge = (status) => {
  const map = {
    pending: "badge-warning",
    verified: "badge-success",
    rejected: "badge-error",
  };
  return (
    <span className={`badge badge-sm gap-1 ${map[status] || "badge-ghost"}`}>
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ userCount: 0, projectCount: 0, kycPending: 0, totalFunded: 0 });
  const [loading, setLoading] = useState(true);
  const [kycList, setKycList] = useState([]);
  const [kycLoading, setKycLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get("/admin/stats");
        if (res?.data?.success) {
          setStats({
            userCount: res.data.userCount || 0,
            projectCount: res.data.projectCount || 0,
            kycPending: res.data.kycPending || 0,
            totalFunded: res.data.totalFunded || 0,
          });
        }
      } catch {
        toast.error("Failed to load admin stats");
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
      } catch {
        toast.error("Failed to fetch KYC list");
      } finally {
        setKycLoading(false);
      }
    };
    fetchKyc();
  }, []);

  const counts = {
    all: kycList.length,
    pending: kycList.filter((k) => k.status === "pending").length,
    verified: kycList.filter((k) => k.status === "verified").length,
    rejected: kycList.filter((k) => k.status === "rejected").length,
  };

  const filteredKyc =
    filter === "all" ? kycList : kycList.filter((k) => k.status === filter);

  return (
    <div className="min-h-screen bg-base-100 text-base-content px-6 pt-8 pb-16">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-1 font-mono">
              Control Center
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 badge badge-outline badge-lg text-success border-success/40 bg-success/5 px-4 py-3">
            <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-mono tracking-widest uppercase">Live</span>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            label="Total Users"
            value={stats.userCount}
            loading={loading}
            icon="👥"
            badgeClass="badge-primary badge-outline"
          />
          <StatCard
            label="Total Projects"
            value={stats.projectCount}
            loading={loading}
            icon="🗂️"
            badgeClass="badge-secondary badge-outline"
          />
          <StatCard
            label="Pending KYC"
            value={stats.kycPending}
            loading={loading}
            icon="⏳"
            badgeClass="badge-warning badge-outline"
          />
          <StatCard
            label="Total Funded"
            value={`NPR ${(stats.totalFunded || 0).toLocaleString()}`}
            loading={loading}
            icon="💰"
            badgeClass="badge-success badge-outline"
          />
        </div>

        {/* Quick action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            {
              title: "User Management",
              desc: "Ban, unban, and change roles",
              path: "/admin/users",
              accent: "border-primary/30 hover:border-primary",
              badge: "badge-primary",
            },
            {
              title: "Analytics",
              desc: "Signups, projects, and funding charts",
              path: "/admin/analytics",
              accent: "border-secondary/30 hover:border-secondary",
              badge: "badge-secondary",
            },
            {
              title: "Transactions",
              desc: "Funding records and refund management",
              path: "/admin/transactions",
              accent: "border-success/30 hover:border-success",
              badge: "badge-success",
            },
          ].map((item) => (
            <button
              key={item.title}
              onClick={() => navigate(item.path)}
              className={`card bg-base-200 border-2 ${item.accent} transition-all text-left shadow-sm hover:shadow-md`}
            >
              <div className="card-body p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-sm">{item.title}</h3>
                  <span className={`badge badge-sm ${item.badge} badge-outline`}>Go →</span>
                </div>
                <p className="text-xs text-base-content/50">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* KYC Table */}
        <div className="card bg-base-200 border border-base-300 shadow-md">
          <div className="card-body p-0">

            {/* Table header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 pt-6 pb-4 border-b border-base-300">
              <div>
                <h2 className="text-xl font-bold">Identity Verifications</h2>
                <p className="text-base-content/40 text-xs font-mono mt-0.5">
                  {counts.all} total submissions
                </p>
              </div>
              <div role="tablist" className="tabs tabs-boxed bg-base-300 p-1">
                {[
                  { key: "all", label: "All" },
                  { key: "pending", label: "Pending" },
                  { key: "verified", label: "Verified" },
                  { key: "rejected", label: "Rejected" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    role="tab"
                    onClick={() => setFilter(key)}
                    className={`tab text-xs font-semibold gap-1.5 transition-all ${filter === key ? "tab-active" : "text-base-content/50"}`}
                  >
                    {label}
                    <span className={`badge badge-xs font-mono ${
                      key === "pending" ? "badge-warning" :
                      key === "verified" ? "badge-success" :
                      key === "rejected" ? "badge-error" : "badge-neutral"
                    } ${filter !== key ? "opacity-40" : ""}`}>
                      {counts[key]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Table body */}
            {kycLoading ? (
              <div className="flex items-center justify-center py-24">
                <span className="loading loading-spinner loading-lg text-primary" />
              </div>
            ) : filteredKyc.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-base-content/30">
                <span className="text-5xl">📋</span>
                <p className="font-mono text-sm">No {filter !== "all" ? filter : ""} submissions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr className="bg-base-300 text-base-content/50 text-xs uppercase tracking-widest font-mono">
                      <th className="font-medium">#</th>
                      <th className="font-medium">Applicant</th>
                      <th className="font-medium">ID Card</th>
                      <th className="font-medium">Selfie</th>
                      <th className="font-medium">Submitted</th>
                      <th className="font-medium">Status</th>
                      <th className="font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKyc.map((k, i) => (
                      <tr key={k._id} className="hover">
                        <td className="text-base-content/30 font-mono text-xs w-10">
                          {String(i + 1).padStart(2, "0")}
                        </td>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                              <div className="bg-neutral text-neutral-content rounded-full w-9 h-9">
                                <span className="text-xs font-bold">
                                  {k.fullName?.charAt(0)?.toUpperCase() || "?"}
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="font-semibold text-sm leading-tight">{k.fullName}</p>
                              <p className="text-base-content/40 text-xs font-mono">{k.submittedBy}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="mask mask-squircle w-10 h-10 bg-base-300 overflow-hidden">
                            <img src={k.idCardUrl} alt="ID" className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td>
                          <div className="mask mask-squircle w-10 h-10 bg-base-300 overflow-hidden">
                            <img src={k.selfieUrl} alt="Selfie" className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="font-mono text-xs text-base-content/50">
                          {new Date(k.submittedAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </td>
                        <td>{statusBadge(k.status)}</td>
                        <td>
                          <button
                            onClick={() => navigate(`/admin/kyc/${k._id}`)}
                            className="btn btn-xs btn-outline btn-primary gap-1"
                          >
                            Review
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer */}
            {!kycLoading && filteredKyc.length > 0 && (
              <div className="px-6 py-4 border-t border-base-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-xs font-mono text-base-content/30">
                  Showing {filteredKyc.length} of {counts.all} entries
                </p>
                <div className="flex flex-wrap gap-2">
                  <div className="badge badge-warning badge-outline badge-sm gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning" />{counts.pending} pending
                  </div>
                  <div className="badge badge-success badge-outline badge-sm gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />{counts.verified} verified
                  </div>
                  <div className="badge badge-error badge-outline badge-sm gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-error" />{counts.rejected} rejected
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
<ProjectManager/>
      </div>
    </div>
  );
};

export default AdminDashboard;